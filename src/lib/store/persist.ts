import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

export interface PersistOptions<T> {
	parse?: (str: string) => T;
	stringify?: (data: T) => string;
	useSessionStorage?: boolean;
}

export function persist<T>(
	name: string,
	value?: T,
	{
		parse = (str: string) => JSON.parse(str),
		stringify = (data: T) => JSON.stringify(data),
		useSessionStorage = false
	}: PersistOptions<T> = {}
): Writable<T> {
	const wr = writable(value);
	if (!browser) {
		return wr;
	}
	const storage = useSessionStorage ? sessionStorage : localStorage;

	try {
		const str = storage.getItem(name);
		if (str) {
			const parsed = parse(str);
			wr.set(parsed);
		}
	} catch {}

	wr.subscribe((data) => {
		const str = stringify(data);
		storage.setItem(name, str);
	});

	return wr;
}
