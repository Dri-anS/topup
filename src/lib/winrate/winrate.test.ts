import { describe, it, expect } from "vitest";
import { Winrate } from ".";

describe("winrate", () => {
	describe("winstreak", () => {
		it.each([
			[10, 50, 75, 10],
			[100, 50, 75, 100],
			[100, 50, 66.66, 50],
			[10, 80, 90, 10],
			[1000, 80, 90, 1000],
			[10, 0, 50, 10],
			[10, 0, 75, 30],
			[75, 66.67, 75, 25],
			[50, 50, 66.66, 25],
			[5, 50, 54.5, 1],
			[5, 50, 54, 1],
			[5, 50, 51, 1],
			[5, 50, 50.00000001, 1],
			[-1 >>> 0, 50, 75, -1 >>> 0],
			[-1 >>> 0, 80, 90, -1 >>> 0]
		] as [currMatch: number, currWr: number, targetWr: number, wsNeeded: number][])(
			"new Winrate(%i, %i).winstreak(%i) === %i",
			(currMatch, currWr, targetWr, wsNeeded) => {
				const wr = new Winrate(currMatch, currWr);
				expect(wr.winstreak(targetWr)).toBe(wsNeeded);
			}
		);
	});
});
