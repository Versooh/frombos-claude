// FROMBOS V20.7 — non-destructive operational controls for Team, Competitive, Meta and Data Center.
// Filters and navigation only; no competitive data or workspace records are mutated.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

function makeRouteButton(label,target,className='btn'){
  const b=document.createElement('button');b.type='button';b.className=className;b.textContent=label;b.dataset.systemGo=target;b.onclick=()=>location.hash=`#/${target}`;return b;
}

function teamControls(){
  if(route()!=='team')return;
  const content=q('.content[data-page="team"]');const head=content&&q('.page-head',content);if(!head)return;
  let controls=q('.team-quick-v20',head);
  if(!controls){
    controls=document.createElement('div');controls.className='team-quick-v20';
    controls.append(makeRouteButton('Composições','comps'),makeRouteButton('Draft Room','draft','btn info'),makeRouteButton('Treinos','training'));
    (head.lastElementChild||head).appendChild(controls);
  }
  const rows=qa('.role-row',content);const configured=rows.filter(row=>{const name=q('[data-player]',row)?.value?.trim();const pool=qa('.pool-list .chip',row).length;return name||pool;}).length;
  let summary=q('.team-summary-v20',content);
  if(!summary){summary=document.createElement('div');summary.className='team-summary-v20';q('.team-progress-v19',content)?.after(summary)??q('.section-title',content)?.before(summary);}
  const unique=new Set(qa('.pool-list .chip',content).map(chip=>normalize(chip.textContent.replace(/×/g,''))).filter(Boolean));
  summary.innerHTML=`<span><b>${configured}/5</b> posições</span><span><b>${unique.size}</b> campeões únicos no pool</span><span><b>${qa('.pool-list .chip',content).length}</b> entradas de pool</span>`;
}

function competitiveControls(){
  if(route()!=='competitive')return;
  const root=q('.competitive-center');const table=root&&q('.competitive-table',root);if(!root||!table)return;
  let tools=q('.competitive-tools-v20',root);
  if(!tools){
    tools=document.createElement('div');tools.className='competitive-tools-v20';
    tools.innerHTML=`<div class="system-search-v20"><span>⌕</span><input class="input" id="competitiveSearchV20" placeholder="Buscar equipe no ranking..." autocomplete="off"></div><span class="system-count-v20" id="competitiveCountV20"></span><small>Clique em uma equipe para abrir o Scouting War Room.</small>`;
    const grid=q('.competitive-grid',root);grid?.before(tools);
    q('#competitiveSearchV20',tools)?.addEventListener('input',applyCompetitiveFilter);
  }
  applyCompetitiveFilter();
}
function applyCompetitiveFilter(){
  const root=q('.competitive-center');const tools=root&&q('.competitive-tools-v20',root);if(!root||!tools)return;
  const term=normalize(q('#competitiveSearchV20',tools)?.value||'');const rows=qa('.ct-row[data-scout-team]',root);let visible=0;
  rows.forEach(row=>{const show=!term||normalize(row.textContent).includes(term);row.hidden=!show;if(show)visible++;});
  const count=q('#competitiveCountV20',tools);if(count)count.textContent=`${visible} de ${rows.length} equipes`;
}

