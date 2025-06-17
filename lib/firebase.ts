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
  Timestamp,
  serverTimestamp,
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
import type { User, Car, Favorite } from "./types"
import type { QuerySnapshot, DocumentData } from "firebase/firestore"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
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

// Update the signUp function to include phoneNumber
export async function signUp(name: string, email: string, password: string, phoneNumber?: string): Promise<void> {
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
      phoneNumber: phoneNumber || null,
      phoneVerified: false,
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
 * Add a function to update user profile
 */
export async function updateUserProfile(userId: string, data: { name?: string; phoneNumber?: string }): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    // Update the user document in Firestore
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })

    // If name is being updated, also update the Firebase Auth profile
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.name,
      })
    }

    console.log(`User profile updated for ${userId}`)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Add functions for phone verification
export async function sendVerificationCode(userId: string, phoneNumber: string): Promise<void> {
  try {
    // In a real implementation, you would integrate with a service like Twilio, Firebase Phone Auth, etc.
    // For this example, we'll simulate sending a code

    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in Firestore with an expiration time (10 minutes from now)
    const verificationRef = doc(db, "phoneVerifications", userId)
    await setDoc(verificationRef, {
      phoneNumber,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      createdAt: new Date().toISOString(),
    })

    console.log(`Verification code sent to ${phoneNumber}: ${verificationCode}`)

    // In a real implementation, you would send an SMS here
    // For demo purposes, we'll just log the code to the console

    return
  } catch (error) {
    console.error("Error sending verification code:", error)
    throw error
  }
}

export async function verifyPhoneNumber(userId: string, code: string): Promise<boolean> {
  try {
    // Get the verification document
    const verificationRef = doc(db, "phoneVerifications", userId)
    const verificationDoc = await getDoc(verificationRef)

    if (!verificationDoc.exists()) {
      console.error("No verification found for user")
      return false
    }

    const verification = verificationDoc.data()

    // Check if the code has expired
    const expiresAt = new Date(verification.expiresAt)
    if (expiresAt < new Date()) {
      console.error("Verification code has expired")
      return false
    }

    // Check if the code matches
    if (verification.code !== code) {
      console.error("Invalid verification code")
      return false
    }

    // Update the user's phoneVerified status
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      phoneVerified: true,
      updatedAt: new Date().toISOString(),
    })

    // Delete the verification document
    await deleteDoc(verificationRef)

    return true
  } catch (error) {
    console.error("Error verifying phone number:", error)
    throw error
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
    if (car) {
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

// Update the getFilteredCars function to handle more filters
export async function getFilteredCars(searchParams: {
  brand?: string
  model?: string
  minPrice?: string
  maxPrice?: string
  minYear?: string
  maxYear?: string
  fuel?: string
  condition?: string
  bodyType?: string
  driveType?: string
  gearbox?: string
  query?: string
}): Promise<Car[]> {
  // Build your base Ref
  const carsRef = collection(db, "cars")
  console.log("Getting filtered cars with params:", searchParams)

  try {
    // 1) Start building the Firestore query
    let q = query(carsRef)

    // 2) Equality filters
    if (searchParams.brand && searchParams.brand !== "any") {
      q = query(q, where("brand", "==", searchParams.brand))
    }
    if (searchParams.fuel && searchParams.fuel !== "any") {
      q = query(q, where("fuel", "==", searchParams.fuel))
    }
    if (searchParams.condition && searchParams.condition !== "any") {
      q = query(q, where("condition", "==", searchParams.condition))
    }
    if (searchParams.bodyType && searchParams.bodyType !== "any") {
      q = query(q, where("bodyType", "==", searchParams.bodyType))
    }
    if (searchParams.driveType && searchParams.driveType !== "any") {
      q = query(q, where("driveType", "==", searchParams.driveType))
    }
    if (searchParams.gearbox && searchParams.gearbox !== "any") {
      q = query(q, where("gearbox", "==", searchParams.gearbox))
    }

    // 3) Range filter on year (Firestore allows only one range per query)
    if (searchParams.minYear && searchParams.minYear !== "2000") {
      const minY = Number.parseInt(searchParams.minYear, 10)
      q = query(q, where("year", ">=", minY))
      // MUST orderBy the same field you range on
      q = query(q, orderBy("year", "desc"))
    }

    // 4) Secondary ordering by creation date
    q = query(q, orderBy("createdAt", "desc"))

    console.log("Executing filtered query...")
    const snapshot = await getDocs(q)
    console.log(`Query returned ${snapshot.docs.length} cars before client-side filtering`)

    // 5) Map to your Car type
    let results = snapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Car
    })

    // 6) Client‑side filtering for things Firestore can’t handle
    if (searchParams.model?.trim()) {
      const m = searchParams.model.toLowerCase()
      results = results.filter((c) => c.model?.toLowerCase().includes(m))
      console.log(`After model filter: ${results.length} cars`)
    }

    if (searchParams.maxYear && +searchParams.maxYear !== new Date().getFullYear()) {
      const maxY = Number.parseInt(searchParams.maxYear, 10)
      results = results.filter((c) => c.year <= maxY)
      console.log(`After maxYear filter: ${results.length} cars`)
    }

    if (searchParams.minPrice && +searchParams.minPrice > 0) {
      const minP = Number.parseInt(searchParams.minPrice, 10)
      results = results.filter((c) => c.price >= minP)
      console.log(`After minPrice filter: ${results.length} cars`)
    }

    if (searchParams.maxPrice && +searchParams.maxPrice < Number.POSITIVE_INFINITY) {
      const maxP = Number.parseInt(searchParams.maxPrice, 10)
      results = results.filter((c) => c.price <= maxP)
      console.log(`After maxPrice filter: ${results.length} cars`)
    }

    if (searchParams.query?.trim()) {
      const ql = searchParams.query.toLowerCase()
      results = results.filter(
        (c) =>
          c.brand.toLowerCase().includes(ql) ||
          c.model.toLowerCase().includes(ql) ||
          c.description.toLowerCase().includes(ql) ||
          (c.bodyType ?? "").toLowerCase().includes(ql) ||
          (c.color ?? "").toLowerCase().includes(ql) ||
          c.condition.toLowerCase().includes(ql),
      )
      console.log(`After text query filter: ${results.length} cars`)
    }

    // 7) Fallback if no matches and filters were specified
    if (results.length === 0 && Object.keys(searchParams).length > 0) {
      console.log("No results found with filters, falling back to all cars")
      const allSnap = await getDocs(query(carsRef, orderBy("createdAt", "desc")))
      results = allSnap.docs.map((doc) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Car
      })
    }

    console.log(`Returning ${results.length} cars after all filtering`)
    return results
  } catch (error: any) {
    // Surface the Firestore error so you can click through to create the missing index
    console.error("Error fetching filtered cars:", error)
    throw error // or `return []` if you really want to swallow it
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
export async function createCarListing(carData: Omit<Car, "id">, images?: File[]): Promise<string> {
  try {
    console.log("Starting car listing creation process")

    // If image URLs already exist in carData, use them
    let imageUrls: string[] = carData.images || []

    // If image files are passed in and we don’t already have URLs
    if (images && images.length > 0 && imageUrls.length === 0) {
      console.log(`Uploading ${images.length} images...`)

      try {
        imageUrls = await uploadFilesToS3(images)
        console.log("Images uploaded successfully to S3:", imageUrls)
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError)
        // Fallback to placeholder images if upload fails
        imageUrls = images.map((_, index) => `/placeholder.svg?height=600&width=800&query=car ${index + 1}`)
        console.log("Using placeholder images instead:", imageUrls)
      }
    }

    // Construct full car data for Firestore
    const completeCarData = {
      ...carData,
      images: imageUrls,
      createdAt: new Date(),
      isVisible: true,
      year: carData.year || new Date().getFullYear(),
      mileage: carData.mileage || 0,
      power: carData.power || 0,
      price: carData.price || 0,
      userId: carData.userId ? String(carData.userId) : "",
    }

    if (!completeCarData.userId) {
      throw new Error("User ID is required to create a listing")
    }

    console.log("Final car data being sent to Firestore:", completeCarData)

    const docRef = await addDoc(collection(db, "cars"), completeCarData)

    console.log("Car listing created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating car listing:", error)
    throw error
  }
}

