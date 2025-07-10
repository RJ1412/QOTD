export default {
  darkMode: "class", // 👈 this is necessary!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a78bfa',
        accent: '#fbcfe8',
        base: '#fdf6f0',
        darkbg: '#1e1e2f',
      },
    },
  },
  plugins: [],
};
