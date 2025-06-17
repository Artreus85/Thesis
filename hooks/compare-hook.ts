import { useState, useEffect } from "react"

const MAX_COMPARE = 2

export function useCompare() {
  const [cars, setCars] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("compareCars")
    if (saved) {
      setCars(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("compareCars", JSON.stringify(cars))
  }, [cars])

  function toggleCompare(id: string) {
    setCars((prev) =>
      prev.includes(id)
        ? prev.filter((carId) => carId !== id)
        : prev.length < MAX_COMPARE
        ? [...prev, id]
        : prev
    )
  }

  function isSelected(id: string) {
    return cars.includes(id)
  }

  return { cars, toggleCompare, isSelected }
}
