// FROMBOS V20.10 — competitive decision flow for Compositions, Champion Intelligence and Draft Room.
// Presentation + local interaction only. No competitive evidence is created, inferred or reclassified here.

import { CHAMPIONS } from './data.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const text=(selector,root=document)=>q(selector,root)?.textContent?.trim()||'';

let compositionCompare=[];

function compositionId(card){return q('[data-comp-draft]',card)?.dataset.compDraft||'';}
function compositionSnapshot(card){
  const id=compositionId(card);
  return {
    id,
    name:text('.comp-card-head h3',card)||text('h3',card)||'Composição',
    archetype:text('.comp-card-head .eyebrow',card)||'Sem arquétipo',
    pool:text('.comp-pool-fit-v20',card)||'POOL NÃO CONFIGURADO',
    lineup:qa('.comp-lineup .champ-slot',card).slice(0,5).map(slot=>({role:text('small',slot),champ:text('b',slot)||'—'})),
    win:text('.comp-win-block p',card)||'Condição de vitória não documentada.'
  };
}
function compareCardHTML(snapshot){
  return `<article class="comp-compare-card-v20" data-compare-id="${esc(snapshot.id)}"><div class="comp-compare-card-head-v20"><div><span>${esc(snapshot.archetype)}</span><b>${esc(snapshot.name)}</b></div><small>${esc(snapshot.pool)}</small></div><div class="comp-compare-lineup-v20">${snapshot.lineup.map(slot=>`<span><small>${esc(slot.role)}</small><b>${esc(slot.champ)}</b></span>`).join('')}</div><p><strong>CONDIÇÃO DE VITÓRIA</strong>${esc(snapshot.win)}</p></article>`;
}
function updateCompositionCompare(){
  if(route()!=='comps')return;
  const content=q('.content[data-page="comps"]');
  const toolbar=content&&q('.comp-toolbar-v20',content);
  const grid=content&&q('.grid.cols-2',content);
  if(!content||!toolbar||!grid)return;
  const cards=qa('article.composition-card',grid);
  const existing=new Set(cards.map(compositionId).filter(Boolean));
  compositionCompare=compositionCompare.filter(id=>existing.has(id)).slice(-2);
  cards.forEach(card=>{
    const id=compositionId(card);const active=compositionCompare.includes(id);
    card.classList.toggle('is-compare-selected-v20',active);
    const button=q('[data-comp-compare-v20]',card);
    if(button){button.setAttribute('aria-pressed',active?'true':'false');button.textContent=active?'✓ Comparando':'Comparar';}
  });
  let rail=q('.comp-compare-v20',content);
  if(!rail){rail=document.createElement('section');rail.className='comp-compare-v20';toolbar.after(rail);}
  const selected=compositionCompare.map(id=>cards.find(card=>compositionId(card)===id)).filter(Boolean).map(compositionSnapshot);
  const signature=selected.map(item=>`${item.id}|${item.pool}|${item.win}`).join('::');
  if(rail.dataset.signature===signature)return;
  rail.dataset.signature=signature;
  rail.dataset.count=String(selected.length);
  rail.innerHTML=`<div class="comp-compare-head-v20"><div><span>COMPARADOR TÁTICO</span><b>${selected.length?`${selected.length}/2 composições selecionadas`:'Selecione até duas composições'}</b></div>${selected.length?'<button type="button" class="btn" data-comp-compare-clear-v20>Limpar</button>':'<small>Use “Comparar” nos cards para confrontar lineup, aderência ao pool e condição de vitória sem inventar métricas.</small>'}</div>${selected.length?`<div class="comp-compare-grid-v20">${selected.map(compareCardHTML).join('')}${selected.length===1?'<div class="comp-compare-empty-v20">Selecione uma segunda composição para comparação lado a lado.</div>':''}</div>`:''}`;
  q('[data-comp-compare-clear-v20]',rail)?.addEventListener('click',()=>{compositionCompare=[];updateCompositionCompare();});
}
function ensureCompositionFlow(){
  if(route()!=='comps')return;
  const grid=q('.content[data-page="comps"] .grid.cols-2');if(!grid)return;
  qa('article.composition-card',grid).forEach(card=>{
    const id=compositionId(card);const actions=q('.comp-card-actions',card);if(!id||!actions)return;
    let button=q('[data-comp-compare-v20]',actions);
    if(!button){button=document.createElement('button');button.type='button';button.className='btn comp-compare-toggle-v20';button.dataset.compCompareV20=id;button.textContent='Comparar';actions.insertBefore(button,actions.lastElementChild||null);}
    if(button.dataset.flowBound!=='1'){
      button.dataset.flowBound='1';
      button.addEventListener('click',()=>{
        const target=button.dataset.compCompareV20;
        if(compositionCompare.includes(target))compositionCompare=compositionCompare.filter(id=>id!==target);
        else compositionCompare=[...compositionCompare,target].slice(-2);
        updateCompositionCompare();
      });
    }
  });
  updateCompositionCompare();
}

