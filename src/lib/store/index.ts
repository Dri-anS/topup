import { persist } from "./persist";

export const theme = persist("theme", "light");
export const invoices = persist("invoices", [] as any[]);

export { persist };
