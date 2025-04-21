import { refreshS3Url } from "./s3"
import { isPreviewEnvironment } from "./environment"

/**
 * Process image URLs to ensure they're valid and not expired
 * @param urls Array of image URLs
 * @returns Processed image URLs
 */
export async function processImageUrls(urls: string[]): Promise<string[]> {

  // Filter out any null or undefined values
  const validUrls = urls.filter((url) => !!url)

  // If no valid URLs, return empty array
  if (validUrls.length === 0) {
    return []
  }

  try {
    // Process each URL in parallel
    const processedUrls = await Promise.all(
      validUrls.map(async (url) => {
        // Skip placeholder images
        if (url.includes("placeholder.svg")) {
          return url
        }

        // Check if URL is expired (contains AWS signature that's expired)
        const isExpired = url.includes("X-Amz-Date") && url.includes("X-Amz-Expires") && url.includes("X-Amz-Signature")

        if (isExpired) {
          try {
            // Refresh the URL
            return await refreshS3Url(url)
          } catch (error) {
            console.error("Error refreshing image URL:", error)
            return url // Return original URL if refresh fails
          }
        }

        return url
      }),
    )

    return processedUrls
  } catch (error) {
    console.error("Error processing image URLs:", error)
    return validUrls // Return original URLs if processing fails
  }
}

/**
 * Get a default image URL for a car
 * @param car Car object or brand/model strings
 * @returns Default image URL
 */
export function getDefaultCarImage(car: { brand?: string; model?: string } | null): string {
  if (!car) {
    return "/classic-red-convertible.png"
  }

  const brand = car.brand || ""
  const model = car.model || ""

  return `/placeholder.svg?height=400&width=600&query=${brand} ${model}`
}
