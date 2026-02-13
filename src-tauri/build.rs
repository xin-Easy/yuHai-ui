fn main() {
  // Load .env file from parent directory
  let env_path = std::path::Path::new("..").join(".env");
  if env_path.exists() {
      dotenv::from_path(&env_path).ok();
  }
  
  // Re-run build script if .env changes
  println!("cargo:rerun-if-changed=../.env");
  
  // Expose VITE_CORE_UPDATE_SERVER_URL to rustc env
  if let Ok(val) = std::env::var("VITE_CORE_UPDATE_SERVER_URL") {
      println!("cargo:rustc-env=VITE_CORE_UPDATE_SERVER_URL={}", val);
  }
  if let Ok(val) = std::env::var("VITE_CORE_EXECUTABLE") {
      println!("cargo:rustc-env=VITE_CORE_EXECUTABLE={}", val);
  }
  if let Ok(val) = std::env::var("VITE_CORE_INSTALL_DIR") {
      println!("cargo:rustc-env=VITE_CORE_INSTALL_DIR={}", val);
  }
  if let Ok(val) = std::env::var("VITE_CORE_API_URL") {
      println!("cargo:rustc-env=VITE_CORE_API_URL={}", val);
  }

  tauri_build::build()
}
