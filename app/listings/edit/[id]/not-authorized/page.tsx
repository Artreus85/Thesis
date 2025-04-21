"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { UnauthorizedAccess } from "@/components/unauthorized-access"

export default function NotAuthorizedPage() {
  const params = useParams()
  const carId = params.id as string
  const router = useRouter()

  // After 5 seconds, redirect to the car detail page
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/cars/${carId}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [carId, router])

  return (
    <UnauthorizedAccess
      message="You are not authorized to edit this listing. Only the listing owner or an administrator can modify this content."
      redirectUrl={`/cars/${carId}`}
      redirectLabel="View Listing"
    />
  )
}
