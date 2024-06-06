/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    colors: {
      "main-title": "#ddd",
      "note-title": "#004c67",
      "note-body": "#2b0a50",
      "white": "#FFFFFF",

      "green": "#115D27",
      "cream": "#C0B070",
      "gold": "#735F0C",
      "brown": "#5A300A",
      "black": "#010000"
    }
  },
  plugins: [],
}

