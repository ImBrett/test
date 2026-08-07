/**
 * @typedef {object} ClockPort
 * @property {() => string} iso
 * @property {() => number} epochMs
 */

/**
 * @typedef {object} RandomPort
 * @property {() => number} next — float in [0, 1)
 * @property {(maxExclusive: number) => number} intBelow
 */

export {};
