'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-rank6-starter-seat-coverage-20261102.json';
const FROZEN=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUT=path.join(ROOT,'agent7-rank6-prospective-starter-seat-coverage.json');
const sha256=x=>createHash('sha256').update(x).digest('hex');

/**
 * Prospectively registered setup first-player and actual physical-seat coverage
 * across both known printed 60s and original rank6 source; no deck changes.
 */
function run(){
 const regBytes=fs.readFileSync(path.join(ROOT,REG));
 const frozenBytes=fs.readFileSync(FROZEN);
 const reg=JSON.parse(regBytes),profile=JSON.parse(frozenBytes);
 assert.equal(reg.schema,'agent7-rank6-prospective-physical-seat-first-turn-coverage-v1');
 assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
 assert.equal(sha256(frozenBytes),reg.sourcePolicySha256);
 const trials=reg.registeredTrials;
 assert.equal(trials.length,16);
 assert.equal(new Set(trials.map(t=>t.id)).size,16);
 const output=runDevelopment({...profile.policyOptions,
   registeredTrials:trials,registeredFrameName:REG});
 assert.deepEqual(output.rows.map(r=>r.trial.id),trials.map(t=>t.id));
 const all=output.rows.map(r=>{
   const candidateSeat=r.candidateSeat;
   const starter=r.actualStarterSeat;
   const sourceSeat=r.sourceSeat;
   const sourcePrizes=r.finalPrizes?.[sourceSeat]??null;
   const candidatePrizes=r.finalPrizes?.[candidateSeat]??null;
   return {
     trialId:r.trial.id,seed:r.trial.seed,rank:r.trial.rank,
     repeat:r.trial.repeat,candidateId:r.trial.candidateId,
     candidatePhysicalSeat:candidateSeat,sourcePhysicalSeat:sourceSeat,
     actualFirstPlayerSeat:starter,
     verifiedFirstDrawLog:r.verifiedFirstTurn===true,
     candidateStartedFirst:starter===candidateSeat,
     sourceStartedFirst:starter===sourceSeat,
     nativeSetupCoinChoiceReceipt:r.nativeSetupCoinChoiceReceipt??null,
     originalSourcePhysicalDealFingerprint:r.sourceDealFingerprint??null,
     completeInitialPhysicalDealFingerprint:r.fullPhysicalDealFingerprint??null,
     originalSourceNativeAttackRoots:(r.rootActionLedger??[])
       .filter(a=>a.playerSlot===sourceSeat&&a.action==='AttackAction')
       .map(a=>({turn:a.turnBefore,attack:a.attack})),
     candidateNativeAttackRoots:(r.rootActionLedger??[])
       .filter(a=>a.playerSlot===candidateSeat&&a.action==='AttackAction')
       .map(a=>({turn:a.turnBefore,attack:a.attack})),
     status:r.status??null,nativeEndReason:r.endReason??null,
     nativeWinnerSeat:r.winner??null,actionCount:r.actionCount??null,
     sourceRemainingPrizes:sourcePrizes,candidateRemainingPrizes:candidatePrizes,
     nativeRootActionLedgerSha256:r.rootActionLedgerSha256??null,
     paperGameQualified:false,competitiveGameQualified:false
   };
 });
 const seatStats=[0,1].map(seat=>{
   const subset=all.filter(r=>r.candidatePhysicalSeat===seat);
   return {
     candidateSeat:seat,trials:subset.length,
     candidateFirst:subset.filter(r=>r.candidateStartedFirst).length,
     sourceFirst:subset.filter(r=>r.sourceStartedFirst).length,
     firstSeatUnverified:subset.filter(r=>!r.verifiedFirstDrawLog).length,
     nativeEndings:subset.filter(r=>r.nativeEndReason==='engine-game-end').length,
     capped:subset.filter(r=>r.nativeEndReason==='action-limit').length
   };
 });
 const result={
   schema:reg.schema,
   provenance:'fresh independent uniform seeds preregistered before all 16 runs',
   registration:REG,registrationSHA256:sha256(regBytes),
   frozenPolicy:profile.schema,frozenPolicySHA256:sha256(frozenBytes),
   pinnedTwinleaf:reg.pinnedTwinleafRevision,
   allRegisteredTrials:trials.length,
   setupSeatStatistics:seatStats,
   originalWithinSourcePairs:output.sourcePairs,
   rows:all,
   competitiveQualifiedGames:0,
   caveat:'Actual first-turn ordering must be empirically verified; physical candidate seat and who begins are distinct axes. Native outcomes remain paper unqualified and do not demonstrate deck strength.'
 };
 writeAtomicLocked(OUT,JSON.stringify(result,null,2)+'\n');
 return result;
}
if(require.main===module) {
 try{
  const r=run();
  console.log(JSON.stringify({schema:r.schema,
    trials:r.allRegisteredTrials,
    verifiedFirstDrawLog:r.rows.filter(x=>x.verifiedFirstDrawLog).length,
    seatStats:r.setupSeatStatistics,
    nativeErrors:r.rows.filter(x=>x.status?.startsWith('engine-error')).length,
    competitiveQualifiedGames:0})+'\n');
 }catch(error){
  writeAtomicLocked(OUT,JSON.stringify({schema:'agent7-rank6-starter-seat-failure',error:String(error?.stack??error),competitiveQualifiedGames:0},null,2)+'\n');
  process.exitCode=1;
  console.error(error);
 }
}
module.exports={run};
