// FROMBOS V20 — decision controls for Composition Lab, Champion Intelligence and Draft Room.
// Filters and coach context only. Competitive evidence is never fabricated or reclassified here.

import { store } from './store.js';
import { championAsset } from './champion-intelligence.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};
const ROLE_IDS=['BARON','JUNGLE','MID','DUO','SUPPORT'];
const ROLE_LABELS={BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte'};

function compositionCards(grid){return qa('article.composition-card',grid);}
function championInitials(name){return String(name||'?').split(/\s+/).map(x=>x[0]).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase()||'?';}
function rolePool(role){return store.state.team?.players?.[role]?.pool||[];}
function poolHas(role,name){const wanted=normalize(name);return rolePool(role).some(champ=>normalize(champ)===wanted);}
function compositionSlots(card){return qa('.comp-lineup .champ-slot',card).slice(0,5).map((slot,index)=>({role:ROLE_IDS[index],name:q('b',slot)?.textContent?.trim()||''}));}
function compositionPoolFit(card){
  const slots=compositionSlots(card);let matched=0,configured=0;
  slots.forEach(({role,name})=>{const pool=rolePool(role);if(pool.length)configured++;if(name&&poolHas(role,name))matched++;});
  return {matched,total:5,configured,full:matched===5};
}

function ensureCompositionActions(card){
  const button=q('[data-comp-draft]',card);const intel=q('.comp-intel',card);if(!button||!intel)return;
  const currentActions=button.closest('.comp-card-actions');
  if(intel.parentElement!==card){const anchor=currentActions||button;card.insertBefore(intel,anchor);}
  let actions=currentActions;
  if(!actions){actions=document.createElement('div');actions.className='comp-card-actions';button.before(actions);actions.appendChild(button);}
  let fit=q('.comp-pool-fit-v20',actions);if(!fit){fit=document.createElement('span');fit.className='comp-pool-fit-v20';actions.prepend(fit);}
  const status=compositionPoolFit(card);fit.classList.toggle('full',status.full);fit.classList.toggle('unconfigured',status.configured===0);
  fit.textContent=status.configured===0?'POOL NÃO CONFIGURADO':`POOL ${status.matched}/5`;
  fit.title=status.configured===0?'Configure os champion pools do time para medir aderência por função.':`${status.matched} de 5 campeões estão no pool da função correspondente.`;
}

function ensureCompositionToolbar(){
  if(route()!=='comps')return;
  const content=q('.content[data-page="comps"]');const grid=content&&q('.grid.cols-2',content);if(!grid)return;
  const cards=compositionCards(grid);if(!cards.length)return;cards.forEach(ensureCompositionActions);
  let toolbar=q('.comp-toolbar-v20',content);
  if(!toolbar){
    toolbar=document.createElement('section');toolbar.className='comp-toolbar-v20';toolbar.dataset.activeArchetype='all';toolbar.dataset.poolOnly='0';
    toolbar.innerHTML=`<div class="comp-search-v20"><span aria-hidden="true">⌕</span><input id="compSearchV20" class="input" autocomplete="off" placeholder="Buscar composição, campeão, estilo ou plano..."></div><div class="comp-filter-tabs-v20" id="compFiltersV20" aria-label="Filtrar composições"></div><div class="comp-count-v20" id="compCountV20"></div>`;
    grid.before(toolbar);q('#compSearchV20',toolbar)?.addEventListener('input',applyCompositionFilters);
  }
  const archetypes=[...new Set(cards.map(card=>q('.comp-card-head .eyebrow',card)?.textContent.trim()).filter(Boolean))];
  const signature=archetypes.map(normalize).join('|');
  if(toolbar.dataset.archetypeSignature!==signature){
    toolbar.dataset.archetypeSignature=signature;const host=q('#compFiltersV20',toolbar);
    if(host){
      host.innerHTML='';const defs=[['all','Todos'],...archetypes.map(label=>[normalize(label),label])];
      defs.forEach(([value,label])=>{const button=document.createElement('button');button.type='button';button.className='comp-filter-v20';button.dataset.archetype=value;button.textContent=label;button.addEventListener('click',()=>{toolbar.dataset.activeArchetype=value;applyCompositionFilters();});host.appendChild(button);});
      const poolButton=document.createElement('button');poolButton.type='button';poolButton.className='comp-pool-toggle-v20';poolButton.innerHTML='Pool 5/5 <b data-pool-full-count>0</b>';poolButton.addEventListener('click',()=>{toolbar.dataset.poolOnly=toolbar.dataset.poolOnly==='1'?'0':'1';applyCompositionFilters();});host.appendChild(poolButton);
    }
    if(!['all',...archetypes.map(normalize)].includes(toolbar.dataset.activeArchetype))toolbar.dataset.activeArchetype='all';
  }
  applyCompositionFilters();
}

function applyCompositionFilters(){
  if(route()!=='comps')return;
  const content=q('.content[data-page="comps"]');const grid=content&&q('.grid.cols-2',content);const toolbar=content&&q('.comp-toolbar-v20',content);if(!grid||!toolbar)return;
  const search=normalize(q('#compSearchV20',toolbar)?.value||'');const archetype=toolbar.dataset.activeArchetype||'all';const poolOnly=toolbar.dataset.poolOnly==='1';let visible=0,fullPool=0;
  const cards=compositionCards(grid);
  cards.forEach(card=>{
    ensureCompositionActions(card);const fit=compositionPoolFit(card);if(fit.full)fullPool++;
    const cardArchetype=normalize(q('.comp-card-head .eyebrow',card)?.textContent||'');const matchesText=!search||normalize(card.textContent).includes(search);const matchesArchetype=archetype==='all'||cardArchetype===archetype;const matchesPool=!poolOnly||fit.full;const show=matchesText&&matchesArchetype&&matchesPool;card.hidden=!show;if(show)visible++;
  });
  qa('.comp-filter-v20',toolbar).forEach(button=>button.setAttribute('aria-pressed',button.dataset.archetype===archetype?'true':'false'));
  const poolButton=q('.comp-pool-toggle-v20',toolbar);poolButton?.setAttribute('aria-pressed',poolOnly?'true':'false');setText(q('[data-pool-full-count]',poolButton||toolbar),String(fullPool));
  setText(q('#compCountV20',toolbar),`${visible} de ${cards.length} composições`);
}

function selectedChampionFromHash(){const raw=location.hash.split('?')[1]||'';return new URLSearchParams(raw).get('champion')||'';}
function championFilterMatch(card,filter){if(filter==='curated')return /curated/i.test(q('.ci-card-body small',card)?.textContent||'');if(filter==='pending')return /pending/i.test(card.textContent);return true;}
function applyChampionFilter(){
  if(route()!=='champions')return;const browser=q('.ci-browser');const grid=q('#ciGrid',browser||document);const meta=browser&&q('.ci-browser-meta-v20',browser);if(!browser||!grid||!meta)return;
  const active=browser.dataset.ciFilter||'all';const cards=qa('[data-ci-champion]',grid);let visible=0,curated=0,pending=0;
  cards.forEach(card=>{if(championFilterMatch(card,'curated'))curated++;if(championFilterMatch(card,'pending'))pending++;const show=championFilterMatch(card,active);card.hidden=!show;if(show)visible++;});
  qa('[data-ci-filter]',meta).forEach(button=>{button.setAttribute('aria-pressed',button.dataset.ciFilter===active?'true':'false');const count=q('b',button);if(count)setText(count,String(button.dataset.ciFilter==='curated'?curated:button.dataset.ciFilter==='pending'?pending:cards.length));});
  const known=Math.max(Number(browser.dataset.maxChampionCount)||0,cards.length);browser.dataset.maxChampionCount=String(known);setText(q('.ci-result-count-v20',meta),`${visible} de ${known} campeões`);
}
function ensureChampionMeta(){
  if(route()!=='champions')return;const browser=q('.ci-browser');const grid=q('#ciGrid',browser||document);if(!browser||!grid)return;
  let meta=q('.ci-browser-meta-v20',browser);
  if(!meta){
    meta=document.createElement('div');meta.className='ci-browser-meta-v20';browser.dataset.ciFilter='all';browser.dataset.maxChampionCount=String(grid.children.length||0);
    meta.innerHTML='<span class="ci-result-count-v20"></span><div class="ci-filter-tabs-v20" role="group" aria-label="Filtrar cobertura de inteligência"><button type="button" data-ci-filter="all">Todos <b>0</b></button><button type="button" data-ci-filter="curated">Curados <b>0</b></button><button type="button" data-ci-filter="pending">Pendentes <b>0</b></button></div>';
    grid.before(meta);qa('[data-ci-filter]',meta).forEach(button=>button.addEventListener('click',()=>{browser.dataset.ciFilter=button.dataset.ciFilter||'all';applyChampionFilter();}));
  }
  const selected=selectedChampionFromHash();qa('[data-ci-champion]',grid).forEach(card=>{const active=Boolean(selected)&&card.dataset.ciChampion===selected;card.classList.toggle('is-selected',active);card.setAttribute('aria-current',active?'true':'false');});applyChampionFilter();
}

function draftFilterMatch(card,filter){if(filter==='pool')return card.classList.contains('in-pool');if(filter==='available')return !card.disabled&&!card.classList.contains('disabled');if(filter==='fearless')return /FEARLESS/i.test(card.textContent);return true;}
function makeReferencePortrait(name){
  const wrap=document.createElement('span');wrap.className='draft-reference-portrait-v20';const asset=championAsset(name);
  if(asset?.portrait){const img=document.createElement('img');img.src=asset.portrait;img.alt=name;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{wrap.textContent=championInitials(name);wrap.classList.add('fallback');};wrap.appendChild(img);}else{wrap.textContent=championInitials(name);wrap.classList.add('fallback');}
  return wrap;
}
function ensureDraftReference(){
  if(route()!=='draft')return;const panel=q('.champion-select');if(!panel)return;const reference=store.state.draft?.referenceComp;let section=q('.draft-reference-v20',panel);
  if(!reference?.lineup){section?.remove();return;}
  const signature=`${reference.id||reference.name||''}|${ROLE_IDS.map(role=>reference.lineup[role]||'').join('|')}`;if(section?.dataset.signature===signature)return;
  section?.remove();section=document.createElement('section');section.className='draft-reference-v20';section.dataset.signature=signature;
  const head=document.createElement('div');head.className='draft-reference-head-v20';head.innerHTML='<span>COMPOSIÇÃO DE REFERÊNCIA</span>';const title=document.createElement('b');title.textContent=reference.name||'Composição enviada ao Draft';head.appendChild(title);section.appendChild(head);
  const row=document.createElement('div');row.className='draft-reference-grid-v20';
  ROLE_IDS.forEach(role=>{const name=reference.lineup[role];if(!name)return;const button=document.createElement('button');button.type='button';button.className='draft-reference-champ-v20';button.title=`Buscar ${name} na seleção`;button.appendChild(makeReferencePortrait(name));const copy=document.createElement('span');const roleLabel=document.createElement('small');roleLabel.textContent=ROLE_LABELS[role];const champ=document.createElement('b');champ.textContent=name;copy.append(roleLabel,champ);button.appendChild(copy);button.addEventListener('click',()=>{const search=q('#drSearch',panel);const bar=q('.draft-filterbar-v20',panel);if(bar)bar.dataset.filter='all';if(search){search.value=name;search.dispatchEvent(new Event('input',{bubbles:true}));search.focus();}});row.appendChild(button);});
  section.appendChild(row);const anchor=q('.draft-filterbar-v20',panel)||q('#drChampGrid',panel);anchor?.before(section);
}
function ensureDraftFilters(){
  if(route()!=='draft')return;const panel=q('.champion-select');const grid=q('#drChampGrid',panel||document);if(!panel||!grid)return;
  let bar=q('.draft-filterbar-v20',panel);
  if(!bar){bar=document.createElement('div');bar.className='draft-filterbar-v20';bar.dataset.filter='all';bar.innerHTML=`<div class="draft-filter-tabs-v20" role="group" aria-label="Filtrar seleção de campeões"><button type="button" data-draft-filter="all">Todos <b data-filter-count="all">0</b></button><button type="button" data-draft-filter="pool">Pool <b data-filter-count="pool">0</b></button><button type="button" data-draft-filter="available">Disponíveis <b data-filter-count="available">0</b></button><button type="button" data-draft-filter="fearless">Fearless <b data-filter-count="fearless">0</b></button></div><span class="draft-visible-count-v20"></span>`;grid.before(bar);qa('[data-draft-filter]',bar).forEach(button=>button.addEventListener('click',()=>{bar.dataset.filter=button.dataset.draftFilter||'all';applyDraftFilters();}));}
  applyDraftFilters();
}
function applyDraftFilters(){
  if(route()!=='draft')return;const panel=q('.champion-select');const grid=q('#drChampGrid',panel||document);const bar=q('.draft-filterbar-v20',panel||document);if(!grid||!bar)return;
  const cards=qa('.draft-champ-card',grid);const active=bar.dataset.filter||'all';const counts={all:cards.length,pool:0,available:0,fearless:0};let visible=0;
  cards.forEach(card=>{if(draftFilterMatch(card,'pool'))counts.pool++;if(draftFilterMatch(card,'available'))counts.available++;if(draftFilterMatch(card,'fearless'))counts.fearless++;const show=draftFilterMatch(card,active);card.hidden=!show;if(show)visible++;});
  qa('[data-draft-filter]',bar).forEach(button=>{const id=button.dataset.draftFilter;button.setAttribute('aria-pressed',id===active?'true':'false');setText(q(`[data-filter-count="${id}"]`,button),String(counts[id]??0));});setText(q('.draft-visible-count-v20',bar),`${visible} visíveis`);
}

function apply(){ensureCompositionToolbar();ensureChampionMeta();ensureDraftFilters();ensureDraftReference();}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
window.FROMBOS_LAB_CONTROLS_V20={apply,applyCompositionFilters,applyChampionFilter,applyDraftFilters};
