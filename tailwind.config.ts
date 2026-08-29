import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0908",
        paper: "#e8dcc8",
        clay: "#9c2b2b",
        gold: "#c4a574",
        navy: "#1a2332",
        mist: "#9a8f7e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.32em",
        heritage: "0.42em",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        stitch:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%231a2332'/%3E%3Cpath d='M4 4h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4zM0 8h4v4H0zm8 0h4v4H8zm8 0h4v4h-4zm4 0h4v4h-4zM4 12h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4zM0 16h4v4H0zm8 0h4v4H8zm8 0h4v4h-4zM4 20h4v4H4zm8 0h4v4h-4zm8 0h4v4h-4z' fill='%23e8dcc8'/%3E%3Cpath d='M8 4h4v4H8zm8 4h4v4h-4zM4 8h4v4H4zm8 8h4v4h-4z' fill='%239c2b2b'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
