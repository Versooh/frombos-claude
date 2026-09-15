// FROMBOS CORE — Tactical Board canonical model
// Keeps tactical annotations/time markers portable between Tactical Board and VOD Review.

export const TACTICAL_EVENT_TYPES = Object.freeze([
  'decision', 'objective', 'vision', 'rotation', 'fight', 'reset', 'mistake', 'setup', 'note'
]);

export function createTacticalEvent(data = {}) {
  return {
    id: data.id || `tact_evt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    timestamp: Number(data.timestamp || 0),
    type: data.type || 'note',
    title: data.title || '',
    note: data.note || '',
    scenarioId: data.scenarioId || null,
    markerIds: Array.isArray(data.markerIds) ? [...data.markerIds] : [],
    playerId: data.playerId || null,
    severity: data.severity || 'info',
    tags: Array.isArray(data.tags) ? [...data.tags] : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createTacticalScenario(data = {}) {
  return {
    id: data.id || `scenario_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name: data.name || 'CENÁRIO',
    markers: Array.isArray(data.markers) ? data.markers : [],
    paths: Array.isArray(data.paths) ? data.paths : [],
    events: Array.isArray(data.events) ? data.events : [],
    coach: {
      winCondition: data.coach?.winCondition || '',
      strongSide: data.coach?.strongSide || '',
      firstObjective: data.coach?.firstObjective || '',
      avoid: data.coach?.avoid || '',
      tags: Array.isArray(data.coach?.tags) ? data.coach.tags : []
    },
    layers: {
      routes: data.layers?.routes !== false,
      zones: data.layers?.zones !== false,
      objectives: data.layers?.objectives !== false,
      vision: data.layers?.vision !== false,
      champions: data.layers?.champions !== false,
      notes: data.layers?.notes !== false
    }
  };
}

export function sortTacticalEvents(events = []) {
  return [...events].sort((a,b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
}
