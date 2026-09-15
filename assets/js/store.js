const KEY='frombos.v2.workspace';
const initialState={
  meta:{version:2,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  team:{name:'UOL E-SPORTS',opponent:'ADVERSÁRIO',format:'MD5',players:{BARON:{name:'',pool:[]},JUNGLE:{name:'',pool:[]},MID:{name:'',pool:[]},DUO:{name:'',pool:[]},SUPPORT:{name:'',pool:[]}}},
  favorites:[],customComps:[],
  training:{goals:[],sessions:[],focus:['Macro','Mecânica','Visão','Comunicação','Objetivos']},
  draft:{game:1,fearless:false,fearlessMode:'off',tournament:'Scrim / Treino',format:'MD5',ruleset:'ALTERNATING_5BAN_5PICK',actions:[],games:{1:{actions:[]}},branches:[],activeBranchId:null,branchOrigin:null,referenceComp:null},
  tactical:{activeScenario:null,scenarios:[],strokes:[]},
  vod:{reviews:[],sessions:[],activeSessionId:null},
  settings:{theme:'dark',reducedMotion:false}
};
function deepMerge(base,next){if(Array.isArray(base)||Array.isArray(next))return next??base;if(!base||typeof base!=='object'||!next||typeof next!=='object')return next??base;const out={...base};for(const key of Object.keys(next))out[key]=key in base?deepMerge(base[key],next[key]):next[key];return out;}
export class WorkspaceStore extends EventTarget{
  constructor(){super();this.state=this.load();}
  load(){try{const raw=localStorage.getItem(KEY);return raw?deepMerge(initialState,JSON.parse(raw)):structuredClone(initialState);}catch{return structuredClone(initialState);}}
  save(){this.state.meta.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(this.state));this.dispatchEvent(new CustomEvent('change',{detail:this.state}));}
  update(mutator){mutator(this.state);this.save();}
  reset(){this.state=structuredClone(initialState);this.save();}
  exportJSON(){return JSON.stringify(this.state,null,2);}
  importJSON(text){const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object')throw new Error('Workspace inválido');this.state=deepMerge(initialState,parsed);this.save();}
}
export const store=new WorkspaceStore();
