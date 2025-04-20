"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, LogIn, Menu, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"

export function Header() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Начало", // modified
      active: pathname === "/",
    },
    {
      href: "/cars",
      label: "Каталог", // modified
      active: pathname === "/cars",
    },  
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-secondary"> {/* Changed to secondary color */}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" /> {/* Set icon color to primary */}
            <span className="font-bold text-primary">CarMarket</span> {/* Set text to primary */}
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/listings/create" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Listing
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex w-full">
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/listings/create" className="flex w-full">
                      Add Listing
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex w-full">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      route.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium">
                      My Dashboard
                    </Link>
                    <Link href="/listings/create" className="text-sm font-medium">
                      Add Listing
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-sm font-medium">
                        Admin Panel
                      </Link>
                    )}
                    <Button variant="ghost" onClick={() => signOut()}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button>Log In</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}