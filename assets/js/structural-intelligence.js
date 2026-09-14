// FROMBOS structural intelligence. Heuristics only: never observed win rate.
const SETS={
  frontline:['Malphite','Ornn','Nautilus','Alistar','Braum','Leona','Maokai','Sion','Shen','Poppy','Gragas','Rammus','Amumu','Galio','Jarvan IV','Xin Zhao','Wukong','Volibear','Nunu & Willump','Cho\'Gath','Sett','Renekton'],
  engage:['Malphite','Nautilus','Alistar','Leona','Rakan','Amumu','Wukong','Jarvan IV','Vi','Galio','Gragas','Maokai','Poppy','Rell','Skarner','Hecarim','Nocturne','Xin Zhao','Kennen'],
  peel:['Braum','Janna','Lulu','Milio','Nami','Rakan','Karma','Thresh','Nautilus','Alistar','Poppy','Shen','Galio','Orianna','Xayah'],
  waveclear:['Orianna','Ziggs','Syndra','Ahri','Viktor','Taliyah','Brand','Lux','Morgana','Seraphine','Corki','Ezreal','Xayah','Jinx','Sivir','Smolder','Aurelion Sol'],
  poke:['Jayce','Ziggs','Ezreal','Karma','Varus','Caitlyn','Lux','Corki','Zoe','Syndra','Nidalee','Jayce'],
  sustained:['Jinx','Xayah','Kai\'Sa','Vayne','Zeri','Yunara','Gwen','Kayle','Twitch','Kog\'Maw','Sivir','Smolder','Master Yi'],
  objectiveDps:['Jinx','Xayah','Kai\'Sa','Vayne','Zeri','Yunara','Gwen','Jax','Master Yi','Tristana','Kog\'Maw','Sivir','Smolder'],
  side:['Camille','Fiora','Gwen','Jax','Tryndamere','Yone','Irelia','Akali','Kassadin','Shen','Jayce','Renekton','Riven'],
  early:['Renekton','Lucian','Draven','Lee Sin','Xin Zhao','Jarvan IV','Pantheon','Nidalee','Jayce','Caitlyn','Nami','Pyke'],
  scaling:['Jinx','Kayle','Kassadin','Gwen','Vayne','Smolder','Aurelion Sol','Veigar','Senna','Zeri','Yunara','Kog\'Maw'],
  magic:['Orianna','Syndra','Ahri','Viktor','Ziggs','Gwen','Galio','Brand','Lux','Morgana','Kennen','Amumu','Aurelion Sol','Vex','Annie'],
  physical:['Jinx','Xayah','Ezreal','Lucian','Draven','Caitlyn','Jayce','Renekton','Camille','Jax','Lee Sin','Vi','Xin Zhao','Jarvan IV','Yone','Yasuo']
};
const ORDER=['frontline','engage','peel','waveclear','sustained','objectiveDps','poke','side','early','scaling','magic','physical'];
const LABEL={frontline:'Frontline',engage:'Engage',peel:'Peel',waveclear:'Waveclear',sustained:'DPS sustentado',objectiveDps:'Dano em objetivo',poke:'Poke/alcance',side:'Side lane',early:'Pressão cedo',scaling:'Scaling',magic:'Dano mágico',physical:'Dano físico'};
const DESIRED={frontline:1,engage:1,peel:1,waveclear:1,sustained:1,objectiveDps:1,magic:1,physical:1};
const has=(name,key)=>SETS[key]?.includes(name)||false;
export function championFeatures(name){return ORDER.filter(k=>has(name,k));}
export function analyzeComposition(champs=[]){
  const counts=Object.fromEntries(ORDER.map(k=>[k,champs.filter(c=>has(c,k)).length]));
  const debts=Object.entries(DESIRED).filter(([k,min])=>counts[k]<min).map(([k])=>k);
  const strengths=ORDER.filter(k=>counts[k]>=2);
  const warnings=[];
  if(champs.length>=3&&counts.magic===0)warnings.push('SEM DANO MÁGICO RELEVANTE');
  if(champs.length>=3&&counts.physical===0)warnings.push('SEM DANO FÍSICO RELEVANTE');
  if(champs.length>=4&&counts.engage===0)warnings.push('SEM ENGAGE CLARO');
  if(champs.length>=4&&counts.frontline===0)warnings.push('SEM FRONTLINE CLARA');
  if(champs.length>=4&&counts.peel===0)warnings.push('POUCO PEEL');
  return{counts,debts,strengths,warnings,labels:LABEL};
}
export function scoreCandidate(name,current=[]){
  const before=analyzeComposition(current),features=championFeatures(name);let score=0;const reasons=[];
  for(const debt of before.debts){if(features.includes(debt)){score+=3;reasons.push(`cobre ${LABEL[debt]}`);}}
  if(features.includes('engage')&&before.counts.engage===0){score+=2;}
  if(features.includes('frontline')&&before.counts.frontline===0){score+=2;}
  if(features.includes('magic')&&before.counts.magic===0){score+=2;}
  if(features.includes('physical')&&before.counts.physical===0){score+=2;}
  return{champion:name,score,reasons,features};
}
export function threatRead(enemy=[]){
  const a=analyzeComposition(enemy),threats=[];
  if(a.counts.engage>=2)threats.push('ENGAGE EM CAMADAS');
  if(a.counts.poke>=2)threats.push('POKE / CERCO');
  if(a.counts.side>=2)threats.push('PRESSÃO LATERAL');
  if(a.counts.scaling>=2)threats.push('ESCALA FORTE');
  if(a.counts.early>=2)threats.push('PRESSÃO CEDO');
  if(a.counts.magic>=3)threats.push('DANO MÁGICO PESADO');
  if(a.counts.physical>=3)threats.push('DANO FÍSICO PESADO');
  return{...a,threats};
}
export const structuralLabel=key=>LABEL[key]||key;
