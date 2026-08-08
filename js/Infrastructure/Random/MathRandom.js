/** @implements {import('../../Domain/Ports/RandomPort.js').RandomPort} */
export function createMathRandom() {
  return {
    next: () => Math.random(),
    intBelow: (maxExclusive) => Math.floor(Math.random() * maxExclusive),
  };
}
