// FROMBOS V23 — Light Arena interaction controller
// Presentation-only enhancement layer. Does not mutate competitive evidence or draft decisions.
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const tones={
  home:['#176bff','Início','⌂'],comps:['#5d6fe8','Composições','⬡'],draft:['#176bff','Draft Room','⚑'],series:['#7b5cff','Fearless / Série','◆'],
  pool:['#7657e6','Champion Pool','◈'],champions:['#7657e6','Campeões','◇'],matchups:['#e55367','Matchups','⇄'],builds:['#d5a437','Builds','▦'],
  scouting:['#f59d45','Scouting','⌖'],tactical:['#1ab6a3','Tactical','◎'],vod:['#d94fc7','VOD','▶'],training:['#2eaf6d','Treinos','↗'],
  reports:['#d5a437','Relatórios','▥'],competitive:['#2e8bff','Open Series','♜'],data:['#64748b','Data','⌁'],team:['#16a3d9','Equipe','◉'],settings:['#64748b','Configurações','⚙'],
  'match-center':['#2e8bff','Match Center','◫']
};
const quick=['draft','comps','pool','scouting','tactical','vod','training','reports'];
const mobile=['home','draft','scouting','tactical','pool'];
const tone=id=>tones[id]||['#176bff',id,'•'];

function setRouteTheme(){
  const id=route();document.documentElement.style.colorScheme='light';document.body.classList.add('v23-light');document.body.dataset.v23Route=id;
}
function decorateNav(){
  document.querySelectorAll('.nav-item[data-route]').forEach(item=>{
    const [color]=tone(item.dataset.route);item.style.setProperty('--v23-item',color);item.dataset.v23Color='1';
  });
}
function decorateModuleCards(){
  document.querySelectorAll('.fb-module-card[data-fb-go]').forEach(card=>{
    const [color]=tone(card.dataset.fbGo);card.style.setProperty('--module',color);
  });
}
function homeArt(){
  const preferred=['Jinx','Ahri','Yasuo','Kai’Sa','Kai\'Sa','Akali','Irelia','Riven'];
  for(const name of preferred){if(CHAMPION_REGISTRY[name]?.splash)return CHAMPION_REGISTRY[name].splash;}
  return Object.values(CHAMPION_REGISTRY).find(x=>x?.splash)?.splash||'';
}
function enhanceHome(){
  if(route()!=='home')return;const hero=document.querySelector('.content[data-page="home"] .hero');if(!hero)return;
  const art=homeArt();if(art)hero.style.setProperty('--v23-home-art',`url("${art.replace(/"/g,'%22')}")`);
  const lead=hero.firstElementChild;if(lead&&!lead.dataset.v23Hero){lead.dataset.v23Hero='1';lead.innerHTML=`<div class="eyebrow">INTELIGÊNCIA COMPETITIVA PARA WILD RIFT</div><h1>O PRÓXIMO <span class="v23-gold">GG</span><br>COMEÇA NO DRAFT.</h1><p>Dados. Estratégia. Treinos. Evolução.<br>Tudo que seu time precisa para preparar melhor cada série.</p><div class="top-actions" style="margin-top:22px"><button class="btn primary" data-fb-go="draft">Começar agora →</button><button class="btn info" data-fb-go="comps">Explorar recursos</button></div>`;}
}
function routeChip(){
  const id=route();const head=document.querySelector('.page-head');if(!head||head.querySelector('.v23-route-chip'))return;const [color,label,icon]=tone(id);const chip=document.createElement('div');chip.className='v23-route-chip';chip.style.setProperty('--v23-accent',color);chip.innerHTML=`<i></i><span>${icon} ${label}</span>`;head.firstElementChild?.prepend(chip);
}
function functionStrip(){
  const id=route();if(id==='home')return;const head=document.querySelector('.page-head');const content=document.querySelector('.content');if(!head||!content||content.querySelector('.v23-function-strip'))return;
  const relevant=id==='draft'?['series','comps','pool','scouting','tactical']:id==='scouting'?['draft','vod','tactical','series','reports']:id==='tactical'?['scouting','vod','draft','comps','training']:id==='champions'||id==='pool'?['matchups','builds','draft','comps','scouting']:id==='training'?['vod','reports','tactical','team','draft']:quick.slice(0,6);
  const strip=document.createElement('div');strip.className='v23-function-strip';strip.setAttribute('aria-label','Atalhos de funções');strip.innerHTML=relevant.map(r=>{const [c,l,i]=tone(r);return `<button type="button" class="v23-function-link" style="--fn:${c}" data-v23-go="${r}"><i></i><span>${i} ${l}</span></button>`}).join('');head.insertAdjacentElement('afterend',strip);strip.querySelectorAll('[data-v23-go]').forEach(btn=>btn.onclick=()=>location.hash=`#/${btn.dataset.v23Go}`);
}
function colorFunctionalControls(){
  document.querySelectorAll('[data-fb-go]').forEach(el=>{const [c]=tone(el.dataset.fbGo);el.style.setProperty('--module',c);});
  const toolColors={select:'#176bff',champion:'#7b5cff',ward:'#1ab6a3',control:'#e55367',arrow:'#16b8e8',pen:'#d5a437',zone:'#8a63e8',danger:'#e55367',objective:'#f59d45',text:'#536fe0',eraser:'#64748b'};
  document.querySelectorAll('.tb-tool[data-tool]').forEach(el=>el.style.setProperty('--tool',toolColors[el.dataset.tool]||'#176bff'));
}
function mobileDock(){
  let dock=document.querySelector('.v23-mobile-dock');if(!dock){dock=document.createElement('nav');dock.className='v23-mobile-dock';dock.setAttribute('aria-label','Navegação mobile FROMBOS');document.body.appendChild(dock);}
  const current=route();dock.innerHTML=mobile.map(id=>{const [c,l,i]=tone(id);return `<button type="button" class="${current===id?'active':''}" style="--fn:${c}" data-v23-mobile="${id}"><span>${i}</span><b>${l.replace('Champion ','')}</b></button>`}).join('');dock.querySelectorAll('[data-v23-mobile]').forEach(btn=>btn.onclick=()=>location.hash=`#/${btn.dataset.v23Mobile}`);
}
function bindGo(){document.querySelectorAll('[data-fb-go]').forEach(btn=>{if(btn.dataset.v23Bound)return;btn.dataset.v23Bound='1';btn.addEventListener('click',()=>location.hash=`#/${btn.dataset.fbGo}`);});}
function reveal(){
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const nodes=[...document.querySelectorAll('.content .card,.fb-home-kpi,.fb-module-card')].filter(n=>!n.dataset.v23Reveal);
  if(!nodes.length)return;const io=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}},{threshold:.06,rootMargin:'40px 0px'});
  nodes.forEach((n,i)=>{n.dataset.v23Reveal='1';n.classList.add('v23-reveal');n.style.transitionDelay=`${Math.min(i%8,6)*28}ms`;io.observe(n);});
}
function pointerLight(){
  if(!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;
  document.querySelectorAll('.content .card').forEach(card=>{if(card.dataset.v23Pointer)return;card.dataset.v23Pointer='1';card.classList.add('v23-pointer');card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`);});});
}
function accentExistingHero(){
  const id=route();const hero=document.querySelector('.ci-hero,.lab-hero,.fb-pool-hero,.v22-hero,.scouting-hero,.series-command-hero');if(hero)hero.dataset.v23Accent=id;
}
function apply(){
  setRouteTheme();decorateNav();decorateModuleCards();enhanceHome();routeChip();functionStrip();colorFunctionalControls();mobileDock();bindGo();accentExistingHero();reveal();pointerLight();
}
window.addEventListener('hashchange',()=>queueMicrotask(apply));
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(()=>queueMicrotask(apply));
window.addEventListener('load',()=>queueMicrotask(apply));queueMicrotask(apply);
window.FROMBOS_V23_LIGHT_ARENA={apply,tones};
