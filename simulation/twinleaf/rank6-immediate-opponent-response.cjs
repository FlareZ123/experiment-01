'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
const {withAcerolaPublicObserver} =
  require('./rank6-acerola-public-observer.cjs');
const {withSourceOpeningProbe} = require('./rank6-seed-opening-probe.cjs');
const {withGuzmaHalaSourceFork,withDamageObserver} =
  require('./rank6-seed-guzma-hala-fork.cjs');
const {publicTurnLedger,responseTurnEndingActionObserved} =
  require('./rank6-response-projection.cjs');

/** @param {unknown} value */
const digest = value => crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @param {object} game @param {string} label */
function publicGameSummary(game,label) {
  const ledger = publicTurnLedger(game.decisionTrace,{seat:0,turn:3});
  return {
    label,
    sourceOpponentTurn:3,
    opponentTurnActions:ledger,
    opponentTurnEndingActionObserved:responseTurnEndingActionObserved(ledger),
    attackCountSeatA:game.attackTrace.filter(a=>a.seat===0).length,
    attackCountSeatB:game.attackTrace.filter(a=>a.seat===1).length,
    gameFinished:game.finished,
    engineWinner:game.finished?game.winner:null,
    actions:game.actions,
    turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    endReason:game.endReason,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}

/** @returns {object} Three same-deal outcomes, each with public turn-3 response. */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(x=>x.rank===6);
  assert.ok(plan.candidate.cards && rank6?.cards);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(rank6.cards.length,60);
  const seed=20367160;
  const request={
    deckA:plan.candidate.cards,deckB:rank6.cards,seed,
    maxActions:125,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const originalObservation=withAcerolaPublicObserver(Store,
    ()=>withSourceOpeningProbe(()=>runMatch(request)));
  const baseline=originalObservation.result;
  assert.equal(originalObservation.pending,false);
  assert.equal(baseline.out.firstTurnSlot,0);
  assert.ok(baseline.observed?.hand);
  const observedFingerprint=digest({
    hand:baseline.observed.hand,
    prizes:baseline.observed.prizes,
    doubleColorless:baseline.observed.doubleColorless
  });
  const originalRow=publicGameSummary(baseline.out,'unmodified-source-bot');
  originalRow.sourceAcerolaPublicBoard=originalObservation.events;
  const all=[originalRow];
  for(const {label,pair} of [
    {label:'guzma-spent',pair:['Guzma','Tropical Beach']},
    {label:'guzma-preserved',pair:["Trainers' Mail",'Tropical Beach']}
  ]) {
    const sourceObservation=withAcerolaPublicObserver(Store,
      ()=>withSourceOpeningProbe(()=>withGuzmaHalaSourceFork(
        ()=>withDamageObserver(()=>runMatch(request)),pair)));
    const branched=sourceObservation.result;
    assert.equal(sourceObservation.pending,false);
    assert.deepEqual(branched.observed?.hand,baseline.observed.hand,
      'Fork changed physical opening hand');
    assert.deepEqual(branched.observed?.prizes,baseline.observed.prizes,
      'Fork changed physical Prize cards');
    assert.deepEqual(branched.observed?.doubleColorless,
      baseline.observed.doubleColorless,'Fork changed DCE location');
    assert.equal(branched.out.completed,true);
    assert.equal(branched.out.result.attack?.damageAfter,140);
    const game=branched.out.result.result;
    assert.equal(game.firstTurnSlot,0);
    assert.deepEqual(game.deckHashes,baseline.out.deckHashes);
    const row=publicGameSummary(game,label);
    row.sourcePayment=pair.slice();
    row.realVoltCycloneDamage=branched.out.result.attack.damageAfter;
    row.samePhysicalOpening=true;
    row.sourceAcerolaPublicBoard=sourceObservation.events;
    all.push(row);
  }
  for(const row of all) assert.ok(row.opponentTurnActions.length>0,
    'No actual third-turn opponent decisions captured: '+row.label);
  const report={
    schema:'rank6-fixed-source-opponent-turn3-response-ledger-v1',
    physicalSeed:seed,
    publishedRankPair:[1,6],
    physicalSeatA:'rank1 champion Shadow Rider',
    physicalSeatB:'rank6 Iron Thorns',
    championActualFirst:true,
    openingPhysicalTruthSha256:observedFingerprint,
    sourceDeckSha256:baseline.out.deckHashes,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    options:Object.fromEntries(Object.entries(request).filter(([key])=>
      key!=='deckA' && key!=='deckB')),
    rows:all,
    interpretation:'One exact source deal, two alternative discard payments, and an observed next opponent turn. All subsequent bot policy remains unqualified.',
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={publicGameSummary,main};
