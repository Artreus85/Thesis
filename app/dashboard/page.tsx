"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Car, Plus, Trash, User, Edit, Eye, WifiOff, ImageOff, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getUserListings, deleteListing } from "@/lib/firebase"
import { getFavoritedCars } from "@/lib/firebase"
import { getValidImageUrl } from "@/lib/image-fallback"
import { handleFirestoreError } from "@/lib/firebase-error-handler"
import { FavoriteButton } from "@/components/favorite-button"
import type { Car as CarType } from "@/lib/types"

export default function Dashboard() {
  const { user, loading: authLoading, connectionBlocked } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<CarType[]>([])
  const [favorites, setFavorites] = useState<CarType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // First effect just to track when auth is checked
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
      console.log("Auth state checked, user:", user ? "logged in" : "not logged in")
    }
  }, [authLoading, user])

  // Second effect to fetch data once auth is checked
  useEffect(() => {
    // Only run this effect if auth has been checked
    if (!authChecked) return

    // If user is logged in, fetch their listings
    if (user) {
      const fetchData = async () => {
        try {
          console.log("Fetching listings for dashboard...")
          setIsLoading(true)
          const userListings = await getUserListings(user.id)
          console.log(`Found ${userListings.length} listings for current user`)
          setListings(userListings)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)

          // Use our error handler
          handleFirestoreError(error, "Failed to load your listings")

          setError("Failed to load your listings. Please try again later.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    } else {
      // If user is not logged in, redirect to login
      console.log("User not authenticated, redirecting to login...")
      router.push("/auth/login")
    }
  }, [authChecked, user, router, toast])

  // Third effect to fetch favorites
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setIsFavoritesLoading(true)
        const favoritedCars = await getFavoritedCars(user.id)
        setFavorites(favoritedCars)
      } catch (error) {
        console.error("Error fetching favorites:", error)
        handleFirestoreError(error, "Failed to load your favorites")
      } finally {
        setIsFavoritesLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

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
        handleFirestoreError(error, "Failed to delete listing")
      }
    }
  }

  const handleImageError = (listingId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [listingId]: true,
    }))
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

  // Show connection blocked warning
  if (connectionBlocked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>Connection Blocked</AlertTitle>
          <AlertDescription>
            Your connection to our database appears to be blocked. This is often caused by ad blockers or privacy
            extensions. Please disable them for this site or add an exception to view your dashboard.
          </AlertDescription>
        </Alert>

        {user && (
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
            <p className="mb-6 text-muted-foreground">We're showing limited functionality due to connection issues.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}
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
                      {imageErrors[listing.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <ImageOff className="h-12 w-12 text-gray-400" />
                        </div>
                      ) : (
                        <Image
                          src={getValidImageUrl(listing.images?.[0], listing) || "/placeholder.svg"}
                          alt={`${listing.brand} ${listing.model}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(listing.id)}
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Year: {listing.year || "N/A"}</p>
                      <p>Mileage: {listing.mileage?.toLocaleString() || "N/A"} mi</p>
                      <p>Status: {listing.isVisible ? "Active" : "Hidden"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/cars/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/listings/edit/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                      <Trash className="mr-1 h-4 w-4" />
                      Delete
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
          {isFavoritesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((car) => (
                <Card key={car.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>
                      {car.brand} {car.model}
                    </CardTitle>
                    <CardDescription>${car.price?.toLocaleString() || "Price not available"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-2">
                      {imageErrors[car.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <ImageOff className="h-12 w-12 text-gray-400" />
                        </div>
                      ) : (
                        <Image
                          src={getValidImageUrl(car.images?.[0], car) || "/placeholder.svg"}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(car.id)}
                          unoptimized
                        />
                      )}
                      <FavoriteButton
                        carId={car.id}
                        className="absolute right-2 top-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Year: {car.year || "N/A"}</p>
                      <p>Mileage: {car.mileage?.toLocaleString() || "N/A"} mi</p>
                      <p>Condition: {car.condition || "N/A"}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/cars/${car.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground fill-none" />
              <h3 className="text-lg font-medium">No Favorites Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't added any cars to your favorites yet.</p>
              <Link href="/cars">
                <Button>Browse Cars</Button>
              </Link>
            </div>
          )}
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
