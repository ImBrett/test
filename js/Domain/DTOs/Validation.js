/** Lightweight DTO validation helpers (no schema lib required). */

export class ValidationError extends Error {
  constructor(errors) {
    super(errors.map((e) => e.message).join("; "));
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export function requireString(value, field, { min = 1, max = 256 } = {}) {
  const errors = [];
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` });
    return errors;
  }
  const trimmed = value.trim();
  if (trimmed.length < min) errors.push({ field, message: `${field} is required` });
  if (trimmed.length > max) errors.push({ field, message: `${field} max length is ${max}` });
  return errors;
}

export function requireInt(value, field, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  const errors = [];
  const n = Number(value);
  if (!Number.isInteger(n)) {
    errors.push({ field, message: `${field} must be an integer` });
    return errors;
  }
  if (n < min || n > max) errors.push({ field, message: `${field} out of range` });
  return errors;
}

export function assertValid(errors) {
  if (errors.length) throw new ValidationError(errors);
}
