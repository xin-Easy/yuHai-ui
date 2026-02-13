import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

/**
 * Checks if the app is running in Tauri environment
 */
export const isTauri = () => {
  return !!(window as any).__TAURI_INTERNALS__
}

/**
 * Downloads a Blob, either via browser download or Tauri save dialog
 * @param blob The data blob to download
 * @param filename Default filename
 * @param extension File extension (without dot) for Tauri filter
 */
export async function downloadBlob(blob: Blob, filename: string, extension = 'xlsx') {
  if (isTauri()) {
    try {
      // 1. Convert Blob to Uint8Array
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // 2. Open Save Dialog
      const path = await save({
        defaultPath: filename,
        filters: [
          {
            name: extension.toUpperCase(),
            extensions: [extension]
          }
        ]
      })

      // 3. Write file if path selected
      if (path) {
        await writeFile(path, uint8Array)
        return true
      }
      return false // User cancelled
    } catch (error) {
      console.error('Tauri download failed:', error)
      // Fallback to browser download if Tauri fails (though it might not work well in Tauri webview)
      triggerBrowserDownload(blob, filename)
      return true
    }
  } else {
    // Browser environment
    triggerBrowserDownload(blob, filename)
    return true
  }
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
