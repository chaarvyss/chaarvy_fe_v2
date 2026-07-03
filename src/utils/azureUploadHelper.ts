import axios from 'axios'

export interface AzureUploadTarget {
  file: File
  uploadUrl: string
}

export interface UploadOptions {
  onProgress?: (percentCompleted: number, fileName: string) => void
}

/**
 * Universally handles single or multiple direct-to-Azure uploads with progress tracking.
 */
export const uploadFilesToAzure = async (targets: AzureUploadTarget[], options?: UploadOptions) => {
  const uploadPromises = targets.map(target => {
    return axios.put(target.uploadUrl, target.file, {
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': target.file.type
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total && options?.onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

          // Pass the progress and the filename back to the component
          options.onProgress(percentCompleted, target.file.name)
        }
      }
    })
  })

  // Executes all uploads in parallel
  return Promise.all(uploadPromises)
}
