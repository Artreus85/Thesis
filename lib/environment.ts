/**
 * Utility to detect the current environment
 */

export function isServer() {
  return typeof window === "undefined"
}

export function isClient() {
  return !isServer()
}

export function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

export function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function isPreviewEnvironment() {
  // Check if we're in the v0 preview environment
  return typeof window !== "undefined" && window.location.hostname.includes("v0.dev")
}