// Add this function to check if a user is authorized to edit a listing
export async function isAuthorizedToEditListing(userId: string, listingId: string): Promise<boolean> {
  try {
    // If no user ID provided, not authorized
    if (!userId) return false

    // Get the car listing
    const car = await getCarById(listingId)
    if (!car) return false

    // Get the user to check if they're an admin
    const user = await getUserById(userId)
    if (!user) return false

    // User is authorized if they are the owner or an admin
    return car.userId === userId || user.role === "admin"
  } catch (error) {
    console.error("Error checking edit authorization:", error)
    return false
  }
}

// Update the updateCarListing function to include authorization checks
export async function updateCarListing(carId: string, carData: Partial<Car>, newImages?: File[]): Promise<void> {
  try {
    console.log(`Updating car listing with ID: ${carId}`)

    // Get the existing car data
    const existingCar = await getCarById(carId)
    if (!existingCar) {
      throw new Error(`Car with ID ${carId} not found`)
    }

    // Get the current user ID from the auth state
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Check if the user is authorized to edit this listing
    const isAuthorized = await isAuthorizedToEditListing(currentUser.uid, carId)
    if (!isAuthorized) {
      throw new Error("Not authorized to edit this listing")
    }

    let imageUrls = existingCar.images || []

    // Handle new images if provided
    if (newImages && newImages.length > 0) {
      console.log(`Uploading ${newImages.length} new images...`)

      try {
        const newImageUrls = await uploadFilesToS3(newImages)
        imageUrls = [...imageUrls, ...newImageUrls]
        console.log("New images uploaded successfully to S3:", newImageUrls)
      } catch (uploadError) {
        console.error("❌ S3 upload failed:", uploadError)
        const fallbackImages = newImages.map((_, index) => `/laina ${index + 1}`)
        imageUrls = fallbackImages
        console.log("Using fallback placeholder images:", fallbackImages)
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

    try {
      // Try the query with ordering (requires index)
      const q = query(carsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

      // Add timeout to detect potential blocking
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Firestore query timed out - connection may be blocked")), 10000)
      })

      // Race between the query and the timeout
      const snapshot = (await Promise.race([getDocs(q), timeoutPromise])) as QuerySnapshot<DocumentData>

      console.log(`Found ${snapshot.docs.length} listings for user`)

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Car
      })
    } catch (indexError) {
      // Check if this is a connection error
      if (
        indexError instanceof Error &&
        (indexError.message.includes("network") ||
          indexError.message.includes("timeout") ||
          indexError.message.includes("blocked"))
      ) {
        console.error("Connection error detected:", indexError)
        throw indexError // Rethrow to be handled by the error handler
      }

      // If index error occurs, fall back to simple query without ordering
      console.warn("Index not yet available, falling back to unordered query:", indexError)
      const fallbackQuery = query(carsRef, where("userId", "==", userId))
      const fallbackSnapshot = await getDocs(fallbackQuery)
      console.log(`Found ${fallbackSnapshot.docs.length} listings for user (unordered)`)

      // Sort the results in memory instead
      const results = fallbackSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Car
      })

      // Sort manually by createdAt in descending order
      return results.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA // Descending order
      })
    }
  } catch (error) {
    console.error(`Error fetching listings for user ${userId}:`, error)
    throw error // Rethrow to be handled by the error handler
  }
}

