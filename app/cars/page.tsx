"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CarCard } from "@/components/car-card"
import { SearchFilters } from "@/components/search-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarsPage() {
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      setLoading(true)
      try {
        // Create a params object from the search params
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        // Dynamically import to prevent build errors
        const { getFilteredCars } = await import("@/lib/firebase")
        const filteredCars = await getFilteredCars(params)
        setCars(filteredCars)
      } catch (error) {
        console.error("Error fetching filtered cars:", error)
        setCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Cars</h1>

      <SearchFilters />

      {loading ? (
        <CarsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.length > 0 ? (
            cars.map((car) => <CarCard key={car.id} car={car} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No cars found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
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
