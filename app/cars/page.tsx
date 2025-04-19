import { Suspense } from "react"
import { CarCard } from "@/components/car-card"
import { SearchFilters } from "@/components/search-filters"
import { Skeleton } from "@/components/ui/skeleton"

// Add dynamic export
export const dynamic = "force-dynamic"

interface CarsPageProps {
  searchParams: {
    brand?: string
    minPrice?: string
    maxPrice?: string
    minYear?: string
    fuel?: string
    condition?: string
    query?: string
  }
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  let cars = []

  try {
    // Dynamically import to prevent build errors
    const { getFilteredCars } = await import("@/lib/firebase")
    cars = await getFilteredCars(searchParams)
  } catch (error) {
    console.error("Error fetching filtered cars:", error)
    cars = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Cars</h1>

      <SearchFilters />

      <Suspense fallback={<CarsGridSkeleton />}>
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
      </Suspense>
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
