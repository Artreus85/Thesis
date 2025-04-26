import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { CarFormValues } from "../car-form"

interface FeaturesStepProps {
  form: UseFormReturn<CarFormValues>
}

export function FeaturesStep({ form }: FeaturesStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="features"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Екстри (по избор)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Избройте екстрите, разделени със запетая (напр. Кожен салон, Навигация, Шибидах)"
                className="min-h-20"
                {...field}
              />
            </FormControl>
            <FormDescription>Въведете основните екстри, разделени със запетая.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <Textarea placeholder="Опишете автомобила си подробно..." className="min-h-32" {...field} />
            </FormControl>
            <FormDescription>
              Включете важни детайли за историята, характеристиките и състоянието на автомобила.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
