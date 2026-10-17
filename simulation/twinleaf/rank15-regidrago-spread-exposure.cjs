'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {initializeCards, runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {withSourceApexObservation, firstActionDifference} =
  require('./rank10-apex-prize-source-pair.cjs');

/** Descriptive, bounded source-60 paired screen. Not a competitive outcome sample. */
function main() {
  const manifest = resolveManifestFile(path.resolve(
    __dirname, '../../results/aichi-2026/full-decklists.json'
  ), {allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true});
  const byRank = new Map(manifest.decks.map(deck => [deck.rank, deck]));
  const regidrago = byRank.get(10);
  const vileplume = byRank.get(15);
  assert.ok(regidrago?.playableUnderEngine && vileplume?.playableUnderEngine);
  initializeCards();
  const {Store} = require(path.resolve(
    __dirname, '../../vendor/twinleaf/ptcg-server/output/game/store/store'
  ));
  const seeds = [4246551499, 4246551500];
  const observations = [];
  for (const seed of seeds) {
    for (const regidragoSeat of [0, 1]) {
      const request = {
        deckA:regidragoSeat === 0 ? regidrago.cardIds : vileplume.cardIds,
        deckB:regidragoSeat === 1 ? regidrago.cardIds : vileplume.cardIds,
        seed, maxActions:280, label:'rank10-v-rank15-spread-screen',
        strictPromptValidation:true, forestSealSearchCorrection:true,
        grandTreeFirstTurnCorrection:true, supporterDecisionCorrection:true,
        doubleDragonRecovery:true, isolatePolicyRandomness:true,
        postSuperAliasRepairIsolation:true,
        regidragoDeclaredHistoryCorrection:true,
        passClearsLastAttackCorrection:true
      };
      const observe = enabled => withSourceApexObservation(Store, () =>
        runMatch({...request, ...(enabled ?
          {apexSpreadPrizeWindowPolicy:true} : {})}));
      const control = observe(false);
      const experimental = observe(true);
      assert.deepEqual(control.result.deckHashes, experimental.result.deckHashes);
      assert.equal(control.firstNormalTurnZoneDigest,
        experimental.firstNormalTurnZoneDigest,
        'Different initial source deal between paired policies');
      assert.ok(control.firstNormalTurnZoneDigest);
      assert.equal(control.result.firstTurnSlot, experimental.result.firstTurnSlot,
        'Different actual starting order in same-deal pair');
      const summarize = source => ({
        finished:source.result.finished,
        turns:source.result.turns,
        actions:source.result.actions,
        winner:source.result.winner,
        prizesRemaining:source.result.prizesRemaining,
        rootActions:source.sourceActions.length,
        regidragoCopyChoices:source.copyChoices.filter(
          row => row.seat === regidragoSeat &&
          row.activePokemon === 'Regidrago VSTAR SIT'),
        damagePrompts:source.spreadChoices.filter(
          row => row.seat === regidragoSeat),
        traceSha256:crypto.createHash('sha256')
          .update(JSON.stringify(source.sourceActions)).digest('hex')
      });
      observations.push({
        seed, regidragoPhysicalSeat:regidragoSeat,
        actualFirstSlot:control.result.firstTurnSlot,
        sameInitialSourceDeal:true,
        firstSourceActionDifference:firstActionDifference(
          control.sourceActions, experimental.sourceActions),
        control:summarize(control),
        jointPolicy:summarize(experimental)
      });
    }
  }
  return {
    schema:'rank15-source-spread-exposure-screen-v1',
    scope:'exact source-60 rank10 Regidrago versus rank15 Lopunny/Vileplume',
    experimentalPolicy:'DoubleDragonAttachTactic-v4+ApexSpreadPrizeWindow-v1',
    seeds, maxActionsPerGame:280,
    allFourPairsHaveEqualInitialDeals:true,
    observations,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
module.exports = {main};
