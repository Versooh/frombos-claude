import { store } from './store.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SOURCE={name:'Open Series',type:'OBSERVED_COMPETITIVE',event:'Open Series · 2º Split 2026',retrievedAt:'2026-09-14',statsUrl:'https://www.openseries.com.br/estatisticas/',rankingsUrl:'https://www.openseries.com.br/rankings/',teamsUrl:'https://www.openseries.com.br/equipes/'};
export const OPEN_SERIES_SNAPSHOT={
  source:SOURCE,
  summary:{games:152,series:118,championsUsed:124,avgDuration:'16:33',blueWinRate:46.7,redWinRate:53.3},
  teams:[
    {rank:1,name:'MyBad eSports',games:15,wins:14,losses:1,winRate:93.3,kda:6.77,avgGold:'12.351'},
    {rank:2,name:'RMD Gaming',games:9,wins:6,losses:3,winRate:66.7,kda:6.44,avgGold:'12.502'},
    {rank:3,name:'Team Hard Counter',games:13,wins:9,losses:4,winRate:69.2,kda:4.99,avgGold:'13.255'},
    {rank:4,name:'Aliança Unlucky',games:24,wins:16,losses:8,winRate:66.7,kda:4.74,avgGold:'12.673'},
    {rank:5,name:'VØID Rise',games:18,wins:11,losses:7,winRate:61.1,kda:4.74,avgGold:'12.555'},
    {rank:6,name:'Full House Gaming',games:15,wins:10,losses:5,winRate:66.7,kda:4.53,avgGold:'13.193'},
    {rank:7,name:'Project Phoenix',games:11,wins:7,losses:4,winRate:63.6,kda:4.35,avgGold:'12.423'},
    {rank:8,name:'SGC TEAM',games:11,wins:7,losses:4,winRate:63.6,kda:4.34,avgGold:'11.868'}
  ],
  players:[
    {rank:1,name:'FHG Aomine#Zone',team:'Full House Gaming',games:15,winRate:66.7,kda:15.38,favorite:'Jhin'},
    {rank:2,name:'Vitin#rlq',team:'RMD Gaming',games:9,winRate:66.7,kda:13.43,favorite:'Lucian'},
    {rank:5,name:'MB Leozin#Skilo',team:'MyBad eSports',games:15,winRate:93.3,kda:9.88,favorite:'Bard'},
    {rank:16,name:'MB Dell#xisL',team:'MyBad eSports',games:15,winRate:93.3,kda:6.56,favorite:'Gwen'},
    {rank:18,name:'MB Unskilled#leleo',team:'MyBad eSports',games:14,winRate:92.9,kda:6.19,favorite:'Varus'},
    {rank:23,name:'AL Gun#miuuy',team:'Aliança Unlucky',games:24,winRate:66.7,kda:5.60,favorite:'Lee Sin'}
  ],
  groups:[
    {group:'A',leader:'Aliança Unlucky',record:'6–0',runnerUp:'Minerva UFRJ · 3–3'},
    {group:'B',leader:'VØID Rise',record:'6–0',runnerUp:'NEXT Gaming · 4–2'},
    {group:'C',leader:'GOATZ VICTORY',record:'5–1 · TB1',runnerUp:'RMD Gaming · 5–1'},
    {group:'D',leader:'Ei Nerd Esports',record:'6–0',runnerUp:'MONORQUIA · 3–3 · TB1'},
    {group:'E',leader:'MyBad eSports',record:'6–0',runnerUp:'Avengers · 4–2'},
    {group:'F',leader:'Ta Triste?',record:'6–0',runnerUp:'Team Hard Counter · 4–2'},
    {group:'G',leader:'Full House Gaming',record:'5–1 · TB1',runnerUp:'Project Phoenix · 5–1'},
    {group:'H',leader:'SGC TEAM',record:'6–0',runnerUp:'TITANUS GAMING · 4–2'}
  ]
};

function ensureScouting(){store.update(s=>{s.scouting=s.scouting||{selectedTeam:'MyBad eSports',notes:{}};s.scouting.notes=s.scouting.notes||{};});}
function sourceBadge(){return `<span class="badge green">${SOURCE.type}</span><span class="snapshot-date">snapshot ${SOURCE.retrievedAt}</span>`;}
export function competitiveHTML(){const d=OPEN_SERIES_SNAPSHOT;return `<div class="competitive-center">
  <section class="competitive-hero card"><div><span class="eyebrow">COMPETITIVE CENTER</span><h2>${SOURCE.event}</h2><p>Snapshot oficial observado. Ranking, estatísticas e grupos são contexto competitivo — não tier automático.</p><div class="source-line">${sourceBadge()}<a href="${SOURCE.statsUrl}" target="_blank" rel="noreferrer">Fonte oficial ↗</a></div></div><div class="side-balance"><div><b>${d.summary.blueWinRate}%</b><span>BLUE</span></div><i></i><div><b>${d.summary.redWinRate}%</b><span>RED</span></div></div></section>
  <div class="competitive-kpis"><article><span>Jogos</span><b>${d.summary.games}</b></article><article><span>Séries</span><b>${d.summary.series}</b></article><article><span>Campeões usados</span><b>${d.summary.championsUsed}</b></article><article><span>Duração média</span><b>${d.summary.avgDuration}</b></article></div>
  <div class="competitive-grid"><section class="card"><div class="section-title"><div><span class="eyebrow">TEAM RANKING</span><h3>Desempenho observado</h3></div><a href="${SOURCE.rankingsUrl}" target="_blank" rel="noreferrer">Abrir ranking ↗</a></div><div class="competitive-table"><div class="ct-head"><span>#</span><span>Equipe</span><span>Jogos</span><span>WR</span><span>KDA</span></div>${d.teams.map(t=>`<button class="ct-row" data-scout-team="${esc(t.name)}"><span>${t.rank}</span><b>${esc(t.name)}</b><span>${t.games}</span><span>${t.winRate}%</span><span>${t.kda}</span></button>`).join('')}</div></section>
  <aside class="card"><span class="eyebrow">GROUP SNAPSHOT</span><h3>Fase de grupos</h3><div class="group-grid">${d.groups.map(g=>`<article><strong>${g.group}</strong><div><b>${esc(g.leader)}</b><span>${esc(g.record)}</span><small>${esc(g.runnerUp)}</small></div></article>`).join('')}</div></aside></div>
  <section class="card evidence-warning"><b>Como ler estes dados</b><p>Win rate descreve o resultado desta amostra. Não mede sozinho prioridade de draft, força de campeão ou qualidade futura da equipe. O FROMBOS cruza esses números com picks/bans e contexto somente quando essa evidência estiver materializada.</p></section>
</div>`;}

