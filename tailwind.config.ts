/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    darkMode: 'dark',
    extend: {
      colors: {
        background: "var(--color-background)",
        text: "var(--color-text)",
        secondaryText: "var(--color-secondaryText)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
      },
    },
  },
  plugins: [],
}