import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent, #FF6B35)",
        accentSoft: "var(--accent-soft, rgba(255,107,53,0.10))",
        canvas: "#0B0D10",
        surface: "#15181E",
        surface2: "#1C2027",
        line: "#2A2F38",
        muted: "#8A93A2",
        ink: "#EDF0F4",
        ember: "#FF6B35",
        gold: "#F5C242",
        mint: "#3FB97E",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
