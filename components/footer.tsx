import Link from "next/link"
import { Car } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
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
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-muted-foreground hover:text-foreground">
                  Добавете обява
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  За нас
                </Link>
              </li>
            </ul>
          </div>
        </div>
          
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CarMarket. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
