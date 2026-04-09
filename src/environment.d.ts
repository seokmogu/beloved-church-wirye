declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      POSTGRES_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      CRON_SECRET?: string
      PREVIEW_SECRET?: string
      BLOB_READ_WRITE_TOKEN?: string
      NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?: string
      NEXT_PUBLIC_CHAT_ENABLED?: string
      OPENCLAW_API_URL?: string
      OPENCLAW_GATEWAY_TOKEN?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
