// FROMBOS V22.1 — Continuous Champion Intelligence flow.
// Presentation/navigation only. Reads existing evidence; never mutates competitive state.
import { CHAMPIONS } from './data.js';
import { CURATED_CHAMPION_DATA } from './curated-champion-data.js';
import { championAsset, portraitHTML } from './champion-intelligence.js';
import { OPEN_SERIES_SNAPSHOT } from './competitive-intelligence.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const params=()=>new URLSearchParams(location.hash.split('?')[1]||'');
const view=()=>params().get('view')||'overview';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const championRoutes=new Set(['champions','matchups','builds','meta','competitive']);

function selectedChampion(){
  const requested=params().get('champion');
  if(CHAMPIONS.includes(requested))return requested;
  const dom=document.querySelector('.ci-detail h2,.lab-hero h2')?.textContent?.trim();
  if(CHAMPIONS.includes(dom))return dom;
  return ['champions','matchups','builds'].includes(route())?CHAMPIONS[0]:null;
}

function hrefFor(target,champ,extra={}){
  const q=new URLSearchParams();
  if(champ)q.set('champion',champ);
  Object.entries(extra).forEach(([k,v])=>v&&q.set(k,v));
  return `#/${target}${q.size?`?${q.toString()}`:''}`;
}

const tabs=[
  {id:'overview',label:'Overview',target:'champions'},
  {id:'builds',label:'Builds',target:'builds'},
  {id:'matchups',label:'Matchups',target:'matchups'},
  {id:'synergies',label:'Sinergias',target:'champions',view:'synergies'},
  {id:'meta',label:'Meta',target:'meta'},
  {id:'competitive',label:'Competitivo',target:'competitive'}
];

function activeTab(tab){
  if(tab.id==='synergies')return route()==='champions'&&view()==='synergies';
  if(tab.id==='overview')return route()==='champions'&&view()!=='synergies';
  return route()===tab.target;
}

function navHTML(champ){
  const cur=CURATED_CHAMPION_DATA[champ];
  const asset=championAsset(champ);
  const source=cur?`CURATED · ${cur.patch}`:'UNKNOWN';
  return `<section class="v22-champion-flow v22-reveal" data-v22-champion="${esc(champ)}">
    <div class="v22-champion-identity">
      <div class="v22-champion-avatar">${portraitHTML(champ,'v22-champion-avatar-img')}</div>
      <div class="v22-champion-copy"><span>CHAMPION WORKSPACE</span><strong>${esc(champ)}</strong><small>${cur?`${esc(cur.role)} · Tier editorial ${esc(cur.tier)}`:'Evidência contextual ainda não materializada'}</small></div>
      <span class="v22-evidence-chip ${cur?'is-curated':'is-unknown'}">${source}</span>
    </div>
    <label class="v22-champion-switcher"><span>Campeão</span><select data-v22-champion-select aria-label="Trocar campeão">${CHAMPIONS.map(name=>`<option ${name===champ?'selected':''}>${esc(name)}</option>`).join('')}</select></label>
    <nav class="v22-champion-tabs" aria-label="Champion Intelligence sections">${tabs.map(tab=>`<a class="${activeTab(tab)?'is-active':''}" href="${hrefFor(tab.target,champ,tab.view?{view:tab.view}:{})}" data-v22-champ-tab="${tab.id}">${tab.label}</a>`).join('')}</nav>
    ${asset.officialUrl?`<a class="v22-official-link" href="${esc(asset.officialUrl)}" target="_blank" rel="noreferrer">Riot oficial ↗</a>`:''}
  </section>`;
}

function renderNavigator(){
  if(!championRoutes.has(route()))return;
  const champ=selectedChampion();
  if(!champ||document.querySelector('.v22-champion-flow'))return;
  const content=document.querySelector('.content');if(!content)return;
  const anchor=content.querySelector(':scope > .v22-page-hero')||content.querySelector(':scope > .v22-context-ribbon')||content.querySelector(':scope > .page-head');
  if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',navHTML(champ));
  const select=document.querySelector('[data-v22-champion-select]');
  select?.addEventListener('change',()=>{
    const extra=route()==='champions'&&view()==='synergies'?{view:'synergies'}:{};
    location.hash=hrefFor(route(),select.value,extra);
  });
}

function portraitStrip(list,label){
  return `<div class="v22-champ-portrait-strip" aria-label="${esc(label)}">${list.map(name=>`<button type="button" data-v22-open-champion="${esc(name)}" title="Abrir ${esc(name)}"><span>${portraitHTML(name,'v22-mini-portrait')}</span><b>${esc(name)}</b></button>`).join('')}</div>`;
}

function decisionRailHTML(champ){
  const cur=CURATED_CHAMPION_DATA[champ];
  if(!cur)return `<section class="v22-champion-decision-rail"><article class="v22-unknown-panel"><span>UNKNOWN</span><b>Contexto ainda não materializado</b><p>O FROMBOS não completa counters, builds ou sinergias por memória. Use o registro oficial e aguarde uma fonte compatível.</p></article></section>`;
  return `<section class="v22-champion-decision-rail v22-reveal">
    <article><header><span>COUNTERS · CURATED</span><button type="button" data-v22-champ-route="matchups">Abrir Matchups →</button></header>${portraitStrip(cur.counters.slice(0,3),'Counters curados')}</article>
    <article><header><span>CORE · CURATED</span><button type="button" data-v22-champ-route="builds">Abrir Builds →</button></header><div class="v22-core-strip">${cur.core.map(item=>`<span>${esc(item)}</span>`).join('')}</div></article>
    <article><header><span>SYNERGIES · CURATED</span><button type="button" data-v22-champ-route="synergies">Explorar →</button></header>${portraitStrip(cur.synergies.slice(0,3),'Sinergias curadas')}</article>
  </section>`;
}

