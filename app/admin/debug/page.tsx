"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"

export default function AdminDebugPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [isSettingAdmin, setIsSettingAdmin] = useState(false)

  const handleSetAdmin = async () => {
    if (!userId) {
      toast({
        title: "Грешка",
        description: "Моля, въведете потребителско ID",
        variant: "destructive",
      })
      return
    }

    setIsSettingAdmin(true)
    try {
      const { setUserAsAdmin } = await import("@/lib/firebase")
      await setUserAsAdmin(userId)

      toast({
        title: "Успешно",
        description: `Потребител ${userId} е назначен като админ`,
      })
    } catch (error) {
      console.error("Грешка при задаване на админ:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно задаване на потребителя като админ",
        variant: "destructive",
      })
    } finally {
      setIsSettingAdmin(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Необходима е автентикация</h1>
        <p className="mb-6">Моля, влезте в профила си, за да получите достъп до страницата</p>
        <Button onClick={() => router.push("/auth/login")}>Вход</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Админ инструменти за отстраняване на грешки</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Информация за текущия потребител</CardTitle>
            <CardDescription>Детайли за вашата текуща сесия</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Потребителско ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Име:</span> {user.name}
              </div>
              <div>
                <span className="font-medium">Имейл:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Роля:</span> {user.role}
              </div>
              <div>
                <span className="font-medium">Създаден на:</span> {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Назначаване на потребител като админ</CardTitle>
            <CardDescription>Промотиране на потребител до админ роля</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Потребителско ID</label>
                <Input
                  placeholder="Въведете потребителско ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Въведете Firebase UID на потребителя, който искате да направите админ
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSetAdmin} disabled={isSettingAdmin || !userId} className="w-full">
              {isSettingAdmin ? "Задаване..." : "Назначи като Админ"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Вашето текущо потребителско ID е: <code className="bg-muted px-1 py-0.5 rounded">{user.id}</code>
        </p>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Обратно към Админ панела
        </Button>
      </div>
    </div>
  )
}
