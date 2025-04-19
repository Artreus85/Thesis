"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, Heart, Plus, Trash, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getAllListings, deleteListing } from "@/lib/firebase"
import type { Car as CarType } from "@/lib/types"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<CarType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch data if authentication is complete and user is logged in
    if (!authLoading && user) {
      const fetchData = async () => {
        try {
          console.log("Fetching listings for dashboard...")
          setIsLoading(true)
          const listingsData = await getAllListings()
          console.log(`Fetched ${listingsData.length} total listings`)

          // Filter listings to only show the current user's listings
          const userListings = listingsData.filter((listing) => listing.userId === user.id)
          console.log(`Found ${userListings.length} listings for current user`)
          setListings(userListings)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          setError("Failed to load your listings. Please try again later.")
          toast({
            title: "Error",
            description: "Failed to load your listings. Please try again later.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    } else if (!authLoading && !user) {
      // If authentication is complete and user is not logged in, redirect to login
      // We'll use a client-side approach here to avoid SSR issues
      console.log("User not authenticated, preparing to redirect...")
      // Don't redirect immediately to avoid hydration issues
      const timer = setTimeout(() => {
        console.log("Redirecting to login page...")
        router.push("/auth/login")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router, toast])

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteListing(listingId)
        setListings(listings.filter((l) => l.id !== listingId))
        toast({
          title: "Listing deleted",
          description: "Your listing has been deleted successfully",
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

  // Show loading state while authentication is in progress
  if (authLoading || (isLoading && user)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  // Show error state if there was an error loading data
  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} size="lg">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // For client-side rendering, we'll render a placeholder first
  // This helps avoid hydration errors when redirecting
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6 text-muted-foreground">Please log in to view your dashboard and manage your listings.</p>
          <Link href="/auth/login">
            <Button size="lg">Log In</Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Link href="/listings/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>
                      {listing.brand} {listing.model}
                    </CardTitle>
                    <CardDescription>${listing.price?.toLocaleString() || "Price not available"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-2">
                      <img
                        src={listing.images?.[0] || "/placeholder.svg?height=200&width=300&query=car"}
                        alt={`${listing.brand} ${listing.model}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Year: {listing.year || "N/A"}</p>
                      <p>Mileage: {listing.mileage?.toLocaleString() || "N/A"} mi</p>
                      <p>Status: {listing.isVisible ? "Active" : "Hidden"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/cars/${listing.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                    <Link href={`/listings/edit/${listing.id}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                    <Button variant="outline" onClick={() => handleDeleteListing(listing.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Listings Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't created any car listings yet.</p>
              <Link href="/listings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Listing
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center py-12 border rounded-lg">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Favorites Yet</h3>
            <p className="text-muted-foreground mb-4">You haven't added any cars to your favorites yet.</p>
            <Link href="/cars">
              <Button>Browse Cars</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{user.name || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{user.email || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Member Since</h3>
                  <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
