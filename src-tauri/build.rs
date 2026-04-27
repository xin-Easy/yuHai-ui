fn main() {
    let env_path = std::path::Path::new("..").join(".env");
    if env_path.exists() {
        dotenv::from_path(&env_path).ok();
    }
    
    println!("cargo:rerun-if-changed=../.env");
    
    let target = std::env::var("TARGET").unwrap_or_default();
    let (os, arch) = detect_platform(&target);
    let platform_suffix = format!("{}-{}", os, arch);
    
    println!("cargo:rerun-if-env-changed=VITE_CORE_PLATFORM={}", platform_suffix);
    
    let default_zip_name = format!("yuHai-core-{}.zip", platform_suffix);
    let zip_name = std::env::var("VITE_CORE_ZIP_NAME")
        .unwrap_or_else(|_| default_zip_name.clone());
    if !zip_name.contains(&platform_suffix) {
        println!("cargo:warning=VITE_CORE_ZIP_NAME '{}' does not match current platform '{}'. Using '{}' instead.", 
                 zip_name, platform_suffix, default_zip_name);
        println!("cargo:rustc-env=VITE_CORE_ZIP_NAME={}", default_zip_name);
    } else {
        println!("cargo:rustc-env=VITE_CORE_ZIP_NAME={}", zip_name);
    }
    
    let exe_ext = match os.as_str() {
        "windows" => ".exe",
        _ => "",
    };
    let exe_name = format!("yuHai{}", exe_ext);
    if let Ok(val) = std::env::var("VITE_CORE_EXECUTABLE") {
        println!("cargo:rustc-env=VITE_CORE_EXECUTABLE={}", val);
    } else {
        println!("cargo:rustc-env=VITE_CORE_EXECUTABLE={}", exe_name);
    }
    
    if let Ok(val) = std::env::var("VITE_CORE_INSTALL_DIR") {
        println!("cargo:rustc-env=VITE_CORE_INSTALL_DIR={}", val);
    }
    if let Ok(val) = std::env::var("VITE_CORE_API_URL") {
        println!("cargo:rustc-env=VITE_CORE_API_URL={}", val);
    }
    
    if let Ok(val) = std::env::var("VITE_CORE_UPDATE_SERVER_URL") {
        println!("cargo:rustc-env=VITE_CORE_UPDATE_SERVER_URL={}", val);
    }

    tauri_build::build()
}

fn detect_platform(target: &str) -> (String, String) {
    let os = if target.contains("windows") {
        "win"
    } else if target.contains("linux") {
        "linux"
    } else if target.contains("darwin") {
        "macos"
    } else {
        "unknown"
    };
    
    let arch = if target.contains("x86_64") || target.contains("amd64") {
        "x64"
    } else if target.contains("aarch64") || target.contains("arm64") {
        "arm64"
    } else if target.contains("i686") || target.contains("i386") {
        "x86"
    } else if target.contains("armv7") {
        "arm"
    } else {
        "unknown"
    };
    
    (os.to_string(), arch.to_string())
}
