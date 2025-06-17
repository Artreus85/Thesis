import { useState, createContext, useContext } from "react"
import type { Car } from "@/lib/types" // Adjust path if needed

type ComparisonContextType = {
  cars: Car[]
  toggleCar: (car: Car) => void
  isInComparison: (carId: string) => boolean
  clearComparison: () => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([])

  const toggleCar = (car: Car) => {
    setCars((prev) =>
      prev.find((c) => c.id === car.id)
        ? prev.filter((c) => c.id !== car.id)
        : prev.length < 2
          ? [...prev, car]
          : prev
    )
  }

  const isInComparison = (carId: string) => cars.some((c) => c.id === carId)
  const clearComparison = () => setCars([])

  return (
    <ComparisonContext.Provider value={{ cars, toggleCar, isInComparison, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) throw new Error("useComparison must be used within a ComparisonProvider")
  return context
}

/*
"use client";

import { CarCard } from "@/components/car-card";
import { Car } from "@/lib/types";
import { useState } from "react";
import { set } from "zod";

export default function ComparePage({ car1, car2 }: { car1: Car, car2: Car }) {
    const [cardBackground, setCardBackground] = useState<string>("bg-white");
    const [fuelTypeIsDifferent, setfuelTypeIsDifferent] = useState<boolean>(false);

    
    if(car1.fuel !== car2.fuel) {
        setfuelTypeIsDifferent(true);
    }

    const assignBackground = () => {
        return fuelTypeIsDifferent ? "bg-red-100" : "bg-green-100";
    }

    setCardBackground(assignBackground());
    
    return (
        <>
            <div className={`container mx-auto px-4 py-8 ${cardBackground}`}>
                <h1 className="text-3xl font-bold mb-6">Сравни обяви</h1>

                <CarCard car={car1}/>
                <CarCard car={car2}/>
            </div>
        </>
    );
}
*/