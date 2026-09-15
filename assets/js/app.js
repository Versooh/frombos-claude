import { MODULES, ROLES, CHAMPIONS, RECOVERED_COMPOSITIONS, DATA_SOURCES } from './data.js';
import { store } from './store.js';
import { coreStore } from './core/store-adapter.js';
import { cloudStore } from './core/cloud-store.js';
import { draftRoomHTML, bindDraftRoom } from './draft-room.js';
import { tacticalHTML, bindTacticalBoard } from './tactical.js';
import { vodReviewHTML, bindVodReview } from './vod-review.js';

const app=document.querySelector('#app');
let currentRoute=location.hash.replace('#/','').split('?')[0]||'home';
const escapeHTML=value=>String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const navGroups=[...new Set(MODULES.map(m=>m.group))];
const download=(name,text,type='application/json')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),300);};
let cloudSaveQueue=Promise.resolve();

// Compatibility bridge: legacy modules continue to render while the SaaS workspace migrates.
// Once an organization/team has been hydrated from Supabase, cloud becomes authoritative.
function syncLegacyToCore(){
  const legacy=store.state;
  if(coreStore.state.meta?.cloud?.organizationId) return;
  coreStore.update(core=>{
    core.team.name=legacy.team?.name||core.team.name;
    core.team.opponent=legacy.team?.opponent||core.team.opponent;
    core.team.format=legacy.team?.format||core.team.format;
    for(const role of Object.keys(core.team.players)){const p=legacy.team?.players?.[role];if(!p)continue;core.team.players[role].name=p.name||'';core.team.players[role].pool=Array.isArray(p.pool)?[...p.pool]:[];}
    if(Array.isArray(legacy.customComps))core.compositions=legacy.customComps.map(c=>({...c}));
    if(legacy.tactical)core.tactical={...core.tactical,...structuredClone(legacy.tactical)};
    if(legacy.vod?.reviews)core.vods=structuredClone(legacy.vod.reviews);
    return core;
  });
}

function queueCloudTeamSave(){
  cloudSaveQueue=cloudSaveQueue.then(async()=>{
    try{
      await cloudStore.persistCoreTeam({createMissing:true});
      const status=document.querySelector('#cloudStatus');
      if(status){status.className='badge green';status.textContent='SINCRONIZADO';}
    }catch(error){
      const status=document.querySelector('#cloudStatus');
      if(status){status.className='badge red';status.textContent='ERRO AO SALVAR';status.title=error.message||'';}
      console.warn('FROMBOS cloud save failed:',error);
    }
  }).catch(()=>{});
  return cloudSaveQueue;
}

function shell(content){
  const nav=navGroups.map(group=>`<div class="nav-group"><div class="nav-group-title">${group}</div>${MODULES.filter(m=>m.group===group).map(m=>`<button class="nav-item ${m.id===currentRoute?'active':''}" data-route="${m.id}"><span>${m.icon}</span><span>${m.label}</span></button>`).join('')}</div>`).join('');
  const mod=MODULES.find(m=>m.id===currentRoute)||MODULES[0];
  app.innerHTML=`<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><div class="brand-mark">F</div><div><strong>FROMBOS</strong><small>Competitive Intelligence</small></div></div>${nav}<div class="footer-note">SaaS foundation · Supabase cloud<br>Organization-scoped workspace.</div></aside><main class="main"><header class="topbar"><div style="display:flex;align-items:center;gap:12px"><button class="btn mobile-toggle" id="menuToggle">☰</button><div class="crumb">FROMBOS / ${mod.label}</div></div><div class="top-actions"><span class="badge green">CLOUD WORKSPACE</span><button class="btn" id="quickExport">Backup</button></div></header><div class="content">${content}</div></main></div>`;
  document.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>location.hash=`#/${el.dataset.route}`);
  document.querySelector('#menuToggle')?.addEventListener('click',()=>document.querySelector('#sidebar')?.classList.toggle('open'));
  document.querySelector('#quickExport')?.addEventListener('click',()=>download(`FROMBOS-WORKSPACE-${new Date().toISOString().slice(0,10)}.json`,coreStore.exportJSON()));
}
function pageHead(kicker,title,desc,actions=''){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div><div>${actions}</div></div>`;}
function goBindings(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.go}`);}

