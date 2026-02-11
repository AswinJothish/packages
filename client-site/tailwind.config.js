/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
	extend: {
		  animation: {
			slideInRight: "slideInRight 1s ease-out",
			slideInLeft: "slideInLeft 1s ease-out", 
		  },
		  keyframes: {slideInRight: {
			"0%": {
			  transform: "translateX(100%)",
			  opacity: "0",
			},
			"100%": {
			  transform: "translateX(0)",
			  opacity: "1",
			},
		  },
		  slideInLeft: {
			"0%": {
			  transform: "translateX(-100%)",
			  opacity: "0",
			},
			"100%": {
			  transform: "translateX(0)",
			  opacity: "1",
			},
		  },
		  },
		backgroundImage: {
			'hero-bg': "url('/images/water-bg.jpg')",
		  },
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
			robo: ['Roboto', 'sans-serif'],
			mont: ['Montserrat', 'sans-serif'],
			pop: ['Poppins', 'sans-serif'],
			lora: ['Lora', 'serif'],
			merr: ['Merriweather', 'serif'],
			open: ['Open Sans', 'sans-serif'],
			nunito: ['Nunito', 'sans-serif'],
			custom_thin: ["source-sans-3", 'sans-serif'],
			pacifico: ['Pacifico', 'cursive'],
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			primary: {
				DEFAULT: 'rgba(177, 177, 178, 0.5)',
				foreground: 'rgba(177, 177, 178, 0.5)'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			}
		},
		screens: {
		  sm: '640px', 
		  md: '768px',
		  lg: '1024px',
		  xl: '1280px',
		  '2xl': '1536px', 
		},
	}
},
// corePlugins: {
//     preflight: false,
//   },
  plugins: [require("tailwindcss-animate")],
} 