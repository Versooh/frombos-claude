// FROMBOS V20.18 — render/image performance hints.
// Presentation/network hints only. No competitive or workspace data is changed.

const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];

const lowSelectors=[
  '.ci-grid img',
  '#drChampGrid img',
  '#tbChampGrid img',
  '.composition-card .comp-lineup img',
  '.sc-reg-player img',
  '.vod-note-card img',
  '.series-v20-portraits img'
];
const highSelectors=[
  '.ci-hero img',
  '.lab-hero img',
  '.ci-card.is-selected img',
  '.dr-slot.filled img',
  '.vod-note-card.active img'
];

function setPriority(img,level){
  if(!(img instanceof HTMLImageElement))return;
  img.decoding='async';
  if(level==='high'){
    img.loading='eager';
    try{img.fetchPriority='high';}catch{}
  }else{
    if(!img.closest('.ci-card.is-selected,.dr-slot.filled,.vod-note-card.active'))img.loading='lazy';
    try{if(!img.closest('.ci-card.is-selected,.dr-slot.filled,.vod-note-card.active'))img.fetchPriority='low';}catch{}
  }
}
function applyImageHints(){
  const seen=new Set();
  lowSelectors.forEach(selector=>qa(selector).forEach(img=>{seen.add(img);setPriority(img,'low');}));
  highSelectors.forEach(selector=>qa(selector).forEach(img=>{seen.add(img);setPriority(img,'high');}));
  document.body.dataset.v20ImageHints=String(seen.size);
}
function markPerformanceLayer(){
  const content=q('.content');if(content)content.dataset.renderPerfV20='1';
}
function apply(){markPerformanceLayer();applyImageHints();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;
  if(runtime?.subscribe){runtime.subscribe(apply);return;}
  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
}
bindRuntime();

window.FROMBOS_RENDER_PERFORMANCE_V20={apply};
