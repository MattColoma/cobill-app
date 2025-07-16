/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}" // Esto le dice a Tailwind que escanee tus archivos React
  ],
  theme: {
    extend: {
      colors: {
        petroleoBlue: '#1A324C'
      },
      // Opcional: si quieres usar la fuente Inter
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}