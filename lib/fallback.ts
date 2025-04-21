import { isPreviewEnvironment } from "./environment"

/**
 * Generate a mock image URL for development and preview
 */
export function getMockImageUrl(fileName: string): string {
  // Generate a deterministic but random-looking string based on the filename
  const hash = Array.from(fileName).reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0)
  }, 0)

  const carTypes = ["sedan", "suv", "sports", "truck", "convertible"]
  const carType = carTypes[Math.abs(hash) % carTypes.length]

  return `/placeholder.svg?height=600&width=800&query=car ${carType}`
}

/**
 * Mock implementation of file upload for preview environments
 */
export async function mockUploadToS3(file: File): Promise<string> {
  // In real environments, this should never be called
  throw new Error("Mock upload called in production environment")
}

/**
 * Mock implementation of multiple file uploads
 */
export async function mockUploadMultipleToS3(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => mockUploadToS3(file)))
}
