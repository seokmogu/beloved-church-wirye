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
      INSTAGRAM_PUSH_SECRET?: string
      IMAGE_TRANSCRIPTION_WORKER_SECRET?: string
      IMAGE_TRANSCRIPTION_GITHUB_TOKEN?: string
      IMAGE_TRANSCRIPTION_GITHUB_REPOSITORY?: string
      IMAGE_TRANSCRIPTION_GITHUB_WORKFLOW?: string
      IMAGE_TRANSCRIPTION_WORKFLOW_REF?: string
      NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?: string
      NEXT_PUBLIC_CHAT_ENABLED?: string
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      GOOGLE_ANALYTICS_PROPERTY_ID?: string
      GOOGLE_ANALYTICS_OAUTH_CLIENT_ID?: string
      GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET?: string
      GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN?: string
      OPENCLAW_API_URL?: string
      OPENCLAW_GATEWAY_TOKEN?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
