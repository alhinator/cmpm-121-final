type Language = {
    name: string;
    rightToLeft: boolean;
    translations: {[key: string]: string}
};

/**
 * A map of all supported languages and their translated UI strings
 */
const LANGUAGES: {[language_key: string]: Language} = {
    "en": {
        name: "English",
        rightToLeft: false,
        translations: {
            "load_slot": "Load #{0}",
            "save_slot": "Save #{0}",
            "new_save": "New Save",
            "autosave_load_prompt": "Would you like to continue where you left off? [Y/N]",
            "turn_label": "TURN",
            "next_turn": "Next Turn",
            "undo": "Undo",
            "redo": "Redo",
            "inventory": "Inventory",
            "inventory_empty": "Empty",
            "inventory_seeds": "Seeds",
            "inventory_crops": "Crops",
            "win": "You Won!",
            "wheat": "Wheat",
            "corn": "Corn",
            "rice": "Rice",
            "language_label": "Langauge"
        }
    },
    "ar": {
        name: "اللغة العربية",
        rightToLeft: true,
        translations: {
            "load_slot": "تحميل #{0}",
            "save_slot": "حفظ #{0}",
            "new_save": "حفظ جديد",
            "autosave_load_prompt": "هل ترغب في الاستمرار من حيث توقفت؟ [Y=نعم/N=لا]",
            "turn_label": "دور",
            "next_turn": "الدور التالي",
            "undo": "التراجع",
            "redo": "أعد",
            "inventory": "جرد",
            "inventory_empty": "فارغ",
            "inventory_seeds": "بذور",
            "inventory_crops": "المحاصيل",
            "win": "لقد فزت!",
            "wheat": "قمح",
            "corn": "حبوب ذرة",
            "rice": "أرز",
            "language_label": "لغة"
        }
    },
    "zh": {
        name: "中文",
        rightToLeft: false,
        translations: {
            "load_slot": "加载 #{0}",
            "save_slot": "保存 #{0}",
            "new_save": "新保存",
            "autosave_load_prompt": "您想从上次中断的地方继续吗？[Y=是/N=否]",
            "turn_label": "转弯次数",
            "next_turn": "下一回合",
            "undo": "撤消",
            "redo": "重做",
            "inventory": "存货",
            "inventory_empty": "空的",
            "inventory_seeds": "种子",
            "inventory_crops": "农作物",
            "win": "你赢了！",
            "wheat": "小麦",
            "corn": "玉米",
            "rice": "米",
            "language_label": "语言"
        }
    }
};

/**
 * Returns the initial language that should be selected.
 * Starts by checking local storage for a language setting,
 * then checks for supported languages in the user's browser preferences,
 * then falls back to English.
 */
function getInitialLanguage(): string {
    let localStorageLanguage = localStorage.getItem("language");
    if(localStorageLanguage != null) {
        return localStorageLanguage;
    }
    const languageCodes = Object.keys(LANGUAGES);
    for(let i = 0; i < languageCodes.length; i++) {
        if(navigator.languages.includes(languageCodes[i])) {
            return languageCodes[i];
        }
    }
    return "en";
}

/**
 * The currently selected language
 */
let currentLanguage: string = getInitialLanguage();

/**
 * Get the current language code.
 * @returns The current language code.
 */
export function getLanguageCode(): string {
    return currentLanguage;
}

export function languageIsRightToLeft(): boolean {
    return LANGUAGES[currentLanguage].rightToLeft;
}

/**
 * Gets all supported language codes.
 * @returns A list of supported language codes.
 */
export function getAllLanguageCodes(): string[] {
    return Object.keys(LANGUAGES);
}

/**
 * Sets the current language code.
 * @param code The new language code.
 */
export function setLanguageCode(code: string) {
    currentLanguage = code;
    localStorage.setItem("language", code);
}

/**
 * Get the full name corresponding to a language code.
 * @param code The language code.
 * @returns The full language name.
 */
export function getLanguageName(code: string): string {
    return LANGUAGES[code].name;
}

/**
 * Returns the translation of the given key for the current language,
 * filled with the given template values.
 * @param key The key of the string
 * @param values Values to fill a template translation
 */
export function translation(key: string, ...values: any[]): string {
    let translation = LANGUAGES[currentLanguage].translations[key];
    if(!translation) {
        return key;
    }
    for(let i = 0; i < values.length; i++) {
        translation = translation.replace("{" + i + "}", String(values[i]));
    }
    return translation;
}