'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const {SEEDS}=require('./agent6-rank1-rank3-energy-recipient-aba.cjs');
const {STEPS}=require('../twinleaf/agent2-multi-basic-retreat-pass-cascade.cjs');

const VERSION='agent6-recipient-enabled-multibasic-pass-cascade-same-policy-aa-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const sha=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Count independent public gates, cumulative public gates and the first
 * rejection across genuine Pass-time actor-only observations.
 * @param {object[]} rows Read-only native owner Pass classifier results.
 * @returns {object} Complete failure-inclusive aggregate.
 */
function countStages(rows){
  assert.ok(Array.isArray(rows));
  const independent={},cumulative={},firstFailures={};
  for(const step of STEPS){
    independent[step]=0;
    cumulative[step]=0;
    firstFailures[step]=0;
  }
  let fullEligibility=0;
  const perSeat=[0,1].map(seat=>({
    seat,originalPasses:0,nominallyEligible:0,
    firstFailures:Object.fromEntries(STEPS.map(step=>[step,0]))
  }));
  for(const row of rows){
    assert.ok(row&&STEPS.every(step=>
      typeof row.stages?.[step]==='boolean'&&
      typeof row.cumulative?.[step]==='boolean'));
    assert.ok(row.actorSeat===0||row.actorSeat===1);
    const seat=perSeat[row.actorSeat];
    seat.originalPasses++;
    if(row.wouldNominallyOffer){
      fullEligibility++;
      seat.nominallyEligible++;
      assert.equal(row.firstFailure,null);
      assert.equal(STEPS.every(step=>row.cumulative[step]),true);
    }else{
      assert.ok(STEPS.includes(row.firstFailure));
      firstFailures[row.firstFailure]++;
      seat.firstFailures[row.firstFailure]++;
    }
    for(const step of STEPS){
      if(row.stages[step])independent[step]++;
      if(row.cumulative[step])cumulative[step]++;
    }
  }
  return {
    originalPasses:rows.length,nominallyEligible:fullEligibility,
    independent,cumulative,firstFailures,perSeat,
    firstFailurePartitionComplete:Object.values(firstFailures)
      .reduce((n,v)=>n+v,0)+fullEligibility===rows.length
  };
}

/**
 * Strict physical and native-policy negative control on identical original
 * sixty, seed, seat and recipient+retreat execution.
 * @param {object} control Real native baseline.
 * @param {object} observed Same true policy with read-only diagnostic.
 * @returns {object} Audited reproducibility fields.
 */
function compareSamePolicy(control,observed){
  const values={
    terminal:control.status==='native-terminal'&&
      observed.status==='native-terminal',
    original60:control.originalSource60Hash===SOURCE&&
      observed.originalSource60Hash===SOURCE&&
      control.originalReference60Hash===REFERENCE&&
      observed.originalReference60Hash===REFERENCE,
    actualFirstPlayer:control.actualFirstSeat===observed.actualFirstSeat,
    nativeStart:control.nativeVerifiedStartByDraw===true&&
      observed.nativeVerifiedStartByDraw===true,
    physicalDeal:typeof control.fullDealSha256==='string'&&
      control.fullDealSha256===observed.fullDealSha256&&
      typeof control.rank3DealSha256==='string'&&
      control.rank3DealSha256===observed.rank3DealSha256,
    nativeRoots:typeof control.rootLedgerSha256==='string'&&
      control.rootLedgerSha256===observed.rootLedgerSha256&&
      isDeepStrictEqual(control.rootActionLedger,observed.rootActionLedger),
    publicBoard:sha(control.finalPublicBoard)===
      sha(observed.finalPublicBoard),
    fullOutcome:control.winner===observed.winner&&
      control.endReason===observed.endReason&&
      control.actions===observed.actions&&
      control.globalTurns===observed.globalTurns,
    proposerCounters:isDeepStrictEqual(control.genericAudit,
      observed.genericAudit),
    targetSidecar:control.nativeAcceptedTargetSidecar?.sha256===
      observed.nativeAcceptedTargetSidecar?.sha256
  };
  return {samePolicy: Object.values(values).every(Boolean),checks:values};
}

/**
 * Reexecute two identical original policy arms per seed/seat. The only B
 * difference is a read-only classifier that delegates to the identical
 * proposer after observing the owner's native Pass.
 * @returns {object} Real Twinleaf 16-game failure-inclusive audit.
 */
