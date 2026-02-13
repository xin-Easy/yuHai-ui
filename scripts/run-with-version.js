import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get version from git tags
 * Default to '0.0.0' if failed
 */
function getGitVersion() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    
    // Remove 'v' prefix if exists (v1.0.0 -> 1.0.0)
    if (tag) {
      return tag.replace(/^v/i, '');
    }
  } catch (e) {
    // console.warn('Failed to get git tag, using default version 0.0.0');
  }
  return '0.0.0';
}

// Allow overriding via environment variables (useful for CI)
// Ensure version is always a valid semver string
let version = process.env.TAURI_APP_VERSION || getGitVersion();
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.warn(`[Version Manager] Invalid version '${version}', falling back to '0.0.0'`);
  version = '0.0.0';
}
// console.log(`[Version Manager] Current Version: ${version}`);

// Inject environment variables
process.env.VITE_VERSION = version;
process.env.TAURI_APP_VERSION = version;

// Parse command arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: No command provided to run-with-version.js');
  process.exit(1);
}

const command = args[0];
const commandArgs = args.slice(1);

// Handle Tauri configuration update
if (command === 'tauri' && (commandArgs.includes('build') || commandArgs.includes('dev'))) {
  const tauriConfigPath = path.resolve(__dirname, '../src-tauri/tauri.conf.json');
  try {
    const configContent = fs.readFileSync(tauriConfigPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Update version
    config.version = version;
    
    // Write back to file
    fs.writeFileSync(tauriConfigPath, JSON.stringify(config, null, 2));
    console.log(`[Version Manager] Updated tauri.conf.json version to ${version}`);
  } catch (err) {
    console.error(`[Version Manager] Failed to update tauri.conf.json: ${err.message}`);
    // Continue anyway, maybe the command will succeed if version is provided elsewhere?
  }
}

// Spawn the command
// shell: true is required for Windows to resolve npm/pnpm commands and shell operators
const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
