'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {initializeCards, runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {withSourceApexObservation, firstActionDifference} =
  require('./rank10-apex-prize-source-pair.cjs');

/**
 * Deterministically select one distinct source seed for each actual first player.
 * The 1-action preview is only a starting-order screen, not a completed game.
 * @param {object} base Fully resolved source-60 deck and game options.
 * @returns {Array<{seed:number,firstTurnSlot:number,probes:number}>}
 */
function selectTrueStartSeeds(base) {
  const selected = new Map();
  for (let i = 0; i < 48 && selected.size < 2; i += 1) {
    const seed = (4246551499 ^ Math.imul(i + 1, 0x9e3779b1)) >>> 0;
    const preview = runMatch({...base, seed, maxActions:1});
    const first = preview.firstTurnSlot;
    assert.ok(first === 0 || first === 1,
      'Source preview did not authenticate its first normal turn');
    if (!selected.has(first)) {
      selected.set(first, {seed,firstTurnSlot:first,probes:i + 1});
    }
  }
  assert.equal(selected.size, 2, '48 sampled authentic starts omitted a player');
  return [...selected.values()].sort((a,b) => a.firstTurnSlot - b.firstTurnSlot);
}

/** Mirror source deals only: mechanics exposure, not candidate-deck qualification. */
function main() {
  const manifest = resolveManifestFile(path.resolve(
    __dirname, '../../results/aichi-2026/full-decklists.json'
  ), {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const deck = manifest.decks.find(x => x.rank === 10);
  assert.ok(deck?.playableUnderEngine);
  initializeCards();
  const {Store} = require(path.resolve(
    __dirname,'../../vendor/twinleaf/ptcg-server/output/game/store/store'
  ));
  const base = {
    deckA:deck.cardIds, deckB:deck.cardIds,
    strictPromptValidation:true, forestSealSearchCorrection:true,
    supporterDecisionCorrection:true, doubleDragonRecovery:true,
    isolatePolicyRandomness:true, postSuperAliasRepairIsolation:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true,
    label:'rank10-source-mirror-apex-exposure'
  };
  const seedStrata = selectTrueStartSeeds(base);
  const observations = [];
  for (const {seed,firstTurnSlot} of seedStrata) {
    const request = {...base, seed,maxActions:350};
    const run = enabled => withSourceApexObservation(Store,()=>
      runMatch({...request,...(enabled ?
        {apexSpreadPrizeWindowPolicy:true}: {})}));
    const control = run(false);
    const experimental = run(true);
    assert.deepEqual(control.result.deckHashes,experimental.result.deckHashes);
    assert.equal(control.firstNormalTurnZoneDigest,
      experimental.firstNormalTurnZoneDigest,
      'Paired source starting cards or Prizes differ');
    assert.ok(control.firstNormalTurnZoneDigest);
    assert.equal(control.result.firstTurnSlot,firstTurnSlot,
      'Source full game start differs from its setup-only preview');
    assert.equal(experimental.result.firstTurnSlot,firstTurnSlot,
      'True starting-order pair diverged under joint prompt policy');
    const summarize = source => ({
      finished:source.result.finished,
      actions:source.result.actions,
      turns:source.result.turns,
      winner:source.result.winner,
      prizesRemaining:source.result.prizesRemaining,
      rootActions:source.sourceActions.length,
      rootApexDeclarations:source.sourceActions.filter(action=>
        action.type==='AttackAction'&&action.attack==='Apex Dragon'),
      rootAttackCount:source.sourceActions.filter(action=>
        action.type==='AttackAction').length,
      sourceCopyChoices:source.copyChoices,
      sourceSpreadChoices:source.spreadChoices,
      rootTraceSha256:crypto.createHash('sha256')
        .update(JSON.stringify(source.sourceActions)).digest('hex')
    });
    observations.push({
      seed,actualFirstSlot:firstTurnSlot,sameInitialSourceDeal:true,
      firstRootActionDifference:firstActionDifference(
        control.sourceActions,experimental.sourceActions),
      control:summarize(control),jointPolicy:summarize(experimental)
    });
  }
  return {
    schema:'rank10-mirror-source-apex-exposure-v1',
    exactSourcePrinting:'Aichi rank10 Regidrago mirrored',
    rationale:'mechanism availability and both authenticated first-player strata',
    experimentalPolicy:'DoubleDragonAttachTactic-v4+ApexSpreadPrizeWindow-v1',
    seedStrata,
    maxActionsPerGame:350,
    observations,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={selectTrueStartSeeds,main};
