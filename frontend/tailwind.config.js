/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        optiblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6', // primary blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        optigreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // secondary green for savings/success
          600: '#16a34a',
          700: '#15803d',
        }
      },
    },
  },
  plugins: [],
}
