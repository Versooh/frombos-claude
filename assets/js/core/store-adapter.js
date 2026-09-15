// FROMBOS CORE — store adapter
// Provides a stable API for UI modules while the legacy V2 store is migrated.
import { createInitialWorkspace, loadWorkspace, saveWorkspace, exportWorkspace, importWorkspace } from './workspace.js';

const hasStorage = () => typeof globalThis !== 'undefined' && !!globalThis.localStorage;

let state = loadWorkspace(hasStorage() ? globalThis.localStorage : undefined);
const listeners = new Set();

function commit(mutator) {
  const draft = structuredClone(state);
  const result = mutator?.(draft);
  state = saveWorkspace(result ?? draft, hasStorage() ? globalThis.localStorage : undefined);
  listeners.forEach(listener => listener(state));
  return state;
}

export const coreStore = {
  get state() { return state; },
  update(mutator) { return commit(mutator); },
  reset() {
    state = createInitialWorkspace();
    saveWorkspace(state, hasStorage() ? globalThis.localStorage : undefined);
    listeners.forEach(listener => listener(state));
    return state;
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  exportJSON() { return exportWorkspace(state); },
  importJSON(text) {
    state = importWorkspace(text);
    saveWorkspace(state, hasStorage() ? globalThis.localStorage : undefined);
    listeners.forEach(listener => listener(state));
    return state;
  }
};

export function useCoreStore() { return coreStore; }
