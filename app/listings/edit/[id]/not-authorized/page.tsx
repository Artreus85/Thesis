"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { UnauthorizedAccess } from "@/components/unauthorized-access"

export default function NotAuthorizedPage() {
  const params = useParams()
  const carId = params.id as string
  const router = useRouter()

  // След 5 секунди пренасочване към страницата на обявата
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/cars/${carId}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [carId, router])

  return (
    <UnauthorizedAccess
      message="Нямате разрешение да редактирате тази обява. Само собственикът на обявата или администратор може да я променя."
      redirectUrl={`/cars/${carId}`}
      redirectLabel="Прегледай обявата"
    />
  )
}
