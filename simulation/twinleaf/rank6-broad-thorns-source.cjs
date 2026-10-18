'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceOpeningProbe}=require('./rank6-seed-opening-probe.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withDamageObserver}=require('./rank6-seed-guzma-hala-fork.cjs');
const {publicTurnLedger}=require('./rank6-response-projection.cjs');

const positiveSeed=20367160;
// 24 CSPRNG-drawn uint32 seeds recorded before any trial outcome was viewed.
// Preserve order, including failure and non-exposure results.
const prospectiveSeeds=[
  666241617,3089003851,2740534263,2658780870,
  1945959224,1819063225,3873602919,2392718716,
  1375507384,3958698189,4181605041,2040126530,
  1290291827,2104302415,1030031846,2966348867,
  3497225400,3981381461,2042403461,1927968779,
  345923365,283721911,3802483431,2091300700
];

/** @param {object} game */
function summarize(game) {
  return {firstTurnSlot:game.firstTurnSlot,
    actualFirstVerified:game.verifiedByDrawLog,
    finished:game.finished,winner:game.finished?game.winner:null,
    actions:game.actions,turns:game.turns,
    attacks:[0,1].map(seat=>game.attackTrace.filter(a=>a.seat===seat).length),
    turn2IronThornsVoltCyclone:game.attackTrace.some(a=>a.seat===1 &&
      a.turn===2 && a.attack==='Volt Cyclone'),
    championTurn3Actions:publicTurnLedger(game.decisionTrace,
      {seat:0,turn:3})
  };
}

/**
 * Compare one physical source seed under default and autonomous rank6
 * policy, preserving the source opening and reporting any failure.
 * @param {object} base
 * @param {number} seed
 * @param {number} maxActions
 */
function compare(base,seed,maxActions) {
  const request={...base,seed,maxActions};
  try {
    const baseline=withSourceOpeningProbe(()=>runMatch(request));
    const alternative=withSourceOpeningProbe(()=>
      withBroadThornsSourceAttack(()=>
        withDamageObserver(()=>runMatch(request))));
    const branch=alternative.out;
    const game=branch.result.result;
    assert.equal(game.firstTurnSlot,baseline.out.firstTurnSlot);
    assert.deepEqual(game.deckHashes,baseline.out.deckHashes);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(baseline.out.verifiedByDrawLog,true);
    const bothObserved=Boolean(baseline.observed&&alternative.observed);
    if(bothObserved) {
      assert.deepEqual(alternative.observed.hand,baseline.observed.hand);
      assert.deepEqual(alternative.observed.prizes,baseline.observed.prizes);
      assert.deepEqual(alternative.observed.doubleColorless,
        baseline.observed.doubleColorless);
    }
    return {seed,
      completeSourceOpeningCompared:bothObserved,
      started:branch.started,
      actionProposed:branch.completed,
      abortReason:branch.abortReason,
      openingPlan:branch.openingPlan,
      selectedActionEvents:branch.events,
      attackDamageWitness:branch.result.attack?
        {announced:branch.result.attack.announced,
          before:branch.result.attack.damageBefore,
          after:branch.result.attack.damageAfter}:null,
      control:summarize(baseline.out),
      treatment:summarize(game),
      engineSourceDeckHashes:game.deckHashes};
  } catch(error) {
    return {seed,trialExecutionError:String(error?.message??error),
      qualifiedForCompetitiveInference:false};
  }
}

/** @returns {object} */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(o=>o.rank===6);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(rank6.cards.length,60);
  const base={deckA:plan.candidate.cards,deckB:rank6.cards,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const positive=compare(base,positiveSeed,125);
  assert.equal(positive.trialExecutionError,undefined,
    'Previously proven source seed could not run under broad policy');
  assert.equal(positive.started,true);
  assert.equal(positive.actionProposed,true);
  assert.equal(positive.abortReason,null);
  assert.equal(positive.completeSourceOpeningCompared,true);
  assert.equal(positive.attackDamageWitness?.before,0);
  assert.equal(positive.attackDamageWitness?.after,140);
  assert.equal(positive.treatment.turn2IronThornsVoltCyclone,true);
  assert.ok(positive.treatment.championTurn3Actions.length>0);

  const prospective=prospectiveSeeds.map(seed=>compare(base,seed,100));
  const summary={
    declared:prospective.length,
    errorTrials:prospective.filter(x=>x.trialExecutionError!==undefined).length,
    realFirstA:prospective.filter(x=>x.control?.firstTurnSlot===0).length,
    realFirstB:prospective.filter(x=>x.control?.firstTurnSlot===1).length,
    policyStarted:prospective.filter(x=>x.started).length,
    policyProposedAttack:prospective.filter(x=>x.actionProposed).length,
    actualRecordedTurn2Attack:prospective.filter(x=>
      x.treatment?.turn2IronThornsVoltCyclone).length,
    unexposed:prospective.filter(x=>x.started===false).length,
    completedMatchPairs:prospective.filter(x=>
      x.control?.finished&&x.treatment?.finished).length
  };
  const report={
    schema:'rank6-broad-source-autonomy-prospective-v1',
    sourceRanks:[1,6],
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    controlPolicy:'frozen pinned SimpleTacticsAi and existing correction flags',
    treatmentPolicy:'rank6-broad-ownhand-tag-gh-thunder-dce-v1',
    positiveControlSeed:positiveSeed,
    prospectiveSeedProtocol:'24 independent crypto.random 32-bit draws, frozen before results',
    prospectiveSeeds,
    positive,summary,prospective,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    caveats:'Actual root Store actions and drawn source rosters. Only first opponent turn potentially differs. Generic challenger policy unqualified; later-turn Thorns remains generic. Win statistics are not inferred. Failed, non-exposed, and capped arms remain represented.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={main,compare,prospectiveSeeds};
