// FROMBOS V20 — layout ownership for high-value modules.
// This module changes presentation hierarchy only. It never mutates competitive/store data.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';

function scopePage(){
  const page=route();
  const content=document.querySelector('.content');
  if(content) content.dataset.page=page;
  document.body.dataset.frombosPage=page;
}

function directChild(root,selector){
  return [...root.children].find(el=>el.matches(selector));
}

function enhanceCompositionCards(){
  if(route()!=='comps') return;
  document.querySelectorAll('article.card:has([data-comp-draft])').forEach(card=>{
    if(card.dataset.layoutV20==='1') return;
    const lineup=card.querySelector('.comp-lineup');
    const button=card.querySelector('[data-comp-draft]');
    if(!lineup||!button) return;

    card.dataset.layoutV20='1';
    card.classList.add('composition-card');

    const header=card.firstElementChild;
    if(header&&header!==lineup) header.classList.add('comp-card-head');

    const directParagraphs=[...card.children].filter(el=>el.tagName==='P');
    const plan=directParagraphs.find(el=>!el.classList.contains('muted'));
    const win=directParagraphs.find(el=>el.classList.contains('muted'));

    if(plan||win){
      const gameplan=document.createElement('div');
      gameplan.className='comp-gameplan';

      if(plan){
        const block=document.createElement('section');
        block.className='comp-plan-block';
        const label=document.createElement('small');
        label.textContent='PLANO DE JOGO';
        block.append(label,plan);
        gameplan.appendChild(block);
      }

      if(win){
        const block=document.createElement('section');
        block.className='comp-win-block';
        const label=document.createElement('small');
        label.textContent='CONDIÇÃO DE VITÓRIA';
        const bold=win.querySelector('b');
        if(bold&&/^win condition:?$/i.test(bold.textContent.trim())) bold.remove();
        block.append(label,win);
        gameplan.appendChild(block);
      }

      lineup.after(gameplan);
    }

    button.classList.add('comp-primary-action');
  });
}

function enhanceChampionModule(){
  if(route()!=='champions') return;
  const root=document.querySelector('.champion-intelligence');
  if(!root||root.dataset.layoutV20==='1') return;
  root.dataset.layoutV20='1';
  document.querySelector('.ci-browser')?.setAttribute('aria-label','Catálogo de campeões Wild Rift');
  document.querySelector('.ci-detail')?.setAttribute('aria-label','Inteligência do campeão selecionado');
}

function enhanceDraftModule(){
  if(route()!=='draft') return;
  const root=document.querySelector('.draft-pro');
  if(!root||root.dataset.layoutV20==='1') return;
  root.dataset.layoutV20='1';
  root.querySelector('.draft-arena')?.setAttribute('aria-label','Palco de draft competitivo');
  root.querySelector('.champion-select')?.setAttribute('aria-label','Seletor de campeões');
}

function apply(){
  scopePage();
  enhanceCompositionCards();
  enhanceChampionModule();
  enhanceDraftModule();
}

let scheduled=false;
function schedule(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    apply();
  });
}

new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
schedule();

window.FROMBOS_LAYOUT_V20={apply};
