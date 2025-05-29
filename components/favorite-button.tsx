"use client"

import type React from "react"

import { useState } from "react"
import { LucideIcon, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  carId: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
  icon: LucideIcon
}

export function FavoriteButton({
  carId,
  variant = "ghost",
  size = "icon",
  className = "",
  showText = false,
}: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const [isUpdating, setIsUpdating] = useState(false)
  const favorited = isFavorited(carId)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isUpdating) return

    setIsUpdating(true)
    try {
      await toggleFavorite(carId)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "group",
        favorited ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500",
        className,
      )}
      onClick={handleToggleFavorite}
      disabled={isUpdating}
    >
      <Star
        className={cn(
          "h-[1.2em] w-[1.2em] transition-all",
          favorited ? "fill-yellow-500 group-hover:fill-yellow-600" : "fill-none group-hover:fill-yellow-500",
        )}
      />
      {showText && <span className="ml-2">{favorited ? "Запазено" : "Запази"}</span>}
      <span className="sr-only">{favorited ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
