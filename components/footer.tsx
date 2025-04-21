import Link from "next/link"
import { Car } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <span className="font-bold">CarMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your perfect car on our trusted marketplace. Buy and sell with confidence.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars" className="text-muted-foreground hover:text-foreground">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-muted-foreground hover:text-foreground">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: support@carmarket.com</li>
              <li className="text-muted-foreground">Phone: +1 (555) 123-4567</li>
              <li className="text-muted-foreground">Address: 123 Market St, San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> CarMarket. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
