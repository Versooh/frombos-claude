// Tactical Board Pro interaction layer.
// Adds timeline events, scenario snapshots and coach review data without replacing tactical.js.
const KEY='frombos.tactical.pro';
const clone=v=>JSON.parse(JSON.stringify(v));
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
const uid=()=>`te_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export function tacticalTimelineState(scenarioId){
  const all=load();
  if(!all[scenarioId]) all[scenarioId]={events:[],snapshots:[],selectedTime:0};
  return all[scenarioId];
}
export function addTacticalEvent(scenarioId,data={}){
  const all=load(),state=all[scenarioId]||{events:[],snapshots:[],selectedTime:0};
  const event={id:uid(),timestamp:Number(data.timestamp||0),type:data.type||'note',title:data.title||'',note:data.note||'',severity:data.severity||'info',tags:data.tags||[],createdAt:new Date().toISOString()};
  state.events=[...state.events,event].sort((a,b)=>a.timestamp-b.timestamp); all[scenarioId]=state;save(all);return event;
}
export function addTacticalSnapshot(scenarioId,boardState,timestamp=0,label='Snapshot'){
  const all=load(),state=all[scenarioId]||{events:[],snapshots:[],selectedTime:0};
  const snapshot={id:uid(),timestamp:Number(timestamp||0),label,board:clone(boardState),createdAt:new Date().toISOString()};
  state.snapshots=[...state.snapshots,snapshot].sort((a,b)=>a.timestamp-b.timestamp);all[scenarioId]=state;save(all);return snapshot;
}
export function mountTacticalTimeline(root,{scenarioId='default',onSeek,onEvent,onSnapshot}={}){
  if(!root)return()=>{};
  const state=tacticalTimelineState(scenarioId);
  root.innerHTML=`<div class="tb-pro-timeline"><div class="tb-pro-head"><div><span class="eyebrow">TACTICAL TIMELINE</span><strong>Execução da jogada</strong></div><output id="tbProTime">00:00</output></div><input id="tbProRange" type="range" min="0" max="1800" step="5" value="${state.selectedTime||0}"><div class="tb-pro-events" id="tbProEvents"></div><div class="tb-pro-actions"><select id="tbProType"><option value="decision">Decisão</option><option value="objective">Objetivo</option><option value="vision">Visão</option><option value="rotation">Rotação</option><option value="fight">Fight</option><option value="mistake">Erro</option><option value="setup">Setup</option><option value="note">Nota</option></select><input id="tbProTitle" placeholder="Título do evento"><button class="btn primary" id="tbProAdd">＋ Registrar</button></div></div>`;
  const range=root.querySelector('#tbProRange'),out=root.querySelector('#tbProTime'),events=root.querySelector('#tbProEvents');
  const render=()=>{const fresh=tacticalTimelineState(scenarioId);range.value=fresh.selectedTime||0;out.value=fmt(+range.value);events.innerHTML=fresh.events.map(e=>`<button class="tb-pro-event" data-t="${e.timestamp}"><b>${fmt(e.timestamp)}</b><span>${String(e.type).toUpperCase()}</span><strong>${String(e.title||'Evento').replace(/[<>]/g,'')}</strong></button>`).join('');events.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{range.value=b.dataset.t;range.dispatchEvent(new Event('input'));});};
  range.oninput=()=>{const all=load(),x=all[scenarioId]||{events:[],snapshots:[],selectedTime:0};x.selectedTime=+range.value;all[scenarioId]=x;save(all);out.value=fmt(+range.value);onSeek?.(+range.value);};
  root.querySelector('#tbProAdd').onclick=()=>{const title=root.querySelector('#tbProTitle').value.trim();if(!title)return;const e=addTacticalEvent(scenarioId,{timestamp:+range.value,type:root.querySelector('#tbProType').value,title});root.querySelector('#tbProTitle').value='';render();onEvent?.(e);};
  render();
  return ()=>{};
}
