import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

// This function runs on the server only
export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique file name to prevent collisions
    const uniqueFileName = `${crypto.randomUUID()}-${fileName.replace(/\s+/g, "-").toLowerCase()}`
    const key = `car-images/${uniqueFileName}`

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_AWS_REGION!,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    })

    // Create the command to put an object in S3
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    })

    // Generate a presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Calculate the public URL that will be available after upload
    const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`

    return NextResponse.json({ presignedUrl, publicUrl, key })
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
