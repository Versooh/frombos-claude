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
const V26_ICON_PATHS={
  brand:'<path d="M12 2l3.2 5.4L21 9l-4 4.3.8 6.2-5.8-2.7-5.8 2.7.8-6.2L3 9l5.8-1.6L12 2z"/><path d="M9.2 9.4l2.8 6.1 2.8-6.1"/>',
  home:'<path d="M3 11.2L12 4l9 7.2"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5.7h5V20"/>',
  team:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 20c.7-4 2.8-6 5.2-6s4.6 2 5.2 6"/><path d="M13.4 15.2c1-.9 2.1-1.3 3.5-1.3 2.2 0 3.8 1.8 4.3 5.1"/>',
  comps:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M8 9.2l4-2.2 4 2.2v5.6L12 17l-4-2.2V9.2z"/>',
  draft:'<path d="M5 4h14v4H5z"/><path d="M5 10h8v4H5z"/><path d="M5 16h14v4H5z"/><path d="M16 10l3 2-3 2"/>',
  series:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/><circle cx="8" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="10" cy="18" r="1.5"/>',
  tactical:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/><path d="M8.5 15.5l7-7"/>',
  vod:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
  champions:'<path d="M12 3l6 4v6c0 4-2.4 6.5-6 8-3.6-1.5-6-4-6-8V7l6-4z"/><path d="M9 12l2 2 4-5"/>',
  meta:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/><path d="M5.5 5.5l13 13"/>',
  matchups:'<path d="M4 7h12"/><path d="M13 4l3 3-3 3"/><path d="M20 17H8"/><path d="M11 14l-3 3 3 3"/>',
  builds:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  scouting:'<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/><path d="M8 11h6M11 8v6"/>',
  training:'<path d="M5 19V9"/><path d="M10 19V5"/><path d="M15 19v-7"/><path d="M20 19V3"/><path d="M3 19h19"/>',
  reports:'<path d="M5 20V10"/><path d="M10 20V6"/><path d="M15 20v-4"/><path d="M20 20V3"/><path d="M3 20h19"/>',
  competitive:'<path d="M7 4h10v4c0 3.5-2 6-5 7-3-1-5-3.5-5-7V4z"/><path d="M9 20h6M12 15v5"/><path d="M7 7H4c0 3 1.5 5 4.2 5.7M17 7h3c0 3-1.5 5-4.2 5.7"/>',
  data:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  backup:'<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 13v7h14v-7"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrow:'<path d="M5 12h14"/><path d="M14 7l5 5-5 5"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>'
};
const v26Icon=id=>`<svg class="v26-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${V26_ICON_PATHS[id]||V26_ICON_PATHS.comps}</svg>`;
const v26Norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();

