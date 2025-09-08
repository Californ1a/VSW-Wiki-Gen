import fs from 'node:fs/promises';
import YAML from 'yaml';
import type { EnemyData, Enemy } from './types/Enemy';
import { type StageData, type Stage, type Treasure, PrizeType, SpawnType } from "./types/Stage";
import type { Lang } from "./types/Lang";

type Dictionary<T> = { [key: string]: T }

const MAIN_PATH = '../VampireSurvivorsFiles/';
const DATA_PATH = `${MAIN_PATH}Data/`;
const OUTPUT_PATH = './out/';

const ENEMIES: Dictionary<EnemyData> = {};
const STAGES: Dictionary<StageData> = {};
const LANG: Dictionary<string> = {};

async function loadData() {
	console.log('Loading data...');
	// for each folder in ../Data/, load enemies and stages
	const folders = await fs.readdir(DATA_PATH);

	async function readJsonFile<T>(path: string): Promise<T> {
		try {
			const fileContent = await fs.readFile(path, "utf8");
			return JSON.parse(fileContent) as T;
		} catch (error) {
			console.error(`Error reading or parsing JSON file ${path}:`, error);
			throw error;
		}
	}

	for (const folder of folders) {
		const stats = await fs.stat(`${DATA_PATH}${folder}`);
		if (!stats.isDirectory()) continue;

		const enemies = await readJsonFile<EnemyData>(`${DATA_PATH}${folder}/Enemy.json`);
		const stages = await readJsonFile<StageData>(`${DATA_PATH}${folder}/Stage.json`);

		ENEMIES[folder] = enemies;
		STAGES[folder] = stages;
	}

	console.log('Data loaded.');
	console.log('Parsing language file...');

	const langFile = await fs.readFile(`${MAIN_PATH}Translations/I2Languages.yaml`, "utf8");
	const lang: Lang = YAML.parse(langFile, { logLevel: 'error' });

	console.log('Language file parsed.');

	const langData: Dictionary<string> = lang.MonoBehaviour.mSource.mTerms
		.reduce((acc, e) => {
			// enemiesLang/{NAME_ID}bName
			const matched = e.Term.match(/enemiesLang\/\{(.*)\}bName/);
			if (!matched) return acc;
			const key = matched[1];
			return { ...acc, [key]: e.Languages[0] };
		}, {});

	Object.assign(LANG, langData);
}

