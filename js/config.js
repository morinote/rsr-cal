/**
 * @constant {string[]} INITIAL_PARTICIPANTS - The original set of participant names.
 */
export const INITIAL_PARTICIPANTS = [
  'おおたけ',
  'なぎさ',
  'ひとし',
  'たけだ',
  'だいすけ',
  'かず',
  'まえさき',
  'のぞみ',
  'みかこ',
  'たつや',
  'くろだ',
  'しずか',
  'しょうま',
  'みう',
  'けんせい',
  'はると',
  'キム',
  'めい',
  'きょうか',
  'よっしー',
];

/** Set version for O(1) lookup */
const INITIAL_PARTICIPANTS_SET = new Set(INITIAL_PARTICIPANTS);

/**
 * Checks if a participant is one of the original members.
 * @param {string} name
 * @returns {boolean}
 */
export const isInitialParticipant = (name) => INITIAL_PARTICIPANTS_SET.has(name);
