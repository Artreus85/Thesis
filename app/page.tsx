import Link from "next/link"
import { CarCard } from "@/components/car-card"
import { SearchFilters } from "@/components/search-filters"
import { Button } from "@/components/ui/button"
import { getCarListings } from "@/lib/firebase"

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cars = await getCarListings(8) // Limit to 8 featured listings

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

      <SearchFilters />

      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link href="/cars">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

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
      </section>

      <section className="py-12 bg-gray-50 rounded-xl my-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Easy Process</div>
              <h3 className="text-2xl font-bold">Sell Your Car in 3 Simple Steps</h3>
              <p className="text-gray-500">Create an account, add your listing with photos, and connect with buyers.</p>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Verified Sellers</div>
              <h3 className="text-2xl font-bold">Buy with Confidence</h3>
              <p className="text-gray-500">
                All sellers are verified and listings are reviewed for quality and accuracy.
              </p>
              <Link href="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Support</div>
              <h3 className="text-2xl font-bold">Need Help?</h3>
              <p className="text-gray-500">Our support team is available to assist you with any questions or issues.</p>
              <Link href="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
