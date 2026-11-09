'use strict';
const assert=require('node:assert/strict');
const reg=require('../../../results/aichi-2026/registrations/agent8-source-challenger-prospective-v2-20261109.json');
const original=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {firstRootDivergence}=
  require('../agent24-v8-perfection-paired-native.cjs');

const VERSION='agent23-rank11-source-payable-attack-vs-quickball-retrospective-v1';
const TARGET='11:3203:B:new-moon-lockbreaker-v1';
const FACTORS=Object.freeze([
  Object.freeze({id:'P0Q0',pivot:false,attackBeforeQuickBall:false}),
  Object.freeze({id:'P0Q1',pivot:false,attackBeforeQuickBall:true}),
  Object.freeze({id:'P1Q0',pivot:true,attackBeforeQuickBall:false}),
  Object.freeze({id:'P1Q1',pivot:true,attackBeforeQuickBall:true})
]);

/**
 * Exact original v2 pre-existing physical deal intentionally selected after
 * its published rank11 source Psychic-attack-versus-Quick-Ball fork.
 * This is retrospective debugging only, never held-out strength evidence.
 * @returns {object}
 */
function frozenTrial(){
  assert.equal(reg.nativePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const selected=reg.groups.filter(trial=>trial.id===TARGET);
  assert.equal(selected.length,1);
  assert.equal(selected[0].rank,11);
  assert.equal(selected[0].candidateSlot,'B');
  assert.equal(selected[0].seed,3592222510);
  return {...selected[0]};
}

/**
 * Run the authentic original source and exact unchanged New Moon 60, including
 * both versions of the pre-existing candidate Perfection pivot.
 * Source-only optional Quick Ball priority is the only Q0/Q1 policy change.
 * @param {object} factor
 * @param {Function} [nativeRunner]
 * @returns {object} Existing source-owner common native simulation receipt.
 */
function runFactor(factor,nativeRunner=runDevelopment){
  assert.ok(FACTORS.some(x=>x.id===factor.id));
  return runNativeBatch(true,runOptions=>nativeRunner({
    ...runOptions,...original.sourceChallengeRootOptions(true),
    sourceScopedQuickBallRoot:true,
    sourceQuickBallPreservePayableAttack:factor.attackBeforeQuickBall,
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    actorOnlySingleSearch:true,
    actorHandDiscard:true
  }),{
    registeredTrials:[frozenTrial()],
    registeredFrameName:VERSION+'-'+factor.id,
    nativeRootActionLimit:reg.rootLimit,
    vipAfterPass:true,
    vipPreferMewtwoDonor:true,
    perfectionTransition:factor.pivot
  });
}

/** @param {object} native Genuine native match outcome. */
function physicalSourceRootCensus(native){
  const seat=native?.trial?.candidateSlot==='A'?1:0;
  const owned=(native.rootActionLedger??[])
    .filter(root=>root.playerSlot===seat);
  const quickBall=owned.filter(root=>root.action==='PlayCardAction'&&
    /^Quick Ball(?: |$)/.test(root.card??''));
  return {
    sourceSeat:seat,
    sourceAttacks:owned.filter(x=>x.action==='AttackAction')
      .map(root=>({ordinal:root.ordinal??null,turn:root.turnBefore,
        name:root.attackName??root.card??null})),
    sourceQuickBalls:quickBall.map(root=>({
      ordinal:root.ordinal??null,turn:root.turnBefore,card:root.card
    })),
    sourcePasses:owned.filter(x=>x.action==='PassTurnAction').length
  };
}

/** @param {{runFactor?:Function}} [deps] */
function run(deps={}){
  const arms={};
  const trial=frozenTrial();
  for(const factor of FACTORS){
    const outcome=(deps.runFactor??runFactor)(factor);
    const native=outcome.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(native)&&native.length===1);
    assert.equal(native[0].trial.id,TARGET);
    arms[factor.id]={
      factor,native:native[0],
      summary:summarizeRow(native[0],true),
      source:physicalSourceRootCensus(native[0])
    };
  }
  const pairs=[false,true].map(pivot=>{
    const base=arms[pivot?'P1Q0':'P0Q0'];
    const test=arms[pivot?'P1Q1':'P0Q1'];
    const fingerprints=[base.summary,test.summary];
    const physicalMatched=fingerprints.every(row=>
      row.fullPhysicalDealFingerprint!==null&&
      row.sourceDealFingerprint!==null)&&
      JSON.stringify(fingerprints[0].fullPhysicalDealFingerprint)===
        JSON.stringify(fingerprints[1].fullPhysicalDealFingerprint)&&
      JSON.stringify(fingerprints[0].sourceDealFingerprint)===
        JSON.stringify(fingerprints[1].sourceDealFingerprint);
    const difference=firstRootDivergence(
      base.summary.rootActionLedger??[],
      test.summary.rootActionLedger??[]);
    const sourceOwnsFirstDifference=difference.ordinal!==null&&
      difference.baseline?.playerSlot===base.source.sourceSeat&&
      difference.treatment?.playerSlot===base.source.sourceSeat;
    const outcome=x=>({
      status:x.summary.status,winner:x.summary.status==='native-terminal'?
        x.summary.winner:null,
      finalPrizes:x.summary.remainingPrizes,
      sourceAttacks:x.source.sourceAttacks,
      sourceQuickBalls:x.source.sourceQuickBalls,
      sourcePasses:x.source.sourcePasses,
      errors:x.summary.error,
      rootActions:x.summary.rootActions
    });
    return {
      pivot,trialId:trial.id,sourceSeat:base.source.sourceSeat,
      candidateSeat:1-base.source.sourceSeat,
      samePhysicalDeal:physicalMatched,
      sourceOnlyFirstDivergence:sourceOwnsFirstDifference,
      firstDifferentAcceptedRoot:difference,
      incumbentQuickBallFirst:outcome(base),
      payableAttackPriority:outcome(test),
      paperCompetitiveQualifiedGames:0
    };
  });
  return {
    schema:VERSION,trial,enginePin:reg.nativePin,
    retrospectiveSelectedObservedFork:true,
    physicalMatchInBothPivotConditions:pairs.every(x=>x.samePhysicalDeal),
    sourceOnlyFirstDifferenceInBothPivotConditions:
      pairs.every(x=>x.sourceOnlyFirstDivergence),
    factors:FACTORS,pairs,
    qualifiedPaperGames:0,winRate:null,
    rawNativeArms:Object.fromEntries(FACTORS.map(x=>[
      x.id,arms[x.id].native
    ])),
    limitation:'Previously selected rank11 seed, real native results but not fresh adversarial field or independent paper/clock qualification'
  };
}

if(require.main===module){
  const report=run();
  original.save(process.env.AGENT23_SOURCE_QB_ATTACK_NATIVE_OUTPUT??
    'artifacts/agent23-rank11-source-quickball-attack-native.json',report);
  process.stdout.write('AGENT23_SOURCE_QB_ATTACK_NATIVE '+JSON.stringify({
    schema:report.schema,matched:report.physicalMatchInBothPivotConditions,
    sourceFirst:report.sourceOnlyFirstDifferenceInBothPivotConditions,
    pairs:report.pairs,
    qualifiedGames:0
  })+'\n');
  if(!report.physicalMatchInBothPivotConditions)process.exitCode=1;
}
module.exports={
  VERSION,TARGET,FACTORS,frozenTrial,runFactor,
  physicalSourceRootCensus,run
};
