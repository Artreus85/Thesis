import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("API route /api/cars called")

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
    const brand = searchParams.get("brand") || undefined
    const minPrice = searchParams.get("minPrice") || undefined
    const maxPrice = searchParams.get("maxPrice") || undefined
    const minYear = searchParams.get("minYear") || undefined
    const fuel = searchParams.get("fuel") || undefined
    const condition = searchParams.get("condition") || undefined
    const query = searchParams.get("query") || undefined

    // Prepare filter parameters
    const filterParams: any = {}
    if (brand) filterParams.brand = brand
    if (minPrice) filterParams.minPrice = minPrice
    if (maxPrice) filterParams.maxPrice = maxPrice
    if (minYear) filterParams.minYear = minYear
    if (fuel) filterParams.fuel = fuel
    if (condition) filterParams.condition = condition
    if (query) filterParams.query = query

    // Try to import Firebase functions dynamically
    const { getFilteredCars } = await import("@/lib/firebase")

    console.log("Fetching filtered cars with params:", filterParams)
    const cars = await getFilteredCars(filterParams)
    console.log(`Found ${cars.length} cars matching filters`)

    // Return the cars with pagination info
    return NextResponse.json({
      cars,
      pagination: {
        total: cars.length,
        page,
        limit,
        totalPages: Math.ceil(cars.length / limit),
      },
    })
  } catch (error) {
    console.error("Error in /api/cars:", error)

    // Return a fallback response with empty data
    return NextResponse.json(
      {
        error: "Failed to fetch car listings",
        details: error instanceof Error ? error.message : String(error),
        fallback: true,
        cars: [], // Return empty array as fallback
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      },
      { status: 200 }, // Return 200 to prevent crashing the app
    )
  }
}
