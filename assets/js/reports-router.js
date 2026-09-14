import { reportsHTML, bindReports } from './reports.js';
function pageHead(kicker,title,desc){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div></div>`;}
function render(){if((location.hash.replace('#/','').split('?')[0]||'home')!=='reports')return;requestAnimationFrame(()=>{const content=document.querySelector('.content');if(!content)return;content.innerHTML=`${pageHead('PERFORMANCE REPORTS','Relatórios','Métricas reais do workspace: roster, pools, drafts, VODs, cenários táticos e treinos.')} ${reportsHTML()}`;bindReports();});}
window.addEventListener('hashchange',render);render();
