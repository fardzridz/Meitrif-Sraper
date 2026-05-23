import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3BE6A6",
        background: "#F7FAF9",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1F2933",
          muted: "#64748B",
          subtle: "#94A3B8"
        },
        line: "#E5E7EB",
        danger: "#EF4444",
        warning: "#F59E0B"
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px"
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0, 0, 0, 0.06)",
        lift: "0 10px 26px rgba(31, 41, 51, 0.08)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
