'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runFrozenCanary,writeAtomicLocked} = require('./agent20-frozen-rank6-canary-v1.cjs');
const {withFrozenCandidateLilliePassProbe,VERSION} = require('../twinleaf/agent7-frozen-candidate-lillie-pass-clone.cjs');
const {withGuzmaHalaOwnerZoneLineage} = require('../twinleaf/agent7-ghala-owner-zone-lineage.cjs');
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.resolve(__dirname,'../../agent7-frozen-rank6-lillie-pass-clone-output.json');
const hash=x=>createHash('sha256').update(x).digest('hex');

/** Execute the original four-arm selected profile under a passive Store clone witness. */
function run(){
 const profileBytes=fs.readFileSync(PROFILE);
 const profile=JSON.parse(profileBytes);
 assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
 const payment=withGuzmaHalaOwnerZoneLineage(()=>
   withFrozenCandidateLilliePassProbe(()=>runFrozenCanary(),profile.registeredTrials),
   {liveOnly:true});
 const probe=payment.result;
 const native=probe.result;
 const rows=native.rawNativeResult.rows;
 assert.deepEqual(rows.map(x=>x.trial.id),profile.registeredTrials.map(x=>x.id));
 assert.equal(probe.audit.observedGameCount,4);
 const events=probe.audit.boundedNativePasses.map(e=>{
   const row=rows.find(x=>x.trial.id===e.trialId);
   const matching=row.rootActionLedger.filter(x=>
     x.action==='PassTurnAction' && x.turnBefore===4 &&
     x.playerSlot===e.actualCandidateSeat);
   return {...e,
     physicalSourceDealFingerprint:row.sourceDealFingerprint,
     sameNativePassRootCount:matching.length,
     firstPassActionOrdinal:matching[0]?.actionOrdinal??null,
     rowEndReason:row.endReason,rowFinished:row.finished};
 });
 const costEvents=payment.audit.events.map(e=>{
   const trial=profile.registeredTrials[e.gameOrdinal];
   const row=rows[e.gameOrdinal];
   const candidateSeat=trial.candidateSlot==='A'?0:1;
   const isSource=e.ownerSeat===1-candidateSeat;
   const sourceAttackRoots=row.rootActionLedger.filter(x=>
     x.action==='AttackAction'&&x.playerSlot===e.ownerSeat&&
     x.turnBefore===e.globalTurnBefore);
   const candidateNextRoots=row.rootActionLedger.filter(x=>
     x.playerSlot===candidateSeat && x.turnBefore===e.globalTurnBefore+1&&
     x.action!=='ResolvePromptAction');
   return {...e,registeredTrial:trial.id,
     originalSourceActor:isSource,
     sourcePhysicalDealFingerprint:row.sourceDealFingerprint,
     sourceTurnAttackRoots:sourceAttackRoots.map(x=>({
       ordinal:x.actionOrdinal,attack:x.attack??null})),
     actualCandidateNextTurnRoots:candidateNextRoots.map(x=>({
       ordinal:x.actionOrdinal,action:x.action,card:x.card??null}))};
 });
 const output={schema:VERSION,sourceProfile:profile.schema,
   profileSha256:hash(profileBytes),pinnedVendor:native.runtime.pinnedVendorRevision,
   runnerCommit:native.runtime.checkoutCommit,registeredTrials:profile.registeredTrials,
   observedGames:probe.audit.observedGameCount,events,
   observedGuzmaHalaPaymentPrompts:payment.audit.observedPaymentPrompts,
   physicalGuzmaHalaTwoCardWitnesses:payment.audit.paperTwoCardZoneWitnesses,
   naturalGuzmaHalaOwnerZoneEvents:costEvents,
   sourcePairs:native.rawNativeResult.sourcePairs.map(x=>({
      pairId:x.pairId,sameSourcePhysicalDeal:x.sameSourcePhysicalDeal,
      sourceDealFingerprints:x.sourceDealFingerprints})),
   originalDisposition:native.releaseDisposition.stages,
   changedActorDecisions:false,competitiveQualifiedGames:0,
   caveat:'Post-choice cloned Store receipt only, no game-policy improvement claim.'};
 writeAtomicLocked(OUTPUT,JSON.stringify(output,null,2)+'\n');
 return output;
}
if(require.main===module){
 const x=run();
 console.log(JSON.stringify({games:x.observedGames,
   naturalGuzmaHalaPaymentEvents:x.naturalGuzmaHalaOwnerZoneEvents.map(e=>({
     trialId:e.registeredTrial,seat:e.ownerSeat,turn:e.globalTurnBefore,
     paid:e.paperTwoCardZoneWitness,attackRoots:e.sourceTurnAttackRoots.length
   })),events:x.events.map(e=>({
   trialId:e.trialId,passCount:e.sameNativePassRootCount,
   outcome:e.observation.outcome,settled:e.observation.printedDrawCountVerified
 })),competitiveQualifiedGames:0}));
}
module.exports={run};