function run(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
  const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
  initializeCards();
  const decks=originals();
  assert.equal(sha(decks.source),SOURCE);
  assert.equal(sha(decks.candidate),REFERENCE);
  const vars=['AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'];
  const prior=vars.map(key=>[key,process.env[key]]);
  const groups=[];
  try{
    for(const key of vars)process.env[key]='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const base={seed,rank3Seat,mode:'bilateral-multi-basic-retreat',
          energyRecipient:true,captureTargets:true};
        const control=runArm({...base,
          id:[seed,rank3Seat,'baseline'].join(':')},decks);
        const observed=runArm({...base,
          id:[seed,rank3Seat,'pass-cascade'].join(':'),
          retreatPassStageCensus:true},decks);
        const same=compareSamePolicy(control,observed);
        const stages=countStages(observed.retreatPassStageRows??[]);
        const passBySeat=observed.genericAudit?.originalPassesBySeat??null;
        const offersBySeat=observed.genericAudit?.nominalOffersBySeat??null;
        const ownedPasses=(passBySeat??[]).reduce((n,v)=>n+v,0);
        const observedOffers=(offersBySeat??[]).reduce((n,v)=>n+v,0);
        const passCountMatched=Array.isArray(passBySeat)&&
          isDeepStrictEqual(stages.perSeat.map(x=>x.originalPasses),
            passBySeat)&&stages.originalPasses===ownedPasses;
        const offerCountMatched=Array.isArray(offersBySeat)&&
          isDeepStrictEqual(stages.perSeat.map(x=>x.nominallyEligible),
            offersBySeat)&&stages.nominallyEligible===observedOffers;
        groups.push({seed,rank3Seat,control,observed,
          samePolicy:same,stages,passCountMatched,offerCountMatched,
          nativeQualifiedGames:0});
      }
    }
  }finally{
    for(const [key,value] of prior){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const totals=countStages(groups.flatMap(x=>
    x.observed.retreatPassStageRows??[]));
  const allSame=groups.length===8&&groups.every(x=>
    x.samePolicy.samePolicy&&x.passCountMatched&&x.offerCountMatched&&
    x.stages.firstFailurePartitionComplete);
  return {
    schema:VERSION,pinnedTwinleaf:PIN,
    sourceOriginal60Sha256:SOURCE,referenceOriginal60Sha256:REFERENCE,
    previousHistoricalSeeds:SEEDS,rank3Seats:[0,1],
    expectedOriginalGroups:8,actualOriginalGroups:groups.length,
    expectedNativeArms:16,actualNativeArms:groups.length*2,
    allPhysicalAndNativePolicyParityVerified:allSame,
    totals,groups,competitivelyQualifiedGames:0,
    caveat:'Retrospective same-policy native Pass census only. Stages are owner-public approximate eligibility, not proof of paper payment or competitive play.'
  };
}
if(require.main===module){
  try{
    const x=run();
    process.stderr.write('AGENT6_RECIPIENT_CASCADE_SUMMARY '+
      JSON.stringify({
        schema:x.schema,expectedNativeArms:x.expectedNativeArms,
        actualNativeArms:x.actualNativeArms,
        allPhysicalAndNativePolicyParityVerified:
          x.allPhysicalAndNativePolicyParityVerified,
        totals:x.totals,
        groupSummaries:x.groups.map(g=>({
          seed:g.seed,rank3Seat:g.rank3Seat,
          samePolicy:g.samePolicy,passCountMatched:g.passCountMatched,
          offerCountMatched:g.offerCountMatched,
          originalPasses:g.stages.originalPasses,
          nominallyEligible:g.stages.nominallyEligible,
          firstFailures:g.stages.firstFailures,
          nativeStatus:g.observed.status
        })),
        competitivelyQualifiedGames:0
      })+'\n');
    process.stdout.write(JSON.stringify(x)+'\n');
    if(!x.allPhysicalAndNativePolicyParityVerified)
      process.exitCode=1;
  }catch(error){
    process.stderr.write('AGENT6_RECIPIENT_CASCADE_ERROR '+
      String(error?.stack??error).slice(0,6000)+'\n');
    process.stdout.write(JSON.stringify({
      schema:VERSION,status:'native-runner-error',
      error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,countStages,compareSamePolicy,run};
