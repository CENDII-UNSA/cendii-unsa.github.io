/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'cendii': {
					'red': '#c8193a',
					'cyan': '#37aece',
					'blue': '#004677'
				},
				'unsa': {
					'red': '#84060c',
					'yellow': '#d0aa66'
				}
			}
		},
	},
	plugins: [],
}