function renderDecisionRail(){
  if(route()!=='champions'||view()==='synergies')return;
  const champ=selectedChampion(),flow=document.querySelector('.v22-champion-flow');
  if(!champ||!flow||document.querySelector('.v22-champion-decision-rail'))return;
  flow.insertAdjacentHTML('afterend',decisionRailHTML(champ));
  bindChampionActions(document.querySelector('.v22-champion-decision-rail'));
}

function synergyHTML(champ){
  const cur=CURATED_CHAMPION_DATA[champ];
  if(!cur)return `<section class="v22-synergy-stage v22-reveal"><div class="v22-synergy-hero"><span>SYNERGY LAB</span><h2>${esc(champ)}</h2><p>Não existe snapshot curado compatível para este campeão. O estado permanece <b>UNKNOWN</b>.</p></div></section>`;
  return `<section class="v22-synergy-stage v22-reveal">
    <div class="v22-synergy-hero"><span>SYNERGY LAB · CURATED ${esc(cur.patch)}</span><h2>${esc(champ)} + quem?</h2><p>Relações editoriais importadas de ${esc(cur.source)}. São pistas de composição, não taxa de vitória observada.</p></div>
    <div class="v22-synergy-grid">${cur.synergies.map((ally,index)=>`<article class="v22-synergy-card">
      <div class="v22-synergy-pair"><div>${portraitHTML(champ,'v22-synergy-portrait')}</div><i>+</i><div>${portraitHTML(ally,'v22-synergy-portrait')}</div></div>
      <div class="v22-synergy-body"><small>SINERGIA CURADA ${String(index+1).padStart(2,'0')}</small><h3>${esc(champ)} + ${esc(ally)}</h3><p>Use como hipótese de draft e composição. Valide condição de vitória, engage, range e plano de objetivos no Composition Lab.</p><div><button type="button" data-v22-open-champion="${esc(ally)}">Ver ${esc(ally)}</button><button type="button" data-v22-champ-route="draft">Abrir Draft</button></div></div>
    </article>`).join('')}</div>
    <footer class="v22-synergy-note"><b>Proveniência:</b> CURATED · ${esc(cur.source)} · ${esc(cur.patch)}. Nenhum percentual foi inferido.</footer>
  </section>`;
}

function renderSynergyView(){
  if(route()!=='champions'||view()!=='synergies')return;
  const champ=selectedChampion(),flow=document.querySelector('.v22-champion-flow');
  if(!champ||!flow||document.querySelector('.v22-synergy-stage'))return;
  flow.insertAdjacentHTML('afterend',synergyHTML(champ));
  bindChampionActions(document.querySelector('.v22-synergy-stage'));
}

function focusPanelHTML(champ){
  const cur=CURATED_CHAMPION_DATA[champ];
  const competitive=OPEN_SERIES_SNAPSHOT.players.filter(p=>p.favorite===champ);
  const isCompetitive=route()==='competitive';
  const detail=isCompetitive
    ? (competitive.length?`${competitive.length} jogador(es) no recorte reduzido têm ${esc(champ)} como favorito observado. Isso não representa presença total de pick/ban.`:'O snapshot competitivo atual não materializa presença pick/ban completa por campeão. Estado: UNKNOWN.')
    : (cur?`${esc(cur.role)} · Tier editorial ${esc(cur.tier)} · ${esc(cur.source)} ${esc(cur.patch)}. A camada observada continua separada.`:'Sem snapshot curado compatível; UNKNOWN.');
  return `<section class="v22-champion-focus v22-reveal"><div class="v22-champion-focus-art">${portraitHTML(champ,'v22-focus-portrait')}</div><div><span>${isCompetitive?'COMPETITIVE FOCUS':'META FOCUS'}</span><h3>${esc(champ)}</h3><p>${detail}</p>${competitive.length?`<small>${competitive.map(p=>`${esc(p.name)} · ${esc(p.team)}`).join(' · ')}</small>`:''}</div><div class="v22-focus-actions"><a href="${hrefFor('champions',champ)}">Overview</a><a href="${hrefFor('matchups',champ)}">Matchups</a><a href="${hrefFor('builds',champ)}">Builds</a></div></section>`;
}

function renderFocusPanel(){
  if(!['meta','competitive'].includes(route()))return;
  const champ=params().get('champion');if(!CHAMPIONS.includes(champ)||document.querySelector('.v22-champion-focus'))return;
  const flow=document.querySelector('.v22-champion-flow');if(!flow)return;
  flow.insertAdjacentHTML('afterend',focusPanelHTML(champ));
}

function bindChampionActions(root=document){
  root?.querySelectorAll?.('[data-v22-open-champion]').forEach(btn=>btn.addEventListener('click',()=>{location.hash=hrefFor('champions',btn.dataset.v22OpenChampion)}));
  root?.querySelectorAll?.('[data-v22-champ-route]').forEach(btn=>btn.addEventListener('click',()=>{
    const champ=selectedChampion();
    if(btn.dataset.v22ChampRoute==='synergies')location.hash=hrefFor('champions',champ,{view:'synergies'});
    else if(btn.dataset.v22ChampRoute==='draft')location.hash='#/draft';
    else location.hash=hrefFor(btn.dataset.v22ChampRoute,champ);
  }));
}

function apply(){
  renderNavigator();
  renderDecisionRail();
  renderSynergyView();
  renderFocusPanel();
  bindChampionActions();
}

const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
window.addEventListener('hashchange',()=>queueMicrotask(apply));
queueMicrotask(apply);
window.FROMBOS_V22_CHAMPION_FLOW={apply,selectedChampion,hrefFor};