const META_FILTERS=[['all','Todas'],['official','Oficial'],['observed','Observado'],['curated','Curado'],['competitive','Competitivo']];
function metaControls(){
  if(route()!=='meta')return;
  const root=q('.meta-intelligence');const lenses=root&&q('.meta-lenses',root);if(!root||!lenses)return;
  let controls=q('.meta-filterbar-v20',root);
  if(!controls){
    controls=document.createElement('div');controls.className='meta-filterbar-v20';controls.dataset.filter='all';
    const group=document.createElement('div');group.className='meta-filter-tabs-v20';group.setAttribute('role','group');group.setAttribute('aria-label','Filtrar camadas do Meta Intelligence');
    META_FILTERS.forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.dataset.metaFilter=id;button.textContent=label;button.onclick=()=>{controls.dataset.filter=id;applyMetaFilter();};group.appendChild(button);});
    const note=document.createElement('span');note.textContent='As camadas continuam independentes; o filtro altera apenas a visualização.';controls.append(group,note);lenses.before(controls);
  }
  applyMetaFilter();
}
function applyMetaFilter(){
  const root=q('.meta-intelligence');const controls=root&&q('.meta-filterbar-v20',root);if(!root||!controls)return;const active=controls.dataset.filter||'all';
  qa('.meta-lens',root).forEach(lens=>{const show=active==='all'||lens.classList.contains(active);lens.hidden=!show;});
  qa('[data-meta-filter]',controls).forEach(button=>button.setAttribute('aria-pressed',button.dataset.metaFilter===active?'true':'false'));
}

function sourceType(row){return normalize(q('.badge',row)?.textContent||'').replace(/\s+/g,'_');}
function dataControls(){
  if(route()!=='data')return;
  const content=q('.content[data-page="data"]');const card=content&&q(':scope>.card',content);if(!content||!card)return;
  const rows=qa('.source-row',card).slice(1);if(!rows.length)return;
  let controls=q('.data-tools-v20',content);
  if(!controls){
    controls=document.createElement('section');controls.className='data-tools-v20';controls.dataset.type='all';
    controls.innerHTML=`<div class="data-evidence-legend-v20"><span class="official">OFICIAL<small>fonte primária</small></span><span class="observed">OBSERVADO<small>amostra publicada</small></span><span class="curated">CURADO<small>interpretação editorial</small></span><span class="structural">FROMBOS<small>cálculo estrutural</small></span></div><div class="data-filter-row-v20"><div class="system-search-v20"><span>⌕</span><input class="input" id="dataSearchV20" placeholder="Buscar fonte, tipo, status ou domínio..." autocomplete="off"></div><div class="data-filter-tabs-v20" role="group" aria-label="Filtrar fontes por tipo"></div><b id="dataCountV20" class="system-count-v20"></b></div>`;
    card.before(controls);
    q('#dataSearchV20',controls)?.addEventListener('input',applyDataFilter);
  }
  const types=[...new Set(rows.map(sourceType).filter(Boolean))];const tabs=q('.data-filter-tabs-v20',controls);
  const signature=types.join('|');if(tabs&&tabs.dataset.signature!==signature){tabs.dataset.signature=signature;tabs.innerHTML='';[['all','Todos'],...types.map(type=>[type,type.replaceAll('_',' ')])].forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.dataset.dataType=id;button.textContent=label;button.onclick=()=>{controls.dataset.type=id;applyDataFilter();};tabs.appendChild(button);});}
  applyDataFilter();
}
function applyDataFilter(){
  const content=q('.content[data-page="data"]');const controls=content&&q('.data-tools-v20',content);const card=content&&q(':scope>.card',content);if(!controls||!card)return;
  const term=normalize(q('#dataSearchV20',controls)?.value||'');const type=controls.dataset.type||'all';const rows=qa('.source-row',card).slice(1);let visible=0;
  rows.forEach(row=>{const matchesTerm=!term||normalize(row.textContent).includes(term);const matchesType=type==='all'||sourceType(row)===type;const show=matchesTerm&&matchesType;row.hidden=!show;if(show)visible++;});
  qa('[data-data-type]',controls).forEach(button=>button.setAttribute('aria-pressed',button.dataset.dataType===type?'true':'false'));
  const count=q('#dataCountV20',controls);if(count)count.textContent=`${visible} de ${rows.length} fontes`;
}

function apply(){teamControls();competitiveControls();metaControls();dataControls();}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
window.FROMBOS_SYSTEM_CONTROLS_V20={apply,applyCompetitiveFilter,applyMetaFilter,applyDataFilter};
