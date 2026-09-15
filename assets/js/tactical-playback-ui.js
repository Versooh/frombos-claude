import { store } from './store.js';
import { coreStore } from './core/store-adapter.js';
import { tacticalCloudBridge } from './core/tactical-cloud-bridge.js';
import { toTrainingCandidates } from './core/tactical-review.js';

const KEY = 'frombos.tactical.playback.seek';
const fmt = s => `${String(Math.floor((s || 0) / 60)).padStart(2, '0')}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`;
const scenario = () => {
  const active = store.state?.tactical?.activeScenario || coreStore.state?.tactical?.activeScenario;
  return store.state?.tactical?.scenarios?.find(s => s.id === active)
    || coreStore.state?.tactical?.scenarios?.find(s => s.id === active)
    || null;
};
const writeSeek = event => {
  try { localStorage.setItem(KEY, JSON.stringify({ eventId:event.id, scenarioId:event.scenarioId, mapTimestamp:event.timestamp || 0, vodTimestamp:event.vodTimestampSeconds ?? event.timestamp ?? 0, at:Date.now() })); } catch {}
};

function syncTraining(events) {
  const candidates = toTrainingCandidates(events);
  if (!candidates.length) return 0;
  const existing = coreStore.state.training?.items || [];
  const known = new Set(existing.map(item => item.sourceEventId).filter(Boolean));
  const fresh = candidates.filter(item => !known.has(item.sourceEventId));
  if (!fresh.length) return 0;
  coreStore.update(state => {
    state.training = state.training || { goals:[], sessions:[], items:[], focus:['Macro','Mecânica','Visão','Comunicação','Objetivos'] };
    state.training.items = [...(state.training.items || []), ...fresh];
  });
  return fresh.length;
}

async function mountTactical(root){
  if (!root || root.dataset.playbackBound === '1') return;
  root.dataset.playbackBound = '1';
  const host = document.createElement('section'); host.className = 'card tb-playback';
  host.innerHTML = `<div class="section-title"><div><div class="eyebrow">PLAYBACK COACH</div><h3>Plano × Execução</h3><p class="muted">Eventos táticos salvos no cenário atual.</p></div><span class="badge blue" id="tbPlaybackCount">0</span></div><div class="tb-playback-actions"><button type="button" class="btn secondary" id="tbGenerateTraining">Gerar treinos dos alertas</button><span class="muted" id="tbTrainingStatus"></span></div><div class="tb-playback-list" id="tbPlaybackList"><div class="empty">Nenhum evento salvo ainda.</div></div>`;
  root.querySelector('.tactical-grid')?.after(host);
  const list = host.querySelector('#tbPlaybackList');
  const load = async () => {
    const s = scenario(); if (!s) return;
    try {
      const events = await tacticalCloudBridge.events(s.id);
      host.querySelector('#tbPlaybackCount').textContent = String(events.length);
      list.innerHTML = events.length ? events.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0)).map(e => `<button class="tb-playback-event" data-event="${e.id}"><span>${fmt(e.timestamp)}</span><b>${String(e.type||'note').toUpperCase()}</b><strong>${String(e.title||'Evento tático').replace(/[&<>]/g,'')}</strong><small>${String(e.note||'').replace(/[&<>]/g,'')}</small></button>`).join('') : '<div class="empty">Nenhum evento salvo ainda.</div>';
      list.querySelectorAll('[data-event]').forEach(btn => btn.addEventListener('click', () => { const e = events.find(x => x.id === btn.dataset.event); if (!e) return; writeSeek(e); window.dispatchEvent(new CustomEvent('frombos:tactical-seek',{detail:e})); const status=document.querySelector('#tbStatus'); if(status) status.textContent=`Evento ${fmt(e.timestamp)} selecionado • VOD ${fmt(e.vodTimestampSeconds ?? e.timestamp)}`; }));
      host.querySelector('#tbGenerateTraining')?.addEventListener('click', () => {
        const count = syncTraining(events);
        const status = host.querySelector('#tbTrainingStatus');
        if (status) status.textContent = count ? `${count} treino(s) criado(s) no Training Center.` : 'Nenhum treino novo; alertas já convertidos.';
      });
    } catch (err) { console.warn('[FROMBOS] playback events failed', err); }
  };
  await load();
  window.addEventListener('frombos:tactical-save', load);
}

function mountVod(root){
  if (!root || root.dataset.playbackBound === '1') return;
  root.dataset.playbackBound = '1';
  const video = root.querySelector('#vodVideo'); if (!video) return;
  const host = document.createElement('div'); host.className='vod-playback-hint'; host.innerHTML='<b>PLAYBACK COACH</b><span id="vodPlaybackHint">Selecione um evento no Tactical Board para posicionar o VOD.</span>';
  root.querySelector('.vod-command')?.append(host);
  const apply = () => { try { const raw=localStorage.getItem(KEY); if(!raw) return; const data=JSON.parse(raw); if(data.vodTimestamp==null) return; video.currentTime=Number(data.vodTimestamp)||0; video.pause(); const hint=host.querySelector('#vodPlaybackHint'); if(hint) hint.textContent=`VOD posicionado em ${fmt(data.vodTimestamp)} • evento ${data.eventId||''}`; } catch {} };
  video.addEventListener('loadedmetadata', apply); window.addEventListener('frombos:tactical-seek', e => { const t=Number(e.detail?.vodTimestampSeconds ?? e.detail?.timestamp); if(Number.isFinite(t)){ video.currentTime=t; video.pause(); } });
  apply();
}

const observer = new MutationObserver(() => { mountTactical(document.querySelector('.tactical-shell')); mountVod(document.querySelector('.vod-pro')); });
observer.observe(document.documentElement,{childList:true,subtree:true});
mountTactical(document.querySelector('.tactical-shell')); mountVod(document.querySelector('.vod-pro'));
