"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CAR_BRANDS, FUEL_TYPES, CONDITIONS, BODY_TYPES, DRIVE_TYPES, GEARBOX_TYPES } from "@/lib/constants"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface FilterParams {
  brand: string
  model: string
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  fuel: string
  condition: string
  bodyType: string
  driveType: string
  gearbox: string
  query: string
}

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentYear = new Date().getFullYear()

  const [filters, setFilters] = useState<FilterParams>({
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    minPrice: searchParams.get("minPrice") || "0",
    maxPrice: searchParams.get("maxPrice") || "100000",
    minYear: searchParams.get("minYear") || "2000",
    maxYear: searchParams.get("maxYear") || currentYear.toString(),
    fuel: searchParams.get("fuel") || "",
    condition: searchParams.get("condition") || "",
    bodyType: searchParams.get("bodyType") || "",
    driveType: searchParams.get("driveType") || "",
    gearbox: searchParams.get("gearbox") || "",
    query: searchParams.get("query") || "",
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0)

  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (!value) return acc
      if (key === "minPrice" && value === "0") return acc
      if (key === "maxPrice" && value === "100000") return acc
      if (key === "minYear" && value === "2000") return acc
      if (key === "maxYear" && value === currentYear.toString()) return acc
      return acc + 1
    }, 0)

    setActiveFiltersCount(count)
  }, [filters, currentYear])

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === "minPrice" && value === "0") return
        if (key === "maxPrice" && value === "100000") return
        if (key === "minYear" && value === "2000") return
        if (key === "maxYear" && value === currentYear.toString()) return
        if (value === "any") return
        params.set(key, value)
      }
    })

    router.push(`/cars?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      brand: "",
      model: "",
      minPrice: "0",
      maxPrice: "100000",
      minYear: "2000",
      maxYear: currentYear.toString(),
      fuel: "",
      condition: "",
      bodyType: "",
      driveType: "",
      gearbox: "",
      query: "",
    })
  }

  const handleFilterChange = (name: keyof FilterParams, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    }))
  }

  const handleYearRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minYear: values[0].toString(),
      maxYear: values[1].toString(),
    }))
  }

  const renderFilterBadges = () => {
    const badges = []

    if (filters.brand && filters.brand !== "any") {
      badges.push(
        <Badge key="brand" variant="outline" className="flex items-center gap-1">
          Марка: {filters.brand}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("brand", "")} />
        </Badge>,
      )
    }

    if (filters.model) {
      badges.push(
        <Badge key="model" variant="outline" className="flex items-center gap-1">
          Модел: {filters.model}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("model", "")} />
        </Badge>,
      )
    }

    if (filters.condition && filters.condition !== "any") {
      badges.push(
        <Badge key="condition" variant="outline" className="flex items-center gap-1">
          Състояние: {filters.condition}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("condition", "")} />
        </Badge>,
      )
    }

    if (filters.fuel && filters.fuel !== "any") {
      badges.push(
        <Badge key="fuel" variant="outline" className="flex items-center gap-1">
          Гориво: {filters.fuel}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("fuel", "")} />
        </Badge>,
      )
    }

    if (filters.bodyType && filters.bodyType !== "any") {
      badges.push(
        <Badge key="bodyType" variant="outline" className="flex items-center gap-1">
          Каросерия: {filters.bodyType}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("bodyType", "")} />
        </Badge>,
      )
    }

    if (filters.gearbox && filters.gearbox !== "any") {
      badges.push(
        <Badge key="gearbox" variant="outline" className="flex items-center gap-1">
          Скорости: {filters.gearbox}
          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("gearbox", "")} />
        </Badge>,
      )
    }

    return badges
  }

  // Desktop filter UI
  const desktopFilters = (
    <div className="hidden lg:block bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Търсене</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Търсене на коли..."
              className="pl-8"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Марка</label>
          <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички марки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички марки</SelectItem>
              {CAR_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Модел</label>
          <Input
            type="text"
            placeholder="Всички модели"
            value={filters.model}
            onChange={(e) => handleFilterChange("model", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Състояние</label>
          <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички състояния" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички състояния</SelectItem>
              {CONDITIONS.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Тип каросерия</label>
          <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange("bodyType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички типове" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички типове</SelectItem>
              {BODY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Гориво</label>
          <Select value={filters.fuel} onValueChange={(value) => handleFilterChange("fuel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички видове гориво" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички видове гориво</SelectItem>
              {FUEL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Ценови диапазон</label>
            <span className="text-sm text-muted-foreground">
              {filters.minPrice} лв. – {filters.maxPrice} лв.
            </span>
          </div>
          <Slider
            value={[Number.parseInt(filters.minPrice), Number.parseInt(filters.maxPrice)]}
            min={0}
            max={100000}
            step={1000}
            onValueChange={handlePriceRangeChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Години</label>
            <span className="text-sm text-muted-foreground">
              {filters.minYear} – {filters.maxYear}
            </span>
          </div>
          <Slider
            value={[Number.parseInt(filters.minYear), Number.parseInt(filters.maxYear)]}
            min={1990}
            max={currentYear}
            step={1}
            onValueChange={handleYearRangeChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Скорости</label>
          <Select value={filters.gearbox} onValueChange={(value) => handleFilterChange("gearbox", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички скоростни кутии" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички скоростни кутии</SelectItem>
              {GEARBOX_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Задвижване</label>
          <Select value={filters.driveType} onValueChange={(value) => handleFilterChange("driveType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Всички типове задвижване" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Всички типове задвижване</SelectItem>
              {DRIVE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderFilterBadges().length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {renderFilterBadges()}
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
            Изчисти всички
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          Търси коли
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Нулирай
        </Button>
      </div>
    </div>
  )

  // Mobile filter UI using sheet component
  const mobileFilters = (
    <div className="lg:hidden mb-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Търсене на коли..."
            className="pl-8"
            value={filters.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Филтри
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Филтрирай коли</SheetTitle>
              <SheetDescription>Стесни търсенето си с помощта на филтри</SheetDescription>
            </SheetHeader>

            <div className="py-4">
              <Accordion type="single" collapsible className="w-full" defaultValue="brand">
                <AccordionItem value="brand">
                  <AccordionTrigger>Марка и модел</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Марка</Label>
                        <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Всички марки" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички марки</SelectItem>
                            {CAR_BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Модел</Label>
                        <Input
                          type="text"
                          placeholder="Всички модели"
                          value={filters.model}
                          onChange={(e) => handleFilterChange("model", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                  <AccordionTrigger>Ценови диапазон</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {Number.parseInt(filters.minPrice).toLocaleString()} лв. –{" "}
                          {Number.parseInt(filters.maxPrice).toLocaleString()} лв.
                        </span>
                      </div>
                      <Slider
                        value={[Number.parseInt(filters.minPrice), Number.parseInt(filters.maxPrice)]}
                        min={0}
                        max={100000}
                        step={1000}
                        onValueChange={handlePriceRangeChange}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="year">
                  <AccordionTrigger>Години</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {filters.minYear} – {filters.maxYear}
                        </span>
                      </div>
                      <Slider
                        value={[Number.parseInt(filters.minYear), Number.parseInt(filters.maxYear)]}
                        min={1990}
                        max={currentYear}
                        step={1}
                        onValueChange={handleYearRangeChange}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vehicle">
                  <AccordionTrigger>Детайли за автомобила</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Състояние</Label>
                        <Select
                          value={filters.condition}
                          onValueChange={(value) => handleFilterChange("condition", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Всички състояния" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички състояния</SelectItem>
                            {CONDITIONS.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Каросерия</Label>
                        <Select
                          value={filters.bodyType}
                          onValueChange={(value) => handleFilterChange("bodyType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Всички типове каросерия" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички типове каросерия</SelectItem>
                            {BODY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Гориво</Label>
                        <Select value={filters.fuel} onValueChange={(value) => handleFilterChange("fuel", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Всички видове гориво" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички видове гориво</SelectItem>
                            {FUEL_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Скорости</Label>
                        <Select value={filters.gearbox} onValueChange={(value) => handleFilterChange("gearbox", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Всички скоростни кутии" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички скоростни кутии</SelectItem>
                            {GEARBOX_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Задвижване</Label>
                        <Select
                          value={filters.driveType}
                          onValueChange={(value) => handleFilterChange("driveType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Всички типове задвижване" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Всички типове задвижване</SelectItem>
                            {DRIVE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <SheetClose asChild>
                <Button onClick={handleSearch} className="w-full">
                  Приложи филтрите
                </Button>
              </SheetClose>

              <Button variant="outline" onClick={handleReset} className="w-full">
                Нулирай филтрите
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {renderFilterBadges().length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {renderFilterBadges()}
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
            Изчисти всички
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {desktopFilters}
      {mobileFilters}
    </>
  )
}