function renderHome(){
  const configured=Object.values(coreStore.state.team.players).filter(p=>p.name||p.pool.length).length;
  const cloud=coreStore.state.meta?.cloud;
  shell(`<section class="hero"><div><div class="eyebrow">FROMBOS · ORGANIZATION CLOUD</div><h1>Visão. Leitura. Execução.</h1><p>O workspace agora nasce dentro da organização e pode carregar o mesmo time entre dispositivos. Prepare a equipe, construa drafts de torneio, planeje séries Fearless, desenhe jogadas e transforme revisão em treino.</p><div class="top-actions" style="margin-top:18px"><button class="btn primary" data-go="team">Administrar time</button><button class="btn info" data-go="draft">Abrir Draft Room</button></div></div><div class="hero-panel"><div class="eyebrow">WORKSPACE</div><h2>${escapeHTML(coreStore.state.team.name||'Nenhum time ativo')}</h2><p class="muted">${configured}/5 posições configuradas · ${cloud?.teamId?'time cloud conectado':'aguardando cadastro do time'}</p><span class="badge ${cloud?.teamId?'green':'gold'}">${cloud?.teamId?'SUPABASE SYNC':'CLOUD READY'}</span></div></section><div class="kpis"><div class="metric"><small>Composições recuperadas</small><b>${RECOVERED_COMPOSITIONS.length}</b></div><div class="metric"><small>Roster catalogado</small><b>${CHAMPIONS.length}</b></div><div class="metric"><small>Fontes registradas</small><b>${DATA_SOURCES.length}</b></div><div class="metric"><small>Drafts no Core</small><b>${coreStore.state.drafts.length}</b></div></div><div class="grid cols-3">${['team','comps','draft','tactical','vod','data'].map(id=>{const m=MODULES.find(x=>x.id===id);return `<article class="card"><div class="eyebrow">${m.group}</div><h3>${m.label}</h3><p class="muted">${({team:'Roster e champion pools privados por organização.',comps:'Composições e planos de execução.',draft:'Tournament Draft + Fearless + branches.',tactical:'Mapa exato, visão, rotas e cenários.',vod:'Player local com notas por timestamp.',data:'Proveniência e separação de evidência.'})[id]}</p><button class="btn" data-go="${id}">Abrir módulo</button></article>`}).join('')}</div>`);goBindings();
}

function renderTeam(){
  const cloud=coreStore.state.meta?.cloud;
  const rows=ROLES.map(r=>{const p=coreStore.state.team.players[r.id];return `<div class="role-row"><div class="role-label">${r.label}</div><input class="input" data-player="${r.id}" value="${escapeHTML(p.name)}" placeholder="Nome do jogador"><div><div class="pool-list">${p.pool.map(c=>`<span class="chip">${escapeHTML(c)} <button data-remove-pool="${r.id}" data-champ="${escapeHTML(c)}" style="all:unset;cursor:pointer">×</button></span>`).join('')}</div><div style="display:flex;gap:7px;margin-top:7px"><select class="select" data-pool-select="${r.id}"><option value="">Adicionar campeão...</option>${CHAMPIONS.filter(c=>!p.pool.includes(c)).map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select><button class="btn" data-add-pool="${r.id}">Adicionar</button></div></div></div>`}).join('');
  shell(`${pageHead('TEAM WORKSPACE','Meu time & pools','Cadastre o time da organização, o roster e os champion pools. Alterações deste módulo são sincronizadas para Supabase.',`<div class="top-actions"><span id="cloudStatus" class="badge ${cloud?.teamId?'green':'gold'}">${cloud?.teamId?'SINCRONIZADO':'NOVO TIME'}</span><button class="btn primary" id="saveCloud">Salvar na organização</button></div>`)}<div class="card"><div class="form-row"><label>Time<input class="input" id="teamName" value="${escapeHTML(coreStore.state.team.name)}" placeholder="Ex.: UOL E-sports"></label><label>Próximo adversário<input class="input" id="opponent" value="${escapeHTML(coreStore.state.team.opponent)}"></label></div><div class="form-row" style="margin-top:12px"><label>Organização<input class="input" value="${escapeHTML(localStorage.getItem('frombos.active.organization.meta') ? JSON.parse(localStorage.getItem('frombos.active.organization.meta')).name || '' : '')}" disabled></label><label>Time cloud<select class="select" id="teamSelector"><option value="">Carregando…</option></select></label></div><div class="section-title"><h2>Roster competitivo</h2><span class="badge blue">USER_PRIVATE · RLS</span></div>${rows}<div class="muted" style="margin-top:14px">Salve com o botão acima ou continue editando: as mudanças do roster/pools entram em uma fila de sincronização.</div></div>`);

  const save=()=>{const status=document.querySelector('#cloudStatus');if(status){status.className='badge gold';status.textContent='SALVANDO…';status.title='';}return queueCloudTeamSave();};
  document.querySelector('#saveCloud').onclick=async()=>{await save();};
  document.querySelector('#teamName').onchange=e=>{coreStore.update(s=>s.team.name=e.target.value);save();};
  document.querySelector('#opponent').onchange=e=>coreStore.update(s=>s.team.opponent=e.target.value);
  document.querySelectorAll('[data-player]').forEach(i=>i.onchange=e=>{coreStore.update(s=>s.team.players[e.target.dataset.player].name=e.target.value);save();});
  document.querySelectorAll('[data-add-pool]').forEach(b=>b.onclick=async()=>{const role=b.dataset.addPool,sel=document.querySelector(`[data-pool-select="${role}"]`);if(!sel.value)return;coreStore.update(s=>s.team.players[role].pool.push(sel.value));renderTeam();await save();});
  document.querySelectorAll('[data-remove-pool]').forEach(b=>b.onclick=async()=>{coreStore.update(s=>s.team.players[b.dataset.removePool].pool=s.team.players[b.dataset.removePool].pool.filter(x=>x!==b.dataset.champ));renderTeam();await save();});

  const selector=document.querySelector('#teamSelector');
  cloudStore.listTeams().then(teams=>{
    selector.innerHTML=teams.length?teams.map(t=>`<option value="${t.id}" ${t.id===cloudStore.activeTeamId?'selected':''}>${escapeHTML(t.name)}</option>`).join(''):'<option value="">Nenhum time cloud</option>';
  }).catch(error=>{selector.innerHTML='<option value="">Erro ao carregar</option>';selector.title=error.message||'';});
  selector.onchange=()=>{if(!selector.value)return;localStorage.setItem('frombos.active.team',selector.value);localStorage.removeItem('frombos.active.team-season');location.reload();};
}

