"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const getRedirectUrl = () => {
    const redirect = searchParams.get("redirect")
    return redirect ? decodeURIComponent(redirect) : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Успешен вход",
        description: "Добре дошли обратно в CarMarket!",
      })

      const redirectUrl = getRedirectUrl()
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Грешка при вход:", error)

      let errorMessage = "Невалиден имейл или парола. Опитайте отново."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Невалиден имейл или парола. Опитайте отново."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Твърде много неуспешни опити. Опитайте по-късно."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Акаунтът е деактивиран. Свържете се с поддръжката."
      }

      toast({
        title: "Неуспешен вход",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Car className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl text-center">Вход</CardTitle>
          <CardDescription className="text-center">Въведете имейл и парола, за да влезете в профила си</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Имейл
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Парола
                </label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Влизане..." : "Влез"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Нямате профил?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Регистрирай се
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
