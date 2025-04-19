export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "regular"
  createdAt: string
}

export interface Car {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  fuel: string
  gearbox: string
  power: number
  price: number
  condition: string
  description: string
  images: string[]
  userId: string
  createdAt: string
  isVisible?: boolean
}
