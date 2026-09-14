import { store } from './store.js';
import { championAsset } from './champion-intelligence.js';

const SVG_NS='http://www.w3.org/2000/svg';
const done=new WeakSet();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const generic=/content_organization\/20aeb6046d11ff197c4eeb93150853ddf2ff14c0/i;
function activeScenario(){const t=store.state.tactical;if(!t?.scenarios?.length)return null;return t.scenarios.find(x=>x.id===t.activeScenario)||t.scenarios[0];}
function portrait(name){const a=championAsset(name)||{};if(a.portrait&&!generic.test(a.portrait))return a.portrait;if(a.splash)return a.splash;return a.portrait||null;}
function svg(tag,attrs={}){const el=document.createElementNS(SVG_NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function replaceImg(img,name){const src=portrait(name);if(!img||!src)return;img.src=src;img.onerror=()=>{img.onerror=null;};}

function upgradeChampionBrowser(){
  document.querySelectorAll('[data-ci-champion]').forEach(card=>{const name=card.dataset.ciChampion;replaceImg(card.querySelector('img'),name);});
  const q=new URLSearchParams(location.hash.split('?')[1]||''),name=q.get('champion');if(name){replaceImg(document.querySelector('.ci-detail-portrait'),name);replaceImg(document.querySelector('.lab-portrait'),name);}
}
function upgradeDraft(){
  document.querySelectorAll('.draft-champ-card[data-champ]').forEach(card=>replaceImg(card.querySelector('img'),card.dataset.champ));
  document.querySelectorAll('.dr-slot.filled').forEach(slot=>{const name=slot.querySelector('.dr-slot-copy b')?.textContent?.trim();if(name)replaceImg(slot.querySelector('img'),name);});
  const picker=document.querySelector('.champion-select');if(picker)picker.dataset.portraitPicker='ready';
}
function upgradeMapMarkers(){
  const scenario=activeScenario();if(!scenario)return;
  document.querySelectorAll('#tbChampions [data-marker-id]').forEach(g=>{
    const marker=scenario.markers?.find(x=>x.id===g.getAttribute('data-marker-id'));if(!marker||marker.type!=='champion')return;
    const src=portrait(marker.label);if(!src)return;
    const selected=g.querySelector('circle[stroke="#fff"]')?.cloneNode(true);g.replaceChildren();if(selected)g.appendChild(selected);
    const safeId=String(marker.id).replace(/[^a-zA-Z0-9_-]/g,''),clipId=`cp-${safeId}`;let defs=document.querySelector('#tbBoard defs');
    if(defs&&!defs.querySelector(`[id="${clipId}"]`)){const cp=svg('clipPath',{id:clipId});cp.appendChild(svg('circle',{cx:0,cy:0,r:19}));defs.appendChild(cp);}
    const ring=marker.team==='red'?'#ff5364':'#43ccff';const im=svg('image',{href:src,x:-19,y:-19,width:38,height:38,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#${clipId})`});
    im.setAttributeNS('http://www.w3.org/1999/xlink','href',src);g.appendChild(im);g.appendChild(svg('circle',{r:20,fill:'none',stroke:ring,'stroke-width':3}));
    const label=svg('text',{x:0,y:31,'text-anchor':'middle',fill:'#fff','font-size':8,'font-weight':800,stroke:'#02060b','stroke-width':2,'paint-order':'stroke'});label.textContent=String(marker.label||'').slice(0,14);g.appendChild(label);
  });
  document.querySelectorAll('#tbVision [data-marker-id]').forEach(g=>{[...g.children].forEach(el=>{if(el.tagName.toLowerCase()==='circle'&&el.getAttribute('r')==='105')return;if(!el.getAttribute('data-compact')){el.setAttribute('transform',`${el.getAttribute('transform')||''} scale(.72)`.trim());el.setAttribute('data-compact','1');}});});
}
function upgradeTacticalPicker(){document.querySelectorAll('#tbChampGrid .tb-champ').forEach(btn=>{const name=btn.dataset.champion,src=portrait(name);if(!src||done.has(btn))return;done.add(btn);const old=btn.querySelector('span');if(!old)return;old.textContent='';const img=document.createElement('img');img.src=src;img.alt=name;img.loading='lazy';img.referrerPolicy='no-referrer';img.className='tb-champ-portrait';old.appendChild(img);});}
function upgradeCompositions(){document.querySelectorAll('.comp-lineup .champ-slot').forEach(slot=>{if(done.has(slot))return;const name=slot.querySelector('b')?.textContent?.trim(),src=portrait(name);if(!src)return;done.add(slot);const wrap=document.createElement('span');wrap.className='comp-portrait-wrap';wrap.innerHTML=`<img class="comp-portrait" src="${esc(src)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer">`;slot.insertBefore(wrap,slot.firstChild);});}
function apply(){upgradeChampionBrowser();upgradeDraft();upgradeMapMarkers();upgradeTacticalPicker();upgradeCompositions();}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});};
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);schedule();
