// FROMBOS V24.4 — Champion Media + Interaction System
// Presentation only: no store writes, no competitive data mutation, no network fetches.
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const clean=v=>String(v??'').trim();
const registryValues=()=>Object.values(CHAMPION_REGISTRY||{});
const asset=name=>CHAMPION_REGISTRY?.[name]||registryValues().find(x=>x?.name===name)||null;
const preferredHome=['Jinx','Ahri','Kai\'Sa','Akali','Irelia','Riven','Yasuo'];

const ICONS={
  home:'<path d="M3 11.2 12 4l9 7.2"/><path d="M5.4 10.4V20h13.2v-9.6"/><path d="M9.2 20v-5.6h5.6V20"/>',
  team:'<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.8 20c.5-4 2.6-6 5.2-6s4.7 2 5.2 6"/><path d="M13.5 15.3c1-.9 2-1.3 3.2-1.3 2.2 0 3.8 1.7 4.3 5"/>',
  comps:'<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="15" width="7" height="5" rx="1"/><rect x="14" y="15" width="7" height="5" rx="1"/>',
  draft:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="m17.2 14.5 1.8 1.8 3-3"/>',
  series:'<path d="M5 4h14v4H5zM5 10h14v4H5zM5 16h14v4H5z"/><path d="M9 6h6M9 12h6M9 18h6"/>',
  tactical:'<path d="M4 5.5 9 3l6 2.5L20 3v15.5L15 21l-6-2.5L4 21z"/><path d="M9 3v15.5M15 5.5V21"/><circle cx="12" cy="12" r="2"/>',
  vod:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
  champions:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.8-5 3.1-7.5 7-7.5S18.2 16 19 21"/><path d="M7 4.5 4.5 2M17 4.5 19.5 2"/>',
  pool:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.8-5 3.1-7.5 7-7.5S18.2 16 19 21"/><path d="M4 12h4M16 12h4"/>',
  scouting:'<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5"/><path d="M8.5 11h5M11 8.5v5"/>',
  matchups:'<path d="M4 7h11M11 3l4 4-4 4"/><path d="M20 17H9M13 13l-4 4 4 4"/>',
  builds:'<path d="M4 20h16M6 17l4-4 3 2 5-7"/><circle cx="18" cy="8" r="2"/>',
  training:'<path d="M4 7h16v10H4z"/><path d="M8 7V4h8v3M8 17v3h8v-3"/><path d="M9 12h6"/>',
  reports:'<path d="M5 20V10M10 20V6M15 20v-8M20 20V3"/>',
  data:'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 14.8 6L14.5 3h-5L9.2 6a7 7 0 0 0-1.7 1.1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3.1 14.5l2 3.4 2.4-1A7 7 0 0 0 9.2 18l.3 3h5l.3-3a7 7 0 0 0 1.7-1.1l2.4 1 2-3.4L18.9 13c.1-.3.1-.7.1-1Z"/>',
  meta:'<path d="M4 19 9 9l4 6 3-4 4 8"/><path d="M4 5h16"/>',
  competitive:'<path d="M4 20V9h4v11M10 20V4h4v16M16 20v-7h4v7"/>',
  fallback:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'
};

const iconSVG=id=>`<svg class="v244-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[id]||ICONS.fallback}</svg>`;

function selectedChampion(){
  const q=new URLSearchParams(location.hash.split('?')[1]||'');
  return clean(q.get('champion'))||clean(document.querySelector('#championDrawerV21')?.dataset.champion)||clean(document.querySelector('[data-ci-champion][aria-current="true"]')?.dataset.ciChampion)||clean(document.querySelector('[data-ci-champion].active')?.dataset.ciChampion)||'';
}
function homeChampion(){
  for(const name of preferredHome){const a=asset(name);if(a?.splash)return a;}
  return registryValues().find(x=>x?.splash)||registryValues().find(x=>x?.portrait)||null;
}
function createMedia(assetData,className,credit){
  const figure=document.createElement('figure');figure.className=className;
  const img=document.createElement('img');img.alt=assetData?.name?`${assetData.name} — arte oficial Wild Rift`:'Arte oficial Wild Rift';img.decoding='async';img.loading='eager';
  try{img.fetchPriority='high';}catch{}
  const src=assetData?.splash||assetData?.portrait||'';if(src)img.src=src;
  img.addEventListener('error',()=>{if(assetData?.portrait&&img.src!==assetData.portrait)img.src=assetData.portrait;},{once:true});
  figure.appendChild(img);
  if(credit){const label=document.createElement('figcaption');label.className='v244-media-credit';label.textContent=`${assetData?.name||'Wild Rift'} · RIOT OFFICIAL`;figure.appendChild(label);}
  return figure;
}

