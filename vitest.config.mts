import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // 통합 테스트가 원격(Supabase dev) DB를 쓸 때 콜드 커넥션이 5초를 넘길 수 있다
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
