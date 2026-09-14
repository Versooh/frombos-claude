import { championAsset } from './champion-intelligence.js';

function initial(name){return name.split(/\s+/).map(x=>x[0]).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();}
function artNode(name,className){const wrap=document.createElement('span');wrap.className=className;const asset=championAsset(name);if(asset?.portrait){const img=document.createElement('img');img.src=asset.portrait;img.alt=name;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{wrap.textContent=initial(name);wrap.classList.add('portrait-text-fallback');};wrap.appendChild(img);}else{wrap.textContent=initial(name);wrap.classList.add('portrait-text-fallback');}return wrap;}
function enhanceCompositions(){
  document.querySelectorAll('.comp-lineup .champ-slot:not([data-portrait-ready])').forEach(slot=>{
    const label=slot.querySelector('b')?.textContent?.trim();if(!label||label==='—')return;slot.dataset.portraitReady='1';slot.prepend(artNode(label,'comp-portrait'));
  });
}
function enhanceTacticalGrid(){
  document.querySelectorAll('#tbChampGrid .tb-champ[data-champion]:not([data-portrait-ready])').forEach(btn=>{
    const name=btn.dataset.champion;if(!name)return;btn.dataset.portraitReady='1';const old=btn.querySelector('span');if(old)old.replaceWith(artNode(name,'tb-official-portrait'));
  });
}
function enhanceTeamPools(){
  document.querySelectorAll('.pool-list .chip:not([data-portrait-ready])').forEach(chip=>{
    const text=[...chip.childNodes].find(n=>n.nodeType===Node.TEXT_NODE)?.textContent?.trim();if(!text)return;chip.dataset.portraitReady='1';chip.prepend(artNode(text,'pool-mini-portrait'));
  });
}
function apply(){const route=location.hash.replace('#/','').split('?')[0]||'home';if(route==='comps')enhanceCompositions();if(route==='tactical')enhanceTacticalGrid();if(route==='team')enhanceTeamPools();}
const observer=new MutationObserver(()=>apply());
observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(apply));
requestAnimationFrame(apply);
