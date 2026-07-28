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
        gold: '#C9A84A',
        'bg-dark': '#050505',
        'cream': '#F7F3EE',
        'muted': '#7D7D84'
      },
      borderRadius: {
        md: '12px'
      },
      maxWidth: {
        'container-xl': '1200px'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial']
      }
    }
  },
  plugins: []
}
