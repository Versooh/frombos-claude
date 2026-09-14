import { MODULES, ROLES, CHAMPIONS, RECOVERED_COMPOSITIONS, DATA_SOURCES, DRAFT_ORDER } from './data.js';
import { store } from './store.js';

const app = document.querySelector('#app');
let currentRoute = location.hash.replace('#/','') || 'home';

const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const download = (name, text, type='application/json') => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); };
const navGroups = [...new Set(MODULES.map(m=>m.group))];

function shell(content) {
  const nav = navGroups.map(group => `<div class="nav-group"><div class="nav-group-title">${group}</div>${MODULES.filter(m=>m.group===group).map(m=>`<button class="nav-item ${m.id===currentRoute?'active':''}" data-route="${m.id}"><span>${m.icon}</span><span>${m.label}</span></button>`).join('')}</div>`).join('');
  const mod = MODULES.find(m=>m.id===currentRoute) || MODULES[0];
  app.innerHTML = `<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><div class="brand-mark">F</div><div><strong>FROMBOS</strong><small>Competitive Intelligence</small></div></div>${nav}<div class="footer-note">V2 · rebuild branch<br>Dados privados permanecem locais nesta fundação.</div></aside><main class="main"><header class="topbar"><div style="display:flex;align-items:center;gap:12px"><button class="btn mobile-toggle" id="menuToggle">☰</button><div class="crumb">FROMBOS / ${mod.label}</div></div><div class="top-actions"><span class="badge green">LOCAL WORKSPACE</span><button class="btn" id="quickExport">Backup</button></div></header><div class="content">${content}</div></main></div>`;
  bindShell();
}

function bindShell(){
  document.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>{ location.hash=`#/${el.dataset.route}`; });
  document.querySelector('#menuToggle')?.addEventListener('click',()=>document.querySelector('#sidebar').classList.toggle('open'));
  document.querySelector('#quickExport')?.addEventListener('click',()=>download(`FROMBOS-WORKSPACE-${new Date().toISOString().slice(0,10)}.json`,store.exportJSON()));
}

function pageHead(kicker,title,desc,actions=''){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div><div>${actions}</div></div>`}

function renderHome(){
  const configured = Object.values(store.state.team.players).filter(p=>p.name||p.pool.length).length;
  const saved = store.state.customComps.length;
  shell(`<section class="hero"><div><div class="eyebrow">FROMBOS V2 · FOUNDATION</div><h1>Visão. Leitura. Execução.</h1><p>Uma única plataforma para preparar o time, estruturar draft, estudar composições, revisar VODs, desenhar jogadas e transformar evidência em treino.</p><div class="top-actions" style="margin-top:18px"><button class="btn primary" data-go="draft">Abrir Draft Room</button><button class="btn info" data-go="team">Configurar time</button></div></div><div class="hero-panel"><div class="eyebrow">ESTADO DO WORKSPACE</div><h2>${escapeHTML(store.state.team.name)}</h2><p class="muted">${configured}/5 posições configuradas · ${saved} composições próprias · dados persistidos neste dispositivo.</p><span class="badge gold">REBUILD ATIVO</span></div></section><div class="kpis"><div class="metric"><small>Composições recuperadas</small><b>${RECOVERED_COMPOSITIONS.length}</b></div><div class="metric"><small>Campeões catalogados</small><b>${CHAMPIONS.length}</b></div><div class="metric"><small>Fontes registradas</small><b>${DATA_SOURCES.length}</b></div><div class="metric"><small>Draft atual</small><b>G${store.state.draft.game}</b></div></div><div class="grid cols-3">${['team','comps','draft','tactical','vod','data'].map(id=>{const m=MODULES.find(x=>x.id===id);return `<article class="card"><div class="eyebrow">${m.group}</div><h3>${m.label}</h3><p class="muted">${moduleDescription(id)}</p><button class="btn" data-go="${id}">Abrir módulo</button></article>`}).join('')}</div>`);
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.go}`);
}

function moduleDescription(id){return ({team:'Roster e champion pools que alimentam Draft e Composições.',comps:'Planos de jogo, arquétipos, condições de vitória e treino.',draft:'Pick/ban manual, série, Fearless e branches persistentes.',tactical:'Prancheta tática com desenho e estado salvo.',vod:'Player local com anotações por timestamp.',data:'Provenance, saúde das fontes e separação entre evidência e inferência.'})[id]||'Módulo em evolução.'}

