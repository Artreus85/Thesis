"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Fuel, Gauge, Mail, Phone, Share2, User, Car, Wrench, DoorOpen, FileText, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FavoriteButton } from "@/components/favorite-button"

// Import the necessary components
import { useAuth } from "@/lib/auth"

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add the useAuth hook to get the current user
  const { user } = useAuth()

  useEffect(() => {
    async function fetchData() {
      try {
        const { getCarById, getUserById } = await import("@/lib/firebase")
        const carData = await getCarById(params.id as string)

        if (carData) {
          setCar(carData)
          const sellerData = await getUserById(carData.userId)
          setSeller(sellerData)
        } else {
          setError("Автомобилът не е намерен")
          router.push("/404")
        }
      } catch (error) {
        console.error("Грешка при зареждане на данните:", error)
        setError("Неуспешно зареждане на детайли за автомобила")
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
          <AlertTitle>Грешка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/cars")}>Разгледай други коли</Button>
        </div>
      </div>
    )
  }

  if (!car) return null

  const images = car.images || []
  const features = car.features ? car.features.split(",").map((f: string) => f.trim()) : []

  if(!car.isVisible) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTitle>Автомобилът не е наличен</AlertTitle>
          <AlertDescription>Този автомобил вече не е в продажба или е скрит от обявата.</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/cars")}>Разгледай други коли</Button>
        </div>
      </div>
    )
  }

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
              unoptimized
            />
            <Badge className="absolute left-4 top-4 text-sm">{car.condition}</Badge>
            <FavoriteButton
              carId={car.id}
              className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm hover:bg-white/90" icon={Star}  
              />          
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {images.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={image || "/placeholder.svg?height=600&width=800&query=car"}
                  alt={`${car.brand} ${car.model} - Снимка ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Детайли</TabsTrigger>
              <TabsTrigger value="specs">Спецификации</TabsTrigger>
              <TabsTrigger value="features">Екстри</TabsTrigger>
              <TabsTrigger value="description">Описание</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-4 border rounded-lg mt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Item label="Марка" value={car.brand} />
                <Item label="Модел" value={car.model} />
                <Item label="Година" value={car.year} />
                <Item label="Пробег" value={`${car.mileage?.toLocaleString() || "N/A"} км`} />
                <Item label="Гориво" value={car.fuel} />
                <Item label="Скорости" value={car.gearbox} />
                <Item label="Мощност" value={`${car.power} к.с.`} />
                <Item label="Състояние" value={car.condition} />
                <Item label="Каросерия" value={car.bodyType} />
                <Item label="Задвижване" value={car.driveType} />
                <Item label="Цвят" value={car.color} />
                <Item label="Врати" value={car.doors} />
                <Item label="Седалки" value={car.seats} />
                <Item label="Обем на двигателя" value={`${car.engineSize} л`} />
                {car.vin && <Item label="VIN" value={car.vin} />}
                {car.licensePlate && <Item label="Рег. номер" value={car.licensePlate} />}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="p-4 border rounded-lg mt-2">
              <SpecBlock
                icon={<Car className="h-5 w-5 text-muted-foreground mt-0.5" />}
                title="Автомобил"
                lines={[`${car.year} ${car.brand} ${car.model}`, `${car.bodyType} • ${car.color} • ${car.condition}`]}
              />
              <SpecBlock
                icon={<Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />}
                title="Двигател и представяне"
                lines={[`${car.engineSize} л • ${car.power} к.с. • ${car.fuel}`, `${car.gearbox} • ${car.driveType}`]}
              />
              <SpecBlock
                icon={<DoorOpen className="h-5 w-5 text-muted-foreground mt-0.5" />}
                title="Капацитет"
                lines={[`${car.doors} врати • ${car.seats} места`]}
              />
              <SpecBlock
                icon={<Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />}
                title="Пробег"
                lines={[`${car.mileage?.toLocaleString() || "N/A"} км`]}
              />
              {car.vin && (
                <SpecBlock
                  icon={<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />}
                  title="Идентификация"
                  lines={[`VIN: ${car.vin}`, car.licensePlate ? `Рег. номер: ${car.licensePlate}` : ""]}
                />
              )}
            </TabsContent>

            <TabsContent value="features" className="p-4 border rounded-lg mt-2">
              {features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.map((feature: any, i: any) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Няма добавени екстри за този автомобил.</p>
              )}
            </TabsContent>

            <TabsContent value="description" className="p-4 border rounded-lg mt-2">
              <p className="whitespace-pre-line">{car.description || "Няма описание"}</p>
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
                  <span>{car.mileage?.toLocaleString() || "N/A"} км</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Fuel className="h-4 w-4" />
                  <span>{car.fuel || "N/A"}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold">{car.price ? `${car.price.toLocaleString()} лв.` : "N/A"}</div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 rounded-full bg-muted">
                  <User className="absolute inset-0 h-full w-full p-2" />
                </div>
                <div>
                  <h3 className="font-medium">{seller?.name || "Продавач"}</h3>
                  <p className="text-sm text-muted-foreground">
                    Потребител от {new Date(seller?.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {seller?.phoneNumber ? (
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    {user ? seller.phoneNumber : "Влезте, за да видите"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Няма телефон
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Помощни компоненти
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p>{value || "N/A"}</p>
    </div>
  )
}

function SpecBlock({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <h3 className="font-medium">{title}</h3>
        {lines.map((line, i) => (
          <p key={i} className="text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
