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
        primary: "#ff6b35",
        gray3: "#333333",
        gray5: "#888888",
        gray6: "#e5e5e5",
        gray7: "#f5f5f5",
        gray9: "#f8f8f8",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      width: {
        large: "1200px",
      },
      maxWidth: {
        large: "1200px",
      },
      zIndex: {
        600: "600",
      },
      screens: {
        mo: { max: "767px" },
        pc: "768px",
      },
    },
  },
  plugins: [],
};
export default config;
