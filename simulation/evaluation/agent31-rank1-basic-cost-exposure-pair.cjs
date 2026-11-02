'use strict';

const assert=require('node:assert/strict');
const {preflight,reconcile}=
  require('./agent31-rank1-prospective-guzma-obstacles.cjs');
const {replayFingerprint}=
  require('./agent43-guzma-held-root-retrospective.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {save}=
  require('./agent43-guzma-original-source-pair.cjs');
const {
  withGuzmaBenchCostObserver,
  VERSION:OBSERVER_VERSION
}=require('../twinleaf/agent31-guzma-bench-cost-exposure.cjs');

const VERSION='agent31-rank1-prospective-guzma-basic-cost-replay-v1';

/**
 * Group each truly observed Store seat by its physically registered source
 * rank and candidate position. An absent native Store record stays absent.
 * Matching game ordinal is an explicit assertion, never a speculative join.
 *
 * @param {object} audit Owner-only observer output.
 * @param {object[]} trials Exact preregistered, ordered trial list.
 * @returns {object} Original source versus candidate seat readings.
 */
function attributeSourceSeats(audit,trials){
  const valid=Number.isSafeInteger(audit.gameCount)&&
    audit.gameCount===trials.length &&
    audit.perGameSeat.every(row=>
      Number.isSafeInteger(row.gameId)&&
      row.gameId>=1&&row.gameId<=trials.length &&
      (row.seat===0||row.seat===1));
  const rows=[];
  if(valid){
    for(const r of audit.perGameSeat){
      const trial=trials[r.gameId-1];
      const candidateSeat=trial.candidateSlot==='A'?0:1;
      const actorRole=r.seat===candidateSeat?'candidate':'original-source';
      rows.push({
        registeredTrialId:trial.id,
        actorRole,
        originalRank:1,
        candidateId:trial.candidateId,
        seat:r.seat,
        ...r
      });
    }
  }
  function summarize(role){
    const subset=rows.filter(row=>row.actorRole===role);
    return {
      role,
      heldTurns:subset.reduce((n,row)=>n+row.heldTurns,0),
      heldTurnsWithBenchEnergy:subset.reduce((n,row)=>
        n+row.heldTurnsWithBenchEnergy,0),
      heldTurnsWithBasicFundedBenchAttack:subset.reduce((n,row)=>
        n+row.heldTurnsWithBasicFundedBenchAttack,0),
      heldTurnsWithPositiveBase:subset.reduce((n,row)=>
        n+row.heldTurnsWithPositiveBase,0),
      heldTurnsWithTargetAndFundedAttack:subset.reduce((n,row)=>
        n+row.heldTurnsWithTargetAndFundedAttack,0),
      heldTurnsWithTargetQuotaAndFundedAttack:subset.reduce((n,row)=>
        n+row.heldTurnsWithTargetQuotaAndFundedAttack,0),
      nativeGameSeatsWithHeldTurn:subset.length
    };
  }
  return {
    gameOrdinalsVerified:valid,
    source:summarize('original-source'),
    candidate:summarize('candidate'),
    registeredRoleRows:rows,
    limitation:'Only game-ordinal/seat mapping, not an actual native attack selection, legal payment or knockout.'
  };
}

/**
 * Same preregistered 16 native deals, played twice with identical policy.
 * The second run only installs a passive owner/public root observer.
 * @returns {object} Failure-inclusive paired native receipt.
 */
function run(){
  const p=preflight();
  const flags={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    actorGuzmaNominalGust:false};
  assert.equal(flags.actorOnlyComposition,true);
  assert.equal(flags.allowAdditionalOriginalSourceRanks,true);
  const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let control,observed;
  try{
    control=runDevelopment(flags);
    observed=withGuzmaBenchCostObserver(()=>runDevelopment(flags));
  }finally{
    if(old===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
  }
  const comparison=reconcile(control.rows,observed.result.rows);
  const controlDigest=replayFingerprint(control.rows);
  const observedDigest=replayFingerprint(observed.result.rows);
  const matched=controlDigest===observedDigest&&comparison.every(pair=>
    pair.sameNativeStatus===true &&
    pair.sameOriginalSourceDeal!==false &&
    pair.sameCompletePhysicalDeal!==false &&
    pair.sameVerifiedFirstSeat!==false &&
    pair.sameNativeRootLedger!==false
  );
  return {
    version:VERSION,observerVersion:OBSERVER_VERSION,
    registrationFile:'results/aichi-2026/registrations/agent31-rank1-prospective-guzma-20261102.json',
    registrationGitBlob:'21d8b8c1093e315fcceadb7079ed64abf5966ce1',
    originalSourceRank:1,sourceArchetype:p.originalSourceArchetype,
    originalSourceRosterGitBlob:p.rosterBlob,
    nativeTwinleafRevision:p.native,
    originalPrecommittedSeeds:p.registration.seeds,
    policyModes:['unmodified-control','read-only-basic-cost-exposure'],
    originalPrinted60Cards:60,
    candidate60s:p.registration.candidateIds,
    nativeTrialsPerMode:16,totalNativeAttempts:32,
    controlDigest,observedDigest,controlUnchangedByObserver:matched,
    physicalAndRootPairs:comparison,
    observer:observed.audit,
    actorBySourceSeat:attributeSourceSeats(
      observed.audit,p.registration.trials),
    gamePerformanceQualified:false,competitiveQualifiedGames:0,
    limitations:[
      'The initial narrower fixed-damage observer workflow was cancelled without outcome analysis after identifying a structural exclusion of textual Shadow Rider moves',
      'This second measurement uses the same preregistered random seeds; its broader attack-cost predicate was built before inspecting any native outcomes',
      'Every hit is a printed Basic-Energy-cost match only, not an active legal AttackAction or real Knock Out',
      'Opponent skill, complete paper payment/effect verification and 25-minute paper match clock are unqualified'
    ]
  };
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write('AGENT31_RANK1_BASIC_COST_PREFLIGHT '+JSON.stringify({
      version:VERSION,rank:1,pin:p.native,
      registeredTrials:p.registration.trials.length,
      registeredSeeds:p.registration.seeds,
      competitiveQualifiedGames:0
    })+'\n');
  }else{
    const result=run();
    if(process.env.AGENT31_RANK1_BASIC_COST_OUTPUT)
      save(process.env.AGENT31_RANK1_BASIC_COST_OUTPUT,result);
    process.stdout.write('AGENT31_RANK1_BASIC_COST '+JSON.stringify({
      version:result.version,
      unchanged:result.controlUnchangedByObserver,
      gameOrdinalsVerified:result.actorBySourceSeat.gameOrdinalsVerified,
      originalSource:result.actorBySourceSeat.source,
      candidate:result.actorBySourceSeat.candidate,
      overall:result.observer.heldTurnsWithBasicFundedBenchAttack,
      heldGuzmaTurns:result.observer.uniqueHeldOwnerTurns,
      competitiveQualifiedGames:0
    })+'\n');
    assert.equal(result.controlUnchangedByObserver,true,
      'Read-only observer changed physical-native root replay');
  }
}
module.exports={VERSION,attributeSourceSeats,run};
