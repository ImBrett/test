/** @implements {import('../../ports/ClockPort.js').RandomPort} */
export function createMathRandom() {
  return {
    next: () => Math.random(),
    intBelow: (maxExclusive) => Math.floor(Math.random() * maxExclusive),
  };
}
