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

export default function CarsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCars, setTotalCars] = useState(0)

  // Extract the search params we're using for display purposes
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

  // Count how many active filters we have for the results summary
  const activeFilterCount = Object.values(activeFilters).filter((value) => value !== "").length

  useEffect(() => {
    async function fetchCars() {
      setLoading(true)
      setError(null)
      try {
        // Create a params object from the search params
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        console.log("Fetching cars with params:", params)

        // Dynamically import to prevent build errors
        const { getFilteredCars } = await import("@/lib/firebase")
        const filteredCars = await getFilteredCars(params)

        console.log(`Received ${filteredCars.length} cars from getFilteredCars`)

        // Check if we have any cars
        if (filteredCars.length === 0) {
          // If no cars and we have filters, try fetching without filters
          if (activeFilterCount > 0) {
            console.log("No cars found with filters, trying to fetch all cars")
            const allCars = await getFilteredCars({})
            if (allCars.length > 0) {
              console.log(`Found ${allCars.length} cars without filters`)
              setCars(allCars)
              setTotalCars(allCars.length)
              setError("No cars match your filters, showing all available cars instead.")
            } else {
              console.log("No cars found at all")
              setCars([])
              setTotalCars(0)
              setError("No cars found in the database. Please try again later.")
            }
          } else {
            console.log("No cars found with no filters")
            setCars([])
            setTotalCars(0)
          }
        } else {
          setCars(filteredCars)
          setTotalCars(filteredCars.length)
        }
      } catch (error) {
        console.error("Error fetching filtered cars:", error)
        setCars([])
        setTotalCars(0)
        setError("An error occurred while fetching cars. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [searchParams, activeFilterCount])

  const handleClearFilters = () => {
    router.push("/cars")
  }

  // Assemble the results summary text
  const getResultsSummary = () => {
    let summary = `${totalCars} ${totalCars === 1 ? "car" : "cars"}`

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
      summary += ` • After ${activeFilters.minYear}`
    } else if (activeFilters.maxYear) {
      summary += ` • Before ${activeFilters.maxYear}`
    }

    if (activeFilters.minPrice && activeFilters.maxPrice) {
      summary += ` • $${Number(activeFilters.minPrice).toLocaleString()}-$${Number(activeFilters.maxPrice).toLocaleString()}`
    } else if (activeFilters.minPrice) {
      summary += ` • From $${Number(activeFilters.minPrice).toLocaleString()}`
    } else if (activeFilters.maxPrice) {
      summary += ` • Up to $${Number(activeFilters.maxPrice).toLocaleString()}`
    }

    return summary
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Cars</h1>

      <SearchFilters />

      {/* Error message */}
      {error && (
        <Alert className="mb-6">
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results summary */}
      {!loading && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{getResultsSummary()}</h2>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear All Filters
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
              <h3 className="text-lg font-medium">No cars found</h3>
              <p className="text-muted-foreground mb-4">
                {activeFilterCount > 0
                  ? "No cars match your current filter criteria. Try adjusting your filters or search query."
                  : "There are no car listings available at the moment. Check back later or be the first to add a listing!"}
              </p>
              {activeFilterCount > 0 ? (
                <Button onClick={handleClearFilters}>Clear All Filters</Button>
              ) : (
                <Link href="/listings/create">
                  <Button>Add Listing</Button>
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

// Add missing Link import
import Link from "next/link"
