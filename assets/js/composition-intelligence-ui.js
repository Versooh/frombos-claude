import { analyzeComposition, structuralLabel } from './structural-intelligence.js';

const done=new WeakMap();
function upgrade(){
  document.querySelectorAll('article.card:has([data-comp-draft])').forEach(card=>{
    const champs=[...card.querySelectorAll('.champ-slot b')].map(x=>x.textContent.trim()).filter(Boolean);
    const sig=champs.join('|');if(done.get(card)===sig)return;done.set(card,sig);
    card.querySelector('.comp-intel')?.remove();const a=analyzeComposition(champs);
    const keys=['frontline','engage','peel','waveclear','sustained','objectiveDps','poke','side','early','scaling'];
    const wrap=document.createElement('div');wrap.className='comp-intel';wrap.innerHTML=`<div class="comp-intel-head"><span>COMPOSITION INTELLIGENCE</span><b>FROMBOS_STRUCTURAL</b></div><div class="comp-intel-chips">${keys.map(k=>`<span class="${a.counts[k]>0?'on':'off'}"><i>${a.counts[k]>0?'✓':'—'}</i>${structuralLabel(k)}</span>`).join('')}</div>${a.warnings.length?`<div class="comp-intel-warn">${a.warnings.join(' · ')}</div>`:''}`;const btn=card.querySelector('[data-comp-draft]');btn?.parentElement?.insertBefore(wrap,btn);
  });
}
let q=false;const schedule=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;upgrade();});};new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);schedule();
