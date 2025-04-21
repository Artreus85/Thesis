"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Upload, X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { getCarById, updateCarListing } from "@/lib/firebase"
import { uploadFilesToS3 } from "@/lib/s3"
import {
  CAR_BRANDS,
  FUEL_TYPES,
  GEARBOX_TYPES,
  CONDITIONS,
  BODY_TYPES,
  DRIVE_TYPES,
  COLORS,
} from "@/lib/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"

// -------------------
// Schema
// -------------------
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

export default function EditListingPage() {
  // -------------------
  // Hooks & State
  // -------------------
  const { id: carId } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [car, setCar] = useState<any>(null)

  // -------------------
  // Form
  // -------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: "",
      mileage: "",
      fuel: "",
      gearbox: "",
      power: "",
      price: "",
      condition: "",
      bodyType: "",
      driveType: "",
      color: "",
      doors: "",
      seats: "",
      engineSize: "",
      vin: "",
      licensePlate: "",
      features: "",
      description: "",
    },
  })

  // -------------------
  // Fetch car data
  // -------------------
  useEffect(() => {
    if (!carId) return

    async function fetchCar() {
      try {
        setPageLoading(true)
        const carData = await getCarById(carId)

        if (!carData) {
          setError("Car not found")
          return
        }

        setCar(carData)
        setExistingImages(carData.images || [])

        // Authorisation check
        if (user && (user.id === carData.userId || user.role === "admin")) {
          form.reset({
            brand: carData.brand || "",
            model: carData.model || "",
            year: carData.year?.toString() || "",
            mileage: carData.mileage?.toString() || "",
            fuel: carData.fuel || "",
            gearbox: carData.gearbox || "",
            power: carData.power?.toString() || "",
            price: carData.price?.toString() || "",
            condition: carData.condition || "",
            bodyType: carData.bodyType || "",
            driveType: carData.driveType || "",
            color: carData.color || "",
            doors: carData.doors?.toString() || "",
            seats: carData.seats?.toString() || "",
            engineSize: carData.engineSize?.toString() || "",
            vin: carData.vin || "",
            licensePlate: carData.licensePlate || "",
            features: carData.features || "",
            description: carData.description || "",
          })
        } else {
          // Not authorised
          setError("You don't have permission to edit this listing")
          setTimeout(() => router.push(`/cars/${carId}`), 3000)
        }
      } catch (err) {
        console.error("Error fetching car:", err)
        setError("Failed to load car data")
      } finally {
        setPageLoading(false)
      }
    }

    // Redirect unauthenticated user when auth has resolved
    if (!user && !authLoading) {
      setError("Please log in to edit listings")
      setTimeout(() => router.push(`/auth/login?redirect=/listings/edit/${carId}`), 2000)
      return
    }

    if (user) {
      fetchCar()
    }
  }, [carId, user, authLoading, form, router])

  // -------------------
  // Image helpers
  // -------------------
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const fileArray = Array.from(e.target.files).slice(0, 5) // Limit to 5
      setImages(fileArray)
      setImagePreviews(fileArray.map((file) => URL.createObjectURL(file)))
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const removeExistingImage = useCallback(
    (index: number) => {
      setImagesToDelete((prev) => [...prev, existingImages[index]])
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    },
    [existingImages],
  )

  // -------------------
  // Submit handler
  // -------------------
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to update a listing", variant: "destructive" })
      router.push("/auth/login")
      return
    }

    if (car && user.id !== car.userId && user.role !== "admin") {
      toast({ title: "Not authorised", description: "You don't have permission to edit this listing", variant: "destructive" })
      router.push(`/cars/${carId}`)
      return
    }

    if (existingImages.length === 0 && images.length === 0) {
      toast({ title: "Images required", description: "Please upload at least one image of your car", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 500)

      const newImageUrls = images.length ? await uploadFilesToS3(images) : []
      const finalImages = [...existingImages, ...newImageUrls]

      await updateCarListing(carId, {
        brand: values.brand,
        model: values.model,
        year: Number(values.year),
        mileage: Number(values.mileage),
        fuel: values.fuel,
        gearbox: values.gearbox,
        power: Number(values.power),
        price: Number(values.price),
        condition: values.condition,
        bodyType: values.bodyType,
        driveType: values.driveType,
        color: values.color,
        doors: Number(values.doors),
        seats: Number(values.seats),
        engineSize: Number(values.engineSize),
        vin: values.vin,
        licensePlate: values.licensePlate,
        features: values.features,
        description: values.description,
        images: finalImages,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({ title: "Listing updated", description: "Your car listing has been updated successfully" })
      router.push(`/cars/${carId}`)
    } catch (err) {
      console.error("Error updating listing:", err)
      toast({ title: "Error", description: "There was an error updating your listing. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up previews
  useEffect(() => {
    return () => imagePreviews.forEach(URL.revokeObjectURL)
  }, [imagePreviews])

  // -------------------
  // Render
  // -------------------
  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading car data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please log in to edit a listing</p>
        <Button onClick={() => router.push("/auth/login")}>Log In</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Car Listing</h1>

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

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Current image ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">New Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
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
                </div>
              )}

              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                    >
                      <span>Upload new images</span>
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

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating Listing..." : "Update Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
