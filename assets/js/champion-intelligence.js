import { CHAMPIONS } from './data.js';
import { CHAMPION_REGISTRY, CHAMPION_REGISTRY_META } from './champion-registry.generated.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=name=>name.split(/\s+/).map(x=>x[0]).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();
export const championAsset=name=>CHAMPION_REGISTRY[name]||{name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),officialUrl:'https://wildrift.leagueoflegends.com/en-us/champions/',portrait:null,splash:null,source:'RIOT_OFFICIAL'};
export const portraitHTML=(name,className='champion-portrait')=>{const a=championAsset(name);return a.portrait?`<img class="${className}" src="${esc(a.portrait)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="portrait-fallback" hidden>${esc(initials(name))}</span>`:`<span class="portrait-fallback">${esc(initials(name))}</span>`;};

const factState=(title,desc,type='UNKNOWN')=>`<article class="intel-state"><div class="intel-state-head"><b>${esc(title)}</b><span class="badge ${type==='OFFICIAL'?'green':type==='FROMBOS_STRUCTURAL'?'gold':'blue'}">${esc(type)}</span></div><p>${esc(desc)}</p></article>`;

function selectedFromLocation(){
  const raw=location.hash.split('?')[1]||'';const q=new URLSearchParams(raw);const wanted=q.get('champion');return CHAMPIONS.includes(wanted)?wanted:CHAMPIONS[0];
}
function championGridCard(name){const a=championAsset(name);return `<button class="ci-card" data-ci-champion="${esc(name)}"><div class="ci-art">${portraitHTML(name,'ci-portrait')}<span class="ci-source">${a.portrait?'RIOT':'PENDING'}</span></div><div class="ci-card-body"><b>${esc(name)}</b><small>${a.portrait?'Official Wild Rift art':'Asset registry pending'}</small></div></button>`;}

export function championIntelligenceHTML(){
  const selected=selectedFromLocation(),asset=championAsset(selected);const coverage=CHAMPION_REGISTRY_META?.portraits??Object.values(CHAMPION_REGISTRY).filter(x=>x.portrait).length;
  return `<div class="champion-intelligence">
    <section class="ci-browser card">
      <div class="ci-browser-head"><div><span class="eyebrow">CHAMPION REGISTRY</span><h3>Wild Rift roster</h3><p class="muted">Busca visual ligada ao registro oficial. ${coverage}/${CHAMPIONS.length} portraits resolvidos neste build.</p></div><input id="ciSearch" class="input" placeholder="Pesquisar campeão..." autocomplete="off"></div>
      <div class="ci-grid" id="ciGrid">${CHAMPIONS.map(championGridCard).join('')}</div>
    </section>
    <section class="ci-detail card">
      <div class="ci-hero ${asset.splash?'has-splash':''}" ${asset.splash?`style="--ci-splash:url('${esc(asset.splash)}')"`:''}>
        <div class="ci-hero-portrait">${portraitHTML(selected,'ci-detail-portrait')}</div>
        <div><span class="eyebrow">CHAMPION INTELLIGENCE</span><h2>${esc(selected)}</h2><p>Uma página única para identidade oficial, meta observado, matchup, build contextual, competitivo e evidência.</p><div class="top-actions"><a class="btn info" href="${esc(asset.officialUrl)}" target="_blank" rel="noreferrer">Página oficial Riot ↗</a><button class="btn" data-ci-open="matchups">Matchup Lab</button><button class="btn" data-ci-open="builds">Build Intelligence</button></div></div>
      </div>
      <div class="ci-evidence-strip"><span><b>IDENTIDADE</b> RIOT_OFFICIAL</span><span><b>META</b> PATCH/OBSERVED/CURATED separados</span><span><b>MATCHUP</b> OBSERVED ≠ STRUCTURAL</span><span><b>SEM EVIDÊNCIA</b> UNKNOWN</span></div>
      <div class="ci-tabs">
        ${factState('Identidade oficial','Nome e arte vêm do registro canônico de Wild Rift. A próxima ingestão adicionará descrição, habilidades e roles somente após validação da fonte.','OFFICIAL')}
        ${factState('Meta atual','Nenhum tier numérico é mostrado até que patch, região, rank e fonte estejam resolvidos no pipeline.','UNKNOWN')}
        ${factState('Confrontos observados','A matriz observada ainda não foi materializada para este campeão nesta versão pública.','UNKNOWN')}
        ${factState('Leitura estrutural','A engine estrutural será exibida separadamente dos dados observados e nunca será chamada de win rate.','FROMBOS_STRUCTURAL')}
        ${factState('Build contextual','A interface está pronta para Core + First Recall + branches por ameaça; recomendações entram apenas com evidência Wild Rift validada.','UNKNOWN')}
        ${factState('Competitivo','Open Series, China e demais torneios terão snapshots próprios por evento/patch, com presença, picks, bans e amostra.','UNKNOWN')}
      </div>
    </section>
  </div>`;
}

