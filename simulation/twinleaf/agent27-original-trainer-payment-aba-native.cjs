'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {summarizeNativePaymentRoots,VERSION:PAYMENT_VERSION}=
  require('./agent27-owner-trainer-payment-observer.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');
const {run:runOriginalFiveEleven}=
  require('./agent5-generic-owner-trainer-frontier-native.cjs');

const VERSION='agent27-original-source-owner-payment-native-aba-v1';

/**
 * Preserve the existing Agent5 original rank5/rank11 physical two-seat A/B/A
 * registration unchanged. Merely add the exact owner-hand cost observer at
 * its genuine native owner-root and compare full native trace parity.
 */
function run(){
  assert.ok(process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR===undefined||
    process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR==='5_11');
  assert.ok(process.env.AGENT27_TRAINER_PAYMENT_AUDIT===undefined||
    process.env.AGENT27_TRAINER_PAYMENT_AUDIT==='true');
  const prev=process.env.AGENT27_TRAINER_PAYMENT_AUDIT;
  const prevRank=process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR;
  process.env.AGENT27_TRAINER_PAYMENT_AUDIT='true';
  process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR='5_11';
  let baseline;
  try{baseline=runOriginalFiveEleven();}
  finally{
    if(prev===undefined)delete process.env.AGENT27_TRAINER_PAYMENT_AUDIT;
    else process.env.AGENT27_TRAINER_PAYMENT_AUDIT=prev;
    if(prevRank===undefined)delete process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR;
    else process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR=prevRank;
  }
  assert.deepEqual(baseline.registeredOriginalRanks,[5,11]);
  assert.equal(baseline.summary.fullGameTraceMatchedABA,2);
  assert.equal(baseline.summary.fullPhysicalMatchedABA,2);
  const rows=baseline.rows.map(row=>{
    const roots=row.frontiers.roots;
    const payment=summarizeNativePaymentRoots(roots);
    assert.equal(payment.auditedRoots,roots.length,
      'Every native Agent5 root must have the owner payment overlay');
    assert.ok(roots.every(x=>x.ownerPaymentSummary?.policyReadOnly===true));
    return {
      primaryRankSeat:row.primaryRankSeat,physicalSlot:row.physicalSlot,
      seed:row.seed,
      sameSeedThreeArmParity:row.sameSeedThreeArmParity,
      initialFullPhysicalDealDigest:row.initialFullPhysicalDealDigest,
      observedOwnerRoots:roots.length,
      paymentSummary:payment,
      paidAffordablePassExamples:roots.filter(root=>
        root.chosen?.action==='PassTurnAction'&&
        root.dispatch==='native-accepted'&&
        root.ownerPaymentSummary?.physicallyAffordablePaidVariants>0)
        .slice(0,10).map(root=>({
          seat:root.seat,turn:root.turn,
          pay:root.ownerPaymentSummary,
          selectedRoot:root.chosen?.action,dispatch:root.dispatch
        })),
      physicallyUnaffordablePassExamples:roots.filter(root=>
        root.chosen?.action==='PassTurnAction'&&
        root.ownerPaymentSummary?.physicallyUnaffordablePaidVariants>0)
        .slice(0,10).map(root=>({
          seat:root.seat,turn:root.turn,
          pay:root.ownerPaymentSummary,
          selectedRoot:root.chosen?.action,dispatch:root.dispatch
        }))
    };
  });
  return {
    version:VERSION,costVersion:PAYMENT_VERSION,
    originalSourceRanks:[5,11],
    originalPhysicalSeeds:baseline.seedPlan,
    sameRegisteredSixties:true,sameNativeRootAndPhysicalABA:true,
    independentCompetitiveGames:0,
    paperPaidTrainerChoicesCertified:0,
    nativeEnumeratorIsPaperLegal:false,
    ownerInformationSafeOverlay:true,
    allInitialDealsAndRootActionsReproduced:true,
    originalNativeAttempts:6,
    rows
  };
}

if(require.main===module){
  const r=run();
  saveResult(path.resolve(process.cwd(),
    'agent27-native-owner-trainer-payment-original5-11.json'),r);
  process.stdout.write('AGENT27_TRAINER_PAYMENT_NATIVE '+JSON.stringify({
    version:r.version,attempts:r.originalNativeAttempts,
    samePhysicalAndActions:r.sameNativeRootAndPhysicalABA,
    bySeat:r.rows.map(row=>({
      seat:row.primaryRankSeat,
      payment:row.paymentSummary,
      affordablePassed:row.paidAffordablePassExamples.length,
      unaffordablePassed:row.physicallyUnaffordablePassExamples.length
    })),
    qualifiedCompetitiveGames:r.independentCompetitiveGames
  })+'\n');
}
module.exports={VERSION,run};
