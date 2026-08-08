/**
 * SQLite Unit of Work — stub adapter.
 * Swap MemoryUnitOfWork for this once a SQLite host exists
 * (Node better-sqlite3, sql.js in browser, Turso, etc.).
 *
 * @implements {import('../../../Domain/Ports/UnitOfWorkPort.js').UnitOfWorkPort}
 */
export function createSqliteUnitOfWork(_db) {
  throw new Error(
    "SqliteUnitOfWork is not implemented yet. Wire schema.sql + seed.sql here and implement UnitOfWorkPort."
  );
}
