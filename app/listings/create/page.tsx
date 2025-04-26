"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { CarForm } from "@/components/car-form/car-form"

export default function CreateListingPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-background rounded-lg border shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-4">Необходим е вход</h1>
          <p className="mb-6 text-muted-foreground">За да създадете обява, трябва да влезете в профила си.</p>
          <Button onClick={() => router.push("/auth/login?redirect=/listings/create")}>Вход</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Създаване на обява</h1>
        <p className="text-muted-foreground mt-2">
          Попълнете информацията за вашия автомобил, за да създадете атрактивна обява
        </p>
      </div>

      <CarForm mode="create" />
    </div>
  )
}
