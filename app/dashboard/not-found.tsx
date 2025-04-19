import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Dashboard Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The dashboard page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="default">Go Home</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
