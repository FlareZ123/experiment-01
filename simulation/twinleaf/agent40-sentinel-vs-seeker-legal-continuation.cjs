'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runWithResearchProfile, EXPANDED_SOURCE_PROFILE} =
  require('./policy-profiles.cjs');
const {
  SEED, SOURCE_SEAT, PRIZE_ROOT_ORDINAL, ORIGINAL_ROOT_SHA256,
  withObservedGrandTreeEvolution
} = require('./agent40-rank2-grandtree-root-fork.cjs');
const {
  withOwnerVisibleSeekerAttempt
} = require('./agent40-sentinel-vs-seeker-root-probe.cjs');

/** @param {unknown} value @returns {string} */
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @returns {object} */
function runAudit() {
  const manifestFile = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const manifest = resolveManifestFile(manifestFile, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const ranks = new Map(manifest.decks.map(deck => [deck.rank, deck]));
  const rank1 = ranks.get(1), rank2 = ranks.get(2);
  assert.equal(rank1.cardIds.length, 60);
  assert.equal(rank2.cardIds.length, 60);
  const request = {
    deckA: rank1.cardIds, deckB: rank2.cardIds,
    seed: SEED, maxActions: 300,
    strictPromptValidation: true,
    grandTreeFirstTurnCorrection: true,
    captureDecisionTrace: true, captureGladionRootPrizeChoices: true,
    label: 'Retrospective genuine VS Seeker owner fallback under sourced Sentinel'
  };
  const untouched = runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE);
  assert.equal(untouched.firstTurnSlot, SOURCE_SEAT);
  assert.equal(sha256(untouched.rootActionLedger), ORIGINAL_ROOT_SHA256);

  /** @param {boolean} promoteStoutland */
  function scenario(promoteStoutland) {
    const fork = withObservedGrandTreeEvolution(() =>
      withOwnerVisibleSeekerAttempt(() =>
        runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE),
      {attemptSupporter: false}), {promoteStoutland});
    assert.equal(fork.audit.phase, 'complete');
    assert.equal(fork.result.phase, 'continued');
    assert.ok(fork.result.legalFollowup);
    assert.ok(fork.result.preAction);
    assert.equal(fork.result.nativeAttempt, null,
      'Actual first owner continuation must not force illegal Supporter root');

    const game = fork.result.game;
    assert.ok(game, 'Natural owner continuation caused game execution failure');
    assert.deepEqual(game.rootActionLedger.filter(row =>
      row.actionOrdinal <= PRIZE_ROOT_ORDINAL),
    untouched.rootActionLedger.filter(row =>
      row.actionOrdinal <= PRIZE_ROOT_ORDINAL));
    const followingOwner = game.rootActionLedger.find(row =>
      row.playerSlot === 1 - SOURCE_SEAT && row.turnBefore === 6 &&
      row.actionOrdinal > PRIZE_ROOT_ORDINAL &&
      row.action !== 'ResolvePromptAction');
    const followingSource = game.rootActionLedger.find(row =>
      row.playerSlot === SOURCE_SEAT && row.turnBefore > 6 &&
      row.action !== 'ResolvePromptAction');
    return {
      source: fork.audit,
      firstOwner: fork.result.preAction,
      followupDecision: fork.result.legalFollowup,
      firstOwnerRoot: followingOwner ?? null,
      firstLaterSourceRoot: followingSource ?? null,
      finished: game.finished, actions: game.actions,
      finalPrizes: game.prizesRemaining,
      gameEndReason: game.endReason,
      rootLedgerSha256: sha256(game.rootActionLedger)
    };
  }
  const benched = scenario(false);
  const active = scenario(true);
  assert.deepEqual(benched.firstOwner.ownerHand, active.firstOwner.ownerHand);
  assert.deepEqual(benched.firstOwner.ownerDiscard, active.firstOwner.ownerDiscard);
  assert.equal(benched.firstOwner.sourceActive, 'Fan Rotom SCR');
  assert.equal(active.firstOwner.sourceActive, 'Stoutland BCR');
  assert.ok(benched.firstLaterSourceRoot &&
    active.firstLaterSourceRoot,
  'Both real-owner continuations must reach at least one real next source turn');
  return {
    study: 'Owner-safe normal policy after genuine source VS Seeker under Sentinel',
    schema: 'agent40-retrospective-owner-seeker-then-original-ai-next-source-v1',
    originalDeckHashes: untouched.deckHashes,
    engine: untouched.engine,
    seed: SEED, originalRootChoiceOrdinal: PRIZE_ROOT_ORDINAL,
    exactInitialActionSHA256: ORIGINAL_ROOT_SHA256,
    sourceStoutlandBenched: benched,
    sourceStoutlandActive: active,
    competitiveGamesQualified: 0,
    caveat: 'Retrospective original-source fixed deal with forced owner-visible Item retrieval. Only the subsequent action comes from ordinary bot. The bot is competitively unqualified; winner and root censor do not estimate performance.'
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(runAudit(), null, 2) + '\n');

module.exports = {runAudit};
