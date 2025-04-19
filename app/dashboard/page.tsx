"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, Heart, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getAllListings, deleteListing } from "@/lib/firebase"
import type { Car as CarType } from "@/lib/types"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<CarType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        setIsLoading(true)
        const listingsData = await getAllListings()

        // Filter listings to only show the current user's listings
        const userListings = listingsData.filter((listing) => listing.userId === user.id)
        setListings(userListings)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router, toast])

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

  if (isLoading) {
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
        <p className="mb-6">Please log in to view your dashboard.</p>
        <Button onClick={() => router.push("/auth/login")}>Log In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button onClick={() => router.push("/listings/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
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
                    <CardDescription>${listing.price.toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-2">
                      <img
                        src={listing.images[0] || "/placeholder.svg?height=200&width=300&query=car"}
                        alt={`${listing.brand} ${listing.model}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Year: {listing.year}</p>
                      <p>Mileage: {listing.mileage.toLocaleString()} mi</p>
                      <p>Status: {listing.isVisible ? "Active" : "Hidden"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push(`/cars/${listing.id}`)}>
                      View
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/listings/edit/${listing.id}`)}>
                      Edit
                    </Button>
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
              <Button onClick={() => router.push("/listings/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Listing
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center py-12 border rounded-lg">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Favorites Yet</h3>
            <p className="text-muted-foreground mb-4">You haven't added any cars to your favorites yet.</p>
            <Button onClick={() => router.push("/cars")}>Browse Cars</Button>
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
                  <p>{user.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Member Since</h3>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
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
