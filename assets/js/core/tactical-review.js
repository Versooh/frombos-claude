// Tactical review helpers: convert timeline events into coach-readable review items.
export const TACTICAL_SEVERITIES=['info','positive','warning','critical'];
export const TACTICAL_TYPES=['decision','objective','vision','rotation','fight','reset','mistake','setup','note'];

export function summarizeTacticalEvents(events=[]){
  const list=[...events].sort((a,b)=>Number(a.timestamp||0)-Number(b.timestamp||0));
  return {total:list.length,positive:list.filter(x=>x.severity==='positive').length,warning:list.filter(x=>x.severity==='warning').length,critical:list.filter(x=>x.severity==='critical').length,byType:Object.fromEntries(TACTICAL_TYPES.map(t=>[t,list.filter(x=>x.type===t).length]))};
}

export function toTrainingCandidates(events=[]){
  return events.filter(e=>['mistake','warning','critical'].includes(e.type)||['warning','critical'].includes(e.severity)).map(e=>({id:`training_${e.id}`,sourceEventId:e.id,timestamp:Number(e.timestamp||0),title:e.title||'Revisar decisão',objective:e.note||`Revisar evento ${e.type}`,category:e.type==='vision'?'Visão':e.type==='objective'?'Objetivos':'Macro',status:'TODO'}));
}
