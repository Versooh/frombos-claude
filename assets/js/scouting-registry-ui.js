import { store } from './store.js';
import { OPEN_SERIES_SCOUTING_META, playersForTeam, lineupForTeam } from './open-series-scouting.generated.js';
import { portraitHTML } from './champion-intelligence.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selectedTeam=()=>store.state.scouting?.selectedTeam||store.state.team?.opponent||'';
const playerCard=p=>`<article class="sc-reg-player"><div class="sc-reg-fav">${p.favorite?portraitHTML(p.favorite,'sc-reg-portrait'):'<span class="portrait-fallback">?</span>'}</div><div class="sc-reg-copy"><b>${esc(p.name)}</b><span>${p.games} jogos · ${p.winRate.toFixed(1)}% WR · ${p.kda.toFixed(2)} KDA</span><small>${p.totalK}/${p.totalD}/${p.totalA} total · gold médio ${esc(p.avgGold)} · favorito observado: ${esc(p.favorite||'UNKNOWN')}</small></div><strong>#${p.rank}</strong></article>`;
function apply(){
  if((location.hash.replace('#/','').split('?')[0]||'home')!=='scouting')return;
  const root=document.querySelector('.scouting-war-room');if(!root||root.querySelector('[data-sc-registry]'))return;
  const team=selectedTeam();if(!team)return;
  const lineup=lineupForTeam(team),players=playersForTeam(team);
  const section=document.createElement('section');section.className='card sc-registry';section.dataset.scRegistry='1';
  section.innerHTML=`<div class="section-title"><div><span class="eyebrow">SCOUTING REGISTRY · OBSERVED</span><h3>${esc(team)} · lineup e ranking público</h3></div><div><span class="badge green">${esc(OPEN_SERIES_SCOUTING_META.type)}</span><span class="snapshot-date">${OPEN_SERIES_SCOUTING_META.playersCoverage} jogadores · ${OPEN_SERIES_SCOUTING_META.teamsCoverage} equipes neste build</span></div></div><div class="sc-reg-layout"><div><h4>Lineup registrada</h4>${lineup.length?`<div class="sc-lineup-list">${lineup.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<div class="empty">Lineup completa ainda não materializada no fallback atual para esta equipe.</div>'}</div><div><h4>Jogadores observados no ranking</h4>${players.length?`<div class="sc-reg-player-list">${players.map(playerCard).join('')}</div>`:'<div class="empty">Nenhum jogador desta equipe materializado no fallback atual. O deploy tenta atualizar o ranking completo automaticamente.</div>'}</div></div><div class="sc-reg-note"><b>Limite da evidência</b><p>“Campeão favorito” é o campo publicado pelo ranking do torneio. Não representa champion pool completo, prioridade de draft, blind pick ou profundidade Fearless. Esses conceitos só serão preenchidos quando existirem drafts/lineups por jogo.</p></div><div class="source-line"><a href="${OPEN_SERIES_SCOUTING_META.rankingsUrl}" target="_blank" rel="noreferrer">Rankings ↗</a><a href="${OPEN_SERIES_SCOUTING_META.teamsUrl}" target="_blank" rel="noreferrer">Equipes/lineups ↗</a></div>`;
  const command=root.querySelector('.scout-command');command?.after(section)??root.prepend(section);
}
const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(apply));requestAnimationFrame(apply);
