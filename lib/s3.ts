import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { isPreviewEnvironment } from "./environment"
import { mockUploadToS3, mockUploadMultipleToS3 } from "./fallback"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
})

const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(file: File): Promise<string> {

  const fileBuffer = await file.arrayBuffer()
  const fileName = `car-images/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  }

  try {
    console.log(`Uploading file to S3: ${fileName}`)
    await s3Client.send(new PutObjectCommand(uploadParams))
    console.log(`File uploaded successfully to S3: ${fileName}`)

    // Generate a URL for the uploaded file
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      }),
      { expiresIn: 3600 * 24 * 7 }, // URL expires in 7 days
    )

    return url
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw new Error("Failed to upload image")
  }
}

/**
 * Upload multiple files to S3
 */
export async function uploadFilesToS3(files: File[]): Promise<string[]> {


  console.log(`Uploading ${files.length} files to S3`)

  // Check if AWS credentials are available
  if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
    console.warn("AWS credentials not found, using placeholder images instead")
    return files.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
  }

  try {
    const uploadPromises = files.map((file) => uploadFileToS3(file))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error in uploadFilesToS3:", error)
    // Fallback to placeholder images
    return files.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    const urlParts = new URL(fileUrl)
    const key = urlParts.pathname.substring(1) // Remove leading slash

    console.log(`Deleting file from S3: ${key}`)
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    }

    await s3Client.send(new DeleteObjectCommand(deleteParams))
    console.log(`File deleted successfully from S3: ${key}`)
  } catch (error) {
    console.error("Error deleting file from S3:", error)
    throw new Error("Failed to delete image")
  }
}

/**
 * Get a signed URL for an S3 object
 */
export async function getS3SignedUrl(key: string): Promise<string> {
  try {
    console.log(`Generating signed URL for S3 object: ${key}`)
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
      { expiresIn: 3600 }, // URL expires in 1 hour
    )

    return url
  } catch (error) {
    console.error("Error generating signed URL:", error)
    throw new Error("Failed to generate image URL")
  }
}

/**
 * Refresh an expiring S3 URL
 */
export async function refreshS3Url(url: string): Promise<string> {
  try {
    // Extract the key from the URL
    const urlParts = new URL(url)
    const key = urlParts.pathname.substring(1) // Remove leading slash

    // Generate a new signed URL
    return await getS3SignedUrl(key)
  } catch (error) {
    console.error("Error refreshing S3 URL:", error)
    return url // Return the original URL if refresh fails
  }
}
