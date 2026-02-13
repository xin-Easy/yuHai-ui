use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Manager, WebviewWindow};

// Remove const constant, we will build it dynamically or use a function
// const BROWSER_API_URL: &str = "http://127.0.0.1:8000/api/v1/browser/position";
// const BROWSER_WIDTH: i32 = 500; // Default browser width
// const DEBOUNCE_MS: u64 = 200;

fn get_browser_width() -> i32 {
    option_env!("VITE_BROWSER_WIDTH")
        .and_then(|s| s.parse().ok())
        .unwrap_or(500)
}

fn get_debounce_ms() -> u64 {
    option_env!("VITE_BROWSER_SYNC_DEBOUNCE")
        .and_then(|s| s.parse().ok())
        .unwrap_or(200)
}

#[derive(Serialize, Debug)]
struct BrowserPositionSchema {
    left: i32,
    top: i32,
    width: i32,
    height: i32,
    window_state: String,
}

struct Debouncer {
    handle: Option<tauri::async_runtime::JoinHandle<()>>,
}

pub fn init<R: tauri::Runtime>(app: AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let debouncer = Arc::new(Mutex::new(Debouncer { handle: None }));
        
        // Clone for the event closure
        let window_clone = window.clone();
        
        window.on_window_event(move |event| {
            match event {
                tauri::WindowEvent::Moved(_) | tauri::WindowEvent::Resized(_) => {
                    let debouncer_clone = debouncer.clone();
                    let window_clone_inner = window_clone.clone();
                    
                    // Cancel previous task
                    let mut d = debouncer_clone.lock().unwrap();
                    if let Some(handle) = d.handle.take() {
                        handle.abort();
                    }
                    
                    // Spawn new task
                    d.handle = Some(tauri::async_runtime::spawn(async move {
                        tokio::time::sleep(Duration::from_millis(get_debounce_ms())).await;
                        sync_browser_position(&window_clone_inner).await;
                    }));
                }
                _ => {}
            }
        });
    }
}

async fn sync_browser_position<R: tauri::Runtime>(window: &WebviewWindow<R>) {
    // Get scale factor for logical pixel conversion
    let scale_factor = window.scale_factor().unwrap_or(1.0);

    // Get main window position and size (Physical)
    let pos = match window.outer_position() {
        Ok(p) => p,
        Err(_) => return,
    };
    let size = match window.outer_size() {
        Ok(s) => s,
        Err(_) => return,
    };

    // Convert to Logical Pixels
    let logical_pos = pos.to_logical::<i32>(scale_factor);
    let logical_size = size.to_logical::<i32>(scale_factor);

    // Calculate target position for the browser (left of main window)
    // Target Left = Main Left - Browser Width
    // All in Logical Pixels
    let browser_width = get_browser_width();
    let target_left = logical_pos.x - browser_width;
    let target_top = logical_pos.y;
    let target_height = logical_size.height;
    
    // We need to handle monitor boundaries potentially, but for now strict adherence.
    
    let payload = BrowserPositionSchema {
        left: target_left,
        top: target_top,
        width: browser_width,
        height: target_height,
        window_state: "normal".to_string(), // Assume normal for now
    };

    let client = reqwest::Client::new();
    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let browser_api_url = format!("{}/api/v1/browser/position", base_url.trim_end_matches('/'));

    // We ignore errors here as we don't want to crash or spam logs too much, 
    // but logging debug info is good.
    match client.post(&browser_api_url)
        .json(&payload)
        .send()
        .await 
    {
        Ok(_) => {
            // Success
            // log::debug!("Synced browser position: {:?}", payload);
        }
        Err(e) => {
            log::error!("Failed to sync browser position: {}", e);
        }
    }
}
