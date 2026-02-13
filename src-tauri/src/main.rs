// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core_update;
mod core_manager;
mod browser_sync;

use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use chrono::Local;
use tauri::Manager;

#[tauri::command]
async fn get_left_window_info(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    
    // Get main window info
    let outer_pos = window.outer_position().unwrap_or_default();
    let outer_size = window.outer_size().unwrap_or_default();
    
    // Get display info
    let monitor = window.current_monitor().unwrap_or(None);
    let (display_id, display_scale, display_bounds) = match monitor {
        Some(m) => (
            m.name().map(|s| s.to_string()).unwrap_or_default(),
            m.scale_factor(),
            serde_json::json!({
                "width": m.size().width,
                "height": m.size().height
            })
        ),
        None => ("".to_string(), 1.0, serde_json::json!({ "width": 0, "height": 0 }))
    };

    // Construct main bounds (Physical)
    let main_bounds = serde_json::json!({
        "x": outer_pos.x,
        "y": outer_pos.y,
        "width": outer_size.width,
        "height": outer_size.height
    });

    // Default left info
    let mut left_info = serde_json::json!({
        "attached": false,
        "id": null,
        "visible": false,
        "focused": false,
        "devtools": false,
        "loading": false,
        "url": "",
        "leftBounds": { "x": 0, "y": 0, "width": 0, "height": 0 },
        "mainBounds": main_bounds,
        "display": {
            "id": display_id,
            "scaleFactor": display_scale,
            "bounds": display_bounds,
            "workArea": {}
        }
    });

    // Query Kernel
    let client = reqwest::Client::new();
    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let status_url = format!("{}/api/v1/browser/status", base_url.trim_end_matches('/'));

    // Try to get browser status from kernel
    match client.get(&status_url).send().await {
        Ok(res) => {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                // Merge kernel response into left_info
                if let Some(obj) = left_info.as_object_mut() {
                    if let Some(k_obj) = json.as_object() {
                        for (k, v) in k_obj {
                            if k == "bounds" {
                                obj.insert("leftBounds".to_string(), v.clone());
                            } else {
                                obj.insert(k.clone(), v.clone());
                            }
                        }
                    }
                }
            }
        },
        Err(_) => {
            // Kernel not running or unreachable, keep defaults
        }
    }

    Ok(left_info)
}

#[tauri::command]
fn get_core_logs(_page: u32, _size: u32) -> Result<serde_json::Value, String> {
     Ok(serde_json::json!({
        "items": [],
        "total": 0
    }))
}

fn main() {
    let update_state = Arc::new(Mutex::new(core_update::UpdateState {
        pending_update: None,
    }));

    let log_file_name = format!("app-{}.log", Local::now().format("%Y-%m-%d"));

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { 
                file_name: Some(log_file_name) 
            }))
            .build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(update_state)
        .manage(core_manager::CoreState::new())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            
            // Initialize browser sync
            browser_sync::init(app.handle().clone());

            // Extract bundled kernel
            let handle = app.handle();
            if let Ok(app_data_dir) = handle.path().app_data_dir() {
                let core_dir = app_data_dir.join("core");
                let kernel_zip_name = option_env!("VITE_CORE_ZIP_NAME").unwrap_or("yuHai-core.zip");
                let kernel_zip_relative = PathBuf::from("resources").join(kernel_zip_name);
 
                if !core_dir.exists() {
                    let _ = std::fs::create_dir_all(&core_dir);
                }
 
                // Check if kernel exists using core_manager logic (which scans subdirs)
                let kernel_exists = core_manager::find_latest_kernel(&handle).is_some();
                
                // Only extract if target executable does not exist
                if !kernel_exists {
                    #[cfg(debug_assertions)]
                    // In development, the resource path is relative to the Cargo.toml location (src-tauri)
                    let resource_path = kernel_zip_relative.clone();

                    #[cfg(not(debug_assertions))]
                    let resource_path = handle.path().resolve(kernel_zip_relative, tauri::path::BaseDirectory::Resource)
                        .unwrap_or_else(|_| PathBuf::from(kernel_zip_name));

                    // Try to resolve absolute path for better debugging
                    let abs_resource_path = if resource_path.is_absolute() {
                        resource_path.clone()
                    } else {
                        std::env::current_dir().unwrap_or_default().join(&resource_path)
                    };

                    if abs_resource_path.exists() {
                        println!("Found bundled kernel zip at: {:?}", abs_resource_path);
                        match std::fs::File::open(&abs_resource_path) {
                            Ok(file) => {
                                match zip::ZipArchive::new(file) {
                                    Ok(mut archive) => {
                                        if let Err(e) = archive.extract(&core_dir) {
                                            eprintln!("Failed to extract kernel zip: {}", e);
                                        } else {
                                            println!("Successfully extracted bundled kernel to: {:?}", core_dir);
                                        }
                                    },
                                    Err(e) => eprintln!("Failed to open zip archive: {}", e),
                                }
                            },
                            Err(e) => log::error!("Failed to open zip file: {}", e),
                        }
                    } else {
                         log::error!("Bundled kernel resource not found at: {:?} (resolved from {:?})", abs_resource_path, resource_path);
                    }
                }
            }

            // Start Core Kernel
            #[cfg(not(debug_assertions))]
            {
                let app_handle = app.handle().clone();
                let state = app_handle.state::<core_manager::CoreState>();
                if let Err(e) = core_manager::start_core(app_handle.clone(), state) {
                    log::error!("Failed to auto-start core kernel: {}", e);
                }
            }
            #[cfg(debug_assertions)]
            log::info!("Skipping auto-start core kernel in dev environment");
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            core_update::core_update_check,
            core_update::core_update_download,
            core_update::core_update_install,
            core_update::core_update_cancel,
            core_update::core_update_get_version,
            core_manager::start_core,
            core_manager::stop_core,
            get_left_window_info,
            get_core_logs
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => {
                let state = app_handle.state::<core_manager::CoreState>();
                core_manager::shutdown_core_gracefully(&state);
            }
            _ => {}
        });
}
