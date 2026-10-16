'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

/**
 * Source-ranked bounded lifecycle of the opt-in post-constructor alias repair.
 * It tests wrapper restoration, original-game noninterference and provenance.
 * No policy or win-rate quality is inferred from the returned engine events.
 *
 * @returns {object}
 */
function verifyPostSuperAliasHeadlessLifecycle() {
  const source = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const byRank = new Map(source.decks.map(deck => [deck.rank,deck]));
  const rank1 = byRank.get(1), rank10 = byRank.get(10);
  assert.ok(rank1?.playableUnderEngine && rank10?.playableUnderEngine);

  const simulatorModule = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/bots/simulator'));
  const originalSimulator = simulatorModule.Simulator;
  const parameters = {
    deckA:rank1.cardIds,deckB:rank10.cardIds,
    seed:20261049,maxActions:150,
    label:'agent48-post-super-alias-lifecycle',
    strictPromptValidation:true,
    supporterDecisionCorrection:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    isolatePolicyRandomness:true
  };

  const original = runMatch(parameters);
  assert.strictEqual(simulatorModule.Simulator,originalSimulator);
  assert.equal(original.postSuperAliasRepairIsolation,false);

  const repaired = runMatch({...parameters,postSuperAliasRepairIsolation:true});
  assert.strictEqual(simulatorModule.Simulator,originalSimulator);
  assert.equal(repaired.postSuperAliasRepairIsolation,true);
  assert.match(repaired.policy,/PostSuperAliasRepairIsolation-experimental-v2/);
  assert.deepEqual(repaired.deckHashes,original.deckHashes);
  assert.equal(repaired.seed,original.seed);
  assert.equal(repaired.firstTurnSlot,original.firstTurnSlot);
  assert.equal(repaired.verifiedByDrawLog,true);

  assert.throws(() => runMatch({
    ...parameters,postSuperAliasRepairIsolation:true,
    prototypeSafeSimulatorIsolation:true
  }),/Choose only one experimental speculative Simulator profile/);
  assert.strictEqual(simulatorModule.Simulator,originalSimulator);

  const again = runMatch(parameters);
  assert.deepEqual(again,original,
    'Post-super experiment must not alter a subsequent original game');
  assert.strictEqual(simulatorModule.Simulator,originalSimulator);

  return {
    evidenceClass:'bounded source-ranked Simulator lifecycle control',
    ranks:[1,10],seed:parameters.seed,
    maxActions:parameters.maxActions,
    engine:original.engine,deckHashes:original.deckHashes,
    actualFirstTurnSlot:original.firstTurnSlot,
    original:{actions:original.actions,finished:original.finished},
    repaired:{actions:repaired.actions,finished:repaired.finished},
    originalGameReproduced:true,
    simulatorExportRestored:true,
    competitiveInferenceQualified:false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(
    verifyPostSuperAliasHeadlessLifecycle(),null,2)+'\n');
}

module.exports = {verifyPostSuperAliasHeadlessLifecycle};
