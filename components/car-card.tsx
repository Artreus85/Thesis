import Image from "next/image"
import Link from "next/link"
import { Calendar, Fuel, Gauge, Heart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Car } from "@/lib/types"

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={car.images && car.images.length > 0 ? car.images[0] : "/placeholder.svg?height=200&width=300&query=car"}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to favorites</span>
        </Button>
        <Badge className="absolute left-2 top-2">{car.condition}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {car.brand} {car.model}
            </h3>
            <span className="font-bold text-lg">${car.price.toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
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
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