export function bindCompetitive(){document.querySelectorAll('[data-scout-team]').forEach(b=>b.onclick=()=>{ensureScouting();store.update(s=>s.scouting.selectedTeam=b.dataset.scoutTeam);location.hash='#/scouting';});}
export function scoutingHTML(){ensureScouting();const s=store.state.scouting;const team=OPEN_SERIES_SNAPSHOT.teams.find(t=>t.name===s.selectedTeam)||OPEN_SERIES_SNAPSHOT.teams[0];const players=OPEN_SERIES_SNAPSHOT.players.filter(p=>p.team===team.name);const notes=s.notes?.[team.name]||'';return `<div class="scouting-war-room">
  <section class="scout-command card"><div><span class="eyebrow">WAR ROOM · OBSERVED</span><h2>${esc(team.name)}</h2><p>Perfil baseado somente no snapshot público disponível. Tendências sem dataset suficiente permanecem UNKNOWN.</p></div><div class="scout-actions"><select id="scoutTeam" class="select">${OPEN_SERIES_SNAPSHOT.teams.map(t=>`<option ${t.name===team.name?'selected':''}>${esc(t.name)}</option>`).join('')}</select><button class="btn primary" id="scoutSetOpponent">Definir adversário</button><button class="btn" id="scoutOpenDraft">Abrir Draft</button></div></section>
  <div class="scout-kpis"><article><span>Ranking observado</span><b>#${team.rank}</b></article><article><span>Jogos</span><b>${team.games}</b></article><article><span>Record</span><b>${team.wins}–${team.losses}</b></article><article><span>Win rate da amostra</span><b>${team.winRate}%</b></article><article><span>KDA agregado</span><b>${team.kda}</b></article></div>
  <div class="scout-grid"><section class="card"><span class="eyebrow">PLAYERS OBSERVADOS</span><h3>Ranking público</h3>${players.length?`<div class="scout-player-list">${players.map(p=>`<article><div><b>${esc(p.name)}</b><span>${esc(p.favorite)} · favorito observado</span></div><div><strong>${p.kda}</strong><small>KDA · ${p.games} jogos</small></div></article>`).join('')}</div>`:'<div class="empty">Nenhum jogador desta equipe está no recorte reduzido importado nesta versão. O roster completo será ingerido separadamente.</div>'}</section>
  <aside class="card scout-unknown"><span class="eyebrow">DRAFT INTELLIGENCE</span><h3>O que ainda não sabemos</h3><div class="unknown-list"><div><b>First-phase priority</b><span>UNKNOWN</span></div><div><b>Ban tendencies</b><span>UNKNOWN</span></div><div><b>Blue/Red draft bias</b><span>UNKNOWN</span></div><div><b>Role-resolved champion pool</b><span>UNKNOWN</span></div><div><b>Fearless depth</b><span>UNKNOWN</span></div></div><p>Esses campos serão preenchidos quando a sequência detalhada de drafts e lineups estiver materializada, sem inferência artificial.</p></aside></div>
  <section class="card"><div class="section-title"><div><span class="eyebrow">COACH NOTES · USER_PRIVATE</span><h3>Hipóteses para preparar</h3></div>${sourceBadge()}</div><textarea id="scoutNotes" class="textarea" placeholder="Ex.: revisar first pick, investigar side preference, confirmar bans recorrentes...">${esc(notes)}</textarea><p class="muted">Notas privadas não viram fato observado. Elas são hipóteses do seu time para validar em VOD/draft.</p></section>
</div>`;}
export function bindScouting(rerender){ensureScouting();document.querySelector('#scoutTeam')?.addEventListener('change',e=>{store.update(s=>s.scouting.selectedTeam=e.target.value);rerender();});document.querySelector('#scoutSetOpponent')?.addEventListener('click',()=>{store.update(s=>s.team.opponent=s.scouting.selectedTeam);alert(`${store.state.scouting.selectedTeam} definido como adversário do workspace.`);});document.querySelector('#scoutOpenDraft')?.addEventListener('click',()=>location.hash='#/draft');document.querySelector('#scoutNotes')?.addEventListener('change',e=>{const team=store.state.scouting.selectedTeam;store.update(s=>s.scouting.notes[team]=e.target.value);});}
