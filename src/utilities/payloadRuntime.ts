export function hasPayloadRuntimeConfig(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET && process.env.POSTGRES_URL)
}
