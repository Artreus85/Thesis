"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  label?: string
  placeholder?: string
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  error,
  required = false,
  label = "Телефонен номер",
  placeholder = "+359 88 888 8888",
  className,
}: PhoneInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isValid, setIsValid] = useState(true)

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // E.164 format validation (e.g., +359123456789)
  const validatePhoneNumber = (phone: string): boolean => {
    // Allow empty if not required
    if (!required && (!phone || phone.trim() === "")) {
      return true
    }

    // Basic E.164 validation: + followed by 7-15 digits
    const e164Regex = /^\+[1-9]\d{7,14}$/
    return e164Regex.test(phone.replace(/\s+/g, ""))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Format the phone number by removing all non-digit characters except +
    const formattedValue = newValue.replace(/[^\d+]/g, "")

    // Validate the formatted value
    const valid = validatePhoneNumber(formattedValue)
    setIsValid(valid)

    // Only update parent if valid or empty
    onChange(formattedValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="phone" className="flex items-center">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id="phone"
        type="tel"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(!isValid && "border-destructive")}
        required={required}
      />
      {(error || !isValid) && (
        <p className="text-sm text-destructive">
          {error || "Моля, въведете валиден телефонен номер в международен формат (напр. +359888888888)"}
        </p>
      )}
    </div>
  )
}
