import daisyui from "daisyui"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [ daisyui ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}

