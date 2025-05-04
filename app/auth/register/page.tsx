"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
// First, import the PhoneInput component
import { PhoneInput } from "@/components/phone-input"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  // Update the state to include phoneNumber
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Update the handleSubmit function to include phoneNumber
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Паролите не съвпадат",
        description: "Моля, уверете се, че паролите съвпадат.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await signUp(name, email, password, phoneNumber)
      toast({
        title: "Успешна регистрация",
        description: "Добре дошли в CarMarket! Вече сте вписани.",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Грешка при регистрация:", error)

      let errorMessage = "Възникна грешка при създаване на акаунт. Моля, опитайте отново."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Този имейл вече е регистриран. Моля, използвайте друг или опитайте да влезете."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Паролата е твърде слаба. Моля, използвайте по-силна парола."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Невалиден имейл адрес. Моля, проверете и опитайте отново."
      }

      toast({
        title: "Неуспешна регистрация",
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
          <CardTitle className="text-2xl text-center">Създай профил</CardTitle>
          <CardDescription className="text-center">Въведете информация, за да създадете профил</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Име
              </label>
              <Input
                id="name"
                placeholder="Име Фамилия"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* Add the PhoneInput component to the form after the email field */}
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

            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              required
              label="Телефонен номер"
              placeholder="+359 88 888 8888"
            />
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Парола
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Потвърди паролата
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Създаване на профил..." : "Създай профил"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Вече имате профил?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Вход
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
