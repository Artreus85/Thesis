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
  type Timestamp,
} from "firebase/firestore"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOutFn,
} from "firebase/auth"
import { uploadFilesToS3, deleteFileFromS3 } from "./s3"
import { firebaseConfig } from "./firebase-config"
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
        createdAt: userData.createdAt?.toDate().toISOString(),
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    await addDoc(collection(db, "users"), {
      id: user.uid,
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    })) as User[]
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    })) as Car[]
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
        await deleteFileFromS3(imageUrl)
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
    const carsRef = collection(db, "cars")
    let q = query(carsRef, where("isVisible", "==", true), orderBy("createdAt", "desc"))

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
    if (searchParams.query) {
      // Simple search implementation, consider using a more robust solution for production
      q = query(q, where("model", ">=", searchParams.query), where("model", "<=", searchParams.query + "\uf8ff"))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()

      // Convert Firestore Timestamp to string if it exists
      if (data.createdAt && typeof data.createdAt !== "string") {
        const timestamp = data.createdAt as Timestamp
        data.createdAt = timestamp.toDate().toISOString()
      }

      return {
        id: doc.id,
        ...data,
      } as Car
    })
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
    const carDoc = await getDoc(doc(db, "cars", carId))

    if (carDoc.exists()) {
      const carData = carDoc.data()

      // Convert Firestore Timestamp to string if it exists
      if (carData.createdAt && typeof carData.createdAt !== "string") {
        const timestamp = carData.createdAt as Timestamp
        carData.createdAt = timestamp.toDate().toISOString()
      }

      return {
        id: carDoc.id,
        ...carData,
      } as Car
    } else {
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
    // Upload images to S3
    const imageUrls = await uploadFilesToS3(images)

    // Create car document in Firestore
    const docRef = await addDoc(collection(db, "cars"), {
      ...carData,
      images: imageUrls,
      createdAt: new Date().toISOString(),
      isVisible: true,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating car listing:", error)
    throw error
  }
}

/**
 * Get car listings
 */
export async function getCarListings(limit: number): Promise<Car[]> {
  try {
    const carsRef = collection(db, "cars")
    const q = query(carsRef, where("isVisible", "==", true), orderBy("createdAt", "desc"), limit ? limit : 20)
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      // Convert Firestore Timestamp to string if it exists
      if (data.createdAt && typeof data.createdAt !== "string") {
        const timestamp = data.createdAt as Timestamp
        data.createdAt = timestamp.toDate().toISOString()
      }

      return {
        id: doc.id,
        ...data,
      } as Car
    })
  } catch (error) {
    console.error("Error fetching car listings:", error)
    return []
  }
}
