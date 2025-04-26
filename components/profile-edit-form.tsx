"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"

type ProfileEditFormProps = {}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = () => {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      await updateUserProfile(user.id, { name, phoneNumber })

      toast({
        title: "Профилът е обновен",
        description: "Вашият профил беше успешно обновен",
      })
    } catch (error: any) {
      console.error("Грешка при обновяване на профила:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на профила. Моля, опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактиране на профила</CardTitle>
        <CardDescription>Променете информацията за вашия профил</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Име</Label>
            <Input id="name" placeholder="Вашето име" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефонен номер</Label>
            <Input
              id="phone"
              placeholder="+359 88 888 8888"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "Запазване..." : "Запази промените"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
