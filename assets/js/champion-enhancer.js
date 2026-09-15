import { championPortrait, hydrateChampionImages } from './champion-visual.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fragment(html){
  const t=document.createElement('template');
  t.innerHTML=html.trim();
  return t.content.firstElementChild;
}

function cleanName(value){
  return String(value||'').replace(/\s+[×x]$/,'').trim();
}

function enhanceCompositions(root){
  root.querySelectorAll('.comp-lineup .champ-slot').forEach(slot=>{
    if(slot.dataset.championEnhanced==='1') return;
    const name=cleanName(slot.querySelector('b')?.textContent);
    if(!name||name==='—') return;
    slot.dataset.championEnhanced='1';
    slot.insertBefore(fragment(championPortrait(name,{size:'md'})),slot.querySelector('b'));
  });
}

function enhancePools(root){
  root.querySelectorAll('.pool-list .chip').forEach(chip=>{
    if(chip.dataset.championEnhanced==='1') return;
    const raw=[...chip.childNodes].find(n=>n.nodeType===Node.TEXT_NODE)?.textContent||chip.textContent;
    const name=cleanName(raw.replace(/×/g,''));
    if(!name) return;
    chip.dataset.championEnhanced='1';
    chip.classList.add('pool-chip-v20');
    chip.prepend(fragment(championPortrait(name,{size:'xs'})));
  });
}

function enhanceDraftGrid(root){
  root.querySelectorAll('.draft-champ-card').forEach(card=>{
    if(card.dataset.championEnhanced==='1') return;
    const name=cleanName(card.dataset.champ||card.querySelector('b')?.textContent);
    if(!name) return;
    card.dataset.championEnhanced='1';
    card.querySelector('.draft-champ-initial')?.remove();
    card.insertBefore(fragment(championPortrait(name,{size:'sm'})),card.firstChild);
  });
}

function enhanceDraftSlots(root){
  root.querySelectorAll('.dr-slot.filled').forEach(slot=>{
    if(slot.dataset.championEnhanced==='1') return;
    const b=slot.querySelector('b');
    const name=cleanName(b?.textContent);
    if(!name||name==='—') return;
    slot.dataset.championEnhanced='1';
    const size=slot.classList.contains('ban')?'xs':'sm';
    const role=slot.querySelector('small')?.textContent||'';
    const visual=fragment(championPortrait(name,{size,label:true,role}));
    b?.remove();
    slot.querySelector('small')?.remove();
    slot.appendChild(visual);
  });
}

function enhanceTacticalPicker(root){
  root.querySelectorAll('.tb-champ').forEach(card=>{
    if(card.dataset.championEnhanced==='1') return;
    const name=cleanName(card.querySelector('small')?.textContent||card.dataset.champ||card.title);
    if(!name) return;
    card.dataset.championEnhanced='1';
    const initials=card.querySelector('span');
    initials?.replaceWith(fragment(championPortrait(name,{size:'xs'})));
  });
}

function deDupe(root){
  root.querySelectorAll('[data-champion-enhanced="1"]').forEach(host=>{
    const visuals=[...host.querySelectorAll(':scope > .champion-visual')];
    visuals.slice(1).forEach(el=>el.remove());
  });
}

function run(root=document){
  enhanceCompositions(root);
  enhancePools(root);
  enhanceDraftGrid(root);
  enhanceDraftSlots(root);
  enhanceTacticalPicker(root);
  deDupe(root);
  hydrateChampionImages(root);
}

let queued=false;
const schedule=()=>{
  if(queued) return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;run(document);});
};

new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('DOMContentLoaded',schedule);
schedule();

export { run as enhanceChampionVisuals };
