"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { createCarListing } from "@/lib/firebase"
import { uploadFilesToS3 } from "@/lib/s3"
import { CAR_BRANDS, FUEL_TYPES, GEARBOX_TYPES, CONDITIONS, BODY_TYPES, DRIVE_TYPES, COLORS } from "@/lib/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
  bodyType: z.string().min(1, "Body type is required"),
  driveType: z.string().min(1, "Drive type is required"),
  color: z.string().min(1, "Color is required"),
  doors: z.string().min(1, "Number of doors is required"),
  seats: z.string().min(1, "Number of seats is required"),
  engineSize: z.string().min(1, "Engine size is required"),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  features: z.string().optional(),
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
      const imageUrls = await uploadFilesToS3(images)
      console.log("Images uploaded successfully to S3:", imageUrls)

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
        images: imageUrls, // Use the uploaded image URLs
        userId: user.id,
        createdAt: new Date().toISOString(),
        isVisible: true, // Make sure listings are visible by default
      }

      console.log("Creating car listing with data:", carData)

      // Ensure user ID is valid
      if (!user.id) {
        throw new Error("User ID is missing. Please log in again.")
      }

      // Create the listing in Firestore
      const listingId = await createCarListing(carData)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAR_BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
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
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Civic, 3 Series" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" min="1900" max={new Date().getFullYear()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage (mi)</FormLabel>
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
                    <FormLabel>Fuel Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
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
                    <FormLabel>Gearbox</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gearbox type" />
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
                    <FormLabel>Power (hp)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITIONS.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
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
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
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
                    <FormLabel>Drive Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drive type" />
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
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
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
                    <FormLabel>Doors</FormLabel>
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
                    <FormLabel>Seats</FormLabel>
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
                    <FormLabel>Engine Size (L)</FormLabel>
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
                    <FormLabel>VIN (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle Identification Number" {...field} />
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
                    <FormLabel>License Plate (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="License plate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List key features separated by commas (e.g., Leather seats, Navigation, Sunroof)"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter the key features of your car, separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your car in detail..." className="min-h-32" {...field} />
                  </FormControl>
                  <FormDescription>
                    Include important details about the car's history, features, and condition.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Images</FormLabel>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {imagePreviews.length === 0 ? (
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                    >
                      <span>{imagePreviews.length === 0 ? "Upload images" : "Change images"}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB each (max 5 images)</p>
                </div>
              </div>
            </div>

            {isSubmitting && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Listing..." : "Create Listing"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
