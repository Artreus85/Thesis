import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface UnauthorizedAccessProps {
  message?: string
  redirectUrl?: string
  redirectLabel?: string
}

export function UnauthorizedAccess({
  message = "You don't have permission to access this page.",
  redirectUrl = "/",
  redirectLabel = "Go to Home",
}: UnauthorizedAccessProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="flex justify-center mt-6">
        <Link href={redirectUrl}>
          <Button>{redirectLabel}</Button>
        </Link>
      </div>
    </div>
  )
}
