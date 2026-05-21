/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1565c0',
        secondary: '#1976d2',
        accent: '#42a5f5',
        dark: '#0d47a1',
        light: '#e3f2fd'
      }
    },
  },
  plugins: [],
}
