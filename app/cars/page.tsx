"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FileSearch } from "lucide-react"
import { CarCard } from "@/components/car-card"
import { SearchFilters } from "@/components/search-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function CarsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCars, setTotalCars] = useState(0)

  const activeFilters = {
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    fuel: searchParams.get("fuel") || "",
    bodyType: searchParams.get("bodyType") || "",
    driveType: searchParams.get("driveType") || "",
    gearbox: searchParams.get("gearbox") || "",
    query: searchParams.get("query") || "",
  }

  const activeFilterCount = Object.values(activeFilters).filter((value) => value !== "").length

  useEffect(() => {
    async function fetchCars() {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const { getFilteredCars } = await import("@/lib/firebase")
        const filteredCars = await getFilteredCars(params)

        if (filteredCars.length === 0) {
          if (activeFilterCount > 0) {
            const allCars = await getFilteredCars({})
            if (allCars.length > 0) {
              setCars(allCars)
              setTotalCars(allCars.length)
              setError("Няма коли, отговарящи на филтрите. Показваме всички налични автомобили.")
            } else {
              setCars([])
              setTotalCars(0)
              setError("Няма налични автомобили в базата данни. Опитайте по-късно.")
            }
          } else {
            setCars([])
            setTotalCars(0)
          }
        } else {
          setCars(filteredCars)
          setTotalCars(filteredCars.length)
        }
      } catch (error) {
        console.error("Грешка при зареждане на коли:", error)
        setCars([])
        setTotalCars(0)
        setError("Възникна грешка при зареждане на автомобилите. Опитайте отново по-късно.")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [searchParams, activeFilterCount])

  const handleClearFilters = () => {
    router.push("/cars")
  }

  const getResultsSummary = () => {
    let summary = `${totalCars} ${totalCars === 1 ? "автомобил" : "автомобила"}`

    if (activeFilters.brand) {
      summary += ` • ${activeFilters.brand}`
      if (activeFilters.model) {
        summary += ` ${activeFilters.model}`
      }
    }

    if (activeFilters.condition) {
      summary += ` • ${activeFilters.condition}`
    }

    if (activeFilters.minYear && activeFilters.maxYear) {
      summary += ` • ${activeFilters.minYear}-${activeFilters.maxYear}`
    } else if (activeFilters.minYear) {
      summary += ` • След ${activeFilters.minYear}`
    } else if (activeFilters.maxYear) {
      summary += ` • Преди ${activeFilters.maxYear}`
    }

    if (activeFilters.minPrice && activeFilters.maxPrice) {
      summary += ` • ${Number(activeFilters.minPrice).toLocaleString()}–${Number(activeFilters.maxPrice).toLocaleString()} лв.`
    } else if (activeFilters.minPrice) {
      summary += ` • От ${Number(activeFilters.minPrice).toLocaleString()} лв.`
    } else if (activeFilters.maxPrice) {
      summary += ` • До ${Number(activeFilters.maxPrice).toLocaleString()} лв.`
    }

    return summary
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Разгледай автомобили</h1>

      <SearchFilters />

      {error && (
        <Alert className="mb-6">
          <AlertTitle>Известие</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{getResultsSummary()}</h2>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Изчисти всички филтри
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <CarsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.length > 0 ? (
            cars.map((car) => <CarCard key={car.id} car={car} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <FileSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Няма намерени автомобили</h3>
              <p className="text-muted-foreground mb-4">
                {activeFilterCount > 0
                  ? "Няма автомобили, отговарящи на зададените филтри. Пробвайте с различни критерии."
                  : "Няма публикувани обяви в момента. Върнете се по-късно или бъдете първи!"}
              </p>
              {activeFilterCount > 0 ? (
                <Button onClick={handleClearFilters}>Изчисти всички филтри</Button>
              ) : (
                <Link href="/listings/create">
                  <Button>Публикувай обява</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CarsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
