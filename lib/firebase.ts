import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  limit as firestoreLimit,
} from "firebase/firestore"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOutFn,
  updateProfile,
} from "firebase/auth"
import { uploadFilesToS3, deleteFileFromS3 } from "./s3"
import { firebaseConfig } from "./firebase-config"
import { isPreviewEnvironment } from "./environment"
import type { User, Car } from "./types"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.() ? userData.createdAt.toDate().toISOString() : userData.createdAt,
      } as User
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(name: string, email: string, password: string): Promise<void> {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user profile with the name
    await updateProfile(user, {
      displayName: name,
    })

    // Create user document in Firestore using the Firebase Auth UID as the document ID
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "regular",
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOutFn(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as User
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

/**
 * Get all listings
 */
export async function getAllListings(): Promise<Car[]> {
  try {
    const listingsRef = collection(db, "cars")
    const snapshot = await getDocs(listingsRef)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return []
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", userId))
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  try {
    // Delete images from S3
    const car = await getCarById(listingId)
    if (car && !isPreviewEnvironment()) {
      for (const imageUrl of car.images) {
        try {
          await deleteFileFromS3(imageUrl)
        } catch (imageError) {
          console.error(`Failed to delete image ${imageUrl}:`, imageError)
          // Continue with other images even if one fails
        }
      }
    }

    await deleteDoc(doc(db, "cars", listingId))
  } catch (error) {
    console.error("Error deleting listing:", error)
    throw error
  }
}

/**
 * Toggle listing visibility
 */
export async function toggleListingVisibility(listingId: string, isVisible: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, "cars", listingId), {
      isVisible: isVisible,
    })
  } catch (error) {
    console.error("Error toggling listing visibility:", error)
    throw error
  }
}

/**
 * Get filtered cars
 */
export async function getFilteredCars(searchParams: {
  brand?: string
  minPrice?: string
  maxPrice?: string
  minYear?: string
  fuel?: string
  condition?: string
  query?: string
}): Promise<Car[]> {
  try {
    console.log("Getting filtered cars with params:", searchParams)
    const carsRef = collection(db, "cars")

    // Start with a basic query
    let q = query(carsRef, orderBy("createdAt", "desc"))

    // Add filters one by one
    if (searchParams.brand && searchParams.brand !== "any") {
      q = query(q, where("brand", "==", searchParams.brand))
    }

    if (searchParams.fuel && searchParams.fuel !== "any") {
      q = query(q, where("fuel", "==", searchParams.fuel))
    }

    if (searchParams.condition && searchParams.condition !== "any") {
      q = query(q, where("condition", "==", searchParams.condition))
    }

    if (searchParams.minYear) {
      q = query(q, where("year", ">=", Number.parseInt(searchParams.minYear)))
    }

    // Execute the query
    console.log("Executing filtered query...")
    const snapshot = await getDocs(q)
    console.log(`Query returned ${snapshot.docs.length} cars`)

    // Process the results
    let results = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })

    // Apply client-side filtering for price range and query
    if (searchParams.minPrice) {
      results = results.filter((car) => car.price >= Number.parseInt(searchParams.minPrice!))
    }

    if (searchParams.maxPrice) {
      results = results.filter((car) => car.price <= Number.parseInt(searchParams.maxPrice!))
    }

    if (searchParams.query) {
      const query = searchParams.query.toLowerCase()
      results = results.filter(
        (car) =>
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.description?.toLowerCase().includes(query),
      )
    }

    return results
  } catch (error) {
    console.error("Error fetching filtered cars:", error)
    return []
  }
}

/**
 * Get a car by ID
 */
export async function getCarById(carId: string): Promise<Car | null> {
  try {
    console.log(`Fetching car with ID: ${carId}`)
    const carDoc = await getDoc(doc(db, "cars", carId))

    if (carDoc.exists()) {
      const carData = carDoc.data()
      console.log(`Car found: ${carData.brand} ${carData.model}`)

      // Ensure images array exists
      if (!carData.images) {
        console.log("No images found for car, setting empty array")
        carData.images = []
      }

      return {
        id: carDoc.id,
        ...carData,
        createdAt: carData.createdAt?.toDate?.() ? carData.createdAt.toDate().toISOString() : carData.createdAt,
      } as Car
    } else {
      console.log(`No car found with ID: ${carId}`)
      return null
    }
  } catch (error) {
    console.error("Error fetching car:", error)
    return null
  }
}

/**
 * Create a car listing
 */
