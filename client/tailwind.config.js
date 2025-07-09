/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: true,
  },
  future: {
    disableColorPalette: true, // disables use of modern oklch() by Tailwind
  }
}
  