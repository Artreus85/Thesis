"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Fuel, Gauge, Mail, Phone, Share2, User, Car, Wrench, DoorOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FavoriteButton } from "@/components/favorite-button"

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Dynamically import to prevent build errors
        const { getCarById, getUserById } = await import("@/lib/firebase")
        const carData = await getCarById(params.id as string)

        if (carData) {
          setCar(carData)
          const sellerData = await getUserById(carData.userId)
          setSeller(sellerData)
        } else {
          setError("Car not found")
          router.push("/404")
        }
      } catch (error) {
        console.error("Error fetching car details:", error)
        setError("Failed to load car details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-lg mb-4" />
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/cars")}>Browse Other Cars</Button>
        </div>
      </div>
    )
  }

  if (!car) {
    return null
  }

  // Ensure car has images array
  const images = car.images || []

  // Format features as an array if it exists
  const features = car.features ? car.features.split(",").map((f: string) => f.trim()) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
            <Image
              src={images[0] || "/placeholder.svg?height=600&width=800&query=car"}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              priority
              unoptimized // Use this for external URLs
            />
            <Badge className="absolute left-4 top-4 text-sm">{car.condition}</Badge>
            <FavoriteButton
              carId={car.id}
              className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {images.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={image || "/placeholder.svg?height=600&width=800&query=car"}
                  alt={`${car.brand} ${car.model} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized // Use this for external URLs
                />
              </div>
            ))}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-4 border rounded-lg mt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Brand</h3>
                  <p>{car.brand || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
                  <p>{car.model || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Year</h3>
                  <p>{car.year || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Mileage</h3>
                  <p>{car.mileage?.toLocaleString() || "N/A"} mi</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fuel Type</h3>
                  <p>{car.fuel || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gearbox</h3>
                  <p>{car.gearbox || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Power</h3>
                  <p>{car.power || "N/A"} hp</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Condition</h3>
                  <p>{car.condition || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Body Type</h3>
                  <p>{car.bodyType || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Drive Type</h3>
                  <p>{car.driveType || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                  <p>{car.color || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doors</h3>
                  <p>{car.doors || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Seats</h3>
                  <p>{car.seats || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Engine Size</h3>
                  <p>{car.engineSize || "N/A"} L</p>
                </div>
                {car.vin && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">VIN</h3>
                    <p>{car.vin}</p>
                  </div>
                )}
                {car.licensePlate && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">License Plate</h3>
                    <p>{car.licensePlate}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="specs" className="p-4 border rounded-lg mt-2">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Vehicle</h3>
                    <p className="text-muted-foreground">
                      {car.year} {car.brand} {car.model}
                    </p>
                    <p className="text-muted-foreground">
                      {car.bodyType} • {car.color} • {car.condition}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Engine & Performance</h3>
                    <p className="text-muted-foreground">
                      {car.engineSize} L • {car.power} hp • {car.fuel}
                    </p>
                    <p className="text-muted-foreground">
                      {car.gearbox} • {car.driveType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DoorOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p className="text-muted-foreground">
                      {car.doors} doors • {car.seats} seats
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Mileage</h3>
                    <p className="text-muted-foreground">{car.mileage?.toLocaleString() || "N/A"} miles</p>
                  </div>
                </div>

                {car.vin && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Vehicle Identification</h3>
                      <p className="text-muted-foreground">
                        VIN: {car.vin}
                        {car.licensePlate && <> • License: {car.licensePlate}</>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="features" className="p-4 border rounded-lg mt-2">
              {features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No features listed for this vehicle.</p>
              )}
            </TabsContent>
            <TabsContent value="description" className="p-4 border rounded-lg mt-2">
              <p className="whitespace-pre-line">{car.description || "No description available"}</p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="sticky top-20">
            <div className="border rounded-lg p-6 mb-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  {car.brand} {car.model}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{car.year || "N/A"}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Gauge className="h-4 w-4" />
                  <span>{car.mileage?.toLocaleString() || "N/A"} mi</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Fuel className="h-4 w-4" />
                  <span>{car.fuel || "N/A"}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold">${car.price?.toLocaleString() || "N/A"}</div>
              </div>

              <div className="space-y-3">
                <Button className="w-full">Contact Seller</Button>
                <div className="flex gap-2">
                  <FavoriteButton carId={car.id} variant="outline" className="flex-1" showText={true} />
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 rounded-full bg-muted">
                  <User className="absolute inset-0 h-full w-full p-2" />
                </div>
                <div>
                  <h3 className="font-medium">{seller?.name || "Seller"}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(seller?.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Show Phone Number
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
