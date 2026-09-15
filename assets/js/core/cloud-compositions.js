// FROMBOS CORE — cloud Composition Lab persistence
import { supabase } from './auth.js';
import { cloudStore } from './cloud-store.js';
import { coreStore } from './store-adapter.js';

const roleMap = { BARON:'baron', JUNGLE:'jungle', MID:'mid', DUO:'dragon', SUPPORT:'support' };
const reverseRoleMap = Object.fromEntries(Object.entries(roleMap).map(([a,b])=>[b,a]));

async function user(){ const {data,error}=await supabase.auth.getUser(); if(error) throw error; if(!data.user) throw new Error('Sessão autenticada necessária.'); return data.user; }

export async function listCloudCompositions(teamSeasonId=cloudStore.activeSeasonId){
  if(!teamSeasonId) return [];
  await user();
  const {data,error}=await supabase.from('team_compositions').select('id,team_season_id,name,identity,win_condition,status,notes,created_by,created_at,updated_at,team_composition_slots(role,champion_id,player_id,slot_note)').eq('team_season_id',teamSeasonId).order('created_at',{ascending:false});
  if(error) throw error;
  return (data||[]).map(c=>({
    id:c.id,type:'composition',name:c.name,archetype:c.identity||'Custom',winCondition:c.win_condition||'',status:c.status,notes:c.notes||'',
    lineup:Object.fromEntries((c.team_composition_slots||[]).map(s=>[reverseRoleMap[s.role]||s.role.toUpperCase(),s.champion_id])),
    slots:c.team_composition_slots||[],origin:'CLOUD'
  }));
}

export async function saveComposition(comp,{teamSeasonId=cloudStore.activeSeasonId}={}){
  if(!teamSeasonId) throw new Error('Nenhuma temporada ativa.');
  await user();
  const payload={team_season_id:teamSeasonId,name:String(comp.name||'Nova composição').trim(),identity:comp.archetype||null,win_condition:comp.winCondition||null,status:['draft','tested','approved','archived'].includes(comp.status)?comp.status:'draft',notes:comp.notes||null};
  let saved;
  if(comp.id && !String(comp.id).startsWith('comp_')){
    const {data,error}=await supabase.from('team_compositions').update(payload).eq('id',comp.id).select('id,team_season_id,name,identity,win_condition,status,notes,created_by,created_at,updated_at').single();
    if(error) throw error; saved=data;
    const {error:delError}=await supabase.from('team_composition_slots').delete().eq('composition_id',saved.id); if(delError) throw delError;
  }else{
    const {data,error}=await supabase.from('team_compositions').insert(payload).select('id,team_season_id,name,identity,win_condition,status,notes,created_by,created_at,updated_at').single();
    if(error) throw error; saved=data;
  }
  const slots=[];
  for(const [role,champion] of Object.entries(comp.lineup||{})) if(champion) slots.push({composition_id:saved.id,role:roleMap[role]||String(role).toLowerCase(),champion_id:champion,player_id:null,slot_note:null});
  if(slots.length){const {error}=await supabase.from('team_composition_slots').insert(slots);if(error) throw error;}
  return saved;
}

export async function syncCoreCompositions(){
  const cloud=await listCloudCompositions();
  coreStore.update(core=>{ core.compositions=cloud; return core; });
  return cloud;
}

export async function persistCoreCompositions(){
  const local=coreStore.state.compositions||[];
  const saved=[];
  for(const comp of local) saved.push(await saveComposition(comp));
  await syncCoreCompositions();
  return saved;
}

export const cloudCompositionStore={listCloudCompositions,saveComposition,syncCoreCompositions,persistCoreCompositions};
