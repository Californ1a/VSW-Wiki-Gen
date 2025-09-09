// Full language file structure
export interface Lang {
	MonoBehaviour: {
		m_ObjectHideFlags: number,
		m_CorrespondingSourceObject: FileID,
		m_PrefabInstance: FileID,
		m_PrefabAsset: FileID,
		m_GameObject: FileID,
		m_Enabled: number,
		m_EditorHideFlags: number,
		m_Script: FileID,
		m_Name: string,
		m_EditorClassIdentifier: null,
		mSource: {
			UserAgreesToHaveItOnTheScene: number,
			UserAgreesToHaveItInsideThePluginsFolder: number,
			GoogleLiveSyncIsUptoDate: number,
			mTerms: Term[],
			CaseInsensitiveTerms: number,
			OnMissingTranslation: number,
			mTerm_AppName: null,
			mLanguages: Array<LangCode>,
			IgnoreDeviceLanguage: number,
			_AllowUnloadingLanguages: number,
			Google_WebServiceURL: string,
			Google_SpreadsheetKey: string,
			Google_SpreadsheetName: string,
			Google_LastUpdatedVersion: number,
			GoogleUpdateFrequency: number,
			GoogleInEditorCheckFrequency: number,
			GoogleUpdateSynchronization: number,
			GoogleUpdateDelay: number,
			Assets: Array<any>,
		}
	}
}

export interface FileID {
	fileID: number,
	guid?: string,
	type?: number,
}

export interface Term {
	Term: string,
	TermType: number,
	Languages: string[],
	Flags: number,
	Languages_Touch: string[],
}

export interface LangCode {
	Name: string,
	Code: string,
	Flags: number,
}

// New language files structure
// Translations/Generated/Split/LangDictionary/enemiesLang.json
export interface EnemyLangDictionary {
	[key: string]: EnemyLangEntry,
}

export interface EnemyLangEntry {
		bDesc: LangShortNames,
		bName: LangShortNames,
	}

export type LangShortNames = Partial<Record<LangShortName, string>>;

export type LangShortName =
	| 'en'  // English
	| 'fr'  // French
	| 'it'  // Italian
	| 'de'  // German
	| 'es'  // Spanish
	| 'pt-BR' // Brazilian Portuguese
	| 'pl'  // Polish
	| 'ru'  // Russian
	| 'tr'  // Turkish
	| 'zh-CN' // Simplified Chinese
	| 'ja'  // Japanese
	| 'ko'  // Korean
	| 'zh-TW' // Traditional Chinese
	| 'uk'  // Ukrainian
