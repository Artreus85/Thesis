import Link from "next/link"
import { Button } from "@/components/ui/button"

// This is a simplified version for preview purposes only
export default function HomePreview() {
  // Mock data instead of fetching from Firebase
  const mockCars = [
    {
      id: "car1",
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      mileage: 15000,
      fuel: "Hybrid",
      price: 25000,
      condition: "Used",
      images: ["/silver-camry-suburban-street.png"],
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
      images: ["/urban-civic-night.png"],
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
      images: ["/sleek-electric-sedan.png"],
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
      images: ["/classic-mustang-drive.png"],
    },
  ]

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
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified search filters for preview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <input type="text" placeholder="Search cars..." className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any brand</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Tesla</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any price</option>
              <option>Under $10,000</option>
              <option>$10,000 - $30,000</option>
              <option>Over $30,000</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Any year</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
            </select>
          </div>
        </div>
        <Button className="w-full">Search Cars</Button>
      </div>

      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link href="/cars">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCars.map((car) => (
            <div key={car.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
              <div className="relative aspect-video">
                <img
                  src={car.images[0] || "/placeholder.svg"}
                  alt={`${car.brand} ${car.model}`}
                  className="object-cover w-full h-full"
                />
                <span className="absolute left-2 top-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                  {car.condition}
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">
                    {car.brand} {car.model}
                  </h3>
                  <span className="font-bold">${car.price.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {car.year} • {car.mileage.toLocaleString()} mi • {car.fuel}
                </div>
                <Button variant="outline" className="w-full mt-3">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
