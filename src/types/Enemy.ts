export interface EnemyData {
	[key: string]: Enemy[],
}

export interface Enemy {
	level: number,
	maxHp: number,
	speed: number,
	power: number,
	knockback: number,
	maxKnockback: number,
	deathKB: number,
	xp: number,
	idleFrameCount: number,
	killedAmount: number,
	textureName: string,
	end: number,
	frameNames: string[],
	bName?: string,
	bDesc?: string,
	bPlaces?: string[],
	bInclue?: boolean,
	bHighlight?: boolean,
	bVariants?: string[],
}
