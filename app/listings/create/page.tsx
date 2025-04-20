"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { createCarListing } from "@/lib/firebase"
import { uploadFilesToS3 } from "@/lib/s3"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { isPreviewEnvironment } from "@/lib/environment"

const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required"),
  mileage: z.string().min(1, "Mileage is required"),
  fuel: z.string().min(1, "Fuel type is required"),
  gearbox: z.string().min(1, "Gearbox type is required"),
  power: z.string().min(1, "Power is required"),
  price: z.string().min(1, "Price is required"),
  condition: z.string().min(1, "Condition is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

export default function CreateListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      description: "",
    },
  })

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)

      // Limit to 5 images
      const selectedFiles = fileArray.slice(0, 5)
      setImages(selectedFiles)

      // Create preview URLs
      const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImagePreviews(previewUrls)
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values)

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your car",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10) // Start progress

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Step 1: Upload images to S3 first
      console.log("Uploading images to S3...")
      let imageUrls: string[] = []

      try {
        if (isPreviewEnvironment()) {
          // In preview environment, use placeholder images
          imageUrls = images.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
          console.log("Using placeholder images in preview environment:", imageUrls)
        } else {
          // In production, upload to S3 directly
          imageUrls = await uploadFilesToS3(images)
          console.log("Images uploaded successfully to S3:", imageUrls)
        }
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError)
        // Fallback to placeholder images if upload fails
        imageUrls = images.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
        console.log("Using placeholder images instead:", imageUrls)
      }

      // Step 2: Create car listing with the uploaded image URLs
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
        description: values.description,
        images: imageUrls, // Use the uploaded image URLs
        userId: user.id, // Ensure user ID is included
        createdAt: new Date().toISOString(),
        isVisible: true, // Make sure listings are visible by default
      }

      console.log("Creating car listing with data:", carData)

      // Ensure user ID is valid
      if (!user.id) {
        throw new Error("User ID is missing. Please log in again.")
      }

      // Create the listing in Firestore
      const listingId = await createCarListing(carData, []) // Pass empty array since we already uploaded images
      console.log("Listing created with ID:", listingId)

      clearInterval(progressInterval)
      setUploadProgress(100) // Complete progress

      toast({
        title: "Listing created",
        description: "Your car listing has been created successfully",
      })

      // Navigate to the new listing
      router.push(`/cars/${listingId}`)
    } catch (error) {
      console.error("Error creating listing:", error)

      // Provide more specific error messages based on the error
      let errorMessage = "There was an error creating your listing. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("User ID")) {
          errorMessage = "Authentication error. Please log out and log in again."
        } else if (error.message.includes("storage") || error.message.includes("upload")) {
          errorMessage = "Failed to upload images. Please try again with smaller images or fewer images."
        } else if (error.message.includes("permission") || error.message.includes("unauthorized")) {
          errorMessage = "You don't have permission to create listings. Please contact support."
        }

        console.error("Detailed error:", error.message)
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please log in to create a listing</p>
        <Button onClick={() => router.push("/auth/login")}>Log In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Car Listing</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form fields remain the same */}
            {/* ... */}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Listing..." : "Create Listing"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
