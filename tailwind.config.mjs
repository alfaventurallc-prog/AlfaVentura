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
			animation: {
				scroll: 'scroll 80s forwards linear infinite',
				slideup: 'slideup 1s ease-in-out',
				slidedown: 'slidedown 1s ease-in-out',
				slideleft: 'slideleft 1s ease-in-out',
				slideright: 'slideright 1s ease-in-out',
				heroslidedown: 'heroslidedown 1s ease-in-out',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
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
				alfa: {
					yellow: '#D4AF37',
					blue: '#1F2A44',
					gray: '#5B6670',
					primary: '#13434E'
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
