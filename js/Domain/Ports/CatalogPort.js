/**
 * @file CatalogPort — read-only content queries (Catalog BC).
 * Swap SeedCatalog for a remote CMS / DB-backed catalog later.
 *
 * @typedef {object} CatalogPort
 * @property {() => string} nowIso
 * @property {(id: number) => object|undefined} speciesById
 * @property {(id: number) => object|undefined} statById
 * @property {(id: number) => object|undefined} itemById
 * @property {(id: number) => object|undefined} moveById
 * @property {(id: number) => object|undefined} zoneById
 * @property {(code: string) => object|undefined} zoneByCode
 * @property {(speciesId: number) => object[]} baseStatsForSpecies
 * @property {(speciesId: number) => object[]} movesForSpecies
 * @property {(a: number|null, b: number|null) => number} matchupMultiplier
 * @property {() => number[]} starterSpeciesIds
 * @property {(speciesId: number) => object[]} evolutionPathsFrom
 * @property {(speciesId: number) => object|undefined} evolutionPathTo
 * @property {(rootSpeciesId: number) => object} buildEvolutionTree
 * @property {(pathId: number) => object|undefined} pathById
 * @property {(pathId: number) => object[]} requirementsForPath
 * @property {(statId: number) => object|undefined} drillForStat
 * @property {(zoneId: number) => object[]} encountersForZone
 * @property {(codeOrKind: string) => object} moveByCodeOrKind
 * @property {object[]} stats
 * @property {object[]} zones
 * @property {object[]} species
 * @property {object[]} items
 * @property {object[]} moves
 * @property {object[]} training_drills
 */

export {};