function compCard(c){return `<article class="card"><div style="display:flex;justify-content:space-between;gap:8px"><div><div class="eyebrow">${escapeHTML(c.archetype)}</div><h3>${escapeHTML(c.name)}</h3></div><span class="badge gold">${escapeHTML(c.origin)}</span></div><div class="comp-lineup">${ROLES.map(r=>`<div class="champ-slot"><small>${r.label}</small><b>${escapeHTML(c.lineup[r.id]||'—')}</b></div>`).join('')}</div><p>${escapeHTML(c.plan)}</p><p class="muted"><b>Win condition:</b> ${escapeHTML(c.winCondition||'Não documentada.')}</p><button class="btn info" data-comp-draft="${c.id}">Levar ao Draft</button></article>`;}
function renderComps(){const all=[...RECOVERED_COMPOSITIONS,...coreStore.state.compositions];shell(`${pageHead('COMPOSITION LAB','Composições','Hipóteses estruturadas de treino, sem transformar uma partida em win rate.')}<div class="grid cols-2">${all.map(compCard).join('')}</div>`);document.querySelectorAll('[data-comp-draft]').forEach(b=>b.onclick=()=>{const c=all.find(x=>x.id===b.dataset.compDraft);coreStore.update(s=>{s.drafts.push({id:`draft_${Date.now().toString(36)}`,type:'draft',game:1,seriesId:null,format:'MD5',ruleset:null,actions:[],referenceCompositionId:c.id,referenceComp:{id:c.id,name:c.name,lineup:{...c.lineup}}});});location.hash='#/draft';});}

function renderDraft(){shell(`${pageHead('DRAFT ROOM PRO','Tournament Draft','Bans e picks alternados, série persistente, Fearless global, champion pool e branches.',`<span class="badge ${coreStore.state.drafts.length?'red':'blue'}">CORE DRAFTS ${coreStore.state.drafts.length}</span>`)}${draftRoomHTML()}`);bindDraftRoom(renderDraft);}
function renderTactical(){shell(`${pageHead('TACTICAL BOARD 2.0','Sala tática','Mapa exato preservado, cenários, campeões, rotas, visão com range, objetivos e leitura do coach.')} ${tacticalHTML()}`);bindTacticalBoard(renderTactical);}
function renderVod(){shell(`${pageHead('VOD REVIEW PRO','Revisão de VOD','Pause, desenhe sobre o vídeo e salve decisões por timestamp sem enviar o arquivo.')} ${vodReviewHTML()}`);bindVodReview(renderVod);}