export async function createCarListing(carData: Omit<Car, "id">, images: File[]): Promise<string> {
  try {
    console.log("Starting car listing creation process")

    // Check if we already have image URLs in the carData
    let imageUrls: string[] = carData.images || []

    // Only upload images if they're provided and we don't already have URLs
    if (images.length > 0 && imageUrls.length === 0) {
      console.log(`Uploading ${images.length} images...`)

      try {
        if (isPreviewEnvironment()) {
          // In preview environment, use placeholder images
          imageUrls = images.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
          console.log("Using placeholder images in preview environment:", imageUrls)
        } else {
          // In production, upload to S3
          imageUrls = await uploadFilesToS3(images)
          console.log("Images uploaded successfully to S3:", imageUrls)
        }
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError)
        // Fallback to placeholder images if upload fails
        imageUrls = images.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
        console.log("Using placeholder images instead:", imageUrls)
      }
    }

    // Create car document in Firestore
    console.log("Creating Firestore document with data:", { ...carData, images: imageUrls })

    // Ensure all required fields are present and properly formatted
    const completeCarData = {
      ...carData,
      images: imageUrls,
      createdAt: new Date(),
      isVisible: true,
      // Add default values for any potentially missing fields
      year: carData.year || new Date().getFullYear(),
      mileage: carData.mileage || 0,
      power: carData.power || 0,
      price: carData.price || 0,
      // Ensure userId is a string
      userId: carData.userId ? String(carData.userId) : "",
    }

    // Check if userId is valid
    if (!completeCarData.userId) {
      throw new Error("User ID is required to create a listing")
    }

    console.log("Final car data being sent to Firestore:", completeCarData)

    // Create the document in Firestore
    const docRef = await addDoc(collection(db, "cars"), completeCarData)

    console.log("Car listing created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating car listing:", error)
    throw error
  }
}

/**
 * Update a car listing
 */
export async function updateCarListing(carId: string, carData: Partial<Car>, newImages?: File[]): Promise<void> {
  try {
    console.log(`Updating car listing with ID: ${carId}`)

    // Get the existing car data
    const existingCar = await getCarById(carId)
    if (!existingCar) {
      throw new Error(`Car with ID ${carId} not found`)
    }

    let imageUrls = existingCar.images || []

    // Handle new images if provided
    if (newImages && newImages.length > 0) {
      console.log(`Uploading ${newImages.length} new images...`)

      try {
        if (isPreviewEnvironment()) {
          // In preview environment, use placeholder images
          const newPlaceholders = newImages.map(
            (_, index) => `/placeholder.svg?height=600&width=800&query=new car ${index + 1}`,
          )
          imageUrls = [...imageUrls, ...newPlaceholders]
          console.log("Added placeholder images in preview environment")
        } else {
          // In production, upload to S3
          const newImageUrls = await uploadFilesToS3(newImages)
          imageUrls = [...imageUrls, ...newImageUrls]
          console.log("New images uploaded successfully to S3")
        }
      } catch (uploadError) {
        console.error("Error uploading new images:", uploadError)
        // Fallback to placeholder images if upload fails
        const fallbackImages = newImages.map(
          (_, index) => `/placeholder.svg?height=600&width=800&query=new car ${index + 1}`,
        )
        imageUrls = [...imageUrls, ...fallbackImages]
        console.log("Using placeholder images for new uploads")
      }
    }

    // Update the car document in Firestore
    const updateData = {
      ...carData,
      images: imageUrls,
      updatedAt: new Date(),
    }

    console.log("Updating Firestore document with data:", updateData)
    await updateDoc(doc(db, "cars", carId), updateData)
    console.log("Car listing updated successfully")
  } catch (error) {
    console.error("Error updating car listing:", error)
    throw error
  }
}

/**
 * Get car listings with pagination
 */
export async function getCarListings(limitCount = 20, startAfterDoc?: any): Promise<{ cars: Car[]; lastDoc: any }> {
  try {
    console.log(`Getting car listings with limit: ${limitCount}`)
    const carsRef = collection(db, "cars")

    let q
    if (startAfterDoc) {
      q = query(carsRef, orderBy("createdAt", "desc"), firestoreLimit(limitCount), startAfterDoc)
    } else {
      q = query(carsRef, orderBy("createdAt", "desc"), firestoreLimit(limitCount))
    }

    console.log("Executing query...")
    const snapshot = await getDocs(q)
    console.log(`Query returned ${snapshot.docs.length} cars`)

    const lastVisible = snapshot.docs[snapshot.docs.length - 1]

    const cars = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })

    return {
      cars,
      lastDoc: lastVisible,
    }
  } catch (error) {
    console.error("Error fetching car listings:", error)
    return { cars: [], lastDoc: null }
  }
}

/**
 * Get all car listings (for homepage, admin, etc.)
 */
export async function getAllCarListings(limit?: number): Promise<Car[]> {
  try {
    console.log(`Getting ALL car listings${limit ? ` with limit: ${limit}` : ""}`)
    const carsRef = collection(db, "cars")

    // Query with optional limit
    const q = limit
      ? query(carsRef, orderBy("createdAt", "desc"), firestoreLimit(limit))
      : query(carsRef, orderBy("createdAt", "desc"))

    console.log("Executing query...")
    const snapshot = await getDocs(q)
    console.log(`Query returned ${snapshot.docs.length} cars`)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })
  } catch (error) {
    console.error("Error fetching all car listings:", error)
    return []
  }
}

/**
 * Get user's car listings
 */
export async function getUserListings(userId: string): Promise<Car[]> {
  try {
    console.log(`Getting listings for user: ${userId}`)
    const carsRef = collection(db, "cars")
    const q = query(carsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    console.log(`Found ${snapshot.docs.length} listings for user`)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })
  } catch (error) {
    console.error(`Error fetching listings for user ${userId}:`, error)
    return []
  }
}
