'use strict';

const assert=require('node:assert/strict');
const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {runV8Perfection260,ACTION_CAP}=
  require('./agent24-v8-perfection-260root-native.cjs');
const {firstRootDivergence}=
  require('./agent24-v8-perfection-paired-native.cjs');

const VERSION='agent24-original-v8-perfection-260root-control-versus-treatment-v1';

/**
 * Repeat the original frozen physical deals with an identical 260-root limit,
 * except that one run permits the public, energy-paid bilateral Perfection
 * root. This is post-exposure developmental causal analysis of historical
 * deals. It never counts unfinished root-capped attempts as victories.
 *
 * @param {{controlRunner?:Function,treatmentRunner?:Function}} [deps]
 * @returns {object}
 */
function runV8Perfection260Pair(deps={}){
  const baseline=(deps.controlRunner??(()=>runIssue25V8WithOwnerAbilityPolicy({
    v8Deps:{runner:options=>runDevelopment({
      ...options,actorOnlyComposition:true,
      nativeRootActionLimit:ACTION_CAP
    })}
  })))();
  const treatment=(deps.treatmentRunner??runV8Perfection260)();
  const bRows=baseline.rawDevelopment?.rows??[];
  const bOutcome=new Map((baseline.diagnostic.actualAttemptRows??[])
    .map(x=>[x.id,x]));
  const treated=new Map((treatment.treatments??[])
    .map(x=>[x.trial,x]));
  assert.equal(bRows.length,8,'Complete frozen v8 original field required');
  assert.equal(treated.size,8,'Complete bilateral Perfection field required');
  const pairs=bRows.map(row=>{
    const id=row.trial?.id??row.id;
    const a=bOutcome.get(id),b=treated.get(id);
    assert.ok(a&&b,'every original trial must be paired');
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint,
      'paired runs must have identical full physical setup');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.candidateSeat,b.candidateSeat);
    assert.ok(Array.isArray(row.rootActionLedger)&&
      Array.isArray(b.nativeAcceptedRootLedger));
    return {
      trial:id,identicalPhysicalDeal:true,
      sourceSeat:a.sourceSeat,candidateSeat:a.candidateSeat,
      firstNativeActionDifference:firstRootDivergence(row.rootActionLedger,
        b.nativeAcceptedRootLedger),
      control:{
        roots:a.rootActionCount,status:a.status,finished:a.finished,
        winner:a.winner,remainingPrizes:a.finalPrizes
      },
      bilateralPaidPerfection:{
        roots:b.rootActionCount,status:b.status,finished:b.finished,
        winner:b.winner,remainingPrizes:b.finalPrizes,
        paidPerfectionActions:b.nativePerfectionRootDecisions,
        copiedAttacks:b.chosenCopiedAttacks
      }
    };
  });
  return {
    version:VERSION,gameKind:'full native, historical physical seeds',
    effectiveNativeRootLimit:ACTION_CAP,
    originalRegisteredV8RootLimit:128,
    controlPolicy:'v8 owner Telepath and Confirm, no Perfection',
    treatmentPolicy:'same owner policy with bilateral paid Perfection root',
    trialsCompared:pairs.length,pairs,
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runV8Perfection260Pair(),null,2)+'\n');
}

module.exports={VERSION,runV8Perfection260Pair};
