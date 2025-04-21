import { isPreviewEnvironment } from "./environment"

/**
 * Get a fallback image URL for a car
 * @param car Car details for generating a relevant placeholder
 * @returns URL to a placeholder image
 */
export function getCarPlaceholder(car: { brand?: string; model?: string } | null): string {
  const brand = car?.brand || "car"
  const model = car?.model || ""
  return `/placeholder.svg?height=600&width=800&query=${brand} ${model}`
}

/**
 * Check if an image URL is valid or if it needs a fallback
 * @param url The image URL to check
 * @returns True if the URL is valid, false if it needs a fallback
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false

  // Always consider placeholder images valid
  if (url.includes("placeholder.svg")) return true

  // Check if URL is from AWS S3
  const isS3Url = url.includes("amazonaws.com") || url.includes("s3.")
  // For S3 URLs, check if they have required components
  if (isS3Url) {
    // Check if URL has expired (missing signature or expired timestamp)
    const hasSignature = url.includes("X-Amz-Signature")
    const hasExpiration = url.includes("X-Amz-Date") && url.includes("X-Amz-Expires")

    // If it's an S3 URL without signature, it might be a public URL which is fine
    // If it has a signature, make sure it has expiration parameters
    return !hasSignature || (hasSignature && hasExpiration)
  }

  // For other URLs, just make sure they're not empty
  return url.trim().length > 0
}

/**
 * Get a valid image URL or fallback to a placeholder
 * @param url The original image URL
 * @param car Car details for generating a relevant placeholder
 * @returns A valid image URL or placeholder
 */
export function getValidImageUrl(
  url: string | undefined | null,
  car: { brand?: string; model?: string } | null,
): string {
  if (isValidImageUrl(url)) {
    return url as string
  }

  return getCarPlaceholder(car)
}
