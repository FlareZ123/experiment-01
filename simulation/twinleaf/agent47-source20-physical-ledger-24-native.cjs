'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
  require('./agent47-minimum-attach-energy-hook.cjs');
const {observableDigest}=require('./dde-source-clone-seat-panel.cjs');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Retrospective, source-fixed, one-arm physical-zone census, preserving every
 * original rank20 natural seed/seat/opponent combination. Both seats share the
 * exact same narrow minimum-Energy bot correction from the completed 48-run
 * forensic replay; no Apex payload change. Counts only; no hidden hands.
 *
 * @param {object} trial Frozen original-source trial manifest row.
 * @param {Map<number,object>} byRank Authenticated original printed 60s.
 */
function execute(trial,byRank){
 const source=byRank.get(20).cardIds;
 const opponent=byRank.get(trial.opponentRank).cardIds;
 const request={
  deckA:trial.sourceSeat===0?source:opponent,
  deckB:trial.sourceSeat===1?source:opponent,
  seed:trial.seed,maxActions:160,
  doubleDragonRecovery:true,strictPromptValidation:true,
  isolatePolicyRandomness:true,
  captureInitialSourceDealFingerprintSeat:trial.sourceSeat,
  captureInitialFullPhysicalDeal:true,
  capturePhysicalZoneIntegrity:true,
  label:'agent47-source20-settled-physical-audit-'+trial.id
 };
 try{
  const corrected=withMinimumAttachEnergySelection(()=>
   withActorHandDiscard(()=>runMatch(request),{},{
    apexPayloadDiscard:false
   }));
  const game=corrected.result.result;
  const ledger=game.physicalZoneIntegrity;
  assert.ok(ledger?.schema==='live-headless-physical-zone-integrity-v1');
  return {
   status:'native-returned',gameFinished:game.finished,
   sourceSeat:trial.sourceSeat,opponentRank:trial.opponentRank,
   actions:game.actions,turns:game.turns,firstSeat:game.firstTurnSlot,
   sourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
   fullPhysicalDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
   physicalZoneIntegrity:ledger,
   correctionProposals:corrected.audit.proposedCorrections,
   selectedDiscardActions:corrected.result.audit.selected,
   attackDeclarations:game.attackTrace.map(x=>({
     attack:x.attack,seat:x.playerSlot??null,turn:x.turn??null
   })),
   observableDigest:observableDigest(game)
  };
 }catch(error){
  return {status:'native-aborted',censored:true,
   sourceSeat:trial.sourceSeat,opponentRank:trial.opponentRank,
   error:String(error?.stack??error).slice(0,900),
   candidateCorrectionAudit:error.nativeMinimumAttachEvidence??null};
 }
}

/** Source-deal-matched retrospective mechanical telemetry, never gameplay strength. */
function main(){
 initializeCards();
 const {byRank,trials}=registration();
 assert.equal(trials.length,24);
 const rows=trials.map(trial=>({trial,result:execute(trial,byRank)}));
 const returned=rows.filter(r=>r.result.status==='native-returned');
 const anomalous=returned.filter(r=>
  r.result.physicalZoneIntegrity.settledRootsWithAnomaly>0);
 return {
  schema:'agent47-source20-24-original-deal-settled-physical-zone-census-v1',
  enginePin:PIN,exactSourceRank:20,opponentRanks:[1,11],
  seeds:[1847000101,1847000102,1847000103,1847000104,1847000105,1847000106],
  rank20Seats:[0,1],maxActions:160,
  retrospective:true,allAttemptedRowsPreserved:true,
  counts:{
   registeredGames:rows.length,nativeReturned:returned.length,
   nativeAbort:rows.length-returned.length,
   sourcePhysicalDealsRecorded:returned.filter(r=>r.result.sourceDealSha256).length,
   returnedWithSettledRootAudit:returned.filter(r=>
    r.result.physicalZoneIntegrity.settledRootsChecked>0).length,
   returnedWithSettledRootAnomaly:anomalous.length,
   totalSettledRootAnomalies:returned.reduce((n,r)=>
    n+r.result.physicalZoneIntegrity.settledRootsWithAnomaly,0),
   totalSettledRootsAudited:returned.reduce((n,r)=>
    n+r.result.physicalZoneIntegrity.settledRootsChecked,0),
   totalProposedMinimumCorrections:returned.reduce((n,r)=>
    n+r.result.correctionProposals,0)
  },rows,competitiveQualifiedGames:0,
  caveat:'Original registered seed/seat/source population reused retrospectively. A settled-root count mismatch is a physical-zone concern, not automatically Celestial Roar causation. Bot interventions are symmetric, speculative opportunities are not native accepted actions, and no engine winner is a competitive win-rate estimate.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={execute,main};
