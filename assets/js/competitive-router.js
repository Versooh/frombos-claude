import { competitiveHTML, bindCompetitive, scoutingHTML, bindScouting } from './competitive-intelligence.js';

function pageHead(kicker,title,desc,actions=''){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div><div>${actions}</div></div>`;}
function current(){return location.hash.replace('#/','').split('?')[0]||'home';}
function render(){
  const route=current();
  if(route!=='competitive'&&route!=='scouting')return;
  requestAnimationFrame(()=>{
    const content=document.querySelector('.content');if(!content)return;
    if(route==='competitive'){
      content.innerHTML=`${pageHead('COMPETITIVE INTELLIGENCE','Cenário competitivo','Dados observados por evento, equipe e jogador. Resultado da amostra não vira tier automaticamente.')} ${competitiveHTML()}`;
      bindCompetitive();
    }else{
      content.innerHTML=`${pageHead('SCOUTING WAR ROOM','Preparação de adversário','Separe fato observado, hipótese do coach e campos ainda desconhecidos antes de alimentar o Draft.')} ${scoutingHTML()}`;
      bindScouting(render);
    }
  });
}
window.addEventListener('hashchange',render);
render();
