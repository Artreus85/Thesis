import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Таблото не е намерено</h1>
        <p className="mb-6 text-muted-foreground">
          Страницата на таблото, която търсите, не съществува или нямате достъп до нея.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="default">Към началната страница</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Вход</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
