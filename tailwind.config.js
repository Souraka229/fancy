module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FF6A00',
        gold: '#C9A84A'
      },
      borderRadius: {
        md: '12px'
      }
    }
  },
  plugins: []
}
