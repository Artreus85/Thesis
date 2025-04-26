"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    id: string
    label: string
    description?: string
    optional?: boolean
  }[]
  activeStep: number
  orientation?: "horizontal" | "vertical"
  onStepClick?: (step: number) => void
}

export function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const isVertical = orientation === "vertical"

  return (
    <div className={cn("flex", isVertical ? "flex-col space-y-4" : "flex-row items-center", className)} {...props}>
      {steps.map((step, index) => {
        const isActive = activeStep === index
        const isCompleted = activeStep > index
        const isLast = index === steps.length - 1
        const isClickable = onStepClick && (isCompleted || index <= activeStep + 1)

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex",
                isVertical ? "flex-row items-start" : "flex-col items-center",
                isClickable && "cursor-pointer",
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                {isVertical && (
                  <div className="ml-4">
                    <div className="text-sm font-medium">
                      {step.label}
                      {step.optional && <span className="ml-1 text-xs text-muted-foreground">(по избор)</span>}
                    </div>
                    {step.description && <div className="text-xs text-muted-foreground">{step.description}</div>}
                  </div>
                )}
              </div>
              {!isVertical && (
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">
                    {step.label}
                    {step.optional && <span className="ml-1 text-xs text-muted-foreground">(по избор)</span>}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground max-w-[120px] text-center">{step.description}</div>
                  )}
                </div>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  "transition-colors",
                  isVertical ? "ml-5 h-10 border-l-2" : "flex-1 border-t-2 mx-2",
                  isCompleted ? "border-primary" : "border-muted-foreground/30",
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export interface StepperContentProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
  activeStep: number
}

export function StepperContent({ step, activeStep, className, children, ...props }: StepperContentProps) {
  const isActive = step === activeStep

  if (!isActive) return null

  return (
    <div className={cn("mt-8 animate-in fade-in-50 duration-300", className)} {...props}>
      {children}
    </div>
  )
}

export interface StepperNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number
  steps: number
  onNext?: () => void
  onBack?: () => void
  nextDisabled?: boolean
  backDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  completeLabel?: string
}

export function StepperNavigation({
  activeStep,
  steps,
  onNext,
  onBack,
  nextDisabled = false,
  backDisabled = false,
  nextLabel = "Напред",
  backLabel = "Назад",
  completeLabel = "Завърши",
  className,
  ...props
}: StepperNavigationProps) {
  const isLastStep = activeStep === steps - 1

  return (
    <div className={cn("flex justify-between mt-8", className)} {...props}>
      <button
        type="button"
        onClick={onBack}
        disabled={activeStep === 0 || backDisabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md",
          "transition-colors",
          activeStep === 0 || backDisabled
            ? "text-muted-foreground cursor-not-allowed"
            : "text-primary hover:bg-primary/10",
        )}
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-colors flex items-center",
          nextDisabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {isLastStep ? completeLabel : nextLabel}
        {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
      </button>
    </div>
  )
}
