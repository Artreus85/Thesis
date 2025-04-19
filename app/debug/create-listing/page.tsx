"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"

export default function DebugCreateListingPage() {
  const { user } = useAuth()
  const [firestoreStatus, setFirestoreStatus] = useState<any>(null)
  const [testDocStatus, setTestDocStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDoc, setIsCreatingDoc] = useState(false)

  const testFirestoreConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug/firestore")
      const data = await response.json()
      setFirestoreStatus(data)
    } catch (error) {
      setFirestoreStatus({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTestDocument = async () => {
    setIsCreatingDoc(true)
    try {
      const response = await fetch("/api/debug/firestore", {
        method: "POST",
      })
      const data = await response.json()
      setTestDocStatus(data)
    } catch (error) {
      setTestDocStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsCreatingDoc(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Create Listing</h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Check if you're properly authenticated</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 font-medium">Authenticated</span>
                </p>
                <p>
                  <span className="font-medium">User ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {user.role}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-medium">Not authenticated</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You need to be logged in to create listings. Please log in and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Firestore Connection Test</CardTitle>
            <CardDescription>Test connection to Firestore database</CardDescription>
          </CardHeader>
          <CardContent>
            {firestoreStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Admin Connection:</h3>
                  <p className={firestoreStatus.admin?.success ? "text-green-600" : "text-red-600"}>
                    {firestoreStatus.admin?.message}
                  </p>
                  {firestoreStatus.admin?.error && (
                    <p className="text-sm text-red-500 mt-1">{firestoreStatus.admin.error}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Client Connection:</h3>
                  <p className={firestoreStatus.client?.success ? "text-green-600" : "text-red-600"}>
                    {firestoreStatus.client?.message}
                  </p>
                  {firestoreStatus.client?.error && (
                    <p className="text-sm text-red-500 mt-1">{firestoreStatus.client.error}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Environment Variables:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(firestoreStatus.environment, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Click the button below to test the Firestore connection.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testFirestoreConnection} disabled={isLoading} className="w-full">
              {isLoading ? "Testing..." : "Test Firestore Connection"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Test Document</CardTitle>
            <CardDescription>Test creating a document in Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            {testDocStatus ? (
              <div>
                <p className={testDocStatus.success ? "text-green-600" : "text-red-600"}>
                  {testDocStatus.success ? "Test document created successfully!" : "Failed to create test document"}
                </p>
                {testDocStatus.documentId && (
                  <p className="text-sm mt-1">
                    Document ID: <span className="font-mono">{testDocStatus.documentId}</span>
                  </p>
                )}
                {testDocStatus.error && <p className="text-sm text-red-500 mt-1">{testDocStatus.error}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">Click the button below to test creating a document in Firestore.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={createTestDocument} disabled={isCreatingDoc} className="w-full">
              {isCreatingDoc ? "Creating..." : "Create Test Document"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