const v25Asset=name=>CHAMPION_REGISTRY?.[name]||Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.name===name)||null;
const v25HeroAsset=route=>{
  for(const name of V25_HERO_CHAMPIONS[route]||['Jinx','Ahri']){
    const a=v25Asset(name); if(a?.splash||a?.portrait)return a;
  }
  return Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.splash)||null;
};
const download=(name,text,type='application/json')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),300);};
function v26CommandPaletteHTML(){
  return `<div class="v26-command-layer" id="v26CommandLayer" hidden aria-hidden="true">
    <section class="v26-command-palette" role="dialog" aria-modal="true" aria-label="Busca global FROMBOS">
      <header class="v26-command-head">
        <div><span>FROMBOS COMMAND</span><b>Navegue pelo sistema</b></div>
        <button type="button" data-v26-command-close aria-label="Fechar">${v26Icon('close')}</button>
      </header>
      <label class="v26-command-search">${v26Icon('search')}<input id="v26CommandInput" autocomplete="off" placeholder="Buscar módulos ou campeões..."><kbd>ESC</kbd></label>
      <div class="v26-command-results" id="v26CommandResults"></div>
      <footer><span>ENTER abre</span><span>CTRL / ⌘ + K busca</span><span>WILD RIFT ONLY</span></footer>
    </section>
  </div>`;
}
function v26CommandResultsHTML(query=''){
  const q=v26Norm(query);
  const modules=MODULES.filter(m=>!q||v26Norm(m.label+' '+m.group+' '+m.id).includes(q)).slice(0,q?8:7);
  const champs=q?CHAMPIONS.filter(name=>v26Norm(name).includes(q)).slice(0,8):[];
  const moduleRows=modules.map(m=>`<button type="button" class="v26-command-row" data-v26-command-route="${m.id}"><span class="v26-command-row-icon">${v26Icon(m.id)}</span><span><b>${escapeHTML(m.label)}</b><small>${escapeHTML(m.group)}</small></span><em>ABRIR</em></button>`).join('');
  const champRows=champs.map(name=>`<button type="button" class="v26-command-row champion" data-v26-command-champion="${escapeHTML(name)}"><span class="v26-command-portrait">${portraitHTML(name,'v26-command-portrait-img')}</span><span><b>${escapeHTML(name)}</b><small>Champion Intelligence</small></span><em>CAMPEÃO</em></button>`).join('');
  return `<div class="v26-command-section"><div class="v26-command-section-title"><span>MÓDULOS</span><b>${modules.length}</b></div>${moduleRows||'<div class="v26-command-empty">Nenhum módulo encontrado.</div>'}</div>${q?`<div class="v26-command-section"><div class="v26-command-section-title"><span>CAMPEÕES</span><b>${champs.length}</b></div>${champRows||'<div class="v26-command-empty">Nenhum campeão encontrado.</div>'}</div>`:''}`;
}
function shell(content){
  const nav=navGroups.map(group=>`<div class="nav-group"><div class="nav-group-title">${group}</div>${MODULES.filter(m=>m.group===group).map(m=>`<button class="nav-item ${m.id===currentRoute?'active':''}" data-route="${m.id}" title="${escapeHTML(m.label)}"><span class="v26-drawer-icon">${v26Icon(m.id)}</span><span>${m.label}</span></button>`).join('')}</div>`).join('');
  const mod=MODULES.find(m=>m.id===currentRoute)||MODULES[0];
  const primary=V25_PRIMARY.map(id=>{const m=MODULES.find(x=>x.id===id);return m?`<button class="v25-nav-link ${id===currentRoute?'active':''}" data-route="${id}" title="${escapeHTML(m.label)}"><span class="v26-nav-icon">${v26Icon(id)}</span><span>${m.label}</span></button>`:'';}).join('');
  app.innerHTML=`<div class="app-shell v25-shell v26-shell" data-v25-route="${currentRoute}" data-v26-route="${currentRoute}">
    <div class="v26-route-progress" aria-hidden="true"></div>
    <header class="topbar v25-topbar v26-topbar">
      <div class="brand v25-brand v26-brand" data-route="home" role="button" tabindex="0" aria-label="Abrir Central de Comando">
        <div class="brand-mark v26-brand-mark">${v26Icon('brand')}</div><div><strong>FROMBOS</strong><small>COMPETITIVE OS · WILD RIFT</small></div>
      </div>
      <nav class="v25-primary-nav v26-primary-nav" aria-label="Navegação principal">${primary}</nav>
      <div class="top-actions v25-top-actions v26-top-actions">
        <button class="v25-search-trigger v26-search-trigger" type="button" data-v26-command-open aria-label="Buscar"><span>${v26Icon('search')}</span><small>Buscar</small><kbd>⌘K</kbd></button>
        <div class="v25-team-chip v26-team-chip"><span>WORKSPACE</span><b>${escapeHTML(store.state.team?.name||'FROMBOS')}</b></div>
        <button class="btn v25-backup v26-icon-button" id="quickExport" title="Exportar backup">${v26Icon('backup')}<span>Backup</span></button>
        <button class="btn mobile-toggle v25-menu-toggle v26-icon-button" id="menuToggle" aria-controls="sidebar" aria-expanded="false">${v26Icon('menu')}<span>Mais</span></button>
      </div>
    </header>
    <aside class="sidebar v25-drawer v26-drawer" id="sidebar" aria-label="Todos os módulos">
      <div class="v25-drawer-head"><div><span>FROMBOS</span><b>Todos os módulos</b></div><button type="button" id="drawerClose" aria-label="Fechar">${v26Icon('close')}</button></div>
      ${nav}
      <div class="footer-note">WILD RIFT ONLY · EVIDENCE FIRST<br>FROMBOS COMPETITIVE OS</div>
    </aside>
    ${v26CommandPaletteHTML()}
    <main class="main v25-main v26-main">
      <div class="v25-subbar v26-subbar"><div><span>${escapeHTML(mod.group)} /</span><b>${mod.label}</b></div><div class="v25-subbar-status"><span>EVIDENCE FIRST</span><span>LOCAL WORKSPACE</span><span>${store.state.draft?.format||'MD5'}</span><span>G${Number(store.state.draft?.game)||1}</span></div></div>
      <div class="content v25-content v26-content" data-page="${currentRoute}">${content}</div>
    </main>
  </div>`;
  document.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>location.hash=`#/${el.dataset.route}`);
  const drawer=document.querySelector('#sidebar'),toggle=document.querySelector('#menuToggle');
  const closeDrawer=()=>{drawer?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');document.body.classList.remove('v25-drawer-open');};
  toggle?.addEventListener('click',()=>{const open=!drawer?.classList.contains('open');drawer?.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('v25-drawer-open',open);});
  document.querySelector('#drawerClose')?.addEventListener('click',closeDrawer);
  document.querySelector('.v25-brand')?.addEventListener('click',()=>location.hash='#/home');
  document.querySelector('.v25-brand')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.hash='#/home';}});
  document.querySelector('#quickExport')?.addEventListener('click',()=>download(`FROMBOS-WORKSPACE-${new Date().toISOString().slice(0,10)}.json`,store.exportJSON()));

  const layer=document.querySelector('#v26CommandLayer'),input=document.querySelector('#v26CommandInput'),results=document.querySelector('#v26CommandResults');
  const renderResults=()=>{if(results)results.innerHTML=v26CommandResultsHTML(input?.value||'');};
  const openCommand=()=>{if(!layer)return;layer.hidden=false;layer.setAttribute('aria-hidden','false');document.body.classList.add('v26-command-open');renderResults();requestAnimationFrame(()=>input?.focus());};
  const closeCommand=()=>{if(!layer)return;layer.hidden=true;layer.setAttribute('aria-hidden','true');document.body.classList.remove('v26-command-open');};
  document.querySelector('[data-v26-command-open]')?.addEventListener('click',openCommand);
  document.querySelector('[data-v26-command-close]')?.addEventListener('click',closeCommand);
  input?.addEventListener('input',renderResults);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results?.querySelector('.v26-command-row');first?.click();}});
  layer?.addEventListener('click',e=>{
    if(e.target===layer){closeCommand();return;}
    const r=e.target.closest('[data-v26-command-route]');if(r){closeCommand();location.hash=`#/${r.dataset.v26CommandRoute}`;return;}
    const ch=e.target.closest('[data-v26-command-champion]');if(ch){closeCommand();location.hash=`#/champions?champion=${encodeURIComponent(ch.dataset.v26CommandChampion)}`;}
  });
  if(window.__FROMBOS_V26_KEY_HANDLER)document.removeEventListener('keydown',window.__FROMBOS_V26_KEY_HANDLER);
  window.__FROMBOS_V26_KEY_HANDLER=e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();layer?.hidden?openCommand():closeCommand();}
    else if(e.key==='Escape'&&!layer?.hidden)closeCommand();
  };
  document.addEventListener('keydown',window.__FROMBOS_V26_KEY_HANDLER);
}
function pageHead(kicker,title,desc,actions=''){
  const names=V25_HERO_CHAMPIONS[currentRoute]||['Jinx','Ahri'];
  const a=v25HeroAsset(currentRoute);
  const b=names.map(v25Asset).find(x=>x&&x!==a&&(x.splash||x.portrait))||null;
  const art=a?.splash||a?.portrait||'',art2=b?.splash||b?.portrait||'';
  const mod=MODULES.find(m=>m.id===currentRoute);
  const style=[art?`--v25-page-art:url('${escapeHTML(art)}')`:'',art2?`--v26-page-art-2:url('${escapeHTML(art2)}')`:''].filter(Boolean).join(';');
  return `<section class="page-head v25-page-hero v26-page-hero" data-v25-page="${currentRoute}" data-v26-page="${currentRoute}"${style?` style="${style}"`:''}>
    <div class="v25-page-copy v26-page-copy"><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p><div class="v25-page-actions">${actions}</div><div class="v26-page-signature"><span>${escapeHTML(mod?.group||'FROMBOS')}</span><i></i><span>WILD RIFT</span></div></div>
    <div class="v25-page-art v26-page-art-primary" aria-hidden="true"></div>
    <div class="v26-page-art-secondary" aria-hidden="true"></div>
    <div class="v26-page-grid" aria-hidden="true"></div>
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
