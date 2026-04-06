/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2c1810",      // темно-коричневий
        beige: "#f8f1e9",        // основний фон
        accent: "#f4d9b8",       // світлий бежевий
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}