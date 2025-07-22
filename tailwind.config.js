/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        gray: {
          750: 'rgb(55 65 81 / 0.8)',
        },
      },
    },
  },
  plugins: [],
}