function renderTeam(){
  const rows=ROLES.map(r=>{const p=store.state.team.players[r.id];return `<div class="role-row"><div class="role-label">${r.label}</div><input class="input" data-player="${r.id}" value="${escapeHTML(p.name)}" placeholder="Nome do jogador"><div><div class="pool-list">${p.pool.map(c=>`<span class="chip">${escapeHTML(c)} <button data-remove-pool="${r.id}" data-champ="${escapeHTML(c)}" style="all:unset;cursor:pointer">×</button></span>`).join('')}</div><div style="display:flex;gap:7px;margin-top:7px"><select class="select" data-pool-select="${r.id}"><option value="">Adicionar campeão...</option>${CHAMPIONS.filter(c=>!p.pool.includes(c)).map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select><button class="btn" data-add-pool="${r.id}">Adicionar</button></div></div></div>`}).join('');
  shell(`${pageHead('TEAM WORKSPACE','Meu time & pools','A champion pool privada é contexto do time. Ela alimenta composição, draft e profundidade Fearless.')}<div class="card"><div class="form-row"><label>Time<input class="input" id="teamName" value="${escapeHTML(store.state.team.name)}"></label><label>Próximo adversário<input class="input" id="opponent" value="${escapeHTML(store.state.team.opponent)}"></label></div><div class="section-title"><h2>Roster competitivo</h2><span class="badge blue">USER_PRIVATE</span></div>${rows}</div>`);
  document.querySelector('#teamName').onchange=e=>store.update(s=>s.team.name=e.target.value);
  document.querySelector('#opponent').onchange=e=>store.update(s=>s.team.opponent=e.target.value);
  document.querySelectorAll('[data-player]').forEach(i=>i.onchange=e=>store.update(s=>s.team.players[e.target.dataset.player].name=e.target.value));
  document.querySelectorAll('[data-add-pool]').forEach(b=>b.onclick=()=>{const role=b.dataset.addPool;const sel=document.querySelector(`[data-pool-select="${role}"]`);if(!sel.value)return;store.update(s=>s.team.players[role].pool.push(sel.value));renderTeam()});
  document.querySelectorAll('[data-remove-pool]').forEach(b=>b.onclick=()=>{store.update(s=>{const arr=s.team.players[b.dataset.removePool].pool;s.team.players[b.dataset.removePool].pool=arr.filter(x=>x!==b.dataset.champ)});renderTeam()});
}

function compCard(c){return `<article class="card"><div style="display:flex;justify-content:space-between;gap:8px"><div><div class="eyebrow">${escapeHTML(c.archetype)}</div><h3>${escapeHTML(c.name)}</h3></div><span class="badge gold">${escapeHTML(c.origin)}</span></div><div class="comp-lineup">${ROLES.map(r=>`<div class="champ-slot"><small>${r.label}</small><b>${escapeHTML(c.lineup[r.id]||'—')}</b></div>`).join('')}</div><p>${escapeHTML(c.plan)}</p><p class="muted"><b>Win condition:</b> ${escapeHTML(c.winCondition||'Ainda não documentada.')}</p><button class="btn info" data-comp-draft="${c.id}">Abrir no Draft</button></article>`}
function renderComps(){
  const all=[...RECOVERED_COMPOSITIONS,...store.state.customComps];
  shell(`${pageHead('COMPOSITION LAB','Composições','Planos de treino e composições são hipóteses estruturadas, não estatísticas de vitória.')}<div class="grid cols-2">${all.map(compCard).join('')}</div>`);
  document.querySelectorAll('[data-comp-draft]').forEach(b=>b.onclick=()=>{const c=all.find(x=>x.id===b.dataset.compDraft);store.update(s=>{s.draft.actions=[];s.draft.game=1;Object.values(c.lineup).forEach((champ,i)=>{const side='blue';const pickSteps=DRAFT_ORDER.map((x,idx)=>({x,idx})).filter(o=>o.x[0]===side&&o.x[1]==='pick');if(pickSteps[i]) s.draft.actions.push({step:pickSteps[i].idx,side:'blue',type:'pick',champ})})});location.hash='#/draft'});
}

