"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"

export default function AdminDebugPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [isSettingAdmin, setIsSettingAdmin] = useState(false)

  const handleSetAdmin = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      })
      return
    }

    setIsSettingAdmin(true)
    try {
      // Dynamically import to prevent build errors
      const { setUserAsAdmin } = await import("@/lib/firebase")
      await setUserAsAdmin(userId)

      toast({
        title: "Success",
        description: `User ${userId} has been set as admin`,
      })
    } catch (error) {
      console.error("Error setting user as admin:", error)
      toast({
        title: "Error",
        description: "Failed to set user as admin",
        variant: "destructive",
      })
    } finally {
      setIsSettingAdmin(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please log in to access this page</p>
        <Button onClick={() => router.push("/auth/login")}>Log In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Tools</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current User Info</CardTitle>
            <CardDescription>Details about your current authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">User ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-medium">Created At:</span> {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set User as Admin</CardTitle>
            <CardDescription>Promote a user to admin role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID</label>
                <Input placeholder="Enter user ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Enter the Firebase Auth UID of the user you want to promote
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSetAdmin} disabled={isSettingAdmin || !userId} className="w-full">
              {isSettingAdmin ? "Setting Admin..." : "Set as Admin"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Your current user ID is: <code className="bg-muted px-1 py-0.5 rounded">{user.id}</code>
        </p>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Back to Admin Panel
        </Button>
      </div>
    </div>
  )
}
