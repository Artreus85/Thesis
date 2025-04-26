"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Eye, MoreHorizontal, Trash, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getAllUsers, getAllListings, deleteUser, deleteListing, toggleListingVisibility } from "@/lib/firebase"
import type { User as UserType, Car } from "@/lib/types"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>([])
  const [listings, setListings] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log("Няма потребител, пренасочване...")
        router.push("/auth/login")
        return
      } 
      else if (user.role !== "admin") {
        console.log("Потребителят не е администратор, пренасочване...")
        router.push("/")
        return
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!authLoading && user && user.role === "admin") {
      const fetchData = async () => {
        try {
          console.log("Зареждане на данни като администратор:", user.id)
          setIsLoading(true)

          const [usersData, listingsData] = await Promise.all([getAllUsers(), getAllListings()])
          setUsers(usersData)
          setListings(listingsData)
          console.log(`Заредени са ${usersData.length} потребители и ${listingsData.length} обяви`)
        } 
        catch (error) {
          console.error("Грешка при зареждане:", error)
          setError("Неуспешно зареждане на админ данни. Опитайте отново.")
          toast({
            title: "Грешка",
            description: "Неуспешно зареждане на админ панел",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [user, authLoading, toast])

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Сигурни ли сте, че искате да изтриете този потребител?")) {
      try {
        await deleteUser(userId)
        setUsers(users.filter((u) => u.id !== userId))
        toast({
          title: "Потребителят е изтрит",
          description: "Потребителят беше успешно изтрит",
        })
      } catch (error) {
        console.error("Грешка при изтриване:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно изтриване на потребител",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Сигурни ли сте, че искате да изтриете тази обява?")) {
      try {
        await deleteListing(listingId)
        setListings(listings.filter((l) => l.id !== listingId))
        toast({
          title: "Обявата е изтрита",
          description: "Обявата беше успешно изтрита",
        })
      } catch (error) {
        console.error("Грешка при изтриване:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно изтриване на обява",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleVisibility = async (listingId: string, isVisible: boolean) => {
    try {
      await toggleListingVisibility(listingId, !isVisible)
      setListings(listings.map((l) => (l.id === listingId ? { ...l, isVisible: !isVisible } : l)))
      toast({
        title: isVisible ? "Обявата е скрита" : "Обявата е видима",
        description: `Обявата вече е ${isVisible ? "скрита" : "видима"}`,
      })
    } catch (error) {
      console.error("Грешка при промяна на видимостта:", error)
      toast({
        title: "Грешка",
        description: "Неуспешна промяна на видимостта",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Достъп отказан</AlertTitle>
          <AlertDescription>Нямате достъп до админ панела. Моля, влезте с администраторски акаунт.</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={() => router.push("/auth/login")}>Вход</Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Грешка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button onClick={() => window.location.reload()}>Опитай отново</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Админ Панел</h1>
          <p className="text-muted-foreground">
            Вписан като <span className="font-medium">{user.name}</span> ({user.email})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium">Администратор</span>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">Обяви</TabsTrigger>
          <TabsTrigger value="users">Потребители</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Автомобил</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Продавач</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {listing.brand} {listing.model}
                      </TableCell>
                      <TableCell>{listing.price.toLocaleString()} лв.</TableCell>
                      <TableCell>{listing.userId.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            listing.isVisible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {listing.isVisible ? "Видима" : "Скрита"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Действия</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/cars/${listing.id}`} className="flex w-full items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Преглед
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/listings/edit/${listing.id}`} className="flex w-full items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактирай
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVisibility(listing.id, listing.isVisible || false)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {listing.isVisible ? "Скрий" : "Покажи"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteListing(listing.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Изтрий
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Няма намерени обяви
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Име</TableHead>
                  <TableHead>Имейл</TableHead>
                  <TableHead>Роля</TableHead>
                  <TableHead>Присъединяване</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Действия</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/admin/users/${user.id}`} className="flex w-full items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Преглед
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/admin/users/edit/${user.id}`} className="flex w-full items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактирай
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Изтрий
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Няма намерени потребители
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
