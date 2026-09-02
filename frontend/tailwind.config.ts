import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#1E293B",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          hover: "#1D4ED8",
          light: "#DBEAFE"
        },
        secondary: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
          hover: "#059669",
          light: "#D1FAE5"
        },
        slot: {
          available: "#22C55E",
          occupied: "#EF4444",
          reserved: "#FACC15",
          selected: "#3B82F6",
          maintenance: "#94A3B8"
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B"
        },
        accent: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F172A"
        },
        border: "#E2E8F0",
        ring: "#2563EB"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        cardHover: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      }
    },
  },
  plugins: [],
};
export default config;