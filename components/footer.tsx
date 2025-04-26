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
              Намери перфектния автомобил в нашата доверена платформа. Купувай и продавай с увереност.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Разгледай</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars" className="text-muted-foreground hover:text-foreground">
                  Разгледай автомобили
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="text-muted-foreground hover:text-foreground">
                  Продай автомобил
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> CarMarket. Всички права запазени.
        </div>
      </div>
    </footer>
  )
}
