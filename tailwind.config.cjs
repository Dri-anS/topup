const config = {
	mode: "jit",
	darkMode: "class",
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {
			fontFamily: {
				ibm: ['"IBM Plex Mono"', "monospace"]
			},
			animation: {
				marque1: "marque1 20s linear infinite",
				marque2: "marque2 20s linear infinite"
			},
			keyframes: {
				marque1: {
					"0%": { transform: "translateX(0%)" },
					"100%": { transform: "translateX(-100%)" }
				},
				marque2: {
					"0%": { transform: "translateX(100%)" },
					"100%": { transform: "translateX(0%)" }
				}
			}
		}
	},

	plugins: [require("daisyui")]
};

module.exports = config;