export function bindChampionIntelligence(rerender){
  const search=document.querySelector('#ciSearch'),grid=document.querySelector('#ciGrid');
  const apply=()=>{const q=(search?.value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');grid.innerHTML=CHAMPIONS.filter(n=>n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q)).map(championGridCard).join('');bindCards();};
  const bindCards=()=>document.querySelectorAll('[data-ci-champion]').forEach(b=>b.onclick=()=>{const route=location.hash.split('?')[0];location.hash=`${route}?champion=${encodeURIComponent(b.dataset.ciChampion)}`;rerender();});
  search?.addEventListener('input',apply);bindCards();
  document.querySelectorAll('[data-ci-open]').forEach(b=>b.onclick=()=>location.hash=`#/${b.dataset.ciOpen}?champion=${encodeURIComponent(selectedFromLocation())}`);
}

export function matchupLabHTML(){const name=selectedFromLocation();return `<div class="intel-lab"><section class="card lab-hero"><div class="lab-champ">${portraitHTML(name,'lab-portrait')}</div><div><span class="eyebrow">MATCHUP LAB</span><h2>${esc(name)}</h2><p>Confrontos serão separados por role, patch, região e classe de evidência. Sem all-vs-all fabricado.</p></div></section><div class="grid cols-2">${factState('DADOS OBSERVADOS · CN','UNKNOWN até existir snapshot observado compatível com role/rank/patch.','UNKNOWN')}${factState('FROMBOS · LEITURA ESTRUTURAL','Será calculada por kits, ranges, pressão, mobilidade, sustain, all-in, wave e contexto da composição.','FROMBOS_STRUCTURAL')}${factState('BUILD CONTRA ESTE MATCHUP','Nenhuma receita é exibida antes de resolver o oponente e as ameaças da composição.','UNKNOWN')}${factState('IMPACTO DA COMPOSIÇÃO','O matchup de lane não será tratado como decisão isolada do draft.','FROMBOS_STRUCTURAL')}</div></div>`;}
export function buildLabHTML(){const name=selectedFromLocation();return `<div class="intel-lab"><section class="card lab-hero"><div class="lab-champ">${portraitHTML(name,'lab-portrait')}</div><div><span class="eyebrow">BUILD INTELLIGENCE</span><h2>${esc(name)}</h2><p>Core, first recall e branches situacionais. A recomendação deve explicar qual ameaça resolve.</p></div></section><div class="build-branch-grid">${['CORE','FIRST RECALL','VS BURST','VS FRONTLINE','VS CC','DO NOT AUTOPILOT'].map(x=>factState(x,'UNKNOWN — aguardando base Wild Rift validada para este campeão e contexto.','UNKNOWN')).join('')}</div></div>`;}
export function bindIntelLab(){document.querySelectorAll('[data-ci-champion]').forEach(()=>{});}
