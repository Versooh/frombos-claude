// FROMBOS V22.4 — Composition Decision Workspace.
// Read-only experience layer. Structural heuristics stay FROMBOS_STRUCTURAL and
// composition provenance is preserved exactly as stored.
import { RECOVERED_COMPOSITIONS, ROLES } from './data.js';
import { store } from './store.js';
import { analyzeComposition, championFeatures, structuralLabel, threatRead } from './structural-intelligence.js';
import { portraitHTML } from './champion-intelligence.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selectedId=null;
let compareId='';

function allComps(){return [...RECOVERED_COMPOSITIONS,...(Array.isArray(store.state.customComps)?store.state.customComps:[])];}
function compById(id){return allComps().find(c=>c.id===id)||null;}
function lineup(comp){return ROLES.map(role=>({role,champion:comp?.lineup?.[role.id]||''})).filter(x=>x.champion);}
function champs(comp){return lineup(comp).map(x=>x.champion);}
function provenance(comp){return comp?.origin||'UNKNOWN';}
function featureChips(name){
  const features=championFeatures(name);
  return features.length?features.slice(0,5).map(k=>`<span>${esc(structuralLabel(k))}</span>`).join(''):'<span>Sem classificação estrutural específica</span>';
}
function structuralCoverage(comp){
  const a=analyzeComposition(champs(comp));
  const keys=['frontline','engage','peel','waveclear','sustained','objectiveDps','poke','side','early','scaling','magic','physical'];
  return `<div class="v22-comp-coverage">${keys.map(k=>`<div class="${a.counts[k]?'on':'off'}"><span>${esc(structuralLabel(k))}</span><b>${a.counts[k]}</b></div>`).join('')}</div>`;
}
function structuralSummary(comp){
  const a=analyzeComposition(champs(comp));
  const strengths=a.strengths.length?a.strengths.map(structuralLabel):['Nenhuma concentração estrutural forte'];
  const debts=a.debts.length?a.debts.map(structuralLabel):['Cobertura-base completa pela heurística'];
  const warningsList=a.warnings.length?a.warnings:['Sem alerta estrutural de composição completa'];
  return `<div class="v22-comp-summary-grid">
    <article><small>CONCENTRAÇÕES</small>${strengths.map(x=>`<span class="good">${esc(x)}</span>`).join('')}</article>
    <article><small>DÍVIDAS ESTRUTURAIS</small>${debts.map(x=>`<span>${esc(x)}</span>`).join('')}</article>
    <article><small>ALERTAS</small>${warningsList.map(x=>`<span class="warn">${esc(x)}</span>`).join('')}</article>
  </div>`;
}
function interactionChains(comp){
  const entries=lineup(comp).map(x=>({...x,features:new Set(championFeatures(x.champion))}));
  const rules=[
    ['engage','engage','Engage em camadas'],
    ['engage','sustained','Entrada + DPS sustentado'],
    ['frontline','poke','Espaço para poke'],
    ['peel','sustained','Proteção de carry'],
    ['side','waveclear','Lateral + controle de rota'],
    ['early','early','Pressão cedo coordenada'],
    ['scaling','peel','Escala protegida'],
    ['frontline','objectiveDps','Frontline + dano em objetivo']
  ];
  const found=[];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    for(const [a,b,label] of rules){
      if((entries[i].features.has(a)&&entries[j].features.has(b))||(entries[i].features.has(b)&&entries[j].features.has(a))){
        const key=`${entries[i].champion}|${entries[j].champion}|${label}`;
        if(!found.some(x=>x.key===key))found.push({key,a:entries[i].champion,b:entries[j].champion,label});
      }
      if(found.length>=5)break;
    }
    if(found.length>=5)break;
  }
  if(!found.length)return '<p class="v22-comp-empty">Nenhuma interação estrutural específica foi detectada pela heurística atual. Isso não representa ausência de sinergia de jogo.</p>';
  return `<div class="v22-comp-chains">${found.map(x=>`<div><span>${portraitHTML(x.a,'v22-comp-chain-img')}${portraitHTML(x.b,'v22-comp-chain-img')}</span><b>${esc(x.a)} + ${esc(x.b)}</b><small>${esc(x.label)} · FROMBOS_STRUCTURAL</small></div>`).join('')}</div>`;
}
function lineupHTML(comp){
  return `<div class="v22-comp-lineup">${lineup(comp).map(({role,champion})=>`<article><div>${portraitHTML(champion,'v22-comp-portrait')}</div><small>${esc(role.label)}</small><b>${esc(champion)}</b><p>${featureChips(champion)}</p></article>`).join('')}</div>`;
}
function comparisonHTML(primary,other){
  if(!other)return '<div class="v22-comp-compare-empty"><b>COMPARISON LENS</b><span>Selecione outra composição para comparar apenas a estrutura. Nenhuma chance de vitória é calculada.</span></div>';
  const left=threatRead(champs(primary)),right=threatRead(champs(other));
  const side=(comp,read)=>`<article><header><span>${esc(comp.name)}</span><small>${esc(provenance(comp))}</small></header><div>${read.threats.length?read.threats.map(x=>`<b>${esc(x)}</b>`).join(''):'<b>Nenhum padrão de ameaça concentrado</b>'}</div><p>${read.warnings.length?read.warnings.map(esc).join(' · '):'Sem alerta estrutural completo.'}</p></article>`;
  return `<div class="v22-comp-comparison"><div class="v22-comp-compare-note"><b>COMPARISON LENS · FROMBOS_STRUCTURAL</b><span>Compara cobertura e padrões, não resultado provável.</span></div><div class="v22-comp-comparison-grid">${side(primary,left)}${side(other,right)}</div></div>`;
}
function draftButton(comp){return `<button type="button" class="btn primary" data-v22-comp-draft="${esc(comp.id)}">Levar referência ao Draft</button>`;}
function workspaceHTML(comp){
  const all=allComps();const other=compareId?compById(compareId):null;
  return `<section class="v22-comp-workspace v22-reveal" data-v22-comp-workspace>
    <header class="v22-comp-head"><div><span>COMPOSITION DECISION WORKSPACE · V22.4</span><h2>Da hipótese ao Draft, com leitura estrutural contínua.</h2><p>Identidade, cobertura, dívidas e interações da composição sem promover heurística a dado observado.</p></div><div class="v22-comp-evidence"><b>WILD RIFT ONLY</b><span>FROMBOS_STRUCTURAL</span><span>NO AUTO-PICK</span></div></header>
    <div class="v22-comp-toolbar"><label>Composição<select class="select" data-v22-comp-select>${all.map(c=>`<option value="${esc(c.id)}" ${c.id===comp.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Comparar estrutura<select class="select" data-v22-comp-compare><option value="">Sem comparação</option>${all.filter(c=>c.id!==comp.id).map(c=>`<option value="${esc(c.id)}" ${c.id===compareId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><div class="v22-comp-actions">${draftButton(comp)}<button type="button" class="btn" data-v22-comp-focus-card="${esc(comp.id)}">Ver card original</button></div></div>
    <div class="v22-comp-hero"><div><span>${esc(comp.archetype||'Arquétipo não documentado')}</span><h3>${esc(comp.name)}</h3><p>${esc(comp.plan||'Plano não documentado.')}</p><small>ORIGEM · ${esc(provenance(comp))}</small></div><div><small>CONDIÇÃO DE VITÓRIA DOCUMENTADA</small><p>${esc(comp.winCondition||'UNKNOWN')}</p></div></div>
    ${lineupHTML(comp)}
    <section class="v22-comp-block"><div class="v22-comp-block-title"><span>COBERTURA ESTRUTURAL</span><small>Contagem heurística por característica</small></div>${structuralCoverage(comp)}${structuralSummary(comp)}</section>
    <section class="v22-comp-block"><div class="v22-comp-block-title"><span>INTERAÇÕES DETECTADAS</span><small>Complementaridade estrutural, não synergy rate</small></div>${interactionChains(comp)}</section>
    <section class="v22-comp-block">${comparisonHTML(comp,other)}</section>
  </section>`;
}
function bind(root){
  root.querySelector('[data-v22-comp-select]')?.addEventListener('change',e=>{selectedId=e.target.value;compareId=compareId===selectedId?'':compareId;apply(true);});
  root.querySelector('[data-v22-comp-compare]')?.addEventListener('change',e=>{compareId=e.target.value;apply(true);});
  root.querySelector('[data-v22-comp-focus-card]')?.addEventListener('click',e=>{
    const card=document.querySelector(`[data-comp-draft="${CSS.escape(e.currentTarget.dataset.v22CompFocusCard)}"]`)?.closest('article');
    card?.scrollIntoView({behavior:'smooth',block:'center'});card?.classList.add('v22-comp-card-focus');setTimeout(()=>card?.classList.remove('v22-comp-card-focus'),1600);
  });
  root.querySelector('[data-v22-comp-draft]')?.addEventListener('click',e=>{
    const source=document.querySelector(`[data-comp-draft="${CSS.escape(e.currentTarget.dataset.v22CompDraft)}"]`);
    if(!source)return;source.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  });
}
function injectCardActions(){
  document.querySelectorAll('[data-comp-draft]').forEach(source=>{
    const card=source.closest('article');if(!card||card.querySelector('[data-v22-analyze-comp]'))return;
    const button=document.createElement('button');button.type='button';button.className='btn v22-comp-analyze';button.dataset.v22AnalyzeComp=source.dataset.compDraft;button.textContent='Analisar composição';button.addEventListener('click',()=>{selectedId=source.dataset.compDraft;apply(true);document.querySelector('[data-v22-comp-workspace]')?.scrollIntoView({behavior:'smooth',block:'start'});});
    source.parentElement?.insertBefore(button,source);
  });
}
function apply(force=false){
  if(route()!=='comps')return;
  const all=allComps();if(!all.length)return;
  if(!selectedId||!compById(selectedId))selectedId=all[0].id;
  if(compareId&&!compById(compareId))compareId='';
  const content=document.querySelector('.content');if(!content)return;
  const existing=content.querySelector('[data-v22-comp-workspace]');
  if(existing&&force)existing.remove();
  if(!content.querySelector('[data-v22-comp-workspace]')){
    const anchor=content.querySelector('.comp-author-v20')||content.querySelector('.page-head');
    if(!anchor)return;
    anchor.insertAdjacentHTML('afterend',workspaceHTML(compById(selectedId)));
    const root=content.querySelector('[data-v22-comp-workspace]');if(root)bind(root);
  }
  injectCardActions();
}
const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(()=>apply());else window.addEventListener('load',()=>apply());
window.addEventListener('hashchange',()=>queueMicrotask(()=>apply()));
queueMicrotask(()=>apply());
window.FROMBOS_V22_COMPOSITION_LAB={apply};
