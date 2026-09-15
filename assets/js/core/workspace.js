// FROMBOS CORE — canonical workspace state
import { PROVENANCE, createPlayer } from './schema.js';

export const WORKSPACE_VERSION = 3;
export const WORKSPACE_KEY = 'frombos.core.workspace';

export function createInitialWorkspace() {
  const players = {
    BARON: createPlayer({ role: 'BARON' }),
    JUNGLE: createPlayer({ role: 'JUNGLE' }),
    MID: createPlayer({ role: 'MID' }),
    DUO: createPlayer({ role: 'DUO' }),
    SUPPORT: createPlayer({ role: 'SUPPORT' })
  };

  return {
    meta: {
      version: WORKSPACE_VERSION,
      schema: 'frombos-core',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    team: {
      id: 'team_local',
      name: '',
      opponent: '',
      format: 'MD5',
      players,
      notes: '',
      evidence: { provenance: PROVENANCE.USER_PRIVATE }
    },
    champions: {},
    compositions: [],
    series: [],
    drafts: [],
    tactical: {
      scenarios: [],
      annotations: [],
      strokes: []
    },
    vods: [],
    training: {
      goals: [],
      sessions: [],
      items: [],
      focus: ['Macro', 'Mecânica', 'Visão', 'Comunicação', 'Objetivos']
    },
    scouting: {
      opponents: [],
      notes: []
    },
    intelligence: {
      sources: [],
      observations: [],
      insights: []
    },
    ui: {
      route: 'home',
      theme: 'dark',
      reducedMotion: false
    }
  };
}

export function mergeWorkspace(base, incoming) {
  if (Array.isArray(base) || Array.isArray(incoming)) return incoming ?? base;
  if (!base || typeof base !== 'object' || !incoming || typeof incoming !== 'object') return incoming ?? base;
  const out = { ...base };
  for (const key of Object.keys(incoming)) out[key] = key in base ? mergeWorkspace(base[key], incoming[key]) : incoming[key];
  return out;
}

export function migrateLegacyWorkspace(legacy = {}) {
  const next = createInitialWorkspace();
  next.team.name = legacy.team?.name || '';
  next.team.opponent = legacy.team?.opponent || '';
  next.team.format = legacy.team?.format || 'MD5';

  for (const role of Object.keys(next.team.players)) {
    const oldPlayer = legacy.team?.players?.[role];
    if (!oldPlayer) continue;
    next.team.players[role] = mergeWorkspace(next.team.players[role], {
      name: oldPlayer.name || '',
      pool: Array.isArray(oldPlayer.pool) ? oldPlayer.pool : []
    });
  }

  if (Array.isArray(legacy.customComps)) next.compositions = legacy.customComps;
  if (legacy.training) next.training = mergeWorkspace(next.training, legacy.training);
  if (legacy.tactical) next.tactical = mergeWorkspace(next.tactical, legacy.tactical);
  if (legacy.vod) next.vods = legacy.vod.reviews || [];
  if (legacy.draft) next.drafts = [{ ...legacy.draft, id: legacy.draft.id || 'draft_legacy' }];
  next.meta.migratedFrom = legacy.meta?.version || 2;
  return next;
}

export function loadWorkspace(storage = globalThis.localStorage) {
  try {
    const rawCore = storage?.getItem(WORKSPACE_KEY);
    if (rawCore) return mergeWorkspace(createInitialWorkspace(), JSON.parse(rawCore));
    const rawLegacy = storage?.getItem('frombos.v2.workspace');
    if (rawLegacy) return migrateLegacyWorkspace(JSON.parse(rawLegacy));
  } catch (error) {
    console.warn('FROMBOS workspace load failed:', error);
  }
  return createInitialWorkspace();
}

export function saveWorkspace(workspace, storage = globalThis.localStorage) {
  const next = mergeWorkspace(createInitialWorkspace(), workspace);
  next.meta.updatedAt = new Date().toISOString();
  storage?.setItem(WORKSPACE_KEY, JSON.stringify(next));
  return next;
}

export function exportWorkspace(workspace) {
  return JSON.stringify(workspace, null, 2);
}

export function importWorkspace(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Workspace inválido');
  return mergeWorkspace(createInitialWorkspace(), parsed);
}