async function main() {
	await loadData();

	const WIKI_TABLES: Dictionary<string[]> = {};
	const ENEMY_LOOKUP: Dictionary<string> = {};

	for (const folder in STAGES) {

		// temp skip for testing
		//if (folder !== 'Vampire Survivors') continue;

		const DLC_STAGES = STAGES[folder];
		const DLC_ENEMIES = ENEMIES[folder];
		if (!DLC_STAGES || !DLC_ENEMIES) continue;

		for (const stageID in DLC_STAGES) {

			// temp skip for testing
			//if (stageID !== 'TP_CASTLE') continue;

			const stageData = DLC_STAGES[stageID];
			if (!stageData) continue;

			WIKI_TABLES[stageID] = [];

			let has_biomes = false;
			const tableHeaders = [];
			const biomeList: string[] = ['Default'];
			for (const wave of stageData) {
				if (wave.biome) {
					has_biomes = true;
					if (!biomeList.includes(wave.biome)) {
						biomeList.push(wave.biome);
					}
				}
			}

			const biomeRows: {[key: string]: Array<Array<string>>} = {};

			for (let i = 0; i < stageData.length; i++) {
				const wave = stageData[i];
				if (!wave) continue;

				const row = [];

				if (i === 0) {
					const stageWave = wave as Stage;
					const name = stageWave.stageName || stageID;
					const waveType = (stageWave.spawnType) ? stageWave.spawnType : SpawnType.Standard;

					let waveDirection = '{{unknown}}';
					switch (waveType) {
						case SpawnType.Standard:
							waveDirection = 'all four directions of the player';
							break;
						case SpawnType.Horizontal:
							waveDirection = 'the left and right sides of the player';
							break;
						case SpawnType.Vertical:
							waveDirection = 'the top and bottom of the player';
							break;
						default:
							break;
					}

					const waveTypeStr = waveType
						.toLowerCase()
						.replace(/_/g, ' ')
						.replace(/\b\w/g, (c) => c.toUpperCase());

					tableHeaders.push(
						`{| class="wikitable mw-collapsible sticky-header ${has_biomes ? 'mw-collapsed' : ''}" style="width:100%"`,
						`!colspan="7" style="text-align:center" | ${name} waves`,
						'|-',
						'!style="width:5%" | Time Elapsed',
						'!style="width:20%" | Enemies',
						'!style="width:5%" | Enemy minimum',
						'!style="width:5%" | Spawn interval (seconds)',
						'!style="width:15%" | Bosses & Treasure',
						'!style="width:15%" | Map events',
						'!Notes',
						'|-'
					);

					const header = [
						'==Waves==',
						`Waves in ${name} have the '''${waveTypeStr}''' spawn type, meaning enemies appear from ${waveDirection}.`,
						'',
						':\'\'Note: As official sources name only a few of the enemies, unit names are mostly made up based on their internal IDs with some creative flair added and may be subject to change.\'\'',
						...tableHeaders
					];
					row.push(...header);

					if (has_biomes) {
						if (!biomeRows['Default']) {
							biomeRows['Default'] = [[]];
							// biomeRows['Default'][0].push(...row);
						}
						for (const biome of biomeList) {
							if (biome === 'Default') continue;
							if (!biomeRows[biome]) {
								biomeRows[biome] = [[]];
							}

							const subheader = [
								`===${biome}===`,
								`Waves in ${name} that spawn in the ${biome} biome.`,
								...tableHeaders
							]
							biomeRows[biome][0].push(subheader.join('\n'));
						}
					}
				}

				const timeElapsed = wave.minute;
				const enemyIDs = wave.enemies;
				const enemyMinimum = wave.minimum;
				const spawnInterval = wave.frequency;
				const bossIDs = wave.bosses;
				const treasure = wave.treasure;
				const events = wave.events;
				const arcanaHolder = wave.arcanaHolder;
				const arcanaTreasures = wave.arcanaTreasure;

				function findEnemyName(ID: string): string | null {
					if (ENEMY_LOOKUP[ID]) return ENEMY_LOOKUP[ID];

					let thisEnemy: Enemy | null = null;
					const candidateIDs = [ID];
					const candidateFrames: string[] = [];

					// find current ID
					for (const dir in ENEMIES) {
						const folderEnemies = ENEMIES[dir];
						if (folderEnemies[ID]) {
							thisEnemy = folderEnemies[ID][0];
							if (thisEnemy.bName) {
								ENEMY_LOOKUP[ID] = thisEnemy.bName;
								return thisEnemy.bName;
							}
							candidateFrames.push(...thisEnemy.frameNames);
							if (thisEnemy.bVariants) {
								candidateIDs.push(...thisEnemy.bVariants);
							}
							break;
						}
					}

					// search enemy file for variants &
					// build candidate IDs list for lang file search
					for (const dir in ENEMIES) {
						const folderEnemies = ENEMIES[dir];
						for (const folderEnemyID in folderEnemies) {
							const enemyData = folderEnemies[folderEnemyID];
							if (!enemyData) continue;
							for (const enemy of enemyData) {
								if (enemy.bVariants?.includes(ID) && !candidateIDs.includes(folderEnemyID)) {
									candidateIDs.push(folderEnemyID);
								}
								if (enemy.bVariants?.includes(ID) && enemy.bName) {
									ENEMY_LOOKUP[folderEnemyID] = enemy.bName;
									return enemy.bName;
								}
								const matchingFrames = enemy.frameNames.filter((frame) => candidateFrames.includes(frame));
								if (matchingFrames.length && enemy.bName) {
									return enemy.bName;
								} else if (matchingFrames.length && !candidateIDs.includes(folderEnemyID)) {
									candidateIDs.push(folderEnemyID);
								}
							}
						}
					}

					// search lang file for name
					for (const ID of candidateIDs) {
						const langName = LANG[ID];
						if (langName) {
							ENEMY_LOOKUP[ID] = langName;
							return langName;
						}
					}

					return null;
				}

				function getEnemyEntries(enemyIDs: string[] | string |undefined, size: string | undefined): string[] {
					if (!enemyIDs) return [];
					if (typeof enemyIDs === 'string') enemyIDs = [enemyIDs];
					if (!enemyIDs?.length) return [];
					if (!DLC_ENEMIES) return [];

					const enemies: [enemyID: string, name: string | null][] = enemyIDs.map((enemyID) => {
						const name = findEnemyName(enemyID);
						return [enemyID, name];
					})

					const enemyEntries = enemies.map(([enemyID, name]) => {
						let link = name || enemyID;
						let sprite = link;
						if (typeof enemyID === 'string') {
							const matched = enemyID.match(/(\d{1,2})$/gm);
							if (matched?.[0] && matched[0] !== '1') {
								sprite += `-${matched[0]}`;
							}
						}
						size = size || 'small';
						link = link.replace(/_/g, ' ').trim();
						sprite = sprite.replace(/_/g, ' ').trim();
						return `{{Sprite|${sprite}|${size}|1|1|link=${link}}}`;
					});

					return enemyEntries;
				}

				const enemyEntries = getEnemyEntries(enemyIDs, 'mid');
				const bossEntries = getEnemyEntries(bossIDs, 'medium');
				const arcanaHolderEntries = getEnemyEntries(arcanaHolder, 'medium');

				function formatTreasure(treasure: Treasure | undefined): string {
					let formattedTreasure = '';
					if (!treasure) return formattedTreasure;

					const tier3 = treasure.chances[0];
					const tier2 = treasure.chances[1];
					const tier1 = treasure.chances[2];
					const can_evo = treasure.prizeTypes.includes(PrizeType.Evolution) ? 1 : 0;
					const is_arcana = treasure.prizeTypes.includes(PrizeType.EvoArcana) ? 1 : 0;
					formattedTreasure = `\n{{Treasure|level=${treasure.level}|evo=${can_evo}|tier3=${tier3}|tier2=${tier2}|tier1=${tier1}${is_arcana ? '|reward1=arcana' : ''}}}`;

					return formattedTreasure;
				}

				const formattedTreasure = formatTreasure(treasure);
				const formattedArcanaTreasure = formatTreasure(arcanaTreasures);

				let eventEntries = '';
				if (typeof events === 'object' && events?.length) {
					eventEntries = events.map((event) => {
						if (!event.eventType) return '';
						if (event.eventType === 'CYCLE_COMPLETE') return '';
						
						const eventName = (event.eventType === 'GENERIC_SWARM' && event.moreY) ? event.moreY : event.eventType;

						// replace underscore with space and uppercase each word
						const name = eventName
							.toLowerCase()
							.replace(/_/g, ' ')
							.replace(/\b\w/g, (c) => c.toUpperCase());
						const chance = event.chance || 0;
						const repeat = event.repeat || 0;
						const delay = event.delay || 0;
						return `{{Map event|name=${name}|enemy=|variant=|chance=${chance}|repeat=${repeat}|delay=${delay}}}`;
					}).filter((event) => event !== '').join('<br>');
				}

				let enemyEntry = '| {{NA}}';
				if (enemyEntries.length > 0) {
					enemyEntry = `|style="text-align:center" | ${enemyEntries.join('<br>')}`;
				}

				let bossEntry = '';
				if (bossEntries.length > 0) {
					bossEntry = `|style="text-align:center" | ${bossEntries.join('<br>')}`;
					if (formattedTreasure !== '') {
						bossEntry += `${formattedTreasure}`;
					}
				}
				if (arcanaHolderEntries.length > 0) {
					if (bossEntry === '') {
						bossEntry = `|style="text-align:center" | ${arcanaHolderEntries.join('<br>')}`;
					} else {
						bossEntry += `<br>${arcanaHolderEntries.join('<br>')}`;
					}
					if (formattedTreasure !== '') {
						bossEntry += `${formattedArcanaTreasure}`;
					}
				}
				if (bossEntry === '') {
					bossEntry = '| {{NA}}';
				}

				function formatMinDigits(num: number, minDigits = 2) {
					let str = num.toString();

					const [intPart] = str.split(".");

					if (intPart.length < minDigits && !str.includes(".")) {
						str += ".0";
					}
					return str;
				}

				const spawnIntervalStr = formatMinDigits(spawnInterval / 1000);

				row.push(
					`| ${timeElapsed}:00`,
					enemyEntry,
					`| ${enemyMinimum}`,
					`| ${spawnIntervalStr}`,
					bossEntry,
					`| ${(eventEntries !== '') ? eventEntries : '{{NA}}'}`,
					'| {{NA}}',
				);

				//WIKI_TABLES[stageID][i] = row.join('\n');
				const rowStr = row.join('\n');
				//console.log(rowStr);
				if (has_biomes) {
					const currentBiome = wave.biome || 'Default';
					if (!biomeRows[currentBiome]) {
						biomeRows[currentBiome] = [];
					}
					if (!biomeRows[currentBiome][i]) {
						biomeRows[currentBiome][i] = [];
					}
					biomeRows[currentBiome][i].push(rowStr);
				} else {
					WIKI_TABLES[stageID][i] = rowStr;
				}
			}

			let table: string = '';
			if (has_biomes) {
				for (const biomeName in biomeRows) {
					let biomeTable = biomeRows[biomeName].filter((e) => e).join('\n|-\n') + '\n|}';

					table += biomeTable + '\n\n';
				}
			} else {
				table = WIKI_TABLES[stageID].join('\n|-\n') + '\n|}';
			}

			try {
				await fs.mkdir(`${OUTPUT_PATH}${folder}`, { recursive: true });

				// final overrides
				table = table.replace('|The Reaper|', '|BOSS_XLDEATH|').trim();

				await fs.writeFile(`${OUTPUT_PATH}${folder}/${stageID}.txt`, table, 'utf-8');
				console.log(`Wrote '${OUTPUT_PATH}${folder}/${stageID}.txt'`);
			} catch (err) {
				console.error(err);
			}
		}
	}
}

main();
