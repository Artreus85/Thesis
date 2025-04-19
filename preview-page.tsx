"use client"

import { useState } from "react"
import { Search, Calendar, Fuel, Gauge, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PreviewHomepage() {
  // Mock data for preview
  const [cars] = useState([
    {
      id: "car1",
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      mileage: 15000,
      fuel: "Hybrid",
      price: 25000,
      condition: "Used",
      images: ["/silver-camry-street.png"],
    },
    {
      id: "car2",
      brand: "Honda",
      model: "Civic",
      year: 2023,
      mileage: 5000,
      fuel: "Petrol",
      price: 22000,
      condition: "Used",
      images: ["/sleek-blue-civic.png"],
    },
    {
      id: "car3",
      brand: "Tesla",
      model: "Model 3",
      year: 2023,
      mileage: 1000,
      fuel: "Electric",
      price: 45000,
      condition: "New",
      images: ["/sleek-white-tesla.png"],
    },
    {
      id: "car4",
      brand: "Ford",
      model: "Mustang",
      year: 2021,
      mileage: 12000,
      fuel: "Petrol",
      price: 38000,
      condition: "Used",
      images: ["/classic-red-mustang.png"],
    },
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
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
              <Button size="lg">Browse Cars</Button>
              <Button variant="outline" size="lg">
                Sell Your Car
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search cars..." className="w-full pl-8 pr-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any brand</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Tesla</option>
              <option>Ford</option>
              <option>BMW</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fuel Type</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any fuel type</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Hybrid</option>
              <option>Electric</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any condition</option>
              <option>New</option>
              <option>Used</option>
              <option>Certified Pre-Owned</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Price Range</label>
              <span className="text-sm text-muted-foreground">$0 - $100,000</span>
            </div>
            <input type="range" className="w-full" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Year (from)</label>
              <span className="text-sm text-muted-foreground">2000</span>
            </div>
            <input type="range" className="w-full" />
          </div>
        </div>

        <Button className="w-full">Search Cars</Button>
      </div>

      {/* Featured Listings */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Button variant="ghost">View All</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={car.images[0] || "/placeholder.svg"}
                  alt={`${car.brand} ${car.model}`}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
                <button className="absolute right-2 top-2 bg-white/80 rounded-full p-1.5 backdrop-blur-sm hover:bg-white/90">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to favorites</span>
                </button>
                <Badge className="absolute left-2 top-2">{car.condition}</Badge>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {car.brand} {car.model}
                    </h3>
                    <span className="font-bold text-lg">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{car.year}</span>
                    </div>
                    <div className="flex items-center">
                      <Gauge className="mr-1 h-4 w-4" />
                      <span>{car.mileage.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center">
                      <Fuel className="mr-1 h-4 w-4" />
                      <span>{car.fuel}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The three-column section has been removed as requested */}
    </div>
  )
}
