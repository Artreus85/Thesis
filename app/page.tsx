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
        const { getFilteredCars } = await import("@/lib/firebase")
        console.log("Извличане на обяви за началната страница...")

        const params = {
          // Празни параметри за извличане на всички публични коли
        }

        const result = await getFilteredCars(params)

        setCars(result.slice(0, 100))
        console.log(`Извлечени са ${result.length} обяви, показваме 100`)
      } catch (error) {
        console.error("Грешка при зареждане на обявите:", error)
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
                Намери перфектната кола за теб
              </h1>
            </div>
            <div className="space-x-4">
              <Link href="/cars">
                <Button size="lg">Разгледай обяви за автомобили</Button>
              </Link>
              <Link href="/listings/create">
                <Button variant="outline" size="lg">
                  Обяви автомобила си за продажба 
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SearchFilters />

      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Препоръчани обяви</h2>
          <Link href="/cars">
            <Button variant="ghost">Виж всички</Button>
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
                <h3 className="text-lg font-medium">Няма налични обяви</h3>
                <p className="text-muted-foreground">Бъди първият, който ще публикува обява!</p>
                <Link href="/listings/create" className="mt-4 inline-block">
                  <Button>Добави обява</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
