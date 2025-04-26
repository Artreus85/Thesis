import * as z from "zod"

export const carFormSchema = z.object({
  brand: z.string().min(1, "Марка е задължителна"),
  model: z.string().min(1, "Модел е задължителен"),
  year: z
    .string()
    .min(1, "Година е задължителна")
    .refine((val) => {
      const year = Number.parseInt(val)
      return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear()
    }, "Невалидна година"),
  mileage: z
    .string()
    .min(1, "Пробег е задължителен")
    .refine(
      (val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) >= 0,
      "Пробегът трябва да е положително число",
    ),
  fuel: z.string().min(1, "Гориво е задължително"),
  gearbox: z.string().min(1, "Скорости са задължителни"),
  power: z
    .string()
    .min(1, "Мощност е задължителна")
    .refine(
      (val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0,
      "Мощността трябва да е положително число",
    ),
  price: z
    .string()
    .min(1, "Цена е задължителна")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) >= 0, "Цената трябва да е положително число"),
  condition: z.string().min(1, "Състояние е задължително"),
  bodyType: z.string().min(1, "Тип каросерия е задължителен"),
  driveType: z.string().min(1, "Тип задвижване е задължителен"),
  color: z.string().min(1, "Цвят е задължителен"),
  doors: z
    .string()
    .min(1, "Брой врати е задължителен")
    .refine(
      (val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0 && Number.parseInt(val) <= 7,
      "Броят врати трябва да е между 1 и 7",
    ),
  seats: z
    .string()
    .min(1, "Брой седалки е задължителен")
    .refine(
      (val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0 && Number.parseInt(val) <= 12,
      "Броят седалки трябва да е между 1 и 12",
    ),
  engineSize: z
    .string()
    .min(1, "Обем на двигателя е задължителен")
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      "Обемът на двигателя трябва да е положително число",
    ),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  features: z.string().optional(),
  description: z.string().min(10, "Описанието трябва да е поне 10 символа"),
})
