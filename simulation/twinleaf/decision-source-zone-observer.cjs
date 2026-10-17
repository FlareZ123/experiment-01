'use strict';

const path=require('node:path');
const {sourceZoneSnapshot,zoneSnapshotDigest}=
  require('./source-zone-checkpoint.cjs');

/**
 * Retrospectively collect live source-zone digests immediately before the
 * actual bot's next decision, without giving private card contents to its
 * policy or altering any action/Store field.
 *
 * @param {Function} BotClass Pinned bot or test class.
 * @returns {{report:object,restore:()=>void}}
 */
function observeBotDecisionSourceZones(BotClass) {
  const proto=BotClass.prototype;
  const previous=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const original=proto.decodeNextAction;
  if(typeof original!=='function')throw new TypeError('Missing bot method');
  const report={
    protocol:'live-source-zone-predecision-digest-v1',
    decisions:[]
  };
  function monitored(state) {
    const snapshot=sourceZoneSnapshot(state);
    report.decisions.push({
      ordinal:report.decisions.length+1,
      turn:state.turn,
      actorSeat:state.activePlayer,
      pending:state.prompts.filter(p=>p.result===undefined)
        .map(p=>({type:p.constructor.name,playerId:p.playerId})),
      digest:zoneSnapshotDigest(snapshot),
      snapshot
    });
    return original.call(this,state);
  }
  Object.defineProperty(proto,'decodeNextAction',{
    value:monitored,writable:true,configurable:true
  });
  return {
    report,
    restore(){
      if(proto.decodeNextAction!==monitored) {
        throw new Error('Source-zone observer lost bot method ownership');
      }
      if(previous)Object.defineProperty(proto,'decodeNextAction',previous);
      else delete proto.decodeNextAction;
    }
  };
}

/** @returns {{report:object,restore:()=>void}} */
function installPinnedDecisionSourceZoneObserver(){
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  return observeBotDecisionSourceZones(SimpleTacticsAi);
}

module.exports={
  observeBotDecisionSourceZones,installPinnedDecisionSourceZoneObserver
};
