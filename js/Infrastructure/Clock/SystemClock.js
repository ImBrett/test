/** @implements {import('../../Domain/Ports/ClockPort.js').ClockPort} */
export function createSystemClock() {
  return {
    iso: () => new Date().toISOString(),
    epochMs: () => Date.now(),
  };
}