function selectedChampion(){const raw=location.hash.split('?')[1]||'';return new URLSearchParams(raw).get('champion')||CHAMPIONS[0]||'';}
function navigateChampion(name){if(!name)return;location.hash=`#/champions?champion=${encodeURIComponent(name)}`;}
function ensureChampionFlow(){
  if(route()!=='champions')return;
  const detail=q('.content[data-page="champions"] .ci-detail');if(!detail)return;
  const evidence=q('.ci-evidence-strip',detail);const states=qa('.intel-state',detail);if(!evidence||!states.length)return;
  let flow=q('.ci-flow-v20',detail);if(!flow){flow=document.createElement('section');flow.className='ci-flow-v20';evidence.after(flow);}
  const current=selectedChampion();const index=Math.max(0,CHAMPIONS.indexOf(current));
  const previous=CHAMPIONS[(index-1+CHAMPIONS.length)%CHAMPIONS.length]||'';
  const next=CHAMPIONS[(index+1)%CHAMPIONS.length]||'';
  const stateRows=states.slice(0,4).map(state=>({label:text('.intel-state-head b',state),type:text('.intel-state-head .badge',state)||'UNKNOWN'}));
  const signature=[current,index,...stateRows.flatMap(row=>[row.label,row.type])].join('|');
  if(flow.dataset.signature===signature)return;
  flow.dataset.signature=signature;
  flow.innerHTML=`<div class="ci-flow-nav-v20"><button type="button" class="btn" data-ci-prev-v20 title="${esc(previous)}">← Anterior</button><div><span>CAMPEÃO ATIVO</span><b>${esc(current)}</b><small>${index+1}/${CHAMPIONS.length} no roster Wild Rift</small></div><button type="button" class="btn" data-ci-next-v20 title="${esc(next)}">Próximo →</button></div><div class="ci-flow-evidence-v20">${stateRows.map(row=>`<span data-evidence-type="${esc(row.type)}"><small>${esc(row.label)}</small><b>${esc(row.type)}</b></span>`).join('')}</div><div class="ci-flow-actions-v20"><button type="button" class="btn" data-ci-flow-lab="matchups">Abrir Matchup Lab</button><button type="button" class="btn" data-ci-flow-lab="builds">Abrir Build Intelligence</button></div>`;
  q('[data-ci-prev-v20]',flow)?.addEventListener('click',()=>navigateChampion(previous));
  q('[data-ci-next-v20]',flow)?.addEventListener('click',()=>navigateChampion(next));
  qa('[data-ci-flow-lab]',flow).forEach(button=>button.addEventListener('click',()=>{location.hash=`#/${button.dataset.ciFlowLab}?champion=${encodeURIComponent(current)}`;}));
}

function ensureDraftFlow(){
  if(route()!=='draft')return;
  const root=q('.content[data-page="draft"] .draft-pro');if(!root)return;
  const command=q('.draft-command',root);const arena=q('.draft-arena',root);const selector=q('.champion-select',root);const rows=qa('.draft-seq-row',root);
  if(!command||!arena||!selector||!rows.length)return;
  const done=rows.filter(row=>row.classList.contains('done')).length;
  const stage=text('.draft-stage-head h2',root)||'DRAFT';
  const game=text('.draft-stage-head .eyebrow',root).split('·')[0]?.trim()||'';
  const cards=qa('.draft-champ-card',selector);
  const pool=cards.filter(card=>card.classList.contains('in-pool')).length;
  const available=cards.filter(card=>!card.disabled&&!card.classList.contains('disabled')).length;
  const fearless=cards.filter(card=>/FEARLESS/i.test(card.textContent||'')).length;
  const branch=root.classList.contains('draft-branch-mode');
  let flow=q('.draft-flow-v20',root);if(!flow){flow=document.createElement('section');flow.className='draft-flow-v20';command.after(flow);}
  const signature=[done,rows.length,stage,game,pool,available,fearless,branch].join('|');
  if(flow.dataset.signature===signature)return;
  flow.dataset.signature=signature;
  const progress=rows.length?Math.round(done/rows.length*100):0;
  flow.innerHTML=`<div class="draft-flow-state-v20"><div><span>${esc(game||'SÉRIE ATIVA')}</span><b>${esc(stage)}</b><small>${branch?'Plano alternativo ativo · linha principal preservada':'Linha principal do draft'}</small></div><div class="draft-progress-v20" role="progressbar" aria-label="Progresso do draft" aria-valuemin="0" aria-valuemax="${rows.length}" aria-valuenow="${done}"><i style="--draft-progress:${progress}%"></i><span>${done}/${rows.length} ações</span></div></div><div class="draft-flow-kpis-v20"><span><small>POOL NO FILTRO</small><b>${pool}</b></span><span><small>DISPONÍVEIS</small><b>${available}</b></span><span><small>FEARLESS</small><b>${fearless}</b></span></div><div class="draft-flow-actions-v20"><button type="button" class="btn" data-draft-jump-v20="arena">Palco</button><button type="button" class="btn info" data-draft-jump-v20="selector">Seleção</button></div>`;
  qa('[data-draft-jump-v20]',flow).forEach(button=>button.addEventListener('click',()=>{(button.dataset.draftJumpV20==='arena'?arena:selector).scrollIntoView({behavior:'smooth',block:'start'});}));
}

function apply(){ensureCompositionFlow();ensureChampionFlow();ensureDraftFlow();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;
  if(runtime?.subscribe){runtime.subscribe(apply);return;}
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
}
bindRuntime();

window.FROMBOS_COMPETITIVE_FLOW_V20={apply,updateCompositionCompare};
