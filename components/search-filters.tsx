"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CAR_BRANDS, FUEL_TYPES, CONDITIONS } from "@/lib/constants"

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [brand, setBrand] = useState(searchParams.get("brand") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "0")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "100000")
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "2000")
  const [fuel, setFuel] = useState(searchParams.get("fuel") || "")
  const [condition, setCondition] = useState(searchParams.get("condition") || "")
  const [query, setQuery] = useState(searchParams.get("query") || "")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (brand) params.set("brand", brand)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (minYear) params.set("minYear", minYear)
    if (fuel) params.set("fuel", fuel)
    if (condition) params.set("condition", condition)
    if (query) params.set("query", query)

    router.push(`/cars?${params.toString()}`)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search cars..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brand</label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Any brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any brand</SelectItem>
              {CAR_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fuel Type</label>
          <Select value={fuel} onValueChange={setFuel}>
            <SelectTrigger>
              <SelectValue placeholder="Any fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any fuel type</SelectItem>
              {FUEL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Condition</label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any condition</SelectItem>
              {CONDITIONS.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Price Range</label>
            <span className="text-sm text-muted-foreground">
              ${Number.parseInt(minPrice).toLocaleString()} - ${Number.parseInt(maxPrice).toLocaleString()}
            </span>
          </div>
          <Slider
            defaultValue={[Number.parseInt(minPrice), Number.parseInt(maxPrice)]}
            max={100000}
            step={1000}
            onValueChange={(values) => {
              setMinPrice(values[0].toString())
              setMaxPrice(values[1].toString())
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Year (from)</label>
            <span className="text-sm text-muted-foreground">{minYear}</span>
          </div>
          <Slider
            defaultValue={[Number.parseInt(minYear)]}
            min={1990}
            max={new Date().getFullYear()}
            step={1}
            onValueChange={(values) => setMinYear(values[0].toString())}
          />
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full">
        Search Cars
      </Button>
    </div>
  )
}
