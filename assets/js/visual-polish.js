import { championAsset } from './champion-intelligence.js';

const SVG_NS='http://www.w3.org/2000/svg';
function initial(name){return name.split(/\s+/).map(x=>x[0]).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();}
function artNode(name,className){const wrap=document.createElement('span');wrap.className=className;const asset=championAsset(name);if(asset?.portrait){const img=document.createElement('img');img.src=asset.portrait;img.alt=name;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{wrap.textContent=initial(name);wrap.classList.add('portrait-text-fallback');};wrap.appendChild(img);}else{wrap.textContent=initial(name);wrap.classList.add('portrait-text-fallback');}return wrap;}
function enhanceCompositions(){document.querySelectorAll('.comp-lineup .champ-slot:not([data-portrait-ready])').forEach(slot=>{const label=slot.querySelector('b')?.textContent?.trim();if(!label||label==='—')return;slot.dataset.portraitReady='1';slot.prepend(artNode(label,'comp-portrait'));});}
function enhanceTacticalGrid(){document.querySelectorAll('#tbChampGrid .tb-champ[data-champion]:not([data-portrait-ready])').forEach(btn=>{const name=btn.dataset.champion;if(!name)return;btn.dataset.portraitReady='1';const old=btn.querySelector('span');if(old)old.replaceWith(artNode(name,'tb-official-portrait'));});}
function enhanceTacticalMarkers(){
  document.querySelectorAll('#tbChampions g[data-marker-id]:not([data-official-portrait])').forEach(group=>{
    const texts=[...group.querySelectorAll('text')];const name=texts.find(t=>Number(t.getAttribute('y'))>20)?.textContent?.trim();if(!name)return;
    const asset=championAsset(name);if(!asset?.portrait)return;group.dataset.officialPortrait='1';
    const image=document.createElementNS(SVG_NS,'image');image.setAttribute('href',asset.portrait);image.setAttribute('x','-27');image.setAttribute('y','-27');image.setAttribute('width','54');image.setAttribute('height','54');image.setAttribute('preserveAspectRatio','xMidYMid slice');image.style.clipPath='circle(50% at 50% 50%)';image.style.pointerEvents='none';
    image.addEventListener('error',()=>image.remove(),{once:true});
    const halo=group.querySelector('circle');if(halo?.nextSibling)group.insertBefore(image,halo.nextSibling);else group.prepend(image);
    const initials=texts.find(t=>Number(t.getAttribute('y'))<=20);if(initials)initials.style.display='none';
  });
}
function enhanceTeamPools(){document.querySelectorAll('.pool-list .chip:not([data-portrait-ready])').forEach(chip=>{const text=[...chip.childNodes].find(n=>n.nodeType===Node.TEXT_NODE)?.textContent?.trim();if(!text)return;chip.dataset.portraitReady='1';chip.prepend(artNode(text,'pool-mini-portrait'));});}
function apply(){const route=location.hash.replace('#/','').split('?')[0]||'home';if(route==='comps')enhanceCompositions();if(route==='tactical'){enhanceTacticalGrid();enhanceTacticalMarkers();}if(route==='team')enhanceTeamPools();}
const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',()=>requestAnimationFrame(apply));requestAnimationFrame(apply);
