const BASE='https://www.wildriftfire.com/images/items/';
const overrides={
  "Serylda's Grudge":'seryldas-grudge',
  "Rabadon's Deathcap":'rabadons-deathcap',
  "Randuin's Omen":'randuins-omen',
  "Luden's Echo":'ludens-echo',
  "Banshee's Veil":'banshees-veil',
  "Liandry's Torment":'liandrys-torment',
  "Serpent's Fang":'serpents-fang',
  "Blade of the Ruined King":'blade-of-the-ruined-king',
  "Mercury's Treads":'mercurys-treads',
  "Youmuu's Ghostblade":'youmuus-ghostblade',
  "Death's Dance":'deaths-dance'
};
export const itemSlug=name=>overrides[name]||String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const itemAsset=name=>({name,icon:`${BASE}${itemSlug(name)}.png`,source:'WildRiftFire',type:'CURATED_ASSET'});
