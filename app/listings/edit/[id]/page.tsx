"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { getCarById } from "@/lib/firebase"
import { CarForm } from "@/components/car-form/car-form"

export default function EditListingPage() {
  const { id: carId } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!carId) return

    async function fetchCar() {
      try {
        setLoading(true)
        const carData = await getCarById(carId as string)

        if (!carData) {
          setError("Автомобилът не е намерен")
          return
        }

        setCar(carData)

        // Check authorization
        if (user && (user.id === carData.userId || user.role === "admin")) {
          // User is authorized
        } else {
          setError("Нямате право да редактирате тази обява")
          setTimeout(() => router.push(`/cars/${carId}`), 3000)
        }
      } catch (err) {
        console.error("Error fetching car:", err)
        setError("Неуспешно зареждане на данните за автомобила")
      } finally {
        setLoading(false)
      }
    }

    // Redirect if not authenticated
    if (!user && !authLoading) {
      setError("Моля, влезте в профила си, за да редактирате обяви")
      setTimeout(() => router.push(`/auth/login?redirect=/listings/edit/${carId}`), 2000)
      return
    }

    if (user) {
      fetchCar()
    }
  }, [carId, user, authLoading, router])

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Зареждане на данните...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Грешка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.back()}>Назад</Button>
        </div>
      </div>
    )
  }

  if (!car) return null

  const defaultValues = {
    brand: car.brand || "",
    model: car.model || "",
    year: car.year?.toString() || "",
    mileage: car.mileage?.toString() || "",
    fuel: car.fuel || "",
    gearbox: car.gearbox || "",
    power: car.power?.toString() || "",
    price: car.price?.toString() || "",
    condition: car.condition || "",
    bodyType: car.bodyType || "",
    driveType: car.driveType || "",
    color: car.color || "",
    doors: car.doors?.toString() || "",
    seats: car.seats?.toString() || "",
    engineSize: car.engineSize?.toString() || "",
    vin: car.vin || "",
    licensePlate: car.licensePlate || "",
    features: car.features || "",
    description: car.description || "",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Редактиране на обява</h1>
        <p className="text-muted-foreground mt-2">
          Актуализирайте информацията за вашия {car.brand} {car.model}
        </p>
      </div>

      <CarForm mode="edit" defaultValues={defaultValues} existingImages={car.images || []} carId={carId as string} />
    </div>
  )
}