function renderSeries(){const drafts=coreStore.state.drafts;const games=[1,2,3,4,5].map(g=>{const d=drafts.find(x=>x.game===g)||null;const acts=d?.actions||[];const picks=acts.filter(x=>x.type==='pick');return `<article class="card"><div class="eyebrow">GAME ${g}</div><h3>${acts.length?`${acts.length}/20 ações registradas`:'Sem estado'}</h3><p class="muted">${picks.length?`Picks: ${picks.map(x=>escapeHTML(x.champ)).join(' · ')}`:'Nenhum pick registrado.'}</p><button class="btn" data-open-game="${g}">Abrir G${g}</button></article>`}).join('');shell(`${pageHead('SERIES INTELLIGENCE','Fearless / Série','O pick de hoje altera a profundidade disponível nos próximos jogos.')}<div class="grid cols-3">${games}</div>`);document.querySelectorAll('[data-open-game]').forEach(b=>b.onclick=()=>{coreStore.update(s=>{let d=s.drafts.find(x=>x.game===+b.dataset.openGame);if(!d){d={id:`draft_${Date.now().toString(36)}`,type:'draft',game:+b.dataset.openGame,seriesId:null,format:'MD5',ruleset:null,actions:[]};s.drafts.push(d);}});location.hash='#/draft';});}

function renderTraining(){shell(`${pageHead('PERFORMANCE CENTER','Treinos & evolução','Planejamento competitivo ligado a draft, composição, mapa e VOD.')}<div class="grid cols-2"><article class="card"><div class="eyebrow">PLANO DA SEMANA</div><h3>Focos</h3><div class="tag-cloud">${coreStore.state.training.focus.map(x=>`<button class="active">${escapeHTML(x)}</button>`).join('')}</div></article><article class="card"><div class="eyebrow">DRILLS</div><h3>Próxima sessão</h3><p class="muted">Conecte uma composição, um cenário tático e anotações de VOD ao treino.</p><button class="btn" data-go="comps">Escolher composição</button> <button class="btn" data-go="tactical">Abrir mapa</button></article></div>`);goBindings();}
function renderData(){shell(`${pageHead('DATA CENTER','Provenance & fontes','Dados oficiais, observados, curados e cálculo estrutural permanecem separados. Ausência de evidência = UNKNOWN.')}<div class="card"><div class="source-row"><b>Fonte</b><b>Tipo</b><b>Status</b><b>Domínios</b></div>${DATA_SOURCES.map(s=>`<div class="source-row"><div><b>${s.name}</b></div><div><span class="badge blue">${s.type}</span></div><div>${s.status}</div><div class="muted">${s.domains.join(' · ')}</div></div>`).join('')}</div>`);}
function renderSettings(){shell(`${pageHead('SISTEMA','Configurações & backup','Exporte ou restaure o workspace Core local.')}<div class="grid cols-2"><div class="card"><h3>Backup</h3><button class="btn primary" id="exportAll">Exportar workspace Core</button></div><div class="card"><h3>Restaurar</h3><input type="file" class="input" id="importFile" accept="application/json"></div><div class="card"><h3>Reset local</h3><button class="btn" id="resetAll">Resetar</button></div></div>`);document.querySelector('#exportAll').onclick=()=>download('FROMBOS-CORE-WORKSPACE.json',coreStore.exportJSON());document.querySelector('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{coreStore.importJSON(await f.text());alert('Workspace Core restaurado.');renderSettings();}catch(err){alert('Arquivo inválido: '+err.message);}};document.querySelector('#resetAll').onclick=()=>{if(confirm('Resetar o workspace Core local?')){coreStore.reset();renderSettings();}};}
function renderPlaceholder(id){const m=MODULES.find(x=>x.id===id);shell(`${pageHead(m?.group||'FROMBOS',m?.label||id,'Módulo conectado à arquitetura Core. A engine entra na próxima sequência de implementação.')}<div class="empty">Estrutura preparada.</div>`);}

function route(){currentRoute=location.hash.replace('#/','').split('?')[0]||'home';if(currentRoute==='home'||currentRoute==='team'||currentRoute==='comps')syncLegacyToCore();const routes={home:renderHome,team:renderTeam,comps:renderComps,draft:renderDraft,series:renderSeries,tactical:renderTactical,vod:renderVod,training:renderTraining,data:renderData,settings:renderSettings};(routes[currentRoute]||(()=>renderPlaceholder(currentRoute)))();}
window.addEventListener('hashchange',route);route();
