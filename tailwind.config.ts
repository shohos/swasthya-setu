import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bd-green": "#006A4E",
        "bd-red": "#F42A41",
        ink: "#0C1018",
        panel: "#141D27",
        card: "#1C2838",
        edge: "#1E3040",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        bangla: ["var(--font-bengali)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(40px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "dash-flow": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        ecg: {
          "0%": { strokeDashoffset: "1200" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.2,0.6,0.4,1) infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        ticker: "ticker 35s linear infinite",
        "dash-flow": "dash-flow 1s linear infinite",
        ecg: "ecg 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
