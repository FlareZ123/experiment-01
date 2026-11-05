'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const {SEEDS,verifiedBasicRecipient}=
  require('./agent6-rank1-rank3-energy-recipient-aba.cjs');
const {compareSamePolicy}=
  require('./agent6-recipient-paid-pass-cascade.cjs');
const VERSION='agent6-original-recipient-basic-attachment-paid-reserve-aa-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Independent, cumulative, and first-failure counts for observed native
 * Basic attachment roots; no alternative action is emitted or certified.
 * @param {object[]} entries Actual after-dispatch owner-basic receipts.
 */
function countReserveStages(entries){
  assert.ok(Array.isArray(entries));
  const keys=['originalPhysicallyAttachedToBench',
    'nativePositiveColorlessRetreatFee',
    'exactlyOneBasicShortBeforeAttachment',
    'ownerCanRetreatThisTurn',
    'previouslyFundedPositiveBenchAttack'];
  const independent=Object.fromEntries(keys.map(k=>[k,0]));
  const cumulative=Object.fromEntries(keys.map(k=>[k,0]));
  const firstFailures=Object.fromEntries(keys.map(k=>[k,0]));
  const bySeat=[0,1].map(seat=>({
    seat,physicalBasicAttachments:0,originalBenchAttachments:0,
    nominalReserveOpportunities:0
  }));
  let accepted=0,physical=0,eligible=0;
  for(const row of entries){
    assert.ok(row&&row.stages&&
      (row.sourceOwnerSeat===0||row.sourceOwnerSeat===1));
    const gates=row.stages.stages;
    assert.ok(keys.every(k=>typeof gates?.[k]==='boolean'));
    if(row.nativeOriginalStoreAccepted)accepted++;
    if(row.actualPhysicalBasicAttachment){
      physical++;
      bySeat[row.sourceOwnerSeat].physicalBasicAttachments++;
      if(gates.originalPhysicallyAttachedToBench)
        bySeat[row.sourceOwnerSeat].originalBenchAttachments++;
    }
    let running=true,first=null;
    for(const key of keys){
      if(gates[key])independent[key]++;
      if(first===null&&!gates[key])first=key;
      running=running&&gates[key];
      if(running)cumulative[key]++;
    }
    if(row.stages.nominalReserveOpportunity){
      assert.equal(running,true);
      eligible++;
      bySeat[row.sourceOwnerSeat].nominalReserveOpportunities++;
    }else{
      assert.ok(first!==null);
      firstFailures[first]++;
    }
  }
  return {
    observedBasicPlayRoots:entries.length,
    acceptedOriginalBasicPlayRoots:accepted,
    physicallyWitnessedBasicAttachments:physical,
    nominalReserveOpportunities:eligible,
    independent,cumulative,firstFailures,bySeat,
    failurePartitionComplete:Object.values(firstFailures)
      .reduce((n,v)=>n+v,0)+eligible===entries.length
  };
}

/** @returns {object} Eight exact original A/B physical paired game records. */
function run(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
  const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
  initializeCards();
  const decks=originals();
  assert.equal(sha(decks.source),SOURCE);
  assert.equal(sha(decks.candidate),REFERENCE);
  const flags=['AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'];
  const originalEnv=flags.map(flag=>[flag,process.env[flag]]);
  const groups=[];
  try{
    for(const flag of flags)process.env[flag]='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const shared={seed,rank3Seat,mode:'control',
          energyRecipient:true,captureTargets:true};
        const original=runArm({...shared,
          id:[seed,rank3Seat,'baseline'].join(':')},decks);
        const observed=runArm({...shared,
          id:[seed,rank3Seat,'passive-native-reserve'].join(':'),
          basicRetreatReserveAudit:true},decks);
        const parity=compareSamePolicy(original,observed);
        const witnessed=(observed.nativeAcceptedTargetSidecar?.events??[])
          .map(verifiedBasicRecipient).filter(Boolean);
        const audit=observed.attachmentReserveAudit??null;
        const aggregate=countReserveStages(audit?.entries??[]);
        const witnessCountsMatch=Boolean(audit&&
          isDeepStrictEqual(
            aggregate.bySeat.map(x=>x.physicalBasicAttachments),
            [0,1].map(seat=>witnessed.filter(x=>x.actorSeat===seat).length)
          )&&
          aggregate.physicallyWitnessedBasicAttachments===
            witnessed.length&&
          aggregate.observedBasicPlayRoots===
            audit.nativeOriginalBasicPlayRoots&&
          aggregate.nominalReserveOpportunities===
            audit.nominalReserveOpportunities);
        groups.push({seed,rank3Seat,original,observed,parity,
          nativePhysicalWitnessCount:witnessed.length,
          witnessCountsMatch,aggregate,competitivelyQualifiedGames:0});
      }
    }
  }finally{
    for(const [flag,value] of originalEnv){
      if(value===undefined)delete process.env[flag];
      else process.env[flag]=value;
    }
  }
  const allEntries=groups.flatMap(g=>
    g.observed.attachmentReserveAudit?.entries??[]);
  const totals=countReserveStages(allEntries);
  const matched=groups.length===8&&groups.every(g=>
    g.parity.samePolicy&&g.witnessCountsMatch&&
    g.aggregate.failurePartitionComplete);
  const candidates=allEntries.filter(x=>
    x.stages.nominalReserveOpportunity);
  return {
    schema:VERSION,pinnedTwinleaf:PIN,
    sourceOriginal60Sha256:SOURCE,referenceOriginal60Sha256:REFERENCE,
    retrospectiveSeeds:SEEDS,rank3Seats:[0,1],
    expectedNativeArms:16,actualNativeArms:groups.length*2,
    allNativeOriginalPhysicalAndRootParityMatched:matched,
    totals,groups,nominalCandidateRows:candidates,
    competitivelyQualifiedGames:0,
    limitation:'Original Basic placement and effective native retreat fee witnessed; hypothetical alternative retarget, paid retreat and subsequent attack never executed.'
  };
}
if(require.main===module){
  try{
    const x=run();
    process.stderr.write('AGENT6_ORIGINAL_PAID_RESERVE_SUMMARY '+
      JSON.stringify({
        schema:x.schema,actualNativeArms:x.actualNativeArms,
        allNativeOriginalPhysicalAndRootParityMatched:
          x.allNativeOriginalPhysicalAndRootParityMatched,
        totals:x.totals,
        groups:x.groups.map(g=>({
          seed:g.seed,rank3Seat:g.rank3Seat,
          parity:g.parity,witnessCountsMatch:g.witnessCountsMatch,
          nativePhysicalWitnessCount:g.nativePhysicalWitnessCount,
          aggregate:g.aggregate,
          originalNativeStatus:g.original.status,
          observedNativeStatus:g.observed.status
        })),
        nominalCandidateRows:x.nominalCandidateRows,
        competitivelyQualifiedGames:0
      })+'\n');
    process.stdout.write(JSON.stringify(x)+'\n');
    if(!x.allNativeOriginalPhysicalAndRootParityMatched)
      process.exitCode=1;
  }catch(error){
    process.stderr.write('AGENT6_ORIGINAL_PAID_RESERVE_ERROR '+
      String(error?.stack??error).slice(0,6500)+'\n');
    process.stdout.write(JSON.stringify({
      schema:VERSION,status:'native-runner-error',
      error:String(error?.stack??error).slice(0,6500),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,countReserveStages,run};