// Add this function to set a user as admin (for testing)
export async function setUserAsAdmin(userId: string): Promise<void> {
  try {
    const db = getFirestore()
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      role: "admin",
    })

    console.log(`User ${userId} has been set as admin`)
  } catch (error) {
    console.error("Error setting user as admin:", error)
    throw error
  }
}

/**
 * Add a car to user's favorites
 */
export async function addToFavorites(userId: string, carId: string): Promise<string> {
  try {
    // Check if already favorited
    const existingFavorite = await checkIfFavorited(userId, carId)
    if (existingFavorite) {
      return existingFavorite
    }

    // Add to favorites collection
    const favoriteRef = await addDoc(collection(db, "favorites"), {
      userId,
      carId,
      createdAt: serverTimestamp(),
    })

    console.log(`Added car ${carId} to favorites for user ${userId}`)
    return favoriteRef.id
  } catch (error) {
    console.error("Error adding to favorites:", error)
    throw new Error("Failed to add to favorites")
  }
}

/**
 * Remove a car from user's favorites
 */
export async function removeFromFavorites(userId: string, carId: string): Promise<void> {
  try {
    // Find the favorite document
    const favoritesRef = collection(db, "favorites")
    const q = query(favoritesRef, where("userId", "==", userId), where("carId", "==", carId))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log(`No favorite found for user ${userId} and car ${carId}`)
      return
    }

    // Delete the favorite document
    const favoriteDoc = querySnapshot.docs[0]
    await deleteDoc(doc(db, "favorites", favoriteDoc.id))

    console.log(`Removed car ${carId} from favorites for user ${userId}`)
  } catch (error) {
    console.error("Error removing from favorites:", error)
    throw new Error("Failed to remove from favorites")
  }
}

/**
 * Check if a car is favorited by the user
 */
export async function checkIfFavorited(userId: string, carId: string): Promise<string | null> {
  try {
    if (!userId || !carId) {
      return null
    }

    const favoritesRef = collection(db, "favorites")
    const q = query(favoritesRef, where("userId", "==", userId), where("carId", "==", carId))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    return querySnapshot.docs[0].id
  } catch (error) {
    console.error("Error checking if favorited:", error)
    return null
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  try {
    const favoritesRef = collection(db, "favorites")
    const q = query(favoritesRef, where("userId", "==", userId))

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        carId: data.carId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Favorite
    })
  } catch (error) {
    console.error("Error getting user favorites:", error)
    return []
  }
}

/**
 * Get all favorited cars for a user
 */
export async function getFavoritedCars(userId: string): Promise<Car[]> {
  try {
    // Get all favorites for the user
    const favorites = await getUserFavorites(userId)

    if (favorites.length === 0) {
      return []
    }

    // Get car details for each favorite
    const { getCarById } = await import("./firebase")

    const carPromises = favorites.map((favorite) => getCarById(favorite.carId))
    const cars = await Promise.all(carPromises)

    // Filter out any null values (cars that might have been deleted)
    return cars.filter((car) => car !== null) as Car[]
  } catch (error) {
    console.error("Error getting favorited cars:", error)
    return []
  }
}

/**
 * Toggle favorite status for a car
 */
export async function toggleFavorite(userId: string, carId: string): Promise<boolean> {
  try {
    const isFavorited = await checkIfFavorited(userId, carId)

    if (isFavorited) {
      await removeFromFavorites(userId, carId)
      return false // Not favorited anymore
    } else {
      await addToFavorites(userId, carId)
      return true // Now favorited
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    throw new Error("Failed to toggle favorite status")
  }
}
