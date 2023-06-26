import { configRepo } from "../";
export type Config<T> = T & {
	$save(): Promise<void>;
	$load(): Promise<void>;
	$set(data: T): void;
};

export type ServerConfig = {
	invoicePrefix: string;
	ogTitle: string;
	ogImage: string;
	ogDescription: string;
	appName: string;
	appLogo: string;
	theme: string;
	owner: string;
	banner: boolean;
	ceil: number;
	populars: string[];
	contacts: [string, string, string][];
	carouselItems: {
		src: string;
		alt: string;
		href?: string;
	}[];
	fee: {
		[k in "NORMAL" | "RESELLER" | "ADMIN"]: {
			[p in "default" | string]: {
				percent?: number;
				flat?: number;
			};
		};
	};
};

export function createConfig<T>(file: string, def: T): Config<T> {
	async function save() {
		const data = JSON.stringify(def, null, "\t");
		await configRepo.save(data);
	}
	async function load() {
		const data = await configRepo.load();
		const json = JSON.parse(data) as T;
		set(json);
	}
	function set(data: T) {
		Object.assign(def as any, data);
	}
	Object.defineProperty(def, "$save", {
		value: save,
		enumerable: false
	});
	Object.defineProperty(def, "$load", {
		value: load,
		enumerable: false
	});
	Object.defineProperty(def, "$set", {
		value: set,
		enumerable: false
	});
	return def as Config<T>;
}

export const config = createConfig<ServerConfig>("data/config.json", {
	invoicePrefix: "FAL",
	ogTitle: "Topup termurah hanya di topup.falentio.com",
	ogDescription:
		"topup.falentio.com adalah website topup termurah, aman, dan terpercaya se indonesia",
	ogImage: "/banner/2.webp",
	appName: "Falentio",
	appLogo: "/favicon.png",
	theme: "",
	owner: "Rivaldi Kevin Falentio",
	banner: true,
	ceil: 100,
	contacts: [
		["facebook", "facebook", "https://fb.me/kevinfalentio"],
		["whatsapp", "whatsapp", "#"],
		["discord", "discord", "#"],
		["instagram", "instagram", "https://instagram.com/kevinfalentio"],
		["telegram", "telegram", "https://t.me/falentio"],
		["line", "line", "#"],
		["email", "email", "#"]
	],
	populars: [],
	carouselItems: [
		{ src: "/banner/1.webp", alt: "fooo" },
		{ src: "/banner/2.webp", alt: "fooo" },
		{ src: "/banner/3.webp", alt: "fooo" }
	],
	fee: {
		NORMAL: {
			default: {
				flat: 150,
				percent: 2
			}
		},
		RESELLER: {
			default: {
				flat: 50,
				percent: 1.5
			}
		},
		ADMIN: {
			default: {
				percent: 0,
				flat: 0
			}
		}
	}
});