function renderDraft(){
  const d=store.state.draft; const actions=[...d.actions].sort((a,b)=>a.step-b.step); const used=new Set(actions.map(a=>a.champ)); const next=[...Array(DRAFT_ORDER.length).keys()].find(i=>!actions.some(a=>a.step===i)); const step=next==null?null:DRAFT_ORDER[next];
  const side=(team,type)=>actions.filter(a=>a.side===team&&a.type===type);
  const slots=(team,type,count)=>Array.from({length:count},(_,i)=>`<div class="${type==='pick'?'pick-slot':'ban-slot'}">${escapeHTML(side(team,type)[i]?.champ||`${type.toUpperCase()} ${i+1}`)}</div>`).join('');
  shell(`${pageHead('DRAFT ROOM','Draft competitivo','Draft manual, persistente e conectado à champion pool. Fearless bloqueia escolhas já gastas em jogos anteriores.',`<span class="badge ${d.fearless?'red':'blue'}">FEARLESS ${d.fearless?'ON':'OFF'}</span>`)}<div class="card" style="margin-bottom:12px"><div class="form-row"><label>Game<select class="select" id="draftGame">${[1,2,3,4,5].map(n=>`<option ${n===d.game?'selected':''}>${n}</option>`).join('')}</select></label><label>Fearless<select class="select" id="fearless"><option value="off" ${!d.fearless?'selected':''}>Off</option><option value="on" ${d.fearless?'selected':''}>On</option></select></label></div>${step?`<div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:12px"><select class="select" id="draftChamp"><option value="">${step[0].toUpperCase()} · ${step[1].toUpperCase()} · selecionar campeão...</option>${CHAMPIONS.filter(c=>!used.has(c)).map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</select><button class="btn primary" id="confirmDraft">Confirmar</button></div>`:`<div class="empty" style="margin-top:12px">Draft concluído.</div>`}</div><div class="draft-board"><section class="card side blue"><div class="eyebrow">BLUE SIDE</div><h2>${escapeHTML(store.state.team.name)}</h2><h4>Bans</h4>${slots('blue','ban',5)}<h4>Picks</h4>${slots('blue','pick',5)}</section><aside class="card draft-sequence"><div class="eyebrow">SEQUÊNCIA</div>${DRAFT_ORDER.map((s,i)=>`<div class="sequence-step ${i===next?'current':actions.some(a=>a.step===i)?'done':''}">${i+1}. ${s[0].toUpperCase()} · ${s[1].toUpperCase()}</div>`).join('')}<button class="btn" id="undoDraft" style="width:100%;margin-top:8px">Desfazer última ação</button></aside><section class="card side red"><div class="eyebrow">RED SIDE</div><h2>${escapeHTML(store.state.team.opponent)}</h2><h4>Bans</h4>${slots('red','ban',5)}<h4>Picks</h4>${slots('red','pick',5)}</section></div>`);
  document.querySelector('#draftGame').onchange=e=>store.update(s=>s.draft.game=+e.target.value);
  document.querySelector('#fearless').onchange=e=>store.update(s=>s.draft.fearless=e.target.value==='on');
  document.querySelector('#confirmDraft')?.addEventListener('click',()=>{const champ=document.querySelector('#draftChamp').value;if(!champ)return;store.update(s=>s.draft.actions.push({step:next,side:step[0],type:step[1],champ}));renderDraft()});
  document.querySelector('#undoDraft').onclick=()=>{store.update(s=>s.draft.actions.pop());renderDraft()};
}

function renderTactical(){
  shell(`${pageHead('TACTICAL BOARD','Sala tática','Fundação funcional da prancheta. O mapa canônico de Wild Rift será inserido somente após validação do asset; não vamos usar Summoner\'s Rift genérico.')}<div class="toolbar"><button class="btn" data-color="#147aff">Azul</button><button class="btn" data-color="#ff5364">Vermelho</button><button class="btn" data-color="#f0c97a">Objetivo</button><button class="btn" id="clearCanvas">Limpar</button></div><div class="canvas-wrap"><canvas id="tacticalCanvas"></canvas><div style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;color:#60729c"><div><b>MAPA WILD RIFT PENDENTE DE ASSET VALIDADO</b><br><small>Canvas e persistência já funcionais.</small></div></div></div>`);
  setupDrawing(document.querySelector('#tacticalCanvas'),'tactical');
}

function setupDrawing(canvas,key){
  const rect=()=>canvas.getBoundingClientRect(); let color='#147aff',drawing=false,last=null; const ctx=canvas.getContext('2d');
  const resize=()=>{const r=rect();canvas.width=Math.max(1,r.width*devicePixelRatio);canvas.height=Math.max(1,r.height*devicePixelRatio);ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); redraw()};
  const redraw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);for(const s of store.state.tactical.strokes){ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(p.x*rect().width,p.y*rect().height):ctx.moveTo(p.x*rect().width,p.y*rect().height));ctx.stroke()}};
  const pos=e=>{const r=rect();const t=e.touches?.[0]||e;return{x:(t.clientX-r.left)/r.width,y:(t.clientY-r.top)/r.height}};
  canvas.onpointerdown=e=>{drawing=true;last={color,points:[pos(e)]}}; canvas.onpointermove=e=>{if(!drawing)return;last.points.push(pos(e));redraw();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();last.points.forEach((p,i)=>i?ctx.lineTo(p.x*rect().width,p.y*rect().height):ctx.moveTo(p.x*rect().width,p.y*rect().height));ctx.stroke()}; canvas.onpointerup=()=>{if(last)store.update(s=>s.tactical.strokes.push(last));drawing=false;last=null};
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>color=b.dataset.color); document.querySelector('#clearCanvas').onclick=()=>{store.update(s=>s.tactical.strokes=[]);redraw()}; window.addEventListener('resize',resize,{once:true}); resize();
}

