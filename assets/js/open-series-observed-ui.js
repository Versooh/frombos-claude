import { OPEN_SERIES_CHAMPION_META, OPEN_SERIES_CHAMPIONS, openSeriesChampion, topOpenSeries } from './open-series-champions.generated.js';
import { portraitHTML } from './champion-intelligence.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>Number(n??0).toFixed(1)+'%';
const selectedChampion=()=>{const raw=location.hash.split('?')[1]||'';return new URLSearchParams(raw).get('champion')||null;};
const sampleLabel=row=>row.picks<5?'AMOSTRA MUITO PEQUENA':row.picks<15?'AMOSTRA PEQUENA':'AMOSTRA OBSERVADA';
const champCard=row=>`<article class="os-champ-card"><div class="os-champ-art">${portraitHTML(row.name,'os-portrait')}</div><div class="os-champ-copy"><b>${esc(row.name)}</b><span>${row.picks} picks · ${row.bans} bans</span></div><div class="os-champ-rates"><strong>${pct(row.pickRate)}</strong><small>pick</small><strong>${pct(row.banRate)}</strong><small>ban</small></div></article>`;

function championObserved(){
  const root=document.querySelector('.champion-intelligence');
  if(!root||root.querySelector('[data-os-champion-observed]'))return;
  const name=selectedChampion();if(!name)return;
  const row=openSeriesChampion(name);if(!row)return;
  const host=root.querySelector('.ci-tabs');if(!host)return;
  const card=document.createElement('article');card.className='intel-state os-observed-state';card.dataset.osChampionObserved='1';
  card.innerHTML=`<div class="intel-state-head"><b>Open Series · observado</b><span class="badge red">OBSERVED_COMPETITIVE</span></div><div class="os-observed-kpis"><div><strong>${row.picks}</strong><span>picks · ${pct(row.pickRate)}</span></div><div><strong>${row.bans}</strong><span>bans · ${pct(row.banRate)}</span></div><div><strong>${pct(row.winRate)}</strong><span>${row.wins}W / ${row.losses}L</span></div><div><strong>${row.kda.toFixed(2)}</strong><span>KDA médio</span></div></div><p><b>${sampleLabel(row)}.</b> Estatística agregada do torneio; não é role-resolved e não representa matchup. WR usa somente os ${row.picks} jogos em que o campeão foi escolhido.</p><a class="meta-source" href="${OPEN_SERIES_CHAMPION_META.url}" target="_blank" rel="noreferrer">Open Series · Campeões ↗</a>`;
  host.appendChild(card);
}

function competitiveObserved(){
  const root=document.querySelector('.competitive-center');
  if(!root||root.querySelector('[data-os-priority]'))return;
  const picks=topOpenSeries('picks',8),bans=topOpenSeries('bans',8);
  const section=document.createElement('section');section.className='card os-priority';section.dataset.osPriority='1';
  section.innerHTML=`<div class="section-title"><div><span class="eyebrow">CHAMPION PRIORITY · OBSERVED</span><h3>Prioridade global do torneio</h3></div><div class="source-line"><span class="badge red">${esc(OPEN_SERIES_CHAMPION_META.type)}</span><span class="snapshot-date">${OPEN_SERIES_CHAMPION_META.coverage}/124 campeões materializados neste build</span></div></div><div class="os-priority-grid"><div><h4>Mais escolhidos</h4><div class="os-champ-list">${picks.map(champCard).join('')}</div></div><div><h4>Mais banidos</h4><div class="os-champ-list">${bans.map(champCard).join('')}</div></div></div><p class="muted">Taxas são as publicadas pela fonte para o escopo da página de campeões. Não recalculamos usando o resumo separado de 152 jogos porque os universos publicados não são idênticos. Estes números também não informam ordem de fase, side ou role.</p><a class="meta-source" href="${OPEN_SERIES_CHAMPION_META.url}" target="_blank" rel="noreferrer">Fonte pública · Open Series Campeões ↗</a>`;
  const warning=root.querySelector('.evidence-warning');warning?.before(section) ?? root.appendChild(section);
}

function metaObserved(){
  const root=document.querySelector('.meta-intelligence');
  if(!root||root.querySelector('[data-os-meta-observed]'))return;
  const lens=root.querySelector('.meta-lens.competitive');if(!lens)return;
  const picks=topOpenSeries('picks',5),bans=topOpenSeries('bans',5);
  const block=document.createElement('div');block.className='os-meta-priority';block.dataset.osMetaObserved='1';
  block.innerHTML=`<div><small>TOP PICKS · OPEN SERIES</small>${picks.map(x=>`<span><b>${esc(x.name)}</b>${x.picks} · ${pct(x.pickRate)}</span>`).join('')}</div><div><small>TOP BANS · OPEN SERIES</small>${bans.map(x=>`<span><b>${esc(x.name)}</b>${x.bans} · ${pct(x.banRate)}</span>`).join('')}</div><p>Prioridade agregada do torneio; ainda não resolve first phase, side ou função.</p>`;
  lens.querySelector('.competitive-mini-kpis')?.after(block) ?? lens.appendChild(block);
}

function apply(){const route=location.hash.replace('#/','').split('?')[0]||'home';if(route==='champions')championObserved();if(route==='competitive')competitiveObserved();if(route==='meta')metaObserved();}
const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(apply));requestAnimationFrame(apply);
