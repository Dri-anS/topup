import { Decimal } from "decimal.js";

export class Winrate {
	match: Decimal;
	winrate: Decimal;
	constructor(match: number, winrate: number) {
		if (match < 0) {
			throw new Error("match can not be less than zero");
		}
		if (winrate < 0) {
			throw new Error("winrate can not be less than zero");
		}
		this.match = new Decimal(match);
		this.winrate = new Decimal(winrate);
	}

	winstreak(targetWr: number) {
		if (targetWr < 0) {
			throw new Error("target winrate can not be less than zero");
		}
		if (this.winrate.gt(targetWr)) {
			throw new Error("target winrate can not be less than current winrate");
		}
		const targetLr = new Decimal(targetWr).sub(100).abs();
		const losses = this.match.mul(this.winrate).div(100).sub(this.match).abs();
		const winsTarget = losses.mul(100).div(targetLr).sub(this.match).ceil();
		return winsTarget.toNumber();
	}
}

export function winstreak(match: number, winrate: number, targetWr: number) {
	return new Winrate(match, winrate).winstreak(targetWr);
}
