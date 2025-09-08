export interface StageData {
	[key: string]: [Stage] |[Stage, ...StageWave[]]
}

export interface StageWave {
	minute: number,
	minimum: number,
	frequency: number,
	enemies: string[],
	events?: WaveEvent[],
	bosses?: string[],
	treasure?: Treasure,
	arcanaHolder?: string,
	arcanaTreasure?: Treasure,
	biome?: string,
}

export interface Treasure {
	chances: number[],
	level: number,
	prizeTypes: PrizeType[],
	fixedPrizes?: string[]
}

export interface Stage extends StageWave {
	order: number,
	stageName: string,
	description: string,
	uiTexture: string,
	uiFrame: string,
	texture: string,
	frameName: string,
	frameNameUnlock?: string,
	bestiaryBG: string,
	stageNumber: string,
	unlocked: boolean,
	hidden?: boolean,
	isMerchantBanned?: boolean,
	isSpeedupBanned?: boolean,
	BGM: string,
	sideBGM?: string,
	tips: string,
	hyperTips: string,
	relics?: string[],
	yellowRelics?: string[],
	cff?: string,
	validForCharacterData: boolean,
	mods: {
		TimeLimit: number,
		ClockSpeed: number,
		PlayerPxSpeed: number,
		EnemySpeed: number,
		ProjectileSpeed: number,
		GoldMultiplier: number,
		EnemyHealthMultiplier: number,
		LuckBonus: number,
		XPBonus: number,
	},
	hyper: {
		unlocked: boolean,
		TimeLimit: number,
		ClockSpeed: number,
		PlayerPxSpeed: number,
		EnemySpeed: number,
		ProjectileSpeed: number,
		GoldMultiplier: number,
		EnemyHealthMultiplier: number,
		LuckBonus: number,
		XPBonus: number,
		StartingSpawns: number,
	},
	inverse?: {
		tint: number,
		GoldMultiplier: number,
		EnemyHealthMultiplier: number,
		LuckBonus: number,
		TimeMods: {
			start: number,
			hpPerMinute: number,
			speedPerMinute: number,
		},
	},
	tileset: {
		setKey: string,
		setPath: string,
		mapKey: string,
		mapPath: string,
		isTiling: boolean,
		SizeX?: number,
		SizeY?: number,
	},
	background: {
		texture: string,
		movingBackground?: boolean,
	},
	LootTable?: string[],
	preload?: {
		textures: string[],
		bgm?: string[],
		videos?: string[],
	},
	spawnType?: SpawnType,
	startingSpawns: number,
	destructibleType: DestructibleType,
	destructibleFreq: number,
	destructibleChance: number,
	destructibleChanceMax: number,
	maxDestructibles: number,
	BGTextureName: string,
	dayNight?: boolean,
	tilemapTiledJSON?: {
		name: string,
		path: string,
	},
	tilemapTiledIMG?: {
		name: string,
		path: string,
	},
	tilemapPos?: {
		x: number,
		y: number,
	},
}

export interface WaveEvent {
	eventType: string,
	delay?: number,
	repeat?: number,
	chance?: number,
	moreX?: number,
	moreY?: string,
}

export enum PrizeType {
	EvoArcana = "EVO_ARCANA",
	Evolution = "EVOLUTION",
	ExistingAny = "EXISTING_ANY",
	ExistingWeapon = "EXISTING_WEAPON",
}

export enum DestructibleType {
	Brazier = "BRAZIER",
	Candelabra = "CANDELABRA",
	Lampost = "LAMPOST",
	Brazier2 = "BRAZIER2",
}

export enum SpawnType {
	Standard = "STANDARD",
	Vertical = "VERTICAL",
	Horizontal = "HORIZONTAL",
	Tiled = "TILED",
	Mapped = "MAPPED",
}
