'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerStartingPokemon}=require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {withOwnerSetupConfirm}=require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerPublicAcknowledgements}=require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withCanonicalActorOnlyPolicy}=require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const rank6=plan.opponents.find(o=>o.rank===6);
assert.equal(rank6?.status,'ready');
assert.equal(rank6.cards.length,60);
assert.equal(plan.candidate.cards.length,60);

const SEEDS=Object.freeze([
  20261126,20261127,20261128,20261129,
  20261130,20261131,20261132,20261133
]);

/**
 * Peel only complete wrapper results; on fail-closed abort the owner-setup
 * audit is carried by the Error rather than a completed result.
 *
 * @param {object} outer
 * @returns {object}
 */
function findStartingAudit(outer){
  let current=outer;
  while(current&&typeof current==='object'&&
    Object.hasOwn(current,'result')&&Object.hasOwn(current,'audit')){
    if(current.audit?.version?.startsWith(
      'agent4-owner-setup-starting-pokemon-v2-'))return current.audit;
    current=current.result;
  }
  return null;
}

/**
 * A naturally generated original Store setup, not a constructed prompt or
 * fake source/deck. Rank6 has four Basic copies; rank1 reference has 14.
 * Seed and physical source seat are frozen, and every attempted outcome is
 * accounted for even when the outer quarantine intentionally stops at an
 * unsupported native decision.
 *
 * @param {0|1} sourceSeat
 * @param {number} seed
 */
function run(sourceSeat,seed){
  const deckA=sourceSeat===0?rank6.cards:plan.candidate.cards;
  const deckB=sourceSeat===1?rank6.cards:plan.candidate.cards;
  return guard(()=>withOwnerSetupConfirm(()=>withOwnerStartingPokemon(()=>
    withOwnerPublicAcknowledgements(()=>withCanonicalActorOnlyPolicy(()=>
      runMatch({deckA,deckB,seed,maxActions:128,
        captureNativeAbortEvidence:true}))))));
}

test('real pinned Store naturally exercises optional min0 Bench choices on both source seats',()=>{
  const rows=[];
  for(const sourceSeat of [0,1])for(const seed of SEEDS){
    let result=null,error=null;
    try{result=run(sourceSeat,seed);}
    catch(e){error=e;}
    if(error)assert.equal(error.code,CODE,
      'Unexpected native engine error is not a permitted quarantine outcome');
    const audit=error?.ownerStartingPokemonAudit??
      findStartingAudit(result);
    assert.ok(audit,'Every original-Store attempt must retain the starting policy audit');
    assert.equal(audit.selectedBonusDecline,audit.acceptedBonusDecline,
      'All selected optional setup declines must reach the actual Store');
    assert.equal(audit.acceptedBonusDecline,
      audit.bonusDeclinePhysicalZonesPreserved,
      'Every accepted decline must keep preexisting physical owner zones');
    assert.equal(audit.physicallyPlacedActiveMissing,0);
    const quarantine=error?.nativeRawStateFallbackQuarantine??
      result?.audit;
    assert.ok(quarantine);
    assert.equal(quarantine.originalNativeDecoderExecuted,false);
    const row={
      sourceSeat,seed,
      status:error?'fail-closed-native-fallback':'bounded-native-return',
      acceptedInitial:audit.acceptedInitial,
      acceptedBonusDecline:audit.acceptedBonusDecline,
      zonePreservation:audit.bonusDeclinePhysicalZonesPreserved,
      originalDecoderCalls:quarantine.rawStateFallbackCalls
    };
    rows.push(row);
  }
  assert.equal(rows.length,16);
  const bySeat=[0,1].map(seat=>rows.filter(r=>
    r.sourceSeat===seat&&r.acceptedBonusDecline>0));
  process.stdout.write(JSON.stringify({
    schema:'agent4-native-bonus-bench-overloaded-prompt-v1',
    sourceRank:6,referenceRank:1,pin:plan.engineRevision,
    policy:'agent4-one-Basic-initial-and-zero-Basic-optional-bonus',
    totalAttempts:rows.length,
    nativeBonusWitnessesBySourceSeat:bySeat.map(a=>a.length),
    attempts:rows,competitivelyQualifiedGames:0
  })+'\n');
  assert.ok(bySeat.every(group=>group.length>0),
    'Predeclared native cohort never reached a bonus-Bench prompt in one source seat');
});
