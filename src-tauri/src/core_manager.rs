use std::env;
use std::path::PathBuf;
use std::process::{Child, Command as StdCommand};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, Runtime};
use regex::Regex;
use semver::Version;

pub struct CoreState {
    pub process: Mutex<Option<Child>>,
}

impl CoreState {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
        }
    }
}

// Helper to extract version from filename - REMOVED
// fn extract_version(filename: &str) -> Option<Version> { ... }

// Helper to get directories to scan (duplicated from core_update.rs to avoid circular deps or complex refactoring)
fn get_scan_dirs<R: Runtime>(app: &AppHandle<R>) -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Ok(dir) = env::var("VITE_CORE_INSTALL_DIR") {
        dirs.push(PathBuf::from(dir));
    }
    if let Ok(app_data_dir) = app.path().app_data_dir() {
        let core_dir = app_data_dir.join("core");
        dirs.push(core_dir.clone());
        
        // Recursively scan all subdirectories in core/
        let mut stack = vec![core_dir];
        while let Some(dir) = stack.pop() {
            if let Ok(entries) = std::fs::read_dir(&dir) {
                for entry in entries.flatten() {
                    if let Ok(file_type) = entry.file_type() {
                        if file_type.is_dir() {
                            let path = entry.path();
                            dirs.push(path.clone());
                            stack.push(path);
                        }
                    }
                }
            }
        }
    }
    dirs
}

// Helper to extract version from binary execution
fn get_binary_version(path: &PathBuf) -> Option<Version> {
    #[cfg(target_os = "windows")]
    use std::os::windows::process::CommandExt;

    let mut cmd = StdCommand::new(path);
    cmd.arg("version");

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000);

    match cmd.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let re = Regex::new(r"Version:\s*(\d+\.\d+\.\d+)").ok()?;
            if let Some(caps) = re.captures(&stdout) {
                if let Some(m) = caps.get(1) {
                    return Version::parse(m.as_str()).ok();
                }
            }
            None
        }
        Err(_) => None,
    }
}

pub fn find_latest_kernel<R: Runtime>(app: &AppHandle<R>) -> Option<PathBuf> {
    let scan_dirs = get_scan_dirs(app);
    let mut max_version = Version::new(0, 0, 0);
    let mut best_path: Option<PathBuf> = None;

    for dir in scan_dirs {
        let exe_name = option_env!("VITE_CORE_EXE_NAME").unwrap_or("yuHai.exe");
        let path = dir.join(exe_name);
        if path.exists() && path.is_file() {
            if let Some(v) = get_binary_version(&path) {
                if v > max_version {
                    max_version = v;
                    best_path = Some(path);
                }
            } else {
                // If we can't get version, but found the file, and haven't found a versioned one yet
                if best_path.is_none() {
                    best_path = Some(path);
                }
            }
        }
    }

    best_path
}

fn get_core_ready_retry_count() -> usize {
    option_env!("VITE_CORE_READY_RETRY_COUNT")
        .and_then(|v| v.parse().ok())
        .unwrap_or(30)
}

fn get_core_ready_retry_interval_ms() -> u64 {
    option_env!("VITE_CORE_READY_RETRY_INTERVAL_MS")
        .and_then(|v| v.parse().ok())
        .unwrap_or(2000)
}

fn get_core_ready_http_timeout_ms() -> u64 {
    option_env!("VITE_CORE_READY_HTTP_TIMEOUT_MS")
        .and_then(|v| v.parse().ok())
        .unwrap_or(2000)
}

fn get_core_shutdown_http_timeout_ms() -> u64 {
    option_env!("VITE_CORE_SHUTDOWN_HTTP_TIMEOUT_MS")
        .and_then(|v| v.parse().ok())
        .unwrap_or(2000)
}

fn get_core_shutdown_wait_ms() -> u64 {
    option_env!("VITE_CORE_SHUTDOWN_WAIT_MS")
        .and_then(|v| v.parse().ok())
        .unwrap_or(500)
}

