/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#A259FF",
				deep: "#2D014D",
				magenta: "#C084FC",
				lavender: "#E9D5FF",
				black: "#000000",
				secondary: "#6C757D",
				success: "#28A745",
				error: "#DC3545",
			},
		},
	},
	plugins: [],
};
