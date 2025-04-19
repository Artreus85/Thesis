"use client"

import { useState } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestConnectionPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [s3Status, setS3Status] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [s3Error, setS3Error] = useState<string | null>(null)
  const [s3BucketInfo, setS3BucketInfo] = useState<string | null>(null)

  const testFirebaseConnection = async () => {
    setFirebaseStatus("testing")
    setFirebaseError(null)

    try {
      // Firebase configuration from environment variables
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      // Initialize Firebase
      const app = initializeApp(firebaseConfig)
      const db = getFirestore(app)

      // Try to access Firestore
      const testCollection = collection(db, "test")
      await getDocs(testCollection)

      setFirebaseStatus("success")
    } catch (error) {
      console.error("Firebase connection error:", error)
      setFirebaseStatus("error")
      setFirebaseError(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  const testS3Connection = async () => {
    setS3Status("testing")
    setS3Error(null)
    setS3BucketInfo(null)

    try {
      // S3 configuration from environment variables
      const s3Client = new S3Client({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      })

      // Try to list buckets to verify connection
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)

      // Check if our target bucket exists
      const targetBucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
      const bucketExists = response.Buckets?.some((bucket) => bucket.Name === targetBucket)

      if (bucketExists) {
        setS3BucketInfo(`Found target bucket: ${targetBucket}`)
        setS3Status("success")
      } else {
        setS3BucketInfo(
          `Target bucket "${targetBucket}" not found in your account. Available buckets: ${response.Buckets?.map((b) => b.Name).join(", ")}`,
        )
        setS3Status("error")
      }
    } catch (error) {
      console.error("S3 connection error:", error)
      setS3Status("error")
      setS3Error(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Connection Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Firebase Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Connection Test</CardTitle>
            <CardDescription>Test connection to Firebase using your environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {firebaseStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">Successfully connected to Firebase!</AlertDescription>
              </Alert>
            )}

            {firebaseStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {firebaseError || "Failed to connect to Firebase"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testFirebaseConnection} disabled={firebaseStatus === "testing"} className="w-full">
              {firebaseStatus === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Firebase Connection"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* S3 Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>AWS S3 Connection Test</CardTitle>
            <CardDescription>Test connection to AWS S3 using your environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {s3Status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully connected to AWS S3!
                  {s3BucketInfo && <p className="mt-2 text-sm">{s3BucketInfo}</p>}
                </AlertDescription>
              </Alert>
            )}

            {s3Status === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {s3Error || "Failed to connect to AWS S3"}
                  {s3BucketInfo && <p className="mt-2 text-sm">{s3BucketInfo}</p>}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testS3Connection} disabled={s3Status === "testing"} className="w-full">
              {s3Status === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test S3 Connection"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Once both connections are successful, we can proceed with the implementation.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  )
}
