"use client"

import React from "react"

import { useState } from "react"
import { Star, CheckCircle, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"
import { Icon } from "@radix-ui/react-select"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase" // Ensure that you have initialized and exported 'db' from your Firebase config

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
  icon,
}: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const [isUpdating, setIsUpdating] = useState(false)
  const userId = "testUserId" // Added userId for authenticated user
  const favorited = isFavorited(carId)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
     if (!userId) throw new Error("User not logged in")

    const userDocRef = doc(db, "users", userId)

    if (favorited) {
      // Remove from favorites
      await updateDoc(userDocRef, {
      favorites: arrayRemove(carId),
      })
      toggleFavorite(carId)
    } else {
      // Add to favorites
      await updateDoc(userDocRef, {
      favorites: arrayUnion(carId),
      })
      toggleFavorite(carId)
    }
    return { favorited, isFavorited, toggleFavorite }
  }
/*
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
    */

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
      <Icon
        className={cn(
          "h-[1.2em] w-[1.2em] transition-all",
          favorited
            ? "fill-yellow-500 group-hover:fill-yellow-600"
            : "fill-none group-hover:fill-yellow-500"
        )}
      />
      
      {showText && <span className="ml-2">{favorited ? "Запазено" : "Запази"}</span>}
      <span className="sr-only">{favorited ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
