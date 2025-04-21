"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import { getAuth } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch all favorites for the current user
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()

      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch favorites")
      }

      const data = await response.json()

      // Convert array of favorites to a map of carId -> true
      const favoritesMap: Record<string, boolean> = {}
      data.favorites.forEach((favorite: any) => {
        favoritesMap[favorite.carId] = true
      })

      setFavorites(favoritesMap)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Check if a specific car is favorited
  const isFavorited = useCallback(
    (carId: string): boolean => {
      return !!favorites[carId]
    },
    [favorites],
  )

  // Toggle favorite status for a car
  const toggleFavorite = useCallback(
    async (carId: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to favorite listings",
          variant: "destructive",
        })
        return false
      }

      try {
        const auth = getAuth()
        const token = await auth.currentUser?.getIdToken()

        if (!token) {
          throw new Error("Not authenticated")
        }

        const response = await fetch("/api/favorites/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ carId }),
        })

        if (!response.ok) {
          throw new Error("Failed to toggle favorite")
        }

        const data = await response.json()

        // Update local state
        setFavorites((prev) => ({
          ...prev,
          [carId]: data.isFavorited,
        }))

        return data.isFavorited
      } catch (error) {
        console.error("Error toggling favorite:", error)
        toast({
          title: "Error",
          description: "Failed to update favorite status",
          variant: "destructive",
        })
        return isFavorited(carId)
      }
    },
    [user, toast, isFavorited],
  )

  // Load favorites when user changes
  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favorites,
    loading,
    isFavorited,
    toggleFavorite,
    fetchFavorites,
  }
}
