'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runFrozenCanary,writeAtomicLocked} = require('./agent20-frozen-rank6-canary-v1.cjs');
const {withFrozenCandidateLilliePassProbe,VERSION} = require('../twinleaf/agent7-frozen-candidate-lillie-pass-clone.cjs');
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.resolve(__dirname,'../../agent7-frozen-rank6-lillie-pass-clone-output.json');
const hash=x=>createHash('sha256').update(x).digest('hex');

/** Execute the original four-arm selected profile under a passive Store clone witness. */
function run(){
 const profileBytes=fs.readFileSync(PROFILE);
 const profile=JSON.parse(profileBytes);
 assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
 const probe=withFrozenCandidateLilliePassProbe(()=>runFrozenCanary(),profile.registeredTrials);
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
 const output={schema:VERSION,sourceProfile:profile.schema,
   profileSha256:hash(profileBytes),pinnedVendor:native.runtime.pinnedVendorRevision,
   runnerCommit:native.runtime.checkoutCommit,registeredTrials:profile.registeredTrials,
   observedGames:probe.audit.observedGameCount,events,
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
 console.log(JSON.stringify({games:x.observedGames,events:x.events.map(e=>({
   trialId:e.trialId,passCount:e.sameNativePassRootCount,
   outcome:e.observation.outcome,settled:e.observation.printedDrawCountVerified
 })),competitiveQualifiedGames:0}));
}
module.exports={run};
