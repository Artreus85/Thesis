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
import { getUserListings, deleteListing, getFavoritedCars } from "@/lib/firebase"
import { getValidImageUrl } from "@/lib/image-fallback"
import { handleFirestoreError } from "@/lib/firebase-error-handler"
import { FavoriteButton } from "@/components/favorite-button"
import type { Car as CarType } from "@/lib/types"
// Import the ProfileEditForm component
import { ProfileEditForm } from "@/components/profile-edit-form"

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

  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
      console.log("Проверка на автентикацията приключи:", user ? "вписан" : "не е вписан")
    }
  }, [authLoading, user])

  useEffect(() => {
    if (!authChecked) return

    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true)
          const userListings = await getUserListings(user.id)
          setListings(userListings)
        } catch (error) {
          handleFirestoreError(error, "Неуспешно зареждане на вашите обяви")
          setError("Неуспешно зареждане на обявите. Моля, опитайте по-късно.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    } else {
      router.push("/auth/login")
    }
  }, [authChecked, user, router])

  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setIsFavoritesLoading(true)
        const favoritedCars = await getFavoritedCars(user.id)
        setFavorites(favoritedCars)
      } catch (error) {
        handleFirestoreError(error, "Неуспешно зареждане на любими")
      } finally {
        setIsFavoritesLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Сигурни ли сте, че искате да изтриете тази обява?")) {
      try {
        await deleteListing(listingId)
        setListings(listings.filter((l) => l.id !== listingId))
        toast({
          title: "Обявата е изтрита",
          description: "Вашата обява беше успешно изтрита",
        })
      } catch (error) {
        handleFirestoreError(error, "Неуспешно изтриване на обявата")
      }
    }
  }

  const handleImageError = (listingId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [listingId]: true,
    }))
  }

  if (authLoading || (isLoading && user)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Зареждане на таблото...</p>
      </div>
    )
  }

  if (connectionBlocked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>Връзката е блокирана</AlertTitle>
          <AlertDescription>
            Връзката с базата данни е блокирана. Проверете разширенията за поверителност или добавете изключение за този
            сайт.
          </AlertDescription>
        </Alert>
        {user && (
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Здравей, {user.name}</h1>
            <p className="mb-6 text-muted-foreground">Показваме ограничена функционалност поради проблем с връзката.</p>
            <Button onClick={() => window.location.reload()}>Опитай отново</Button>
          </div>
        )}
      </div>
    )
  }

  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Възникна грешка</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} size="lg">
            Опитай отново
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Необходим е вход</h1>
          <p className="mb-6 text-muted-foreground">Впишете се, за да управлявате своите обяви.</p>
          <Link href="/auth/login">
            <Button size="lg">Вход</Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Нямате акаунт?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Регистрация
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Моето табло</h1>
        <Link href="/listings/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Нова обява
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">Моите обяви</TabsTrigger>
          <TabsTrigger value="favorites">Любими</TabsTrigger>
          <TabsTrigger value="account">Профил</TabsTrigger>
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
                    <CardDescription>{listing.price?.toLocaleString() || "Няма цена"} лв.</CardDescription>
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
                      <p>Година: {listing.year || "–"}</p>
                      <p>Пробег: {listing.mileage?.toLocaleString() || "–"} км</p>
                      <p>Статус: {listing.isVisible ? "Активна" : "Скрита"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/cars/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" /> Преглед
                      </Button>
                    </Link>
                    <Link href={`/listings/edit/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-4 w-4" /> Редактирай
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                      <Trash className="mr-1 h-4 w-4" /> Изтрий
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Все още нямате обяви</h3>
              <p className="text-muted-foreground mb-4">Добавете първата си автомобилна обява.</p>
              <Link href="/listings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Добави обява
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
                    <CardDescription>{car.price?.toLocaleString() + " лв." || "Няма цена"}</CardDescription>
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
                      <p>Година: {car.year || "–"}</p>
                      <p>Пробег: {car.mileage?.toLocaleString() || "–"} км</p>
                      <p>Състояние: {car.condition || "–"}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/cars/${car.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <Eye className="mr-1 h-4 w-4" /> Виж детайли
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground fill-none" />
              <h3 className="text-lg font-medium">Нямате любими</h3>
              <p className="text-muted-foreground mb-4">Все още не сте добавили любими автомобили.</p>
              <Link href="/cars">
                <Button>Разгледай автомобили</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="account">
          <ProfileEditForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
