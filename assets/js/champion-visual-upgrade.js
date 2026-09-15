import { store } from './store.js';
import { championAsset } from './champion-intelligence.js';

const SVG_NS='http://www.w3.org/2000/svg';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const generic=/content_organization\/20aeb6046d11ff197c4eeb93150853ddf2ff14c0/i;
const signatures=new WeakMap();

function activeScenario(){const t=store.state.tactical;if(!t?.scenarios?.length)return null;return t.scenarios.find(x=>x.id===t.activeScenario)||t.scenarios[0];}
function portrait(name){const a=championAsset(name)||{};if(a.portrait&&!generic.test(a.portrait))return a.portrait;if(a.splash&&!generic.test(a.splash))return a.splash;return null;}
function initials(name){return String(name||'?').split(/\s+/).map(x=>x[0]).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase()||'?';}
function svg(tag,attrs={}){const el=document.createElementNS(SVG_NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function replaceImg(img,name){const src=portrait(name);if(!img||!src)return;img.hidden=false;img.src=src;img.referrerPolicy='no-referrer';img.onerror=()=>{img.onerror=null;img.hidden=true;};}
function imageNode(name,className){const src=portrait(name);const wrap=document.createElement('span');wrap.className=className;wrap.dataset.championPortrait=name;if(src){const img=document.createElement('img');img.src=src;img.alt=name;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onerror=()=>{wrap.classList.add('portrait-text-fallback');wrap.textContent=initials(name);};wrap.appendChild(img);}else{wrap.classList.add('portrait-text-fallback');wrap.textContent=initials(name);}return wrap;}
function directChildren(el,selector){return [...el.children].filter(x=>x.matches(selector));}

function upgradeChampionBrowser(){
  document.querySelectorAll('[data-ci-champion]').forEach(card=>{const name=card.dataset.ciChampion;replaceImg(card.querySelector('img'),name);});
  const q=new URLSearchParams(location.hash.split('?')[1]||''),name=q.get('champion');if(name){replaceImg(document.querySelector('.ci-detail-portrait'),name);replaceImg(document.querySelector('.lab-portrait'),name);}
}

function upgradeDraft(){
  document.querySelectorAll('.draft-champ-card[data-champ]').forEach(card=>replaceImg(card.querySelector('img'),card.dataset.champ));
  document.querySelectorAll('.dr-slot.filled').forEach(slot=>{const name=slot.querySelector('.dr-slot-copy b')?.textContent?.trim();if(name)replaceImg(slot.querySelector('img'),name);});
  document.querySelector('.champion-select')?.setAttribute('data-portrait-picker','v20');
}

function upgradeMapMarkers(){
  const scenario=activeScenario();if(!scenario)return;
  document.querySelectorAll('#tbChampions [data-marker-id]').forEach(g=>{
    const marker=scenario.markers?.find(x=>x.id===g.getAttribute('data-marker-id'));if(!marker||marker.type!=='champion')return;
    const src=portrait(marker.label);if(!src)return;
    if(g.dataset.portraitSource===src)return;
    const selected=g.querySelector('circle[stroke="#fff"]')?.cloneNode(true);g.replaceChildren();if(selected)g.appendChild(selected);
    const safeId=String(marker.id).replace(/[^a-zA-Z0-9_-]/g,''),clipId=`cp-v20-${safeId}`;let defs=document.querySelector('#tbBoard defs');
    if(defs&&!defs.querySelector(`[id="${clipId}"]`)){const cp=svg('clipPath',{id:clipId});cp.appendChild(svg('circle',{cx:0,cy:0,r:22}));defs.appendChild(cp);}
    const ring=marker.team==='red'?'#ff5364':'#43ccff';const im=svg('image',{href:src,x:-22,y:-22,width:44,height:44,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#${clipId})`});
    im.setAttributeNS('http://www.w3.org/1999/xlink','href',src);g.appendChild(im);g.appendChild(svg('circle',{r:23,fill:'none',stroke:ring,'stroke-width':3.5}));
    const label=svg('text',{x:0,y:36,'text-anchor':'middle',fill:'#fff','font-size':9,'font-weight':800,stroke:'#02060b','stroke-width':2.5,'paint-order':'stroke'});label.textContent=String(marker.label||'').slice(0,14);g.appendChild(label);g.dataset.portraitSource=src;
  });
}

function upgradeTacticalPicker(){
  document.querySelectorAll('#tbChampGrid .tb-champ').forEach(btn=>{
    const name=btn.dataset.champion||btn.querySelector('small')?.textContent?.trim();if(!name)return;
    const src=portrait(name),sig=src||`fallback:${name}`;if(signatures.get(btn)===sig)return;signatures.set(btn,sig);
    const old=btn.querySelector('span');if(!old)return;old.replaceWith(imageNode(name,'tb-champ-v20-portrait'));
  });
}

function upgradeCompositions(){
  document.querySelectorAll('.comp-lineup .champ-slot').forEach(slot=>{
    const name=slot.querySelector('b')?.textContent?.trim();if(!name||name==='—')return;
    const src=portrait(name),sig=src||`fallback:${name}`;
    if(signatures.get(slot)===sig&&directChildren(slot,'.comp-v20-portrait').length===1)return;
    signatures.set(slot,sig);
    /* V20 canonicalizes old V4/V10 injectors: exactly one direct portrait per slot. */
    directChildren(slot,'.comp-portrait-wrap,.comp-portrait,.comp-v20-portrait,[data-champion-portrait]').forEach(x=>x.remove());
    slot.prepend(imageNode(name,'comp-v20-portrait'));
    slot.dataset.portraitReady='v20';
  });
}

function upgradeTeamPools(){
  document.querySelectorAll('.pool-list .chip').forEach(chip=>{
    const text=[...chip.childNodes].find(n=>n.nodeType===Node.TEXT_NODE)?.textContent?.trim();if(!text)return;
    const name=text.replace(/×\s*$/,'').trim(),src=portrait(name),sig=src||`fallback:${name}`;
    if(signatures.get(chip)===sig&&directChildren(chip,'.pool-v20-portrait').length===1)return;signatures.set(chip,sig);
    directChildren(chip,'.pool-mini-portrait,.pool-v20-portrait,[data-champion-portrait]').forEach(x=>x.remove());
    chip.prepend(imageNode(name,'pool-v20-portrait'));chip.dataset.portraitReady='v20';
  });
}

function upgradeSeries(){
  document.querySelectorAll('[data-open-game]').forEach(button=>{
    const card=button.closest('article.card');if(!card)return;const p=[...card.querySelectorAll('p')].find(x=>x.textContent.trim().startsWith('Picks:'));if(!p)return;
    const names=p.textContent.replace(/^Picks:\s*/,'').split('·').map(x=>x.trim()).filter(Boolean);const sig=names.join('|');if(!names.length||signatures.get(p)===sig)return;signatures.set(p,sig);
    p.hidden=true;card.querySelector('.series-v20-portraits')?.remove();const row=document.createElement('div');row.className='series-v20-portraits';
    names.forEach(name=>{const item=imageNode(name,'series-v20-portrait');item.title=name;row.appendChild(item);});p.after(row);
  });
}

function apply(){
  upgradeChampionBrowser();upgradeDraft();upgradeCompositions();upgradeTeamPools();upgradeSeries();upgradeTacticalPicker();upgradeMapMarkers();
}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});};
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);schedule();
