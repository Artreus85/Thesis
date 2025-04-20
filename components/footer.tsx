import Link from "next/link"
import { Car } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-secondary"> {/* Changed to secondary color */}
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-primary" /> {/* Set icon color to primary */}
              <span className="font-bold text-primary">CarMarket</span> {/* Set text to primary */}
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your perfect car on our trusted marketplace. Buy and sell with confidence.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-primary">Explore</h3> {/* Set heading to primary */}
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars" className="text-muted-foreground hover:text-primary"> {/* Updated hover */}
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-muted-foreground hover:text-primary">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          {/* Similar changes for other sections... */}
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CarMarket. All rights reserved.
        </div>
      </div>
    </footer>
  )
}