// FROMBOS V22.5 — Opponent Prep Workspace.
// Read-only experience layer over already materialized scouting evidence.
// OBSERVED_COMPETITIVE facts, FROMBOS_STRUCTURAL tags and UNKNOWN fields stay separate.
import { store } from './store.js';
import { OPEN_SERIES_SNAPSHOT } from './competitive-intelligence.js';
import { OPEN_SERIES_SCOUTING_META, OPEN_SERIES_PLAYERS, OPEN_SERIES_LINEUPS } from './open-series-scouting.generated.js';
import { OPEN_SERIES_RESULTS_META, OPEN_SERIES_MATCHES } from './open-series-results.generated.js';
import { portraitHTML } from './champion-intelligence.js';
import { championFeatures, structuralLabel } from './structural-intelligence.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const same=(a,b)=>norm(a)===norm(b);
const selectedTeam=()=>store.state.scouting?.selectedTeam||store.state.team?.opponent||OPEN_SERIES_SNAPSHOT.teams[0]?.name||'';
const playersFor=team=>OPEN_SERIES_PLAYERS.filter(p=>same(p.team,team)).sort((a,b)=>a.rank-b.rank);
const lineupFor=team=>Object.entries(OPEN_SERIES_LINEUPS).find(([name])=>same(name,team))?.[1]||[];
const matchesFor=team=>OPEN_SERIES_MATCHES.filter(m=>same(m.teamA,team)||same(m.teamB,team));
const teamStat=team=>OPEN_SERIES_SNAPSHOT.teams.find(t=>same(t.name,team))||null;
function teamResult(match,team){const left=same(match.teamA,team),own=left?match.scoreA:match.scoreB,opp=left?match.scoreB:match.scoreA;return {own,opp,opponent:left?match.teamB:match.teamA,result:own>opp?'W':own<opp?'L':'D'};}
function stateRow(label,status,detail){return `<div class="v22-scout-evidence-row" data-status="${esc(status)}"><span>${esc(label)}</span><b>${esc(status)}</b><small>${esc(detail)}</small></div>`;}
function evidenceMatrix(team){
  const stat=teamStat(team),players=playersFor(team),lineup=lineupFor(team),matches=matchesFor(team);
  return `<section class="v22-scout-panel"><div class="v22-scout-panel-head"><div><span>EVIDENCE MATRIX</span><h3>O que sabemos antes do Draft</h3></div><small>UNKNOWN não vira tendência</small></div><div class="v22-scout-evidence-grid">
    ${stateRow('Ranking da equipe',stat?'OBSERVED_COMPETITIVE':'UNKNOWN',stat?`#${stat.rank} · ${stat.games} jogos no snapshot`:'Sem linha compatível no snapshot atual')}
    ${stateRow('Lineup pública',lineup.length?'OBSERVED_COMPETITIVE':'UNKNOWN',lineup.length?`${lineup.length} nomes materializados`:'Lineup não materializada para esta equipe')}
    ${stateRow('Favoritos publicados',players.length?'OBSERVED_COMPETITIVE':'UNKNOWN',players.length?`${players.length} jogadores com campo favorito observado`:'Sem jogadores compatíveis no recorte atual')}
    ${stateRow('Resultados publicados',matches.length?'OBSERVED_COMPETITIVE':'UNKNOWN',matches.length?`${matches.length} confrontos publicados`:'Sem confrontos materializados')}
    ${stateRow('Sequência pick/ban','UNKNOWN','A fonte atual não expõe draft por jogo')}
    ${stateRow('First-phase priority','UNKNOWN','Exige sequência detalhada de drafts')}
    ${stateRow('Ban tendencies','UNKNOWN','Não inferido a partir de favorito ou resultado')}
    ${stateRow('Blue/Red draft bias','UNKNOWN','Side do placar não identifica side do Draft')}
    ${stateRow('Role-resolved pool','UNKNOWN','Favorito publicado não equivale a champion pool')}
    ${stateRow('Fearless depth','UNKNOWN','Exige série e picks por jogo')}
  </div></section>`;
}
function signalCard(player){
  const champ=player.favorite||'';const features=champ?championFeatures(champ):[];
  return `<article class="v22-scout-signal"><div class="v22-scout-signal-art">${champ?portraitHTML(champ,'v22-scout-signal-img'):'<span>?</span>'}</div><div><small>OBSERVED FAVORITE</small><h4>${esc(champ||'UNKNOWN')}</h4><b>${esc(player.name)}</b><p>${player.games} jogos no ranking · campo favorito publicado</p><div>${features.slice(0,4).map(k=>`<span>${esc(structuralLabel(k))}</span>`).join('')||'<span>Sem tag estrutural</span>'}</div></div></article>`;
}
function championSignals(team){
  const players=playersFor(team);
  return `<section class="v22-scout-panel"><div class="v22-scout-panel-head"><div><span>OBSERVED CHAMPION SIGNALS</span><h3>Campos favoritos publicados</h3></div><small>não é prioridade de ban</small></div>${players.length?`<div class="v22-scout-signals">${players.map(signalCard).join('')}</div>`:'<div class="v22-scout-empty">Nenhum favorito observado materializado para esta equipe. O campo permanece UNKNOWN.</div>'}<p class="v22-scout-boundary">Esses campeões vêm do campo <b>favorito observado</b> do ranking público. Eles não são tratados como champion pool completo, blind pick, first pick ou ban priority.</p></section>`;
}
function matchPulse(team){
  const matches=matchesFor(team).map(m=>({...m,...teamResult(m,team)}));
  const wins=matches.filter(x=>x.result==='W').length,losses=matches.filter(x=>x.result==='L').length,draws=matches.filter(x=>x.result==='D').length;
  const rows=matches.slice(-6).reverse();
  return `<section class="v22-scout-panel"><div class="v22-scout-panel-head"><div><span>PUBLISHED MATCH PULSE</span><h3>Contexto de resultados</h3></div><small>${matches.length?`${wins}-${losses}${draws?`-${draws}`:''} W-L${draws?'-D':''}`:'UNKNOWN'}</small></div>${rows.length?`<div class="v22-scout-match-list">${rows.map(x=>`<article data-result="${x.result}"><b>${x.result}</b><span>vs ${esc(x.opponent)}</span><strong>${x.own} × ${x.opp}</strong><small>${esc(x.group)}</small></article>`).join('')}</div>`:'<div class="v22-scout-empty">Sem confrontos publicados compatíveis neste snapshot.</div>'}<p class="v22-scout-boundary">Ordem de publicação não é tratada como cronologia de partidas. Resultados não geram tendência de Draft sem evidência adicional.</p></section>`;
}
function validationQueue(){
  const items=[
    ['First-phase priority','Validar em drafts detalhados por jogo'],
    ['Ban tendencies','Materializar bans por fase e side'],
    ['Role-resolved champion pool','Cruzar lineup + picks por função'],
    ['Side draft bias','Confirmar side real do Draft em cada jogo'],
    ['Fearless depth','Materializar série e campeões já utilizados']
  ];
  return `<section class="v22-scout-panel"><div class="v22-scout-panel-head"><div><span>VALIDATION QUEUE</span><h3>Próximas evidências necessárias</h3></div><small>UNKNOWN → VALIDATE</small></div><div class="v22-scout-queue">${items.map(([title,task],i)=>`<article><i>${String(i+1).padStart(2,'0')}</i><div><b>${esc(title)}</b><span>${esc(task)}</span></div><em>UNKNOWN</em></article>`).join('')}</div></section>`;
}
function html(team){
  const stat=teamStat(team),players=playersFor(team),lineup=lineupFor(team),matches=matchesFor(team);
  return `<section class="v22-scout-workspace v22-reveal" data-v22-scout-workspace data-team="${esc(team)}">
    <header class="v22-scout-head"><div><span>OPPONENT PREP WORKSPACE · V22.5</span><h2>${esc(team)}</h2><p>Scouting acionável com limites visíveis: fatos observados, leitura estrutural e campos ainda desconhecidos permanecem separados.</p></div><div class="v22-scout-badges"><b>WILD RIFT ONLY</b><span>OBSERVED_COMPETITIVE</span><span>FROMBOS_STRUCTURAL</span><span>UNKNOWN STAYS UNKNOWN</span></div></header>
    <div class="v22-scout-overview"><article><small>RANKING</small><b>${stat?`#${stat.rank}`:'UNKNOWN'}</b><span>${stat?`${stat.wins}-${stat.losses} · ${stat.games} jogos`:'sem snapshot compatível'}</span></article><article><small>LINEUP</small><b>${lineup.length||'UNKNOWN'}</b><span>${lineup.length?'nomes publicados':'não materializada'}</span></article><article><small>FAVORITOS</small><b>${players.length||'UNKNOWN'}</b><span>${players.length?'campos observados':'sem recorte compatível'}</span></article><article><small>CONFRONTOS</small><b>${matches.length||'UNKNOWN'}</b><span>${matches.length?'resultados publicados':'sem materialização'}</span></article></div>
    <div class="v22-scout-actions"><button type="button" class="btn primary" data-v22-scout-go="draft">Abrir Draft Analyzer</button><button type="button" class="btn" data-v22-scout-go="vod">Validar em VOD</button><button type="button" class="btn" data-v22-scout-go="tactical">Preparar mapa</button></div>
    <div class="v22-scout-layout">${evidenceMatrix(team)}${championSignals(team)}${matchPulse(team)}${validationQueue()}</div>
    <footer><b>Fonte principal:</b> ${esc(OPEN_SERIES_SCOUTING_META.source)} · ${esc(OPEN_SERIES_SCOUTING_META.retrievedAt)} / resultados ${esc(OPEN_SERIES_RESULTS_META.retrievedAt)}. Nenhuma prioridade de Draft é criada a partir de campos que não existem na fonte.</footer>
  </section>`;
}
function bind(root){root.querySelectorAll('[data-v22-scout-go]').forEach(btn=>btn.addEventListener('click',()=>{location.hash=`#/${btn.dataset.v22ScoutGo}`;}));}
function apply(force=false){
  if(route()!=='scouting')return;
  const war=document.querySelector('.scouting-war-room');if(!war){requestAnimationFrame(()=>requestAnimationFrame(()=>apply(force)));return;}
  const team=selectedTeam();if(!team)return;
  const old=war.querySelector('[data-v22-scout-workspace]');
  if(old&&old.dataset.team===team&&!force)return;
  old?.remove();
  const command=war.querySelector('.scout-command');
  command?.insertAdjacentHTML('afterend',html(team));
  const root=war.querySelector('[data-v22-scout-workspace]');if(root)bind(root);
}
const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(()=>apply());else window.addEventListener('load',()=>apply());
window.addEventListener('hashchange',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>apply(true))));
queueMicrotask(()=>apply());
window.FROMBOS_V22_SCOUTING={apply};
