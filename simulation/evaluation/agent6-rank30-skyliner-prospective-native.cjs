'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent6-rank30-skyliner-prospective-20261102.json');
const {runOption}=require('./agent6-rank30-canonical-skyliner-rondo-native.cjs');
const {VERSION:FRONTIER_VERSION}=
  require('../twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const VERSION='agent6-rank30-prospective-owner-root-rondo-native-v1';

/**
 * Register all physical source seats and candidate Sixties before calling
 * the engine. This experiment has no post-outcome opponent/seed selection.
 *
 * @returns {object} Frozen input registration.
 */
function verifyRegistration(){
  assert.equal(registration.schema,
    'agent6-preregistered-rank30-skyliner-rondo-native-v1');
  assert.equal(registration.sourceRank,30);
  assert.equal(registration.vendorPinned,profile.pinnedVendorRevision);
  assert.equal(registration.policyVersion,FRONTIER_VERSION);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.registeredGroups.length,4);
  assert.equal(registration.registeredArms.length,8);
  const seen=new Set(),pastSeeds=new Set([3407938073,233633536]);
  for(const group of registration.registeredGroups){
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.equal(group.sourceSeat,group.candidateSlot==='A'?1:0);
    assert.ok(Number.isSafeInteger(group.repeat)&&group.repeat>=1);
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
    assert.ok(!pastSeeds.has(group.seed));
    assert.ok(!seen.has(group.seed));
    seen.add(group.seed);
    const arms=registration.registeredArms.filter(row=>
      row.rank===group.rank&&row.repeat===group.repeat&&
      row.candidateSlot===group.candidateSlot&&row.seed===group.seed);
    assert.deepEqual(arms.map(a=>a.candidateId),
      registration.candidateIds);
    for(const arm of arms){
      assert.equal(arm.id,[arm.rank,arm.repeat,arm.candidateSlot,
        arm.candidateId].join(':'));
      assert.equal(arm.sourceSeat,group.sourceSeat);
    }
  }
  return registration;
}

/**
 * Extract source action and opponent return proofs for the full game,
 * including after turn 35; incomplete games remain explicit denominators.
 *
 * @param {object} game Source Store result or native error row.
 * @param {0|1} seat Original rank30 source physical seat.
 * @returns {object}
 */
function publicEvidence(game,seat){
  const roots=game.rootActionLedger??[];
  const sourceRoots=roots.filter(row=>row.playerSlot===seat);
  const opponentRoots=roots.filter(row=>row.playerSlot!==seat);
  const sourceAttacks=sourceRoots.filter(row=>row.action==='AttackAction');
  const retreats=sourceRoots.filter(row=>row.action==='RetreatAction');
  const rondoDeclarations=sourceAttacks.filter(row=>
    row.attack==='Full Moon Rondo');
  const sourceSettlements=game.sourceAttackSettlement?.attacks??[];
  const settledRondos=sourceSettlements.filter(a=>
    a.attackName==='Full Moon Rondo');
  const relatedEnemyRoots=[];
  for(const row of rondoDeclarations){
    relatedEnemyRoots.push(...opponentRoots.filter(e=>
      e.actionOrdinal>row.actionOrdinal&&
      e.actionOrdinal<=row.actionOrdinal+24));
  }
  const actorRoot=game.actorOnlyDecisionCoverage
    ?.detailedComponentAudits?.root;
  const accepted=game.nativeAcceptedTargetSidecar?.events?.filter(row=>
    row.action==='RetreatAction'&&row.playerSlot===seat)??[];
  return {id:game.trial.id,sourceSeat:seat,repeat:game.trial.repeat,
    candidateId:game.trial.candidateId,seed:game.trial.seed,
    status:game.status??(game.finished?'untimed-engine-terminal':'censored'),
    nativeError:game.error??null,nativeStoreCauseStack:
      game.nativeStoreCauseStack??null,
    nativeAbortEvidence:game.nativeAbortEvidence??null,
    sourcePrinted60Digest:game.sourceDeckFingerprint??null,
    candidatePrinted60Digest:game.candidateDeckFingerprint??null,
    fullPhysicalDealFingerprint:game.fullPhysicalDealFingerprint??null,
    sourceDealFingerprint:game.sourceDealFingerprint??null,
    actualStarterSeat:game.actualStarterSeat??null,
    rootLedgerSha256:game.rootActionLedgerSha256??null,
    rootLedgerLength:roots.length,
    nativeAcceptedTargetRootLinked:
      game.nativeAcceptedTargetSidecar?.rootOrdinalLinked??null,
    sourceAttackCount:sourceAttacks.length,
    sourceAttackNames:sourceAttacks.map(e=>({turn:e.turnBefore,
      ordinal:e.actionOrdinal,name:e.attack??null})),
    sourceRetreats:retreats,
    sourceRondoDeclarations:rondoDeclarations,
    sourceSettledRondoAttacks:settledRondos,
    opponentRootsFollowingRondo:relatedEnemyRoots,
    nativeRetreatTargetEvents:accepted,
    ownerSelectedRondoRetreatCount:
      actorRoot?.typedIntentCounts?.['skyliner-rondo-retreat']??0,
    ownerNativePhysicalConfirmedRetreats:
      actorRoot?.nativePhysicalConfirmedByIntent
        ?.['skyliner-rondo-retreat']??0,
    ownerNativePhysicalUnconfirmedRetreats:
      actorRoot?.nativePhysicalUnconfirmedByIntent
        ?.['skyliner-rondo-retreat']??0,
    ownerNativeRetreatAcceptanceSamples:(actorRoot?.nativeRootAcceptances??[])
      .filter(a=>a.kind==='skyliner-rondo-retreat'),
    rootActorPolicyVersion:actorRoot?.version??null,
    sourceAttackSettlementCount:sourceSettlements.length,
    wonGameUntimedUnqualified:game.winner===seat&&game.finished===true,
    winnerSeatUntimedUnqualified:game.winner??null,
    finalPrizes:game.finalPrizes??null,
    finalPublicBoard:game.finalBoard??null,
    actionCount:game.actionCount??null,turns:game.turns??null,
    competitiveQualified:false};
}

