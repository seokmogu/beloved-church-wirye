/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 (사랑하는교회 위례)
        primary: {
          DEFAULT: '#1B3A2D', // 다크 그린 (메인)
          dark: '#0F2319',    // 더 어두운 그린
          light: '#2D5A47',   // 밝은 그린
        },
        secondary: {
          DEFAULT: '#C9A84C', // 골드 (강조)
          dark: '#A68C3D',    // 어두운 골드
          light: '#E0C76B',   // 밝은 골드
        },
        neutral: {
          cream: '#F5F0E8',   // 배경용 베이지/크림
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