function renderVod(){
  shell(`${pageHead('VOD REVIEW','Revisão de VOD','Abra um vídeo localmente, pause e registre observações. O arquivo não é enviado nesta fundação.')}<div class="card"><input type="file" id="vodFile" accept="video/*" class="input"><div class="video-stage" style="margin-top:12px"><video id="vodVideo" controls></video><canvas id="vodCanvas"></canvas></div><div class="form-row" style="margin-top:12px"><input class="input" id="vodNote" placeholder="Observação no timestamp atual"><button class="btn primary" id="saveVodNote">Salvar anotação</button></div><div class="section-title"><h2>Anotações</h2></div><div id="vodNotes">${store.state.vod.reviews.length?store.state.vod.reviews.map((n,i)=>`<div class="card" style="margin-bottom:8px"><b>${formatTime(n.time)}</b> · ${escapeHTML(n.note)}</div>`).join(''):'<div class="empty">Nenhuma anotação ainda.</div>'}</div></div>`);
  const v=document.querySelector('#vodVideo'); document.querySelector('#vodFile').onchange=e=>{const f=e.target.files[0];if(f)v.src=URL.createObjectURL(f)}; document.querySelector('#saveVodNote').onclick=()=>{const note=document.querySelector('#vodNote').value.trim();if(!note)return;store.update(s=>s.vod.reviews.push({time:v.currentTime||0,note,createdAt:new Date().toISOString()}));renderVod()};
}
const formatTime=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;

function renderData(){
  shell(`${pageHead('DATA CENTER','Provenance & fontes','O FROMBOS separa dados oficiais, observados, curados e cálculos estruturais. Ausência de evidência continua sendo UNKNOWN.')}<div class="card"><div class="source-row"><b>Fonte</b><b>Tipo</b><b>Status</b><b>Domínios</b></div>${DATA_SOURCES.map(s=>`<div class="source-row"><div><b>${s.name}</b></div><div><span class="badge blue">${s.type}</span></div><div>${s.status}</div><div class="muted">${s.domains.join(' · ')}</div></div>`).join('')}</div>`)
}

function renderSettings(){
  shell(`${pageHead('SISTEMA','Configurações & backup','Controle o workspace local, exporte um backup ou restaure um arquivo previamente salvo.')}<div class="grid cols-2"><div class="card"><h3>Backup</h3><p class="muted">Exporta time, pools, draft, VOD notes, tactical board e preferências.</p><button class="btn primary" id="exportAll">Exportar workspace</button></div><div class="card"><h3>Restaurar</h3><input type="file" class="input" id="importFile" accept="application/json"><p class="muted">A restauração substitui o estado local atual.</p></div><div class="card"><h3>Reset local</h3><p class="muted">Limpa somente esta fundação V2 neste navegador.</p><button class="btn" id="resetAll">Resetar</button></div></div>`);
  document.querySelector('#exportAll').onclick=()=>download('FROMBOS-WORKSPACE.json',store.exportJSON()); document.querySelector('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{store.importJSON(await f.text());alert('Workspace restaurado.');renderSettings()}catch(err){alert('Arquivo inválido: '+err.message)}}; document.querySelector('#resetAll').onclick=()=>{if(confirm('Resetar o workspace V2 local?')){store.reset();renderSettings()}};
}

function renderPlaceholder(id){const m=MODULES.find(x=>x.id===id);shell(`${pageHead(m.group,m.label,'Estrutura criada e conectada ao shell V2. A engine específica deste módulo entra na fase correspondente do plano de execução.')}<div class="empty">Módulo preparado para implementação funcional na próxima fase.</div>`)}

function route(){currentRoute=location.hash.replace('#/','')||'home';const routes={home:renderHome,team:renderTeam,comps:renderComps,draft:renderDraft,tactical:renderTactical,vod:renderVod,data:renderData,settings:renderSettings};(routes[currentRoute]||(()=>renderPlaceholder(currentRoute)))()}
window.addEventListener('hashchange',route); store.addEventListener('change',()=>{}); route();
