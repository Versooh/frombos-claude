// Small integration bridge used by Tactical/VOD UI without coupling route modules to Supabase.
import { cloudTactical } from './cloud-tactical.js';

export const tacticalCloudBridge = {
  async saveScenario(scenario){return cloudTactical.saveTacticalScenario({id:scenario.id,name:scenario.name,teamSeasonId:scenario.teamSeasonId,vodId:scenario.vodId,gameNumber:scenario.gameNumber,stateSnapshot:{markers:scenario.markers||[],paths:scenario.paths||[],layers:scenario.layers||{}},coachPlan:scenario.coach||{}});},
  async saveEvent(scenarioId,event){return cloudTactical.saveTacticalEvent({id:event.id,scenarioId,timestampSeconds:event.timestamp,eventType:event.type,title:event.title,note:event.note,severity:event.severity,playerId:event.playerId,vodId:event.vodId,vodTimestampSeconds:event.vodTimestampSeconds,metadata:{markerIds:event.markerIds||[],tags:event.tags||[]}});},
  async events(scenarioId){return cloudTactical.listTacticalEvents(scenarioId);}
};
