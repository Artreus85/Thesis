"use client"

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import type { Car, User } from "./types"
import { getFirestoreClient, getAuthClient } from "./firebase-client"
import { uploadFilesToS3 } from "./upload"

// Get instances
const db = getFirestoreClient()
const auth = getAuthClient()

// User functions
export async function createUser(name: string, email: string, uid: string) {
  const userRef = collection(db, "users")
  const userData = {
    id: uid,
    name,
    email,
    role: "regular",
    createdAt: serverTimestamp(),
  }

  await addDoc(userRef, userData)
  return {
    ...userData,
    createdAt: new Date().toISOString(), // Convert for immediate use
  }
}

export async function getUserById(userId: string) {
  const userQuery = query(collection(db, "users"), where("id", "==", userId))
  const snapshot = await getDocs(userQuery)

  if (snapshot.empty) {
    return null
  }

  const userData = snapshot.docs[0].data() as User

  // Convert Firestore Timestamp to string if it exists
  if (userData.createdAt && typeof userData.createdAt !== "string") {
    const timestamp = userData.createdAt as unknown as Timestamp
    userData.createdAt = timestamp.toDate().toISOString()
  }

  return userData
}

export async function getAllUsers() {
  const usersRef = collection(db, "users")
  const snapshot = await getDocs(usersRef)

  return snapshot.docs.map((doc) => {
    const data = doc.data() as User

    // Convert Firestore Timestamp to string if it exists
    if (data.createdAt && typeof data.createdAt !== "string") {
      const timestamp = data.createdAt as unknown as Timestamp
      data.createdAt = timestamp.toDate().toISOString()
    }

    return data
  })
}

export async function deleteUser(userId: string) {
  const userQuery = query(collection(db, "users"), where("id", "==", userId))
  const snapshot = await getDocs(userQuery)

  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref)
  }
}

// Car listing functions
export async function createCarListing(carData: Omit<Car, "id">, imageFiles: File[]) {
  // First upload images to S3 using the client-side utility
  const imageUrls = await uploadFilesToS3(imageFiles)

  // Then create the car listing in Firestore
  const carsRef = collection(db, "cars")
  const docRef = await addDoc(carsRef, {
    ...carData,
    images: imageUrls,
    isVisible: true,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getCarListings(limitCount = 20) {
  // Create a query with multiple conditions
  const carsRef = collection(db, "cars")
  const q = query(carsRef, where("isVisible", "==", true), orderBy("createdAt", "desc"), limit(limitCount))

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
}

export async function getFilteredCars(filters: any) {
  const carsRef = collection(db, "cars")

  // Start with base conditions
  const conditions: any[] = [where("isVisible", "==", true)]

  // Add filter conditions
  if (filters.brand && filters.brand !== "any") {
    conditions.push(where("brand", "==", filters.brand))
  }

  if (filters.minPrice) {
    conditions.push(where("price", ">=", Number.parseInt(filters.minPrice)))
  }

  if (filters.maxPrice) {
    conditions.push(where("price", "<=", Number.parseInt(filters.maxPrice)))
  }

  if (filters.minYear) {
    conditions.push(where("year", ">=", Number.parseInt(filters.minYear)))
  }

  if (filters.fuel && filters.fuel !== "any") {
    conditions.push(where("fuel", "==", filters.fuel))
  }

  if (filters.condition && filters.condition !== "any") {
    conditions.push(where("condition", "==", filters.condition))
  }

  // Create the query with all conditions
  const q = query(carsRef, ...conditions, orderBy("createdAt", "desc"))

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
}

export async function getCarById(carId: string) {
  const docRef = doc(db, "cars", carId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data()

  // Convert Firestore Timestamp to string if it exists
  if (data.createdAt && typeof data.createdAt !== "string") {
    const timestamp = data.createdAt as Timestamp
    data.createdAt = timestamp.toDate().toISOString()
  }

  return {
    id: docSnap.id,
    ...data,
  } as Car
}

export async function getUserListings(userId: string) {
  const carsRef = collection(db, "cars")
  const q = query(carsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

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
}

export async function getAllListings() {
  const carsRef = collection(db, "cars")
  const snapshot = await getDocs(carsRef)

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
}

export async function updateCarListing(carId: string, data: Partial<Car>, newImageFiles?: File[]) {
  const docRef = doc(db, "cars", carId)

  // If there are new images, upload them to S3
  if (newImageFiles && newImageFiles.length > 0) {
    // Upload new images
    const newImageUrls = await uploadFilesToS3(newImageFiles)
    data.images = newImageUrls
  }

  // Update the document in Firestore
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteListing(carId: string) {
  const docRef = doc(db, "cars", carId)
  await deleteDoc(docRef)
}

export async function toggleListingVisibility(carId: string, isVisible: boolean) {
  const docRef = doc(db, "cars", carId)
  await updateDoc(docRef, {
    isVisible,
    updatedAt: serverTimestamp(),
  })
}

// Authentication functions
export async function signUp(name: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await createUser(name, email, userCredential.user.uid)
  return userCredential.user
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signOut() {
  return firebaseSignOut(auth)
}
