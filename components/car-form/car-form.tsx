"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"

import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Stepper, StepperContent, StepperNavigation } from "@/components/ui/stepper"
import { useAuth } from "@/lib/auth"
import { createCarListing, updateCarListing } from "@/lib/firebase"
import { uploadFilesToS3 } from "@/lib/s3"

import { BasicInfoStep } from "./steps/basic-info-step"
import { TechnicalDetailsStep } from "./steps/technical-details-step"
import { FeaturesStep } from "./steps/features-step"
import { ImagesStep } from "./steps/images-step"
import { ReviewStep } from "./steps/review-step"
import { carFormSchema } from "./schema"

export type CarFormValues = z.infer<typeof carFormSchema>

interface CarFormProps {
  defaultValues?: Partial<CarFormValues>
  existingImages?: string[]
  carId?: string
  mode: "create" | "edit"
}

export function CarForm({ defaultValues, existingImages = [], carId, mode }: CarFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeStep, setActiveStep] = React.useState(0)
  const [images, setImages] = React.useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = React.useState<string[]>([])
  const [remainingImages, setRemainingImages] = React.useState<string[]>(existingImages)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: "",
      fuel: "",
      gearbox: "",
      power: "",
      price: "",
      condition: "",
      bodyType: "",
      driveType: "",
      color: "",
      doors: "4",
      seats: "5",
      engineSize: "",
      vin: "",
      licensePlate: "",
      features: "",
      description: "",
      ...defaultValues,
    },
    mode: "onChange",
  })

  const steps = [
    { id: "basic-info", label: "Основна информация", description: "Марка, модел, година" },
    { id: "technical", label: "Технически данни", description: "Двигател, скорости" },
    { id: "features", label: "Екстри", description: "Описание и екстри" },
    { id: "images", label: "Снимки", description: "Качване на снимки" },
    { id: "review", label: "Преглед", description: "Финални настройки" },
  ]

  const handleNext = async () => {
    const fieldsToValidate: Record<number, (keyof CarFormValues)[]> = {
      0: ["brand", "model", "year", "condition", "price"],
      1: ["mileage", "fuel", "gearbox", "power", "bodyType", "driveType", "color", "doors", "seats", "engineSize"],
      2: ["description"],
      3: [], // No validation for images step
      4: [], // No validation for review step
    }

    const isValid = await form.trigger(fieldsToValidate[activeStep])

    if (isValid) {
      if (activeStep === steps.length - 1) {
        await handleSubmit()
      } else {
        setActiveStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleStepClick = (step: number) => {
    // Only allow going to steps that are completed or the next one
    if (step <= activeStep + 1) {
      setActiveStep(step)
    }
  }

  const handleRemoveExistingImage = (index: number) => {
    const imageToDelete = remainingImages[index]
    setImagesToDelete((prev) => [...prev, imageToDelete])
    setRemainingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Необходим е вход",
        description: "Моля, влезте в профила си, за да публикувате обява",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (remainingImages.length === 0 && images.length === 0) {
      toast({
        title: "Необходими са снимки",
        description: "Моля, качете поне една снимка на автомобила",
        variant: "destructive",
      })
      setActiveStep(3) // Go to images step
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 500)

      const values = form.getValues()
      const newImageUrls = images.length ? await uploadFilesToS3(images) : []
      const finalImages = [...remainingImages, ...newImageUrls]

      const carData = {
        brand: values.brand,
        model: values.model,
        year: Number.parseInt(values.year),
        mileage: Number.parseInt(values.mileage),
        fuel: values.fuel,
        gearbox: values.gearbox,
        power: Number.parseInt(values.power),
        price: Number.parseInt(values.price),
        condition: values.condition,
        bodyType: values.bodyType,
        driveType: values.driveType,
        color: values.color,
        doors: Number.parseInt(values.doors),
        seats: Number.parseInt(values.seats),
        engineSize: Number.parseFloat(values.engineSize),
        vin: values.vin,
        licensePlate: values.licensePlate,
        features: values.features,
        description: values.description,
        images: finalImages,
        userId: user.id,
        createdAt: new Date().toISOString(),
        isVisible: true,
      }

      if (mode === "create") {
        const listingId = await createCarListing(carData)
        clearInterval(progressInterval)
        setUploadProgress(100)
        setIsSuccess(true)

        setTimeout(() => {
          router.push(`/cars/${listingId}`)
        }, 2000)
      } else if (mode === "edit" && carId) {
        await updateCarListing(carId, carData, images.length > 0 ? images : undefined)
        clearInterval(progressInterval)
        setUploadProgress(100)
        setIsSuccess(true)

        setTimeout(() => {
          router.push(`/cars/${carId}`)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Грешка при обработка на обява:", error)
      let errorMessage = "Възникна грешка. Моля, опитайте отново."

      if (error.message.includes("User ID")) {
        errorMessage = "Грешка при автентикация. Моля, излезте и влезте отново."
      } else if (error.message.includes("upload")) {
        errorMessage = "Неуспешно качване на снимки. Опитайте с по-малки файлове."
      } else if (error.message.includes("permission")) {
        errorMessage = "Нямате права да публикувате обяви. Свържете се с поддръжката."
      }

      toast({
        title: "Грешка",
        description: errorMessage,
        variant: "destructive",
      })
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {mode === "create" ? "Обявата е създадена успешно!" : "Обявата е обновена успешно!"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {mode === "create"
            ? "Вашата обява е публикувана и скоро ще бъде видима за всички потребители."
            : "Промените по вашата обява са запазени успешно."}
        </p>
        <p className="text-sm text-muted-foreground">Пренасочване...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 overflow-x-auto pb-2">
        <Stepper steps={steps} activeStep={activeStep} onStepClick={handleStepClick} className="min-w-max" />
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <StepperContent step={0} activeStep={activeStep}>
                <BasicInfoStep form={form} />
              </StepperContent>

              <StepperContent step={1} activeStep={activeStep}>
                <TechnicalDetailsStep form={form} />
              </StepperContent>

              <StepperContent step={2} activeStep={activeStep}>
                <FeaturesStep form={form} />
              </StepperContent>

              <StepperContent step={3} activeStep={activeStep}>
                <ImagesStep
                  images={images}
                  setImages={setImages}
                  existingImages={remainingImages}
                  onRemoveExisting={handleRemoveExistingImage}
                />
              </StepperContent>

              <StepperContent step={4} activeStep={activeStep}>
                <ReviewStep formValues={form.getValues()} images={images} existingImages={remainingImages} />
              </StepperContent>
            </CardContent>
          </Card>

          {isSubmitting && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <StepperNavigation
            activeStep={activeStep}
            steps={steps.length}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isSubmitting}
            backDisabled={isSubmitting}
            nextLabel={
              activeStep === steps.length - 1 ? (mode === "create" ? "Създай обява" : "Запази промените") : "Напред"
            }
            completeLabel={
              isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Създаване..." : "Обновяване..."}
                </span>
              ) : mode === "create" ? (
                "Създай обява"
              ) : (
                "Запази промените"
              )
            }
          />
        </form>
      </Form>
    </div>
  )
}
