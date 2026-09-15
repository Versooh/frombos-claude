// FROMBOS V22.2 — Meta Command Center.
// Enhances existing rendered evidence only. No network acquisition and no invented trend data.
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const num=text=>Number(String(text||'').replace('%','').replace(',','.'))||0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function observedRows(){
  return [...document.querySelectorAll('.meta-intelligence .mst-row')].map(row=>{
    const cells=[...row.children];
    return {el:row,champ:cells[0]?.textContent?.trim()||'',role:cells[1]?.textContent?.trim()||'',wr:num(cells[2]?.textContent),pr:num(cells[3]?.textContent),br:num(cells[4]?.textContent)};
  }).filter(x=>x.champ);
}

function patchLabel(){return document.querySelector('.meta-intelligence .meta-stamp b')?.textContent?.trim()||'snapshot atual';}

function cardHTML(row){return `<button type="button" class="v22-meta-observed-card" data-v22-meta-champion="${esc(row.champ)}" data-role="${esc(row.role)}"><div><b>${esc(row.champ)}</b><span>${esc(row.role)}</span></div><dl><div><dt>WR</dt><dd>${row.wr.toFixed(2)}%</dd></div><div><dt>Pick</dt><dd>${row.pr.toFixed(2)}%</dd></div><div><dt>Ban</dt><dd>${row.br.toFixed(2)}%</dd></div></dl><i>OBSERVED · CN</i></button>`;}

function commandHTML(rows){
  const roles=[...new Set(rows.map(x=>x.role))];
  return `<section class="v22-meta-command v22-reveal" data-v22-role="all" data-v22-lens="all">
    <header class="v22-meta-command-head"><div><span>META COMMAND CENTER · ${esc(patchLabel())}</span><h2>Filtre o sinal antes de tomar a decisão.</h2><p>O painel reorganiza apenas o snapshot já materializado no FROMBOS. Fontes continuam separadas.</p></div><div class="v22-meta-snapshot"><small>SNAPSHOT ATIVO</small><b>${esc(patchLabel())}</b><span>${rows.length} linhas observadas</span></div></header>
    <div class="v22-meta-controls">
      <label><span>Buscar campeão</span><input type="search" data-v22-meta-search placeholder="Ex.: Ahri"></label>
      <div class="v22-meta-role-filter" aria-label="Filtrar função"><button class="is-active" type="button" data-v22-meta-role="all">Todos</button>${roles.map(role=>`<button type="button" data-v22-meta-role="${esc(role)}">${esc(role)}</button>`).join('')}</div>
      <label><span>Ordenar observado</span><select data-v22-meta-sort><option value="wr">Win Rate</option><option value="pr">Pick Rate</option><option value="br">Ban Rate</option><option value="champ">Campeão A–Z</option></select></label>
    </div>
    <div class="v22-meta-lens-filter"><small>LENTE</small><button class="is-active" type="button" data-v22-meta-lens="all">Todas</button><button type="button" data-v22-meta-lens="official">Riot Official</button><button type="button" data-v22-meta-lens="observed">Observed</button><button type="button" data-v22-meta-lens="curated">Curated</button><button type="button" data-v22-meta-lens="competitive">Competitive</button><button class="v22-compare-button" type="button" data-v22-meta-compare>Comparar snapshots</button></div>
    <div class="v22-meta-compare-note" hidden data-v22-meta-compare-note><b>META EVOLUTION · UNKNOWN</b><span>O build atual possui um único snapshot compatível nesta camada. Comparação temporal só será ativada quando existir um segundo snapshot com patch, função e escopo comparáveis.</span></div>
    <div class="v22-meta-observed-head"><div><span>OBSERVED RANKED · CN</span><h3>Explorador do snapshot</h3></div><span data-v22-meta-count>${rows.length} campeões/roles</span></div>
    <div class="v22-meta-observed-grid" data-v22-meta-grid>${rows.map(cardHTML).join('')}</div>
  </section>`;
}

function sortRows(rows,key){
  return [...rows].sort((a,b)=>key==='champ'?a.champ.localeCompare(b.champ,'pt-BR'):b[key]-a[key]);
}

function bind(root,sourceRows){
  let role='all',query='',sort='wr';
  const grid=root.querySelector('[data-v22-meta-grid]'),count=root.querySelector('[data-v22-meta-count]');
  const render=()=>{
    const filtered=sortRows(sourceRows.filter(row=>(role==='all'||row.role===role)&&(!query||row.champ.toLocaleLowerCase('pt-BR').includes(query))),sort);
    grid.innerHTML=filtered.map(cardHTML).join('')||'<div class="v22-meta-empty">Nenhuma linha observada corresponde aos filtros atuais.</div>';
    if(count)count.textContent=`${filtered.length} campeões/roles`;
    grid.querySelectorAll('[data-v22-meta-champion]').forEach(btn=>btn.addEventListener('click',()=>location.hash=`#/champions?champion=${encodeURIComponent(btn.dataset.v22MetaChampion)}`));
    sourceRows.forEach(row=>{row.el.hidden=!((role==='all'||row.role===role)&&(!query||row.champ.toLocaleLowerCase('pt-BR').includes(query)));});
  };
  root.querySelector('[data-v22-meta-search]')?.addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('pt-BR');render();});
  root.querySelector('[data-v22-meta-sort]')?.addEventListener('change',e=>{sort=e.target.value;render();});
  root.querySelectorAll('[data-v22-meta-role]').forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.v22MetaRole;root.querySelectorAll('[data-v22-meta-role]').forEach(x=>x.classList.toggle('is-active',x===btn));render();}));
  root.querySelectorAll('[data-v22-meta-lens]').forEach(btn=>btn.addEventListener('click',()=>{
    const lens=btn.dataset.v22MetaLens;root.dataset.v22Lens=lens;root.querySelectorAll('[data-v22-meta-lens]').forEach(x=>x.classList.toggle('is-active',x===btn));
    document.querySelectorAll('.meta-intelligence .meta-lens').forEach(section=>{section.hidden=lens!=='all'&&!section.classList.contains(lens);});
  }));
  root.querySelector('[data-v22-meta-compare]')?.addEventListener('click',()=>{const note=root.querySelector('[data-v22-meta-compare-note]');if(note)note.hidden=!note.hidden;});
  render();
}

function apply(){
  if(route()!=='meta')return;
  const intel=document.querySelector('.meta-intelligence');
  if(!intel){requestAnimationFrame(()=>requestAnimationFrame(apply));return;}
  if(document.querySelector('.v22-meta-command'))return;
  const rows=observedRows();
  if(!rows.length)return;
  intel.insertAdjacentHTML('beforebegin',commandHTML(rows));
  const root=document.querySelector('.v22-meta-command');if(root)bind(root,rows);
}

const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
window.addEventListener('hashchange',()=>requestAnimationFrame(()=>requestAnimationFrame(apply)));
requestAnimationFrame(()=>requestAnimationFrame(apply));
window.FROMBOS_V22_META={apply};
