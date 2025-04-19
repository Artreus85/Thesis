import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, Fuel, Gauge, Mail, Phone, Share2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getValidImageUrl } from "@/lib/image-fallback"

// Add dynamic export
export const dynamic = "force-dynamic"

interface CarDetailPageProps {
  params: {
    id: string
  }
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  let car = null
  let seller = null

  try {
    // Dynamically import to prevent build errors
    const { getCarById, getUserById } = await import("@/lib/firebase")
    car = await getCarById(params.id)

    if (car) {
      seller = await getUserById(car.userId)
    }
  } catch (error) {
    console.error("Error fetching car details:", error)
  }

  if (!car) {
    notFound()
  }

  // Ensure car has images array
  const images = car.images || []

  // Get valid image URLs or fallbacks
  const mainImage = images.length > 0 ? getValidImageUrl(images[0], car) : getValidImageUrl(null, car)
  const additionalImages = images
    .slice(1, 5)
    .map((img, index) => getValidImageUrl(img, { brand: car.brand, model: `${car.model} ${index + 1}` }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              priority
              unoptimized // Use this for external URLs
            />
            <Badge className="absolute left-4 top-4 text-sm">{car.condition}</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {additionalImages.map((image, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${car.brand} ${car.model} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized // Use this for external URLs
                />
              </div>
            ))}
          </div>

          {/* Rest of the component remains the same */}
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-4 border rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </TabsContent>
            <TabsContent value="specs" className="p-4 border rounded-lg mt-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Engine</h3>
                  <p className="text-muted-foreground">
                    {car.power || "N/A"}hp {car.fuel || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Transmission</h3>
                  <p className="text-muted-foreground">{car.gearbox || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Performance</h3>
                  <p className="text-muted-foreground">0-60 mph in {car.power > 300 ? "under 6" : "under 8"} seconds</p>
                </div>
                <div>
                  <h3 className="font-medium">Dimensions</h3>
                  <p className="text-muted-foreground">Length: 4.5m, Width: 1.8m, Height: 1.5m</p>
                </div>
              </div>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
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
