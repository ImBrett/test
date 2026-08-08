/**
 * In-process pub/sub for presentation → controller.
 * Presentations emit named events; controllers subscribe.
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const handlers = new Map();

  function on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, new Set());
    handlers.get(eventName).add(handler);
    return () => handlers.get(eventName)?.delete(handler);
  }

  async function emit(eventName, payload = {}) {
    const set = handlers.get(eventName);
    if (!set?.size) return [];
    const results = [];
    for (const handler of set) {
      results.push(await handler({ type: eventName, payload, at: Date.now() }));
    }
    return results;
  }

  return { on, emit };
}
