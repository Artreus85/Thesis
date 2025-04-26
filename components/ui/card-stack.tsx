"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface CardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  items: React.ReactNode[]
  activeIndex: number
}

export function CardStack({ items, activeIndex, className, ...props }: CardStackProps) {
  return (
    <div className={cn("relative w-full", className)} {...props}>
      {items.map((item, index) => {
        const isActive = index === activeIndex
        const isPrevious = index < activeIndex
        const isNext = index > activeIndex

        return (
          <div
            key={index}
            className={cn(
              "absolute top-0 left-0 w-full transition-all duration-300 ease-in-out",
              isActive && "z-10 translate-y-0 opacity-100",
              isPrevious && "z-0 -translate-y-4 opacity-0 pointer-events-none",
              isNext && "z-0 translate-y-4 opacity-0 pointer-events-none",
            )}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}
