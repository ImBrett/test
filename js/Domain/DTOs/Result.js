/** Shared Result monad for action/service outcomes. */

export function ok(data = null, meta = {}) {
  return { ok: true, data, ...meta };
}

export function fail(code, message = "", details = null) {
  return { ok: false, error: { code, message, details } };
}

export function isOk(result) {
  return !!result?.ok;
}
