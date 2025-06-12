export interface HebrewChar {
    char: string;
    color: string;
    value: number; // 1-based index for game logic
}

export type BoardSize = 4 | 5 | 6 | 7 | 8 | 9;
export type GameVariant = 'chinese' | 'alphabet' | 'colors';

// Full set of Chinese characters with colors
const FULL_CHINESE_CHARS: HebrewChar[] = [
    { char: '一', color: '#FF0000', value: 1 }, // red
    { char: '二', color: '#FFA500', value: 2 }, // orange
    { char: '三', color: '#FFFF00', value: 3 }, // yellow
    { char: '五', color: '#00EE00', value: 4 }, // bright green
    { char: '六', color: '#4169E1', value: 5 }, // royal blue
    { char: '七', color: '#FF00FF', value: 6 }, // magenta
    { char: '八', color: '#23dbcf', value: 7 }, // cyan
    { char: '九', color: '#945206', value: 8 }, // brown
    { char: '十', color: '#404040', value: 9 }  // dark gray
];

// Full set of Hebrew characters with brighter colors
const FULL_HEBREW_CHARS: HebrewChar[] = [
    { char: 'א', color: '#FF0000', value: 1 }, // red
    { char: 'ב', color: '#FFA500', value: 2 }, // orange
    { char: 'ג', color: '#FFFF00', value: 3 }, // yellow
    { char: 'ד', color: '#00EE00', value: 4 }, // bright green
    { char: 'ה', color: '#4169E1', value: 5 }, // royal blue
    { char: 'מ', color: '#FF00FF', value: 6 }, // magenta
    { char: 'צ', color: '#23dbcf', value: 7 }, // cyan
    { char: 'ש', color: '#945206', value: 8 }, // brown
    { char: 'ת', color: '#404040', value: 9 }  // dark gray
];

// Color-only variant (using colored squares) with brighter colors
const COLOR_CHARS: HebrewChar[] = [
    { char: '■', color: '#FF0000', value: 1 }, // red
    { char: '■', color: '#FFA500', value: 2 }, // orange
    { char: '■', color: '#FFFF00', value: 3 }, // yellow
    { char: '■', color: '#00EE00', value: 4 }, // bright green
    { char: '■', color: '#4169E1', value: 5 }, // royal blue
    { char: '■', color: '#FF00FF', value: 6 }, // magenta
    { char: '■', color: '#23dbcf', value: 7 }, // cyan
    { char: '■', color: '#945206', value: 8 }, // brown
    { char: '■', color: '#404040', value: 9 }  // dark gray
];

export const getHebrewChars = (size: BoardSize, variant: GameVariant): HebrewChar[] => {
    const source = variant === 'chinese' ? FULL_CHINESE_CHARS :
                  variant === 'alphabet' ? FULL_HEBREW_CHARS : COLOR_CHARS;
    return source.slice(0, size);
};

export const getHebrewChar = (value: number, variant: GameVariant): HebrewChar => {
    const source = variant === 'chinese' ? FULL_CHINESE_CHARS :
                  variant === 'alphabet' ? FULL_HEBREW_CHARS : COLOR_CHARS;
    const char = source.find(char => char.value === value);
    if (!char) {
        // Return a default HebrewChar for invalid values
        return { char: '', color: '#000000', value: 0 };
    }
    return char;
};

export const getValueFromChar = (char: string, variant: GameVariant): number => {
    const source = variant === 'chinese' ? FULL_CHINESE_CHARS :
                  variant === 'alphabet' ? FULL_HEBREW_CHARS : COLOR_CHARS;
    return source.find(hc => hc.char === char)?.value ?? 0;
}; 