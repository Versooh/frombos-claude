import { metaIntelligenceHTML, bindMetaIntelligence } from './meta-intelligence.js';
function pageHead(kicker,title,desc){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div></div>`;}
function render(){if((location.hash.replace('#/','').split('?')[0]||'home')!=='meta')return;requestAnimationFrame(()=>{const content=document.querySelector('.content');if(!content)return;content.innerHTML=`${pageHead('META INTELLIGENCE','Meta por camadas','Patch, ranqueada CN, curadoria e competitivo são sinais diferentes. O FROMBOS mostra cada origem antes de sintetizar.')} ${metaIntelligenceHTML()}`;bindMetaIntelligence();});}
window.addEventListener('hashchange',render);render();