#[tauri::command]
pub fn start_core<R: Runtime>(app: AppHandle<R>, state: tauri::State<'_, CoreState>) -> Result<(), String> {
    let mut process_guard = state.process.lock().map_err(|e| e.to_string())?;

    if process_guard.is_some() {
        return Ok(()); // Already running
    }

    if let Some(kernel_path) = find_latest_kernel(&app) {
        log::info!("Starting kernel from: {:?}", kernel_path);
        
        // Ensure we execute relative to the directory it resides in, or pass CWD
        let parent_dir = kernel_path.parent().unwrap_or(&kernel_path);

        let mut cmd = StdCommand::new(&kernel_path);
        cmd.arg("start").current_dir(parent_dir);

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }

        match cmd.spawn() {
            Ok(child) => {
                *process_guard = Some(child);
                log::info!("Kernel started successfully.");
                
                // Spawn a thread to wait for core readiness and navigate
                wait_for_core_and_navigate();
                
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to start kernel: {}", e);
                Err(format!("Failed to start kernel: {}", e))
            }
        }
    } else {
        log::error!("Kernel executable not found");
        Err("Kernel executable not found".to_string())
    }
}

#[tauri::command]
pub fn stop_core(state: tauri::State<'_, CoreState>) -> Result<(), String> {
    shutdown_core_gracefully(&state);
    Ok(())
}

pub fn shutdown_core_gracefully(state: &CoreState) {
    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let shutdown_url = format!("{}/api/v1/system/shutdown", base_url.trim_end_matches('/'));

    let client = reqwest::blocking::Client::new();
    match client.post(&shutdown_url)
        .timeout(std::time::Duration::from_millis(get_core_shutdown_http_timeout_ms()))
        .send() {
        Ok(_) => log::info!("Sent shutdown signal to core."),
        Err(e) => log::error!("Failed to send shutdown signal: {}", e),
    }

    std::thread::sleep(std::time::Duration::from_millis(get_core_shutdown_wait_ms()));

    if let Ok(mut process_guard) = state.process.lock() {
        if let Some(mut child) = process_guard.take() {
            match child.try_wait() {
                Ok(Some(_)) => log::info!("Core process exited gracefully."),
                Ok(None) => {
                    log::warn!("Core process still running, force killing...");
                    let _ = child.kill();
                },
                Err(_) => {
                    let _ = child.kill();
                }
            }
        }
    }
}

fn wait_for_core_and_navigate() {
    std::thread::spawn(|| {
        let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
        let navigate_url = format!("{}/api/v1/browser/navigate", base_url.trim_end_matches('/'));
        let check_url = format!("{}/docs", base_url.trim_end_matches('/'));

        let client = reqwest::blocking::Client::new();
        let max_retries = get_core_ready_retry_count();
        let timeout = std::time::Duration::from_millis(get_core_ready_http_timeout_ms());
        let retry_interval = std::time::Duration::from_millis(get_core_ready_retry_interval_ms());
        let mut ready = false;

        log::info!("Waiting for core to be ready...");

        for _ in 0..max_retries {
            if client.get(&check_url).timeout(timeout).send().is_ok() {
                ready = true;
                break;
            }
            std::thread::sleep(retry_interval);
        }

        if ready {
             let startup_url = option_env!("VITE_CORE_STARTUP_URL").unwrap_or("https://www.xiaohongshu.com");
             log::info!("Core is ready. Navigating to {}...", startup_url);
             match client.post(&navigate_url)
                .json(&serde_json::json!({
                    "url": startup_url
                }))
                .send() {
                Ok(resp) => {
                     if resp.status().is_success() {
                         log::info!("Successfully navigated to Xiaohongshu");
                     } else {
                         log::error!("Failed to navigate: {:?}", resp.text().ok());
                     }
                },
                Err(e) => log::error!("Failed to call navigate endpoint: {}", e),
             }
        } else {
            log::error!("Core startup timed out - could not navigate.");
        }
    });
}
