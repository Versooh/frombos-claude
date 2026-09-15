// FROMBOS CORE — canonical domain schema
// This file defines the shared vocabulary used by modules.
// It is intentionally framework-free so the static/PWA build can evolve without migration pain.

export const CORE_VERSION = '1.0.0';

export const PROVENANCE = Object.freeze({
  OFFICIAL: 'OFFICIAL',
  OBSERVED: 'OBSERVED',
  CURATED: 'CURATED',
  FROMBOS_STRUCTURAL: 'FROMBOS_STRUCTURAL',
  USER_PRIVATE: 'USER_PRIVATE',
  UNKNOWN: 'UNKNOWN'
});

export const ENTITY_TYPES = Object.freeze([
  'team', 'player', 'champion', 'composition', 'draft', 'series',
  'scenario', 'objective', 'vod', 'annotation', 'trainingItem', 'source'
]);

export function createId(prefix = 'entity') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function evidenceMeta({
  provenance = PROVENANCE.UNKNOWN,
  source = null,
  patch = null,
  region = null,
  mode = null,
  sample = null,
  observedAt = null,
  confidence = null,
  evidence = null,
  stale = false
} = {}) {
  return { provenance, source, patch, region, mode, sample, observedAt, confidence, evidence, stale };
}

export function createEntity(type, data = {}, evidence = {}) {
  if (!ENTITY_TYPES.includes(type)) throw new Error(`Tipo de entidade inválido: ${type}`);
  return {
    id: data.id || createId(type),
    type,
    ...data,
    evidence: evidenceMeta(evidence)
  };
}

export function createPlayer(data = {}) {
  return createEntity('player', {
    name: '',
    role: null,
    pool: [],
    notes: '',
    ...data
  }, { provenance: PROVENANCE.USER_PRIVATE });
}

export function createComposition(data = {}) {
  return createEntity('composition', {
    name: '',
    archetype: null,
    lineup: {},
    plan: '',
    winCondition: '',
    risks: [],
    counters: [],
    ...data
  }, { provenance: PROVENANCE.FROMBOS_STRUCTURAL, ...data.evidence });
}

export function createDraft(data = {}) {
  return createEntity('draft', {
    seriesId: null,
    game: 1,
    format: 'MD5',
    ruleset: null,
    blueSide: null,
    redSide: null,
    actions: [],
    referenceCompositionId: null,
    ...data
  }, { provenance: PROVENANCE.USER_PRIVATE, ...data.evidence });
}

export function createVodAnnotation(data = {}) {
  return createEntity('annotation', {
    vodId: null,
    timestamp: 0,
    playerId: null,
    type: 'NOTE',
    title: '',
    note: '',
    tags: [],
    severity: null,
    trainingItemId: null,
    ...data
  }, { provenance: PROVENANCE.USER_PRIVATE, ...data.evidence });
}

export function createTrainingItem(data = {}) {
  return createEntity('trainingItem', {
    title: '',
    category: 'MACRO',
    sourceAnnotationId: null,
    playerId: null,
    objective: '',
    drill: '',
    status: 'TODO',
    ...data
  }, { provenance: PROVENANCE.USER_PRIVATE, ...data.evidence });
}