function applyRoot(){document.body.classList.add('v244-media-system');document.body.dataset.v244Route=route();}

function decorateNavigation(){
  document.querySelectorAll('.nav-item[data-route]').forEach(item=>{
    const slot=item.querySelector('span:first-child');if(slot&&!slot.dataset.v244Icon){slot.innerHTML=iconSVG(item.dataset.route);slot.dataset.v244Icon='1';}
  });
  document.querySelectorAll('[data-v23-go],[data-fb-go]').forEach(item=>{
    if(item.querySelector('.v244-fn-icon'))return;
    const target=item.dataset.v23Go||item.dataset.fbGo||'fallback';
    const badge=document.createElement('span');badge.className='v244-fn-icon';badge.innerHTML=iconSVG(target);item.prepend(badge);
  });
  document.querySelectorAll('.v243-flow-step[data-v243-flow-go]').forEach(item=>{
    if(item.querySelector('.v244-flow-icon'))return;
    const icon=document.createElement('span');icon.className='v244-flow-icon';icon.innerHTML=iconSVG(item.dataset.v243FlowGo);item.prepend(icon);
  });
}

function decorateHome(){
  if(route()!=='home')return;
  const hero=document.querySelector('.content[data-page="home"] .hero');if(!hero)return;
  const a=homeChampion();if(!a)return;
  const current=hero.querySelector('.v244-hero-media');
  if(current?.dataset.champion===a.name)return;
  current?.remove();
  const media=createMedia(a,'v244-hero-media',true);media.dataset.champion=a.name||'';hero.appendChild(media);
}

function upgradeCardImages(){
  document.querySelectorAll('.ci-card[data-ci-champion],.draft-champ-card[data-champ]').forEach(card=>{
    const name=clean(card.dataset.ciChampion||card.dataset.champ);const a=asset(name);const img=card.querySelector('img');if(!a||!img)return;
    const src=a.portrait||a.splash;if(src&&img.dataset.v244Media!==src){img.src=src;img.dataset.v244Media=src;img.alt=name;img.decoding='async';img.loading='lazy';}
  });
}

function decorateChampionDetail(){
  const name=selectedChampion();if(!name)return;const a=asset(name);if(!a?.splash)return;
  document.querySelectorAll('.ci-hero,.lab-hero').forEach(hero=>{
    const old=hero.querySelector('.v244-detail-media');
    if(old?.dataset.champion===name)return;
    old?.remove();const media=createMedia(a,'v244-detail-media',false);media.dataset.champion=name;hero.appendChild(media);
  });
}

function ensureMapFocus(){
  if(route()!=='tactical')return;
  const boardCard=document.querySelector('.tb-board-card');const zoom=document.querySelector('.tb-zoom');const board=document.querySelector('#tbBoard');if(!boardCard||!zoom||!board)return;
  board.dataset.v244Map='presentation-enhanced';
  if(zoom.querySelector('[data-v244-map-focus]'))return;
  const btn=document.createElement('button');btn.type='button';btn.className='v244-map-focus';btn.dataset.v244MapFocus='1';btn.title='Alternar modo de foco do mapa';btn.setAttribute('aria-label','Alternar modo de foco do mapa');btn.innerHTML=iconSVG('tactical');
  btn.addEventListener('click',async()=>{
    try{
      if(document.fullscreenElement===boardCard)await document.exitFullscreen();
      else if(boardCard.requestFullscreen)await boardCard.requestFullscreen();
    }catch{}
  });
  zoom.appendChild(btn);
}

function syncFullscreen(){
  const btn=document.querySelector('[data-v244-map-focus]');const boardCard=document.querySelector('.tb-board-card');if(!btn||!boardCard)return;
  const active=document.fullscreenElement===boardCard;btn.setAttribute('aria-pressed',active?'true':'false');btn.title=active?'Sair do modo de foco':'Abrir modo de foco do mapa';
}

function improveImageSemantics(){
  document.querySelectorAll('.ci-portrait,.draft-champ-portrait,.ci-detail-portrait,.lab-portrait').forEach(img=>{
    img.decoding='async';if(!img.loading)img.loading='lazy';
  });
}

function apply(){applyRoot();decorateNavigation();decorateHome();upgradeCardImages();decorateChampionDetail();ensureMapFocus();improveImageSemantics();syncFullscreen();}
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('fullscreenchange',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V24_4_MEDIA_DESIGN_SYSTEM={apply,schedule,iconSVG};
