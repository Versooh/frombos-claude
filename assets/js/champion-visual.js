const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

const SPECIAL_SLUGS={
  "Cho'Gath":'chogath',
  "Dr. Mundo":'dr-mundo',
  "Jarvan IV":'jarvan-iv',
  "Kai'Sa":'kaisa',
  "K'Sante":'ksante',
  "Kha'Zix":'khazix',
  "Kog'Maw":'kogmaw',
  "Lee Sin":'lee-sin',
  "Master Yi":'master-yi',
  "Miss Fortune":'miss-fortune',
  "Nunu & Willump":'nunu-willump',
  "Twisted Fate":'twisted-fate',
  "Xin Zhao":'xin-zhao',
  "Vel'Koz":'velkoz'
};

/*
 * Asset allow-lists are intentionally explicit. V20 never probes 141 nonexistent
 * files and never substitutes League PC art. Add a slug here only after the
 * corresponding Wild Rift file exists in assets/champions/{portrait|hero}/.
 */
const VERIFIED_PORTRAITS=new Set([]);
const VERIFIED_HEROES=new Set([]);

export function championSlug(name){
  if(SPECIAL_SLUGS[name]) return SPECIAL_SLUGS[name];
  return String(name||'unknown')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[.'’]/g,'')
    .replace(/&/g,'and')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-|-$/g,'');
}

export function championInitials(name){
  const parts=String(name||'?').replace(/[.'&]/g,' ').split(/\s+/).filter(Boolean);
  return parts.map(x=>x[0]).slice(0,2).join('').toUpperCase()||'?';
}

export function championAsset(name,variant='portrait'){
  const slug=championSlug(name);
  const folder=variant==='hero'?'hero':'portrait';
  return `assets/champions/${folder}/${slug}.webp`;
}

export function hasChampionAsset(name,variant='portrait'){
  const slug=championSlug(name);
  return (variant==='hero'?VERIFIED_HEROES:VERIFIED_PORTRAITS).has(slug);
}

export function championPortrait(name,options={}){
  const {size='md',label=false,role='',className='',variant='portrait',priority=false}=options;
  const safe=esc(name||'Campeão');
  const roleLabel=role?`<small class="champion-role">${esc(role)}</small>`:'';
  const image=hasChampionAsset(name,variant)
    ? `<img class="champion-image" data-champion-img src="${championAsset(name,variant)}" alt="${safe}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`
    : '';
  return `<span class="champion-visual champion-${size} ${className} ${image?'':'image-missing'}" data-champion="${safe}">
    <span class="champion-fallback" aria-hidden="true">${championInitials(name)}</span>
    ${image}
    ${label?`<span class="champion-copy"><b>${safe}</b>${roleLabel}</span>`:''}
  </span>`;
}

export function hydrateChampionImages(root=document){
  root.querySelectorAll?.('[data-champion-img]').forEach(img=>{
    if(img.dataset.bound==='1') return;
    img.dataset.bound='1';
    const wrap=img.closest('.champion-visual');
    const loaded=()=>wrap?.classList.add('has-image');
    const failed=()=>{wrap?.classList.remove('has-image');wrap?.classList.add('image-missing');img.hidden=true;};
    img.addEventListener('load',loaded,{once:true});
    img.addEventListener('error',failed,{once:true});
    if(img.complete){ if(img.naturalWidth>1) loaded(); else failed(); }
  });
}

export const CHAMPION_ASSET_POLICY={
  source:'FROMBOS_LOCAL_WILD_RIFT_ONLY',
  fallback:'INITIALS',
  allowLeaguePCFallback:false,
  probeMissingAssets:false
};
