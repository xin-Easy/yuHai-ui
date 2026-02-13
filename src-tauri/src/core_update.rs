use std::sync::{Arc, Mutex};

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub version: String,
    pub file_size: u64,
    pub release_notes: Option<String>,
    pub pub_date: Option<String>,
    pub download_url: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheckResult {
    pub has_update: bool,
    pub update_info: Option<UpdateInfo>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
#[derive(Clone)]
#[allow(dead_code)]
struct ReleaseAsset {
    name: String,
    size: u64,
    download_url: String,
    #[serde(default)]
    content_type: Option<String>,
    #[serde(default)]
    updated_at: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
struct CoreUpdateResponse {
    has_update: bool,
    current_version: String,
    latest_version: String,
    #[serde(default)]
    release_notes: Option<String>,
    #[serde(default)]
    published_at: Option<String>,
    #[serde(default)]
    assets: Option<Vec<ReleaseAsset>>,
    #[serde(default)]
    download_url: Option<String>,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct ApiResponse<T> {
    code: i32,
    message: Option<String>,
    data: T,
}

pub struct UpdateState {
    pub pending_update: Option<UpdateInfo>,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn core_update_check<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, Arc<Mutex<UpdateState>>>,
) -> Result<UpdateCheckResult, String> {
    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let check_url = format!("{}/api/v1/system/update/check", base_url.trim_end_matches('/'));

    let client = Client::new();
    let resp = client
        .get(&check_url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to core: {}", e))?
        .json::<ApiResponse<CoreUpdateResponse>>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let data = resp.data;

    let cleaned_download = data
        .download_url
        .clone()
        .map(|u| u.trim().trim_matches('`').to_string());

    let file_size = if let Some(ref target_url) = cleaned_download {
        data.assets
            .as_ref()
            .and_then(|list| {
                list.iter().find(|a| {
                    a.download_url.trim().trim_matches('`') == target_url
                })
            })
            .map(|a| a.size)
            .or_else(|| {
                data.assets
                    .as_ref()
                    .and_then(|list| list.first().map(|a| a.size))
            })
            .unwrap_or(0)
    } else {
        data.assets
            .as_ref()
            .and_then(|list| list.first().map(|a| a.size))
            .unwrap_or(0)
    };

    let info = UpdateInfo {
        version: data.latest_version.clone(),
        file_size,
        release_notes: data.release_notes.clone(),
        pub_date: data.published_at.clone(),
        download_url: cleaned_download,
    };

    if data.has_update {
        if let Ok(mut s) = state.lock() {
            s.pending_update = Some(info.clone());
        }
    }

    Ok(UpdateCheckResult {
        has_update: data.has_update,
        update_info: Some(info),
    })
}

#[tauri::command(rename_all = "snake_case")]
pub async fn core_update_install<R: Runtime>(
    _app: AppHandle<R>,
    state: State<'_, Arc<Mutex<UpdateState>>>,
) -> Result<String, String> {
    let info = {
        let s = state.lock().map_err(|e| e.to_string())?;
        s.pending_update.clone().ok_or("No pending update info")?
    };

    let download_url = info.download_url.ok_or("No download URL provided by update check")?;

    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let execute_url = format!("{}/api/v1/system/update/execute", base_url.trim_end_matches('/'));

    let client = Client::new();
    let resp = client
        .post(&execute_url)
        .json(&serde_json::json!({
            "download_url": download_url,
            "version": info.version
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to trigger update: {}", e))?;

    if resp.status().is_success() {
        Ok("Update triggered successfully. Service may restart.".to_string())
    } else {
        let error_msg = resp.text().await.unwrap_or_default();
        Err(format!("Update failed: {}", error_msg))
    }
}

// Deprecated/Stubbed commands to maintain interface compatibility if frontend calls them
#[tauri::command(rename_all = "snake_case")]
pub async fn core_update_download<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, Arc<Mutex<UpdateState>>>,
) -> Result<(), String> {
    // No-op or Error, as core handles download now
    Ok(()) 
}

#[tauri::command(rename_all = "snake_case")]
pub fn core_update_cancel(_state: State<'_, Arc<Mutex<UpdateState>>>) -> Result<(), String> {
    // No-op
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn core_update_get_version<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    // We can try to fetch it from the check endpoint or just return "0.0.0" and let check handle it
    let base_url = option_env!("VITE_CORE_API_URL").unwrap_or("http://127.0.0.1:8000");
    let check_url = format!("{}/api/v1/system/update/check", base_url.trim_end_matches('/'));

    let client = Client::new();
    match client.get(&check_url).send().await {
        Ok(resp) => {
             if let Ok(json) = resp.json::<ApiResponse<CoreUpdateResponse>>().await {
                 Ok(json.data.current_version)
             } else {
                 Ok("0.0.0".to_string())
             }
        },
        Err(_) => Ok("0.0.0".to_string())
    }
}
