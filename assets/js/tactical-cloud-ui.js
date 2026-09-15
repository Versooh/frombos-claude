import { store } from './store.js';
import { tacticalCloudBridge } from './core/tactical-cloud-bridge.js';

const stateKey = () => store.state?.tactical?.activeScenario || null;
const scenario = () => store.state?.tactical?.scenarios?.find(s => s.id === stateKey()) || null;
const signature = value => JSON.stringify(value || {});
let lastSaved = '';
let saveTimer = null;

async function persist(reason = 'board') {
  const current = scenario();
  if (!current) return;
  const payload = {
    ...current,
    stateSnapshot: undefined,
    coachPlan: undefined,
  };
  const sig = signature({
    name: current.name,
    markers: current.markers,
    paths: current.paths,
    layers: current.layers,
    coach: current.coach,
  });
  if (sig === lastSaved && reason !== 'force') return;
  try {
    await tacticalCloudBridge.saveScenario(payload);
    lastSaved = sig;
    const status = document.querySelector('#tbStatus');
    if (status) status.textContent = `Salvo na nuvem • ${reason}`;
  } catch (error) {
    console.warn('[FROMBOS] Tactical cloud save failed:', error);
    const status = document.querySelector('#tbStatus');
    if (status) status.textContent = 'Alteração local • sincronização pendente';
  }
}

function schedule(reason) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persist(reason), 350);
}

function bind(root) {
  if (!root || root.dataset.cloudBound === '1') return;
  root.dataset.cloudBound = '1';

  root.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.id === 'tbSave') {
      event.preventDefault();
      persist('manual');
      return;
    }
    if (target.id === 'tbAddScenario') {
      setTimeout(() => {
        lastSaved = '';
        persist('novo cenário');
      }, 120);
      return;
    }
    if (target.matches('[data-tag]') || target.matches('[data-layer]') || target.id === 'tbShowLayers') {
      schedule('configuração');
    }
  }, true);

  ['tbWin','tbStrong','tbFirst','tbAvoid'].forEach(id => {
    const field = root.querySelector(`#${id}`);
    field?.addEventListener('input', () => schedule('coach plan'));
    field?.addEventListener('change', () => schedule('coach plan'));
  });

  root.addEventListener('pointerup', event => {
    if (event.target.closest('#tbBoard')) schedule('mapa');
  }, true);

  const select = root.querySelector('#tbScenario');
  select?.addEventListener('change', () => {
    setTimeout(() => {
      lastSaved = '';
      persist('cenário');
    }, 80);
  });
}

const observer = new MutationObserver(() => {
  const root = document.querySelector('.tactical-shell');
  if (root) bind(root);
});
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('frombos:tactical-save', () => persist('evento'));
