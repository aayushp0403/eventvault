/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body:    ["'Satoshi'", "sans-serif"],
      },
      colors: {
        obsidian: {
          950: "#080810",
          900: "#0d0d1a",
          800: "#13131f",
          700: "#1a1a2e",
          600: "#22223b",
        },
        volt:  { DEFAULT: "#c8ff00", dark: "#9ecc00" },
        ember: { DEFAULT: "#ff5c1a", dark: "#cc4200" },
        ice:   { DEFAULT: "#a8d8ff", dark: "#5ba8e0" },
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "pulse-volt": "pulseVolt 2s ease-in-out infinite",
        "shimmer":    "shimmer 1.6s linear infinite",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity: 0, transform: "translateY(18px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        pulseVolt: { "0%,100%": { boxShadow: "0 0 0 0 rgba(200,255,0,0.3)" }, "50%": { boxShadow: "0 0 0 10px rgba(200,255,0,0)" } },
        shimmer:   { "0%": { backgroundPosition: "-700px 0" }, "100%": { backgroundPosition: "700px 0" } },
      },
    },
  },
  plugins: [],
}