"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FUEL_TYPES, GEARBOX_TYPES, BODY_TYPES, DRIVE_TYPES, COLORS } from "@/lib/constants"
import type { CarFormValues } from "../car-form"

interface TechnicalDetailsStepProps {
  form: UseFormReturn<CarFormValues>
}

export function TechnicalDetailsStep({ form }: TechnicalDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="mileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пробег (км)</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fuel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Гориво</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери тип гориво" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FUEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gearbox"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Скоростна кутия</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери тип кутия" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GEARBOX_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="power"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Мощност (к.с.)</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bodyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип купе</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери тип купе" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BODY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driveType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Задвижване</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери тип задвижване" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DRIVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цвят</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери цвят" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Брой врати</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="7" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Брой седалки</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="engineSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Обем на двигателя (л)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN (по избор)</FormLabel>
              <FormControl>
                <Input placeholder="Идентификационен номер на превозното средство" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Регистрационен номер (по избор)</FormLabel>
              <FormControl>
                <Input placeholder="Регистрационен номер" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
