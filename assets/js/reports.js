import { store } from './store.js';
import { ROLES, RECOVERED_COMPOSITIONS } from './data.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=v=>{try{return new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '—';}};
function snapshot(){
 const s=store.state;
 const players=Object.entries(s.team?.players||{});
 const configured=players.filter(([,p])=>p.name||p.pool?.length).length;
 const poolEntries=players.reduce((n,[,p])=>n+(p.pool?.length||0),0);
 const uniquePool=new Set(players.flatMap(([,p])=>p.pool||[])).size;
 const games=Object.entries(s.draft?.games||{}).filter(([,g])=>(g.actions||[]).length);
 const allActions=games.flatMap(([,g])=>g.actions||[]);
 const picks=allActions.filter(x=>x.type==='pick').length,bans=allActions.filter(x=>x.type==='ban').length;
 const vod=s.vod?.reviews||[];const vodCats={};for(const n of vod){const k=n.category||'Sem categoria';vodCats[k]=(vodCats[k]||0)+1;}
 const scenarios=Array.isArray(s.tactical?.scenarios)?s.tactical.scenarios:[];
 const tacticalElements=scenarios.reduce((n,x)=>n+(x.markers?.length||0)+(x.paths?.length||0),0);
 const drills=s.training?.sessions||[];
 const drillTypes={};for(const x of drills){const k=x.type||'Treino';drillTypes[k]=(drillTypes[k]||0)+1;}
 return {configured,poolEntries,uniquePool,games,allActions,picks,bans,vod,vodCats,scenarios,tacticalElements,drills,drillTypes,players,s};
}
function metric(label,value,note){return `<article class="report-metric"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(note)}</small></article>`;}
function bars(obj,empty='Sem dados ainda.'){const rows=Object.entries(obj).sort((a,b)=>b[1]-a[1]);if(!rows.length)return `<div class="empty">${esc(empty)}</div>`;const max=Math.max(...rows.map(x=>x[1]),1);return `<div class="report-bars">${rows.map(([k,n])=>`<div class="report-bar"><div><b>${esc(k)}</b><span>${n}</span></div><i><em style="width:${Math.max(4,n/max*100)}%"></em></i></div>`).join('')}</div>`;}
function poolTable(players){return `<div class="report-pool-table"><div class="rpt-head"><span>Role</span><span>Jogador</span><span>Pool</span><span>Profundidade</span></div>${ROLES.map(role=>{const p=Object.fromEntries(players)[role.id]||{name:'',pool:[]};return `<div class="rpt-row"><b>${esc(role.label)}</b><span>${esc(p.name||'Não configurado')}</span><span>${(p.pool||[]).map(x=>`<small>${esc(x)}</small>`).join('')||'<small>—</small>'}</span><strong>${p.pool?.length||0}</strong></div>`}).join('')}</div>`;}
function recentActivity(r){const events=[];for(const n of r.vod)events.push({at:n.createdAt,label:`VOD · ${n.category||'Nota'}`,text:n.note||'Quadro tático'});for(const d of r.drills)events.push({at:d.createdAt,label:`Treino · ${d.type||'Drill'}`,text:[d.objective,d.call].filter(Boolean).join(' · ')||'Sessão salva'});for(const [game,g] of r.games)events.push({at:g.updatedAt,label:`Draft · G${game}`,text:`${(g.actions||[]).length} ações registradas`});return events.filter(x=>x.at).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,8);}
export function reportsHTML(){
 const r=snapshot(),activity=recentActivity(r);const completeDrafts=r.games.filter(([,g])=>(g.actions||[]).length>=20).length;
 return `<div class="reports-center">
  <section class="report-hero card"><div><span class="eyebrow">OPERATING REPORT</span><h2>${esc(r.s.team?.name||'Meu time')}</h2><p>Resumo gerado exclusivamente a partir do workspace local. Contagens representam atividade registrada; não são notas de habilidade.</p></div><div class="report-updated"><span>última atualização</span><b>${fmtDate(r.s.meta?.updatedAt)}</b></div></section>
  <div class="report-metrics">${metric('Roster configurado',`${r.configured}/5`,'posições com nome ou pool')}${metric('Champion pool',r.uniquePool,'campeões únicos')}${metric('Drafts com estado',r.games.length,`${completeDrafts} concluídos`)}${metric('VOD notes',r.vod.length,'timestamps registrados')}${metric('Cenários táticos',r.scenarios.length,`${r.tacticalElements} elementos`)}${metric('Drills salvos',r.drills.length,'sessões do Coach Mode')}</div>
  <div class="reports-grid">
   <section class="card"><div class="section-title"><div><span class="eyebrow">TEAM DEPTH</span><h3>Champion pools</h3></div><span class="badge blue">USER_PRIVATE</span></div>${poolTable(r.players)}<p class="report-footnote">Profundidade = quantidade cadastrada no pool local. Não representa proficiência automaticamente.</p></section>
   <section class="card"><div class="section-title"><div><span class="eyebrow">DRAFT ACTIVITY</span><h3>Séries & decisões</h3></div><span class="badge gold">${r.picks} picks · ${r.bans} bans</span></div>${r.games.length?`<div class="draft-report-list">${r.games.map(([game,g])=>{const a=g.actions||[];return `<article><div><b>G${game}</b><span>${a.length}/20 ações</span></div><i><em style="width:${Math.min(100,a.length/20*100)}%"></em></i><small>${a.filter(x=>x.type==='pick').map(x=>esc(x.champ)).join(' · ')||'sem picks'}</small></article>`}).join('')}</div>`:'<div class="empty">Nenhum draft salvo ainda.</div>'}</section>
   <section class="card"><div class="section-title"><div><span class="eyebrow">VOD REVIEW</span><h3>Padrões anotados</h3></div></div>${bars(r.vodCats,'Nenhuma categoria de VOD registrada.')}</section>
   <section class="card"><div class="section-title"><div><span class="eyebrow">COACH MODE</span><h3>Drills registrados</h3></div></div>${bars(r.drillTypes,'Nenhum drill salvo ainda.')}<div class="report-link-row"><button class="btn" data-report-go="training">Abrir Treinos</button><button class="btn" data-report-go="vod">Abrir VOD</button></div></section>
  </div>
  <section class="card"><div class="section-title"><div><span class="eyebrow">RECENT ACTIVITY</span><h3>Linha operacional</h3></div><span class="badge blue">LOCAL</span></div>${activity.length?`<div class="activity-list">${activity.map(x=>`<article><time>${fmtDate(x.at)}</time><b>${esc(x.label)}</b><p>${esc(x.text)}</p></article>`).join('')}</div>`:'<div class="empty">A atividade começa a aparecer quando Draft, VOD e Treinos forem usados.</div>'}</section>
  <section class="card report-context"><div><b>Composições de treino recuperadas</b><span>${RECOVERED_COMPOSITIONS.length}</span></div><p>Essas composições são propostas de treino/editoriais recuperadas do projeto. Elas não entram como vitórias, jogos ou performance do seu time.</p></section>
 </div>`;
}
export function bindReports(){document.querySelectorAll('[data-report-go]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.reportGo}`);}
