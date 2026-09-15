import { matchCenterHTML, bindMatchCenter } from './match-center-v18.js';
function pageHead(kicker,title,desc){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div></div>`;}
function render(){if((location.hash.replace('#/','').split('?')[0]||'home')!=='matches')return;requestAnimationFrame(()=>requestAnimationFrame(()=>{const content=document.querySelector('.content');if(!content)return;content.innerHTML=`${pageHead('MATCH CENTER V18','Jogos & Scrims','Registre partidas, conecte Draft e VOD e mantenha leitura descritiva com amostra sempre visível.')} ${matchCenterHTML()}`;bindMatchCenter(render);}));}
window.addEventListener('hashchange',render);window.addEventListener('load',render);render();
