/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        "bg-light": '#F6F3E9',
        "fg-light": '#39322B',
        "bg-dark": '#39322B',
        "link": '#3f51b5',
        "link-dark": '#818cf8',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}

