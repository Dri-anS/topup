import { customAlphabet } from "nanoid/async";
import { config } from "../config";
export const id = customAlphabet("1234567890QWERTYUIOPASDFGHJKLZXCVBNM");
export const nanoid = (len: number) => {
	const date = new Date();
	const y = (date as any).getYear() - 120;
	const m = date.getMonth();
	const d = date.getDate();
	return id(len - 3).then(
		(s) =>
			y.toString(36).toUpperCase() + m.toString(36).toUpperCase() + d.toString(36).toUpperCase() + s
	);
};
export const prefix = (prefix: string, len = 16) =>
	nanoid(len).then((s) => prefix.toUpperCase() + "-" + s);
export const topupId = () => prefix(config.invoicePrefix);
export const invDigiflazz = (p: string, id: number) => `${p}-${id.toString()}`;
