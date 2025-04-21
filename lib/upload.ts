import { isPreviewEnvironment } from "./environment"
import { mockUploadMultipleToS3 } from "./fallback"
import { mockUploadToS3 } from "./fallback" // Import mockUploadToS3

/**
 * Get a presigned URL for uploading a file to S3
 */
export async function getPresignedUrl(file: File): Promise<{
  presignedUrl: string
  publicUrl: string
  key: string
}> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get presigned URL")
  }

  return response.json()
}

/**
 * Upload a file directly to S3 using a presigned URL
 */
export async function uploadFileWithPresignedUrl(file: File, presignedUrl: string): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to upload file to S3")
  }
}

/**
 * Upload a file to S3 (handles both getting the presigned URL and uploading)
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // Get a presigned URL
  const { presignedUrl, publicUrl } = await getPresignedUrl(file)

  // Upload the file directly to S3
  await uploadFileWithPresignedUrl(file, presignedUrl)

  // Return the public URL
  return publicUrl
}

/**
 * Upload multiple files to S3
 */
export async function uploadFilesToS3(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadFileToS3(file))
  return Promise.all(uploadPromises)
}