/** @returns {object} Every prespecified source/candidate arm, both policies. */
function run(){
  const reg=verifyRegistration();
  const groups=[];
  for(const group of reg.registeredGroups){
    const trials=reg.registeredArms.filter(row=>
      row.repeat===group.repeat&&row.candidateSlot===group.candidateSlot);
    assert.equal(trials.length,2);
    const arms=[];
    for(const treatment of [false,true]){
      try{
        const result=runOption(trials,group.sourceSeat,treatment);
        assert.equal(result.rows.length,2);
        assert.deepEqual(result.rows.map(row=>row.trial.id),
          trials.map(row=>row.id));
        arms.push({treatment,runnerCompleted:true,
          games:result.rows.map(row=>publicEvidence(row,group.sourceSeat))});
      }catch(error){
        arms.push({treatment,runnerCompleted:false,
          nativeStoreAttemptsUnknown:true,
          error:String(error?.stack??error).slice(0,3500),games:[]});
      }
    }
    const comparable=arms.every(a=>a.runnerCompleted===true)&&
      arms[0].games.every((x,i)=>
        x.id===arms[1].games[i].id&&
        x.fullPhysicalDealFingerprint!==null&&
        JSON.stringify(x.fullPhysicalDealFingerprint)===
          JSON.stringify(arms[1].games[i].fullPhysicalDealFingerprint));
    groups.push({...group,samePhysicalDealForEveryCandidate:comparable,arms});
  }
  const rows=groups.flatMap(g=>g.arms).flatMap(arm=>arm.games);
  const control=groups.flatMap(g=>g.arms.filter(a=>!a.treatment))
    .flatMap(a=>a.games);
  const treatment=groups.flatMap(g=>g.arms.filter(a=>a.treatment))
    .flatMap(a=>a.games);
  const count=(items,field)=>items.reduce((n,x)=>n+(x[field]??0),0);
  const nativeErrors=rows.filter(g=>
    /error|abort/i.test(g.status)).length;
  const candidateComparisons=control.map(c=>{
    const match=treatment.find(t=>t.id===c.id);
    return {id:c.id,controlStatus:c.status,
      treatmentStatus:match?.status??null,
      exactSamePhysicalDeal:match?.fullPhysicalDealFingerprint!==null&&
        JSON.stringify(c.fullPhysicalDealFingerprint)===
          JSON.stringify(match?.fullPhysicalDealFingerprint),
      controlWinnerUnqualified:c.winnerSeatUntimedUnqualified,
      treatedWinnerUnqualified:match?.winnerSeatUntimedUnqualified??null,
      controlSourcePrizeRemaining:c.finalPrizes?.[c.sourceSeat]??null,
      treatedSourcePrizeRemaining:
        match?.finalPrizes?.[c.sourceSeat]??null,
      selectedNativeRetreats:match?.ownerSelectedRondoRetreatCount??0,
      settledNativeRondos:match?.sourceSettledRondoAttacks?.length??0};
  });
  return {version:VERSION,registration:reg,enginePin:reg.vendorPinned,
    registeredSourceGroups:4,registeredCandidateSixties:2,
    registeredCandidateGroups:8,registeredPhysicalComparisonArms:16,
    completedNativeRows:rows.length,
    driverFailures:groups.flatMap(g=>g.arms).filter(a=>
      !a.runnerCompleted).length,
    nativeRowErrors:nativeErrors,
    physicallyComparableCandidatePairs:groups.flatMap(g=>g.arms)[0]?
      candidateComparisons.filter(x=>x.exactSamePhysicalDeal).length:0,
    sourceTrueOwnerChosenRetreats:
      count(treatment,'ownerSelectedRondoRetreatCount'),
    sourceNativeConfirmedRetreats:
      count(treatment,'ownerNativePhysicalConfirmedRetreats'),
    sourceNativeUnconfirmedRetreats:
      count(treatment,'ownerNativePhysicalUnconfirmedRetreats'),
    sourceRondoSettlements:treatment.reduce((n,g)=>
      n+g.sourceSettledRondoAttacks.length,0),
    sourceGameWinnerFlips:candidateComparisons.filter(c=>
      c.controlWinnerUnqualified!==null&&
      c.treatedWinnerUnqualified!==null&&
      c.controlWinnerUnqualified!==c.treatedWinnerUnqualified).length,
    independentRegisteredSeeds:reg.registeredGroups.map(g=>g.seed),
    originalSourceSixtyUnmodified:true,
    candidateSixtiesUnmodified:true,
    competitiveQualifiedGames:0,
    candidateComparisons,groups,
    caveat:'Prospectively preregistered native driver seeds and policy choice, but still a developmental generic-bot experiment; physical parity checked only within exact candidate/control pairs; no tournament clock, paper qualification or 99.5% claim.'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,verifyRegistration,publicEvidence,run};
