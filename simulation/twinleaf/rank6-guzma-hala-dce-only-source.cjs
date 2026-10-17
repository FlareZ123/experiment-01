'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withSourceOpeningProbe} = require('./rank6-seed-opening-probe.cjs');
const {withGuzmaHalaSourceFork,withDamageObserver} =
  require('./rank6-seed-guzma-hala-fork.cjs');

const seed = 20367160;
const discardNames = ['Guzma','Tropical Beach'];
const dce = 'Double Colorless Energy';
const wondrous = 'Wondrous Labyrinth Prism Star';

/**
 * Compare ordinary combined category search with a restricted G&H search
 * which deliberately fails to find a Stadium while taking the Special Energy.
 * Both arms retain the exact source-dealt hand, Prize zone and actor turn.
 * @returns {object} Source action evidence only, not a competitive outcome.
 */
function main() {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(entry=>entry.rank===6);
  assert.ok(plan.candidate.cards && opponent?.cards);

  const request = {
    deckA:plan.candidate.cards,deckB:opponent.cards,seed,
    maxActions:125,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  /** @param {string[]} searchNames */
  function arm(searchNames) {
    const probe = withSourceOpeningProbe(()=>
      withGuzmaHalaSourceFork(()=>
        withDamageObserver(()=>runMatch(request)),
      discardNames,searchNames));
    const branch = probe.out;
    assert.equal(branch.completed,true,'G&H source attack did not complete');
    const attack = branch.result.attack;
    assert.ok(attack,'No original-Store Volt Cyclone attack captured');
    assert.equal(attack.announced,'Volt Cyclone');
    assert.equal(attack.damageBefore,0);
    assert.equal(attack.damageAfter,140);
    assert.equal(branch.result.result.firstTurnSlot,0);
    return {probe,branch,attack};
  }

  const normal=arm([dce,wondrous]);
  const noStadium=arm([dce]);
  assert.deepEqual(normal.probe.observed.hand,noStadium.probe.observed.hand,
    'Source pre-G&H physical hand differs');
  assert.deepEqual(normal.probe.observed.prizes,noStadium.probe.observed.prizes,
    'Source physical six Prizes differ');
  assert.deepEqual(normal.probe.observed.doubleColorless,
    noStadium.probe.observed.doubleColorless,'Source DCE location differs');
  assert.deepEqual(normal.probe.observed.stadium,
    noStadium.probe.observed.stadium,'Predecision Stadium differs');
  assert.ok(normal.attack.handNamesAtDamage.includes(wondrous),
    'Control did not search Wondrous into hand');
  assert.ok(!noStadium.attack.handNamesAtDamage.includes(wondrous),
    'DCE-only search acquired Wondrous unexpectedly');
  assert.ok(!noStadium.attack.discardNamesAtDamage.includes(wondrous),
    'Wondrous should remain out of discard on this source turn');
  assert.ok(noStadium.branch.events.some(e=>
    e.action==='Fetch '+dce && e.prompt==='ChooseCardsPrompt'),
  'No successful DCE-only search prompt');

  const summary={
    evidence:'Fixed seed 20367160 authentic G&H restricted-search source fork',
    declaredPrintedLists:{candidateRank:1,opponentRank:6},
    physicalSeed:seed,actualFirstPlayerSlot:0,
    startingHandEqual:true,prizesEqual:true,dceZoneEqual:true,
    control:{searched:[dce,wondrous],damage:normal.attack.damageAfter,
      handHasWondrous:true},
    alternative:{searched:[dce],damage:noStadium.attack.damageAfter,
      handHasWondrous:false,promptAccepted:true},
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    caveat:'This validates one legal Store action sequence and its 140 damage. It neither proves superior subsequent tactics nor certifies paper-rules fidelity or win rate.'
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}

if (require.main===module) main();
module.exports={main};
