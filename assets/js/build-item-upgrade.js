import { itemAsset } from './item-assets.js';

const done=new WeakSet();
function upgradeItems(){
  document.querySelectorAll('.build-item-pill').forEach(pill=>{
    if(done.has(pill))return;
    const name=pill.querySelector('b')?.textContent?.trim();
    const glyph=pill.querySelector('.item-glyph');
    if(!name||!glyph)return;
    done.add(pill);
    const {icon}=itemAsset(name);
    glyph.textContent='';
    glyph.classList.add('has-item-icon');
    const img=document.createElement('img');
    img.src=icon;img.alt=name;img.loading='lazy';img.referrerPolicy='no-referrer';img.className='build-item-icon';
    img.onerror=()=>{img.remove();glyph.classList.remove('has-item-icon');glyph.textContent='◆';};
    glyph.appendChild(img);
  });
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;upgradeItems();});};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);schedule();
