import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./content/**/*.mdx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(240 6% 4%)",
        surface: "hsl(240 5% 7%)",
        "surface-hover": "hsl(240 5% 10%)",
        border: "hsl(240 5% 14%)",
        "border-strong": "hsl(240 5% 22%)",
        foreground: "hsl(0 0% 95%)",
        muted: "hsl(240 4% 62%)",
        subtle: "hsl(240 4% 42%)",
        accent: {
          DEFAULT: "hsl(210 100% 66%)",
          violet: "hsl(258 90% 70%)",
          emerald: "hsl(160 84% 45%)",
          amber: "hsl(38 92% 55%)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      fontSize: {
        "display-lg": ["clamp(2.75rem, 6vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        display: ["clamp(2rem, 4.5vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        title: ["clamp(1.375rem, 2.5vw, 1.75rem)", { lineHeight: "1.25", letterSpacing: "-0.02em" }]
      },
      animation: {
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        dash: "dash 3s linear infinite"
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" }
        },
        dash: { to: { strokeDashoffset: "-24" } }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
