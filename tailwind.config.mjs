/** @type {import('tailwindcss').Config} */
import aspectRatio from "@tailwindcss/aspect-ratio";
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	safelist: [
		"animate-scroll",
		"hover:[animation-play-state:paused]",
	],
	theme: {
		extend: {
			fontFamily: {
				heading: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
				body: ['var(--font-inter)', 'Inter', 'sans-serif'],
			},
			animation: {
				scroll: 'scroll 80s forwards linear infinite',
				slideup: 'slideup 0.7s ease-out',
				slidedown: 'slidedown 0.7s ease-out',
				slideleft: 'slideleft 0.7s ease-out',
				slideright: 'slideright 0.7s ease-out',
				heroslidedown: 'heroslidedown 0.8s ease-out',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-out',
			},
			keyframes: {
				scroll: {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translate(calc(-50% - 0.5rem))'
					}
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideup: {
					from: {
						opacity: '0',
						transform: 'translateY(25%)'
					},
					to: {
						opacity: '1',
						transform: 'none'
					}
				},
				slidedown: {
					from: {
						opacity: '0',
						transform: 'translateY(-25%)'
					},
					to: {
						opacity: '1',
						transform: 'none'
					}
				},
				heroslidedown: {
					from: {
						opacity: '0',
						transform: 'translateY(-3%)'
					},
					to: {
						opacity: '1',
						transform: 'none'
					}
				},
				slideleft: {
					from: {
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				slideright: {
					from: {
						opacity: '0',
						transform: 'translateX(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
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
				}
			},
			colors: {
				green: {
					'50': '#30AF5B',
					'90': '#292C27'
				},
				// Brand color system — derived from Alfa Ventura logo (warm bronze/gold)
				alfa: {
					bronze: '#9B7040',       // primary brand — logo color
					'bronze-light': '#C9A96E', // lighter accent gold
					'bronze-dark': '#7A5520',  // deep bronze
					navy: '#1F2A44',           // dark navy (headings, footer)
					teal: '#13434E',           // secondary dark teal
					cream: '#FDF8F3',          // warm off-white background
					'cream-dark': '#F2EAE0',   // slightly deeper warm bg
					// Legacy aliases kept for backward compat
					yellow: '#D4AF37',
					blue: '#1F2A44',
					gray: '#6B7280',
					primary: '#9B7040',
				},
				gray: {
					'10': '#EEEEEE',
					'20': '#A2A2A2',
					'30': '#7B7B7B',
					'50': '#585858',
					'90': '#141414'
				},
				orange: {
					'50': '#FF814C'
				},
				blue: {
					'70': '#021639'
				},
				yellow: {
					'50': '#FEC601'
				},
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
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				xs: '400px',
				'3xl': '1680px',
				'4xl': '2200px'
			},
			maxWidth: {
				'10xl': '1512px'
			},
			borderRadius: {
				'5xl': '40px',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [aspectRatio, require("tailwindcss-animate")],
};
