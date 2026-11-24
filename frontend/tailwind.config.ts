import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
          tertiary: "var(--background-tertiary)",
        },
        content: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--text-secondary)",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
        surface: "var(--card-bg)",
        accent: {
          DEFAULT: "#7C5CE8",
          hover: "#5B3EC0",
          light: "#EDE9FE",
          lighter: "#F5F3FF",
        },
        dark: "#0F0B24",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgb(124 92 232 / 0.08)",
        card: "0 4px 24px -4px rgb(124 92 232 / 0.10)",
        "card-hover": "0 12px 32px -8px rgb(124 92 232 / 0.15)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;