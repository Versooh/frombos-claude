// FROMBOS V20 — decision controls for Composition Lab, Champion Intelligence and Draft Room.
// Presentation/filtering only. This module never mutates competitive data or persistent workspace state.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};

function compositionCards(grid){return qa('article.composition-card',grid);}

function ensureCompositionActions(card){
  const button=q('[data-comp-draft]',card);
  if(!button||button.parentElement?.classList.contains('comp-card-actions'))return;
  const actions=document.createElement('div');
  actions.className='comp-card-actions';
  button.before(actions);
  actions.appendChild(button);
}

function ensureCompositionToolbar(){
  if(route()!=='comps')return;
  const content=q('.content[data-page="comps"]');
  const grid=content&&q('.grid.cols-2',content);
  if(!grid)return;
  const cards=compositionCards(grid);
  if(!cards.length)return;
  cards.forEach(ensureCompositionActions);

  let toolbar=q('.comp-toolbar-v20',content);
  if(!toolbar){
    toolbar=document.createElement('section');
    toolbar.className='comp-toolbar-v20';
    toolbar.innerHTML=`<div class="comp-search-v20"><span aria-hidden="true">⌕</span><input id="compSearchV20" class="input" autocomplete="off" placeholder="Buscar composição, campeão, estilo ou plano..."></div><div class="comp-filter-tabs-v20" id="compFiltersV20" aria-label="Filtrar composições por estilo"></div><div class="comp-count-v20" id="compCountV20"></div>`;
    grid.before(toolbar);
    q('#compSearchV20',toolbar)?.addEventListener('input',applyCompositionFilters);
    toolbar.dataset.activeArchetype='all';
  }

  const archetypes=[...new Set(cards.map(card=>q('.comp-card-head .eyebrow',card)?.textContent.trim()).filter(Boolean))];
  const signature=archetypes.map(normalize).join('|');
  if(toolbar.dataset.archetypeSignature!==signature){
    toolbar.dataset.archetypeSignature=signature;
    const host=q('#compFiltersV20',toolbar);
    if(host){
      host.innerHTML='';
      const defs=[['all','Todos'],...archetypes.map(label=>[normalize(label),label])];
      defs.forEach(([value,label])=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='comp-filter-v20';
        button.dataset.archetype=value;
        button.textContent=label;
        button.setAttribute('aria-pressed',value===toolbar.dataset.activeArchetype?'true':'false');
        button.addEventListener('click',()=>{
          toolbar.dataset.activeArchetype=value;
          applyCompositionFilters();
        });
        host.appendChild(button);
      });
    }
    if(!['all',...archetypes.map(normalize)].includes(toolbar.dataset.activeArchetype))toolbar.dataset.activeArchetype='all';
  }
  applyCompositionFilters();
}

function applyCompositionFilters(){
  if(route()!=='comps')return;
  const content=q('.content[data-page="comps"]');
  const grid=content&&q('.grid.cols-2',content);
  const toolbar=content&&q('.comp-toolbar-v20',content);
  if(!grid||!toolbar)return;
  const search=normalize(q('#compSearchV20',toolbar)?.value||'');
  const archetype=toolbar.dataset.activeArchetype||'all';
  let visible=0;
  const cards=compositionCards(grid);
  cards.forEach(card=>{
    const cardArchetype=normalize(q('.comp-card-head .eyebrow',card)?.textContent||'');
    const matchesText=!search||normalize(card.textContent).includes(search);
    const matchesArchetype=archetype==='all'||cardArchetype===archetype;
    const show=matchesText&&matchesArchetype;
    card.hidden=!show;
    if(show)visible++;
  });
  qa('.comp-filter-v20',toolbar).forEach(button=>button.setAttribute('aria-pressed',button.dataset.archetype===archetype?'true':'false'));
  setText(q('#compCountV20',toolbar),`${visible} de ${cards.length} composições`);
}

function selectedChampionFromHash(){
  const raw=location.hash.split('?')[1]||'';
  return new URLSearchParams(raw).get('champion')||'';
}

function ensureChampionMeta(){
  if(route()!=='champions')return;
  const browser=q('.ci-browser');
  const grid=q('#ciGrid',browser||document);
  if(!browser||!grid)return;
  let meta=q('.ci-browser-meta-v20',browser);
  if(!meta){
    meta=document.createElement('div');
    meta.className='ci-browser-meta-v20';
    meta.innerHTML='<span class="ci-result-count-v20"></span><span>arte oficial Wild Rift</span>';
    grid.before(meta);
    browser.dataset.maxChampionCount=String(grid.children.length||0);
  }
  const currentCount=grid.children.length;
  const known=Math.max(Number(browser.dataset.maxChampionCount)||0,currentCount);
  browser.dataset.maxChampionCount=String(known);
  setText(q('.ci-result-count-v20',meta),`${currentCount} de ${known} campeões`);
  const selected=selectedChampionFromHash();
  qa('[data-ci-champion]',grid).forEach(card=>{
    const active=Boolean(selected)&&card.dataset.ciChampion===selected;
    card.classList.toggle('is-selected',active);
    card.setAttribute('aria-current',active?'true':'false');
  });
}

function draftFilterMatch(card,filter){
  if(filter==='pool')return card.classList.contains('in-pool');
  if(filter==='available')return !card.disabled&&!card.classList.contains('disabled');
  if(filter==='fearless')return /FEARLESS/i.test(card.textContent);
  return true;
}

function ensureDraftFilters(){
  if(route()!=='draft')return;
  const panel=q('.champion-select');
  const grid=q('#drChampGrid',panel||document);
  if(!panel||!grid)return;
  let bar=q('.draft-filterbar-v20',panel);
  if(!bar){
    bar=document.createElement('div');
    bar.className='draft-filterbar-v20';
    bar.dataset.filter='all';
    bar.innerHTML=`<div class="draft-filter-tabs-v20" role="group" aria-label="Filtrar seleção de campeões"><button type="button" data-draft-filter="all">Todos <b data-filter-count="all">0</b></button><button type="button" data-draft-filter="pool">Pool <b data-filter-count="pool">0</b></button><button type="button" data-draft-filter="available">Disponíveis <b data-filter-count="available">0</b></button><button type="button" data-draft-filter="fearless">Fearless <b data-filter-count="fearless">0</b></button></div><span class="draft-visible-count-v20"></span>`;
    grid.before(bar);
    qa('[data-draft-filter]',bar).forEach(button=>button.addEventListener('click',()=>{
      bar.dataset.filter=button.dataset.draftFilter||'all';
      applyDraftFilters();
    }));
  }
  applyDraftFilters();
}

function applyDraftFilters(){
  if(route()!=='draft')return;
  const panel=q('.champion-select');
  const grid=q('#drChampGrid',panel||document);
  const bar=q('.draft-filterbar-v20',panel||document);
  if(!grid||!bar)return;
  const cards=qa('.draft-champ-card',grid);
  const active=bar.dataset.filter||'all';
  const counts={all:cards.length,pool:0,available:0,fearless:0};
  let visible=0;
  cards.forEach(card=>{
    if(draftFilterMatch(card,'pool'))counts.pool++;
    if(draftFilterMatch(card,'available'))counts.available++;
    if(draftFilterMatch(card,'fearless'))counts.fearless++;
    const show=draftFilterMatch(card,active);
    card.hidden=!show;
    if(show)visible++;
  });
  qa('[data-draft-filter]',bar).forEach(button=>{
    const id=button.dataset.draftFilter;
    button.setAttribute('aria-pressed',id===active?'true':'false');
    setText(q(`[data-filter-count="${id}"]`,button),String(counts[id]??0));
  });
  setText(q('.draft-visible-count-v20',bar),`${visible} visíveis`);
}

function apply(){
  ensureCompositionToolbar();
  ensureChampionMeta();
  ensureDraftFilters();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply();});
}

new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
schedule();

window.FROMBOS_LAB_CONTROLS_V20={apply,applyCompositionFilters,applyDraftFilters};
