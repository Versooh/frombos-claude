// FROMBOS V22.6 — Tactical Scouting + VOD Intelligence.
// Read-only bridge over USER_PRIVATE VOD annotations. Selected evidence travels by route IDs only.
// The Tactical Board map, scenarios, markers and paths are never changed automatically.
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const query=()=>new URLSearchParams(location.hash.split('?')[1]||'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>`${String(Math.floor((Number(s)||0)/60)).padStart(2,'0')}:${String(Math.floor((Number(s)||0)%60)).padStart(2,'0')}`;
const ROLE_LABEL={TEAM:'Equipe / Geral',BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte'};
const PHASES=[
  {id:'early',label:'EARLY',range:'00:00–04:59',min:0,max:300},
  {id:'first-objective',label:'1º OBJ WINDOW',range:'05:00–07:59',min:300,max:480},
  {id:'mid',label:'MID GAME',range:'08:00–12:59',min:480,max:780},
  {id:'late',label:'LATE',range:'13:00+',min:780,max:Infinity}
];
let selected=new Set();
let filters={phase:'all',category:'all'};
let pendingFocus='';

function sessions(){return Array.isArray(store.state.vod?.sessions)?store.state.vod.sessions:[];}
function reviews(){return Array.isArray(store.state.vod?.reviews)?store.state.vod.reviews:[];}
function sessionById(id){return sessions().find(x=>x.id===id)||null;}
function activeSession(){return sessionById(store.state.vod?.activeSessionId)||null;}
function requestedSession(){const id=query().get('vodSession');return sessionById(id)||activeSession();}
function notesFor(id){return reviews().filter(n=>n.sessionId===id).sort((a,b)=>(Number(a.time)||0)-(Number(b.time)||0));}
function phaseFor(time){const t=Number(time)||0;return PHASES.find(p=>t>=p.min&&t<p.max)||PHASES.at(-1);}
function playerLabel(value){if(!value||value==='TEAM')return ROLE_LABEL.TEAM;const player=store.state.team?.players?.[value];return `${ROLE_LABEL[value]||value}${player?.name?` · ${player.name}`:''}`;}
function selectedIdsForCurrent(notes){const valid=new Set(notes.map(n=>n.id));selected=new Set([...selected].filter(id=>valid.has(id)));return selected;}
function categories(notes){return [...new Set(notes.map(n=>n.category||'Nota'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function visibleNotes(notes){return notes.filter(n=>(filters.phase==='all'||phaseFor(n.time).id===filters.phase)&&(filters.category==='all'||(n.category||'Nota')===filters.category));}
function annotationFocus(notes){
  if(!notes.length)return {label:'Sem anotações',count:0};
  const counts=new Map();for(const n of notes)counts.set(n.category||'Nota',(counts.get(n.category||'Nota')||0)+1);
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR')).map(([label,count])=>({label,count}))[0];
}
function phaseRail(notes){
  return `<div class="v22-vod-phase-rail">${PHASES.map(p=>{const count=notes.filter(n=>phaseFor(n.time).id===p.id).length;return `<button type="button" data-v22-vod-phase="${p.id}" class="${filters.phase===p.id?'is-active':''}"><small>${p.label}</small><b>${count}</b><span>${p.range}</span></button>`;}).join('')}</div>`;
}
function evidenceCard(note){
  const phase=phaseFor(note.time),checked=selected.has(note.id);
  return `<article class="v22-vod-evidence-card ${checked?'is-selected':''}" data-v22-vod-card="${esc(note.id)}">
    <button type="button" class="v22-vod-check" data-v22-vod-toggle="${esc(note.id)}" aria-pressed="${checked?'true':'false'}"><span>${checked?'✓':'＋'}</span><small>${checked?'SELECIONADA':'SELECIONAR'}</small></button>
    <div class="v22-vod-evidence-time"><b>${fmt(note.time)}</b><span>${esc(phase.label)}</span></div>
    <div class="v22-vod-evidence-copy"><div><span>${esc(note.category||'Nota')}</span><em>USER_PRIVATE</em>${note.snapshot?'<i>QUADRO SALVO</i>':'<i>TIMESTAMP</i>'}</div><p>${esc(note.note||'Quadro tático sem comentário textual.')}</p><small>${esc(playerLabel(note.player))}</small></div>
    <button type="button" class="v22-vod-focus" data-v22-vod-focus="${esc(note.id)}">Abrir no player</button>
  </article>`;
}
function emptyVod(session){
  return `<section class="v22-vod-intelligence v22-reveal" data-v22-vod-intelligence data-session="${esc(session?.id||'')}"><header class="v22-vod-intel-head"><div><span>VOD INTELLIGENCE LENS · V22.6</span><h2>${esc(session?.title||'Crie uma análise para começar')}</h2><p>Transforme timestamps e quadros anotados em um pacote de evidências para o Tactical Board.</p></div><div class="v22-vod-intel-badges"><b>WILD RIFT</b><span>USER_PRIVATE</span><span>FROMBOS_STRUCTURAL</span></div></header><div class="v22-vod-intel-empty"><b>Nenhuma evidência nesta sessão.</b><span>Use “Marcar timestamp” ou “Salvar quadro + imagem” no VOD Review. O FROMBOS só organiza o que sua equipe realmente anotou.</span></div></section>`;
}
function vodWorkspace(session,notes){
  const focus=annotationFocus(notes),visible=visibleNotes(notes),selectedCount=selectedIdsForCurrent(notes).size;
  return `<section class="v22-vod-intelligence v22-reveal" data-v22-vod-intelligence data-session="${esc(session.id)}">
    <header class="v22-vod-intel-head"><div><span>VOD INTELLIGENCE LENS · V22.6</span><h2>${esc(session.title||'Análise de VOD')}</h2><p>Organize evidências por timing e leve apenas os eventos selecionados para o Tactical Board. As faixas temporais são uma lente FROMBOS_STRUCTURAL, não eventos oficiais do jogo.</p></div><div class="v22-vod-intel-badges"><b>WILD RIFT</b><span>USER_PRIVATE</span><span>FROMBOS_STRUCTURAL</span><span>NO AUTO-MARKERS</span></div></header>
    <div class="v22-vod-intel-kpis"><article><small>ADVERSÁRIO</small><b>${esc(session.opponent||store.state.team?.opponent||'Não informado')}</b><span>contexto da sessão</span></article><article><small>ANOTAÇÕES</small><b>${notes.length}</b><span>timestamps materializados</span></article><article><small>FOCO DE REVISÃO</small><b>${esc(focus.label)}</b><span>${focus.count} anotaç${focus.count===1?'ão':'ões'} · volume, não tendência</span></article><article><small>PACOTE TÁTICO</small><b data-v22-vod-selected-count>${selectedCount}</b><span>evidências selecionadas</span></article></div>
    ${phaseRail(notes)}
    <div class="v22-vod-intel-toolbar"><label><span>Categoria</span><select data-v22-vod-category><option value="all">Todas</option>${categories(notes).map(c=>`<option value="${esc(c)}" ${filters.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label><div><button type="button" data-v22-vod-select-visible>Selecionar visíveis</button><button type="button" data-v22-vod-clear>Limpar seleção</button></div><button type="button" class="is-primary" data-v22-vod-tactical ${selectedCount?'':'disabled'}>Abrir pacote no Tactical Board</button></div>
    <div class="v22-vod-intel-list" data-v22-vod-list>${visible.length?visible.map(evidenceCard).join(''):'<div class="v22-vod-intel-empty"><b>Nenhuma anotação corresponde aos filtros.</b><span>A evidência original permanece intacta na sessão.</span></div>'}</div>
    <footer><b>Regra do bridge:</b> somente IDs de anotações viajam para o Tactical Board. Nenhum marcador, rota, ward, zona ou coordenada é criada automaticamente.</footer>
  </section>`;
}
function focusLegacyNote(id,session){
  const active=activeSession();
  if(active?.id!==session.id){
    const select=document.querySelector('#vodSessionSelect');
    if(select&&[...select.options].some(o=>o.value===session.id)){pendingFocus=id;select.value=session.id;select.dispatchEvent(new Event('change',{bubbles:true}));return;}
  }
  const legacy=document.querySelector(`[data-vod-id="${CSS.escape(id)}"]`);
  legacy?.scrollIntoView({behavior:'smooth',block:'center'});
  legacy?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
}
function tacticalHash(sessionId,ids){return `#/tactical?vodSession=${encodeURIComponent(sessionId)}&vodNotes=${encodeURIComponent(ids.join(','))}`;}
function bindVod(root,session,notes){
  root.querySelectorAll('[data-v22-vod-phase]').forEach(btn=>btn.addEventListener('click',()=>{filters.phase=filters.phase===btn.dataset.v22VodPhase?'all':btn.dataset.v22VodPhase;applyVod(true);}));
  root.querySelector('[data-v22-vod-category]')?.addEventListener('change',e=>{filters.category=e.target.value;applyVod(true);});
  root.querySelectorAll('[data-v22-vod-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.v22VodToggle;selected.has(id)?selected.delete(id):selected.add(id);applyVod(true);}));
  root.querySelectorAll('[data-v22-vod-focus]').forEach(btn=>btn.addEventListener('click',()=>focusLegacyNote(btn.dataset.v22VodFocus,session)));
  root.querySelector('[data-v22-vod-select-visible]')?.addEventListener('click',()=>{visibleNotes(notes).forEach(n=>selected.add(n.id));applyVod(true);});
  root.querySelector('[data-v22-vod-clear]')?.addEventListener('click',()=>{selected.clear();applyVod(true);});
  root.querySelector('[data-v22-vod-tactical]')?.addEventListener('click',()=>{const ids=[...selected].filter(id=>notes.some(n=>n.id===id));if(ids.length)location.hash=tacticalHash(session.id,ids);});
}
function applyVod(force=false){
  if(route()!=='vod')return;
  const host=document.querySelector('.vod-pro');if(!host){requestAnimationFrame(()=>requestAnimationFrame(()=>applyVod(force)));return;}
  const session=requestedSession();const notes=session?notesFor(session.id):[];
  const old=host.querySelector('[data-v22-vod-intelligence]');if(old&&!force&&old.dataset.session===(session?.id||''))return;old?.remove();
  const anchor=host.querySelector('.vod-command')||host.firstElementChild;if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',session&&notes.length?vodWorkspace(session,notes):emptyVod(session));
  const root=host.querySelector('[data-v22-vod-intelligence]');if(root&&session)bindVod(root,session,notes);
  if(pendingFocus&&session?.id===activeSession()?.id){const id=pendingFocus;pendingFocus='';requestAnimationFrame(()=>focusLegacyNote(id,session));}
}
function packet(){
  if(route()!=='tactical')return null;
  const params=query(),session=sessionById(params.get('vodSession'));if(!session)return null;
  const requested=(params.get('vodNotes')||'').split(',').map(x=>x.trim()).filter(Boolean);
  const set=new Set(requested),notes=notesFor(session.id).filter(n=>set.has(n.id));
  return notes.length?{session,notes}:null;
}
function briefingText(session,notes){return [`FROMBOS · VOD EVIDENCE PACK`,`Sessão: ${session.title||'Análise de VOD'}`,`Adversário: ${session.opponent||store.state.team?.opponent||'Não informado'}`,...notes.map(n=>`${fmt(n.time)} · ${phaseFor(n.time).label} · ${n.category||'Nota'} · ${playerLabel(n.player)} — ${n.note||'Quadro tático'}`),'','USER_PRIVATE · Faixas temporais FROMBOS_STRUCTURAL. Nenhuma coordenada de mapa foi inferida.'].join('\n');}
function tacticalDock(pack){
  const {session,notes}=pack;
  return `<section class="v22-tactical-evidence" data-v22-tactical-evidence><header><div><span>VOD → TACTICAL EVIDENCE DOCK · V22.6</span><h2>${esc(session.title||'Pacote de evidências')}</h2><p>${esc(session.opponent||store.state.team?.opponent||'Adversário não informado')} · ${notes.length} evento${notes.length===1?'':'s'} selecionado${notes.length===1?'':'s'}</p></div><div><b>USER_PRIVATE</b><span>READ-ONLY BRIDGE</span><span>MAP UNCHANGED</span></div></header><div class="v22-tactical-evidence-grid">${notes.map(n=>{const p=phaseFor(n.time);return `<article><div><b>${fmt(n.time)}</b><span>${esc(p.label)}</span></div><small>${esc(n.category||'Nota')} · ${esc(playerLabel(n.player))}</small><p>${esc(n.note||'Quadro tático sem comentário textual.')}</p>${n.snapshot?'<em>QUADRO SALVO</em>':'<em>TIMESTAMP</em>'}</article>`;}).join('')}</div><footer><p>Use estas evidências como referência e marque manualmente no mapa oficial as rotas, wards, zonas e objetivos que você realmente observou.</p><div><button type="button" data-v22-tactical-copy>Copiar briefing</button><button type="button" data-v22-tactical-vod>Voltar ao VOD</button><button type="button" data-v22-tactical-clear>Fechar pacote</button></div></footer></section>`;
}
function copyText(text,button){
  const done=()=>{const old=button.textContent;button.textContent='Briefing copiado';setTimeout(()=>button.textContent=old,1600);};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(()=>{});
}
function bindTactical(root,pack){
  root.querySelector('[data-v22-tactical-copy]')?.addEventListener('click',e=>copyText(briefingText(pack.session,pack.notes),e.currentTarget));
  root.querySelector('[data-v22-tactical-vod]')?.addEventListener('click',()=>{location.hash=`#/vod?vodSession=${encodeURIComponent(pack.session.id)}`;});
  root.querySelector('[data-v22-tactical-clear]')?.addEventListener('click',()=>{location.hash='#/tactical';});
}
function applyTactical(force=false){
  if(route()!=='tactical')return;
  const shell=document.querySelector('.tactical-shell');if(!shell){requestAnimationFrame(()=>requestAnimationFrame(()=>applyTactical(force)));return;}
  const pack=packet(),old=shell.querySelector('[data-v22-tactical-evidence]');
  if(!pack){old?.remove();return;}
  const key=`${pack.session.id}:${pack.notes.map(n=>n.id).join(',')}`;if(old&&!force&&old.dataset.packet===key)return;old?.remove();
  const anchor=shell.querySelector('.tactical-topline')||shell.firstElementChild;if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',tacticalDock(pack));const root=shell.querySelector('[data-v22-tactical-evidence]');if(root){root.dataset.packet=key;bindTactical(root,pack);}
}
function apply(force=false){applyVod(force);applyTactical(force);}
const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(()=>apply());else window.addEventListener('load',()=>apply());
window.addEventListener('hashchange',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>apply(true))));
const observer=new MutationObserver(()=>{if(route()==='vod'||route()==='tactical')apply();});observer.observe(document.documentElement,{subtree:true,childList:true});
queueMicrotask(()=>apply());
window.FROMBOS_V22_VOD_TACTICAL={apply};
