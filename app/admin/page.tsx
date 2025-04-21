"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Eye, MoreHorizontal, Trash, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getAllUsers, getAllListings, deleteUser, deleteListing, toggleListingVisibility } from "@/lib/firebase"
import type { User as UserType, Car } from "@/lib/types"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>([])
  const [listings, setListings] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use an effect to check authentication and redirect if needed
  useEffect(() => {
    // Only proceed when auth state is no longer loading
    if (!authLoading) {
      if (!user) {
        console.log("No user found, redirecting from admin page")
        router.push("/auth/login")
        return
      } else if (user.role !== "admin") {
        console.log("User is not admin, redirecting from admin page")
        router.push("/")
        return
      }
    }
  }, [user, authLoading, router])

  // Separate effect for data fetching that only runs when user is confirmed admin
  useEffect(() => {
    // Only fetch data when we have a confirmed admin user
    if (!authLoading && user && user.role === "admin") {
      const fetchData = async () => {
        try {
          console.log("Fetching admin data as user:", user.id)
          setIsLoading(true)

          // Fetch data in parallel
          const [usersData, listingsData] = await Promise.all([getAllUsers(), getAllListings()])

          setUsers(usersData)
          setListings(listingsData)
          console.log(`Fetched ${usersData.length} users and ${listingsData.length} listings`)
        } catch (error) {
          console.error("Error fetching admin data:", error)
          setError("Failed to load admin data. Please try again.")
          toast({
            title: "Error",
            description: "Failed to load admin data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [user, authLoading, toast])

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId)
        setUsers(users.filter((u) => u.id !== userId))
        toast({
          title: "User deleted",
          description: "The user has been deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteListing(listingId)
        setListings(listings.filter((l) => l.id !== listingId))
        toast({
          title: "Listing deleted",
          description: "The listing has been deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting listing:", error)
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleVisibility = async (listingId: string, isVisible: boolean) => {
    try {
      await toggleListingVisibility(listingId, !isVisible)
      setListings(listings.map((l) => (l.id === listingId ? { ...l, isVisible: !isVisible } : l)))
      toast({
        title: isVisible ? "Listing hidden" : "Listing visible",
        description: `The listing is now ${isVisible ? "hidden" : "visible"}`,
      })
    } catch (error) {
      console.error("Error toggling visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update listing visibility",
        variant: "destructive",
      })
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin panel. Please log in with an admin account.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Logged in as <span className="font-medium">{user.name}</span> ({user.email})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium">Admin Access</span>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {listing.brand} {listing.model}
                      </TableCell>
                      <TableCell>${listing.price.toLocaleString()}</TableCell>
                      <TableCell>{listing.userId.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            listing.isVisible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {listing.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/cars/${listing.id}`} className="flex w-full items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/listings/edit/${listing.id}`} className="flex w-full items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVisibility(listing.id, listing.isVisible || false)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {listing.isVisible ? "Hide" : "Show"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No listings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/admin/users/${user.id}`} className="flex w-full items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/admin/users/edit/${user.id}`} className="flex w-full items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
