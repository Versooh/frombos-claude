// FROMBOS VOD V14 runtime polish.
function syncVodV14(){
  if(!location.hash.startsWith('#/vod'))return;
  const playerFilter=document.querySelector('#vodFilterPlayer');
  if(playerFilter&&!playerFilter.dataset.v14Ready){
    playerFilter.dataset.v14Ready='1';
    playerFilter.value='';
  }
}
let queued=false;
const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncVodV14();});};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
schedule();
