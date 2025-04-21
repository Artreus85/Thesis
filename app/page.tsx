"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CarCard } from "@/components/car-card"
import { SearchFilters } from "@/components/search-filters"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      try {
        // Dynamically import to prevent build errors
        const { getCarListings } = await import("@/lib/firebase")
        console.log("Fetching car listings for homepage...")

        // Destructure the result to get just the cars array
        const result = await getCarListings(8) // Limit to 8 featured listings
        setCars(result.cars)
        console.log(`Fetched ${result.cars.length} car listings for homepage`)
      } catch (error) {
        console.error("Error fetching car listings:", error)
        // Provide fallback data if fetch fails
        setCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Find Your Perfect Car
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Browse thousands of cars from trusted sellers. Find the perfect match for your needs and budget.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/cars">
                <Button size="lg">Browse Cars</Button>
              </Link>
              <Link href="/listings/create">
                <Button variant="outline" size="lg">
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SearchFilters />

      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link href="/cars">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 h-64 animate-pulse bg-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.length > 0 ? (
              cars.map((car) => <CarCard key={car.id} car={car} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">No listings available</h3>
                <p className="text-muted-foreground">Be the first to add a car listing!</p>
                <Link href="/listings/create" className="mt-4 inline-block">
                  <Button>Add Listing</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
