'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {main}=require('./rank10-shred-turn29-response-source.cjs');
const {withTurn29OwnHandAudit}=require('./rank10-turn29-own-hand-audit.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');

/** Retrospective acting-player information, never fed into either bot. */
function audit(){
 initializeCards();
 const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const {Store}=require(path.join(output,'game/store/store'));
 const {SuperType,TrainerType}=require(path.join(output,'game/store/card/card-types'));
 const observed=withTurn29OwnHandAudit(Store,main,{
  SuperType,TrainerType,
  digest:state=>zoneSnapshotDigest(sourceZoneSnapshot(state))
 });
 const source=observed.result;
 assert.equal(source.readOnlyObserverTraceMatch,true);
 assert.equal(observed.observations.length,2);
 assert.deepEqual(observed.observations[0],observed.observations[1]);
 const first=observed.observations[0];
 assert.equal(first.zoneDigest,
  source.opponentTurn29Events.find(e=>e.ordinal===231).sourceZoneSha256);
 assert.equal(first.ownHand.ownHand.length,3);
 return {
  schema:'rank10-regidrago-own-information-at-first-turn29-action-v1',
  source:source.immutableSource,
  observedAt:{rootOrdinal:231,action:'RetreatAction',
   preActionSourceZoneSha256:first.zoneDigest},
  ownHand:first.ownHand,
  pairedSourceReplaysMatch:true,
  originalFinishedGame:source.result,
  sourceReplayMechanicsVerified:false,
  qualifiedForCompetitiveInference:false,
  caveat:'Hand identities known to the acting player. Presence and turn flags alone do not certify legal action opportunities or strategic strength.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports={audit};
