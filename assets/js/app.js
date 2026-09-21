import { MODULES, ROLES, CHAMPIONS, RECOVERED_COMPOSITIONS, DATA_SOURCES } from './data.js';
import { store } from './store.js';
import { draftRoomHTML, bindDraftRoom } from './draft-room.js';
import { tacticalHTML, bindTacticalBoard } from './tactical.js';
import { vodReviewHTML, bindVodReview } from './vod-review.js';
import { championIntelligenceHTML, bindChampionIntelligence, matchupLabHTML, buildLabHTML, portraitHTML } from './champion-intelligence.js';
import { performanceCenterHTML, bindPerformanceCenter } from './performance-center.js';
import { commandCenterHTML, bindCommandCenter } from './command-center-v24-6.js';
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const app=document.querySelector('#app');
let currentRoute=location.hash.replace('#/','').split('?')[0]||'home';
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navGroups=[...new Set(MODULES.map(m=>m.group))];
const V25_PRIMARY=['home','draft','comps','champions','scouting','training','reports'];
const V25_HERO_CHAMPIONS={
  team:['Jinx','Ahri'],comps:['Orianna','Yasuo'],draft:['Yasuo','Ahri'],series:['Ahri','Jinx'],
  tactical:['Twisted Fate','Lee Sin'],vod:['Jinx',"Kai'Sa"],champions:['Ahri','Akali'],
  matchups:['Akali','Galio'],builds:['Ahri','Jinx'],scouting:['Lee Sin','Ahri'],
  training:['Irelia','Yasuo'],reports:['Orianna','Ahri'],competitive:['Yasuo','Ahri'],
  data:['Twisted Fate','Orianna'],settings:['Ahri','Jinx'],meta:['Ahri','Yasuo']
};
const v25Asset=name=>CHAMPION_REGISTRY?.[name]||Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.name===name)||null;
const v25HeroAsset=route=>{
  for(const name of V25_HERO_CHAMPIONS[route]||['Jinx','Ahri']){
    const a=v25Asset(name); if(a?.splash||a?.portrait)return a;
  }
  return Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.splash)||null;
};
const download=(name,text,type='application/json')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),300);};
function shell(content){
  const nav=navGroups.map(group=>`<div class="nav-group"><div class="nav-group-title">${group}</div>${MODULES.filter(m=>m.group===group).map(m=>`<button class="nav-item ${m.id===currentRoute?'active':''}" data-route="${m.id}"><span>${m.icon}</span><span>${m.label}</span></button>`).join('')}</div>`).join('');
  const mod=MODULES.find(m=>m.id===currentRoute)||MODULES[0];
  const primary=V25_PRIMARY.map(id=>{const m=MODULES.find(x=>x.id===id);return m?`<button class="v25-nav-link ${id===currentRoute?'active':''}" data-route="${id}"><span>${m.label}</span></button>`:'';}).join('');
  app.innerHTML=`<div class="app-shell v25-shell" data-v25-route="${currentRoute}">
    <header class="topbar v25-topbar">
      <div class="brand v25-brand" data-route="home" role="button" tabindex="0" aria-label="Abrir Central de Comando">
        <div class="brand-mark">F</div><div><strong>FROMBOS</strong><small>COACH · WILD RIFT</small></div>
      </div>
      <nav class="v25-primary-nav" aria-label="Navegação principal">${primary}</nav>
      <div class="top-actions v25-top-actions">
        <button class="v25-search-trigger" type="button" data-v25-search aria-label="Buscar"><span>⌕</span><small>Buscar</small></button>
        <div class="v25-team-chip"><span>TIME</span><b>${escapeHTML(store.state.team?.name||'FROMBOS')}</b></div>
        <button class="btn v25-backup" id="quickExport">Backup</button>
        <button class="btn mobile-toggle v25-menu-toggle" id="menuToggle" aria-controls="sidebar" aria-expanded="false">Mais</button>
      </div>
    </header>
    <aside class="sidebar v25-drawer" id="sidebar" aria-label="Todos os módulos">
      <div class="v25-drawer-head"><div><span>FROMBOS</span><b>Todos os módulos</b></div><button type="button" id="drawerClose" aria-label="Fechar">×</button></div>
      ${nav}
      <div class="footer-note">WILD RIFT ONLY · EVIDENCE FIRST<br>FROMBOS COMPETITIVE OS</div>
    </aside>
    <main class="main v25-main">
      <div class="v25-subbar"><div><span>FROMBOS /</span><b>${mod.label}</b></div><div class="v25-subbar-status"><span>LOCAL WORKSPACE</span><span>${store.state.draft?.format||'MD5'}</span><span>G${Number(store.state.draft?.game)||1}</span></div></div>
      <div class="content v25-content" data-page="${currentRoute}">${content}</div>
    </main>
  </div>`;
  document.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>location.hash=`#/${el.dataset.route}`);
  const drawer=document.querySelector('#sidebar'),toggle=document.querySelector('#menuToggle');
  const closeDrawer=()=>{drawer?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');document.body.classList.remove('v25-drawer-open');};
  toggle?.addEventListener('click',()=>{const open=!drawer?.classList.contains('open');drawer?.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('v25-drawer-open',open);});
  document.querySelector('#drawerClose')?.addEventListener('click',closeDrawer);
  document.querySelector('.v25-brand')?.addEventListener('click',()=>location.hash='#/home');
  document.querySelector('.v25-brand')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.hash='#/home';}});
  document.querySelector('[data-v25-search]')?.addEventListener('click',()=>{const global=document.querySelector('[data-v21-global-search], .v21-global-search input, .v21-search input');if(global){global.focus();return;}document.dispatchEvent(new CustomEvent('frombos:open-search'));});
  document.querySelector('#quickExport')?.addEventListener('click',()=>download(`FROMBOS-WORKSPACE-${new Date().toISOString().slice(0,10)}.json`,store.exportJSON()));
}
function pageHead(kicker,title,desc,actions=''){
  const a=v25HeroAsset(currentRoute);const art=a?.splash||a?.portrait||'';
  const style=art?` style="--v25-page-art:url('${escapeHTML(art)}')"`:'';
  return `<section class="page-head v25-page-hero" data-v25-page="${currentRoute}"${style}>
    <div class="v25-page-copy"><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p><div class="v25-page-actions">${actions}</div></div>
    <div class="v25-page-art" aria-hidden="true"></div>
    <div class="v25-page-ornament"><span>PLAY</span><span>ANALYZE</span><span>EVOLVE</span></div>
  </section>`;
}
function goBindings(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.go}`);}
function renderHome(){shell(commandCenterHTML());document.querySelector('.content')?.setAttribute('data-page','home');bindCommandCenter();}
function renderTeam(){const rows=ROLES.map(r=>{const p=store.state.team.players[r.id];return `<div class="role-row"><div class="role-label">${r.label}</div><input class="input" data-player="${r.id}" value="${escapeHTML(p.name)}" placeholder="Nome do jogador"><div><div class="pool-list">${p.pool.map(c=>`<span class="chip">${escapeHTML(c)} <button data-remove-pool="${r.id}" data-champ="${escapeHTML(c)}" style="all:unset;cursor:pointer">×</button></span>`).join('')}</div><div style="display:flex;gap:7px;margin-top:7px"><select class="select" data-pool-select="${r.id}"><option value="">Adicionar campeão...</option>${CHAMPIONS.filter(c=>!p.pool.includes(c)).map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select><button class="btn" data-add-pool="${r.id}">Adicionar</button></div></div></div>`}).join('');shell(`${pageHead('TEAM WORKSPACE','Meu time & pools','Champion pools alimentam Draft, Fearless e Composições.')}<div class="card"><div class="form-row"><label>Time<input class="input" id="teamName" value="${escapeHTML(store.state.team.name)}"></label><label>Próximo adversário<input class="input" id="opponent" value="${escapeHTML(store.state.team.opponent)}"></label></div><div class="section-title"><h2>Roster competitivo</h2><span class="badge blue">USER_PRIVATE</span></div>${rows}</div>`);document.querySelector('#teamName').onchange=e=>store.update(s=>s.team.name=e.target.value);document.querySelector('#opponent').onchange=e=>store.update(s=>s.team.opponent=e.target.value);document.querySelectorAll('[data-player]').forEach(i=>i.onchange=e=>store.update(s=>s.team.players[e.target.dataset.player].name=e.target.value));document.querySelectorAll('[data-add-pool]').forEach(b=>b.onclick=()=>{const role=b.dataset.addPool,sel=document.querySelector(`[data-pool-select="${role}"]`);if(!sel.value)return;store.update(s=>s.team.players[role].pool.push(sel.value));renderTeam();});document.querySelectorAll('[data-remove-pool]').forEach(b=>b.onclick=()=>{store.update(s=>s.team.players[b.dataset.removePool].pool=s.team.players[b.dataset.removePool].pool.filter(x=>x!==b.dataset.champ));renderTeam();});}
function compCard(c){return `<article class="card v251-comp-card"><div class="v251-comp-card-head"><div><div class="eyebrow">${escapeHTML(c.archetype)}</div><h3>${escapeHTML(c.name)}</h3></div><span class="badge gold">${escapeHTML(c.origin)}</span></div><div class="comp-lineup">${ROLES.map(r=>{const champ=c.lineup[r.id]||'';return `<div class="champ-slot"><div class="v251-comp-slot-art">${champ?portraitHTML(champ,'v251-comp-slot-img'):'<span class="portrait-fallback">—</span>'}</div><small>${r.label}</small><b>${escapeHTML(champ||'—')}</b></div>`;}).join('')}</div><div class="v251-comp-copy"><p>${escapeHTML(c.plan)}</p><p class="muted"><b>Condição de vitória:</b> ${escapeHTML(c.winCondition||'Não documentada.')}</p></div><button class="btn info" data-comp-draft="${c.id}">Levar ao Draft</button></article>`;}
function renderComps(){const all=[...RECOVERED_COMPOSITIONS,...store.state.customComps];shell(`${pageHead('COMPOSITION LAB','Composições','Hipóteses estruturadas de treino, sem transformar uma partida em win rate.')}<div class="grid cols-2">${all.map(compCard).join('')}</div>`);document.querySelectorAll('[data-comp-draft]').forEach(b=>b.onclick=()=>{const c=all.find(x=>x.id===b.dataset.compDraft);store.update(s=>{s.draft.referenceComp={id:c.id,name:c.name,lineup:{...c.lineup}};});location.hash='#/draft';});}
function renderDraft(){shell(`${pageHead('DRAFT ROOM PRO','Tournament Draft','Bans e picks alternados, portraits oficiais, série persistente, Fearless global, champion pool e branches.',`<span class="badge ${store.state.draft.fearless?'red':'blue'}">FEARLESS ${store.state.draft.fearless?'ON':'OFF'}</span>`)}${draftRoomHTML()}`);bindDraftRoom(renderDraft);}
function renderTactical(){shell(`${pageHead('TACTICAL BOARD 2.0','Sala tática','Mapa exato preservado, cenários, campeões, rotas, visão com range, objetivos e leitura do coach.')} ${tacticalHTML()}`);bindTacticalBoard(renderTactical);}
function renderVod(){shell(`${pageHead('VOD REVIEW PRO','Revisão de VOD','Pause, desenhe sobre o vídeo e salve decisões por timestamp sem enviar o arquivo.')} ${vodReviewHTML()}`);bindVodReview(renderVod);}
function renderChampions(){shell(`${pageHead('CHAMPION INTELLIGENCE','Champions','Roster visual e página central de conhecimento por campeão, sem misturar LoL PC.')} ${championIntelligenceHTML()}`);bindChampionIntelligence(renderChampions);}
function renderMatchups(){shell(`${pageHead('MATCHUP LAB','Confrontos','Observed data, leitura estrutural e impacto da composição permanecem separados.')} ${matchupLabHTML()}`);}
function renderBuilds(){shell(`${pageHead('BUILD INTELLIGENCE','Builds contextuais','Uma build deve responder à ameaça e ao plano do jogo — não ser apenas uma receita fixa.')} ${buildLabHTML()}`);}
function renderSeries(){const d=store.state.draft;const games=[1,2,3,4,5].map(g=>{const acts=d.games?.[g]?.actions||[];const picks=acts.filter(x=>x.type==='pick');return `<article class="card"><div class="eyebrow">GAME ${g}</div><h3>${acts.length?`${acts.length}/20 ações registradas`:'Sem estado'}</h3><p class="muted">${picks.length?`Picks: ${picks.map(x=>escapeHTML(x.champ)).join(' · ')}`:'Nenhum pick registrado.'}</p><button class="btn" data-open-game="${g}">Abrir G${g}</button></article>`}).join('');shell(`${pageHead('SERIES INTELLIGENCE','Fearless / Série','O pick de hoje altera a profundidade disponível nos próximos jogos.')}<div class="grid cols-3">${games}</div>`);document.querySelectorAll('[data-open-game]').forEach(b=>b.onclick=()=>{store.update(s=>{s.draft.game=+b.dataset.openGame;s.draft.actions=(s.draft.games[s.draft.game]?.actions||[]).map(x=>({...x}));});location.hash='#/draft';});}
function renderTraining(){shell(`${pageHead('PERFORMANCE CENTER','Treinos & Coach Mode','Treine preparação de objetivo, visão, decisão e transforme padrões de VOD em drills.')} ${performanceCenterHTML()}`);bindPerformanceCenter(renderTraining);}
function renderData(){shell(`${pageHead('DATA CENTER','Provenance & fontes','Dados oficiais, observados, curados e cálculo estrutural permanecem separados. Ausência de evidência = UNKNOWN.')}<div class="card"><div class="source-row"><b>Fonte</b><b>Tipo</b><b>Status</b><b>Domínios</b></div>${DATA_SOURCES.map(s=>`<div class="source-row"><div><b>${s.name}</b></div><div><span class="badge blue">${s.type}</span></div><div>${s.status}</div><div class="muted">${s.domains.join(' · ')}</div></div>`).join('')}</div>`);}
function renderSettings(){shell(`${pageHead('SISTEMA','Configurações & backup','Exporte ou restaure o workspace local.')}<div class="grid cols-2"><div class="card"><h3>Backup</h3><button class="btn primary" id="exportAll">Exportar workspace</button></div><div class="card"><h3>Restaurar</h3><input type="file" class="input" id="importFile" accept="application/json"></div><div class="card"><h3>Reset local</h3><button class="btn" id="resetAll">Resetar</button></div></div>`);document.querySelector('#exportAll').onclick=()=>download('FROMBOS-WORKSPACE.json',store.exportJSON());document.querySelector('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{store.importJSON(await f.text());renderSettings();}catch(err){alert('Arquivo inválido: '+err.message);}};document.querySelector('#resetAll').onclick=()=>{if(confirm('Resetar o workspace V2 local?')){store.reset();renderSettings();}};}
function renderPlaceholder(id){const m=MODULES.find(x=>x.id===id);shell(`${pageHead(m?.group||'FROMBOS',m?.label||id,'Módulo conectado à arquitetura V2. A engine específica continuará entrando por etapas.')}<div class="empty">Estrutura preparada.</div>`);}
function route(){currentRoute=location.hash.replace('#/','').split('?')[0]||'home';const routes={home:renderHome,team:renderTeam,comps:renderComps,draft:renderDraft,series:renderSeries,tactical:renderTactical,vod:renderVod,champions:renderChampions,matchups:renderMatchups,builds:renderBuilds,training:renderTraining,data:renderData,settings:renderSettings};(routes[currentRoute]||(()=>renderPlaceholder(currentRoute)))();}
window.addEventListener('hashchange',route);route();
