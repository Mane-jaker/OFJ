import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        fg: "var(--color-fg)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "16px",
        xl: "14px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      maxWidth: {
        landing: "1120px",
        form: "680px",
        results: "800px",
      },
    },
  },
  plugins: [],
};

export default config;
