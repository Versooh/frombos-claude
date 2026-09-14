import { store } from './store.js';
import { OPEN_SERIES_RESULTS_META, matchesForTeam, resultForTeam } from './open-series-results.generated.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selectedTeam=()=>store.state.scouting?.selectedTeam||store.state.team?.opponent||'';
function teamView(m,team){const left=m.teamA===team,own=left?m.scoreA:m.scoreB,opp=left?m.scoreB:m.scoreA,opponent=left?m.teamB:m.teamA,result=resultForTeam(m,team);return{own,opp,opponent,result};}
function apply(){
  if((location.hash.replace('#/','').split('?')[0]||'home')!=='scouting')return;
  const root=document.querySelector('.scouting-war-room');if(!root||root.querySelector('[data-os-results]'))return;
  const team=selectedTeam();if(!team)return;const matches=matchesForTeam(team);if(!matches.length)return;
  const views=matches.map(m=>({...m,...teamView(m,team)}));const wins=views.filter(x=>x.result==='W').length,losses=views.filter(x=>x.result==='L').length,draws=views.filter(x=>x.result==='D').length;
  const section=document.createElement('section');section.className='card sc-results';section.dataset.osResults='1';
  section.innerHTML=`<div class="section-title"><div><span class="eyebrow">MATCH HISTORY · OBSERVED</span><h3>Confrontos publicados</h3></div><div class="sc-results-record"><strong>${wins}-${losses}${draws?`-${draws}`:''}</strong><span>W-L${draws?'-D':''} · ${matches.length} séries</span></div></div><div class="sc-results-list">${views.map(v=>`<article class="sc-result-row ${v.result.toLowerCase()}"><span class="sc-result-badge">${v.result}</span><div><b>${esc(team)}</b><small>vs ${esc(v.opponent)} · ${esc(v.group)}</small></div><strong>${v.own} × ${v.opp}</strong></article>`).join('')}</div><div class="sc-reg-note"><b>Escopo da evidência</b><p>Esta página pública informa confrontos e placares em ordem de publicação, mas não fornece data por partida nem sequência de picks/bans. Por isso o FROMBOS não chama esta lista de “últimos jogos” e não deriva first phase, side bias ou Fearless destes resultados.</p></div><a class="meta-source" href="${OPEN_SERIES_RESULTS_META.url}" target="_blank" rel="noreferrer">Fonte pública · Open Series Confrontos ↗</a>`;
  const registry=root.querySelector('[data-sc-registry]');registry?.after(section)??root.querySelector('.scout-command')?.after(section)??root.appendChild(section);
}
const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(apply));requestAnimationFrame(apply);
