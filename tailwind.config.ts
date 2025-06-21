
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Modern Blue Palette
				blue: {
					50: 'hsl(214, 100%, 97%)',
					100: 'hsl(214, 95%, 93%)',
					200: 'hsl(213, 97%, 87%)',
					300: 'hsl(212, 96%, 78%)',
					400: 'hsl(213, 94%, 68%)',
					500: 'hsl(216, 100%, 50%)', // Primary vibrant blue
					600: 'hsl(216, 100%, 47%)',
					700: 'hsl(216, 100%, 44%)',
					800: 'hsl(216, 100%, 39%)',
					900: 'hsl(216, 100%, 31%)',
				},
				// Modern Gray Palette
				gray: {
					50: 'hsl(0, 0%, 98%)',
					100: 'hsl(0, 0%, 96%)',
					200: 'hsl(0, 0%, 90%)',
					300: 'hsl(0, 0%, 83%)',
					400: 'hsl(0, 0%, 64%)',
					500: 'hsl(0, 0%, 45%)',
					600: 'hsl(0, 0%, 32%)',
					700: 'hsl(0, 0%, 25%)',
					800: 'hsl(0, 0%, 15%)',
					900: 'hsl(0, 0%, 9%)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['12px', { lineHeight: '16px' }],
				'sm': ['14px', { lineHeight: '20px' }],
				'base': ['16px', { lineHeight: '24px' }],
				'lg': ['18px', { lineHeight: '28px' }],
				'xl': ['20px', { lineHeight: '28px' }],
				'2xl': ['24px', { lineHeight: '32px' }],
				'3xl': ['30px', { lineHeight: '36px' }],
				'4xl': ['36px', { lineHeight: '40px' }],
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			minHeight: {
				'touch': '44px',
				'button': '52px',
			},
			minWidth: {
				'touch': '44px',
			},
			maxWidth: {
				'mobile': '375px',
				'tablet': '768px',
			},
			boxShadow: {
				'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
				'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
				'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
