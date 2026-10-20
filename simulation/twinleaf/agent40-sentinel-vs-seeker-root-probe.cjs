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

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const TARGET = "Lillie's Determination M1L";
const SEEKER = 'VS Seeker PHF';

/** @param {unknown} value @returns {string} */
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Execute one strictly bounded opponent-owner legal Item -> Supporter attempt
 * at an authentic source-dealt turn-six root. This is a retrospective mechanic
 * test. The owner discard is accessed only during an actual own-discard prompt.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {{game:T|null,error:object|null,phase:string,
 *            preAction:object|null,nativeAttempt:object|null}}
 */
function withOwnerVisibleSeekerAttempt(execute) {
  const engine = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction} = engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {Store} = engine('game/store/store');
  const originalBot = SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof originalDispatch?.value, 'function');
  let actualRoot = null, phase = 'await-opponent-turn';
  let preAction = null, nativeAttempt = null;

  /** @param {object} state @returns {object} */
  function view(state) {
    const owner = state.players[1 - SOURCE_SEAT];
    return {
      globalTurn: state.turn, actualActor: state.activePlayer,
      sourceActive: state.players[SOURCE_SEAT].active
        .getPokemonCard()?.fullName ?? null,
      ownerActive: owner.active.getPokemonCard()?.fullName ?? null,
      ownerHand: owner.hand.cards.map(card => card.fullName),
      ownerDiscard: owner.discard.cards.map(card => card.fullName),
      ownerSupporterQuota: owner.supporterTurn,
      ownerPrizesRemaining: owner.prizes.filter(slot => slot.cards.length).length,
      sourcePrizesRemaining: state.players[SOURCE_SEAT].prizes
        .filter(slot => slot.cards.length).length
    };
  }

  SimpleTacticsAi.prototype.decodeNextAction = function ownerRoot(state) {
    const owner = state.players[1 - SOURCE_SEAT];
    const pending = state.prompts.find(p => p.result === undefined);
    if (this.client?.id === owner?.id && state.turn === 6 &&
        state.activePlayer === 1 - SOURCE_SEAT) {
      if (phase === 'await-opponent-turn' && !pending) {
        preAction = view(state);
        assert.equal(preAction.ownerSupporterQuota, 0);
        assert.ok(preAction.ownerHand.includes(SEEKER));
        assert.ok(preAction.ownerDiscard.includes(TARGET));
        phase = 'seeker-prompt';
        return new PlayCardAction(owner.id,
          owner.hand.cards.findIndex(card => card.fullName === SEEKER));
      }
      if (phase === 'seeker-prompt') {
        assert.equal(pending?.constructor?.name, 'ChooseCardsPrompt',
          'VS Seeker must present a genuine own-discard ChooseCardsPrompt');
        assert.equal(pending.playerId, owner.id);
        assert.strictEqual(pending.cards, owner.discard);
        const card = pending.cards.cards.find(c => c.fullName === TARGET);
        assert.ok(card && pending.validate([card], state));
        phase = 'supporter-play';
        return new ResolvePromptAction(pending.id, [card]);
      }
      if (phase === 'supporter-play' && !pending) {
        assert.ok(owner.hand.cards.some(card => card.fullName === TARGET),
          'VS Seeker did not actually retrieve Lillie from own discard');
        phase = 'submitted';
        return new PlayCardAction(owner.id,
          owner.hand.cards.findIndex(card => card.fullName === TARGET));
      }
    }
    return originalBot.call(this, state);
  };

  Store.prototype.dispatch = function auditedRootDispatch(...args) {
    const action = args[0];
    if (actualRoot === null && action?.constructor?.name === 'AddPlayerAction')
      actualRoot = this;
    const state = this.state;
    const owner = state?.players?.[1 - SOURCE_SEAT];
    const card = action?.constructor?.name === 'PlayCardAction' &&
      action.id === owner?.id ? owner.hand.cards[action.handIndex] : null;
    const observe = this === actualRoot && phase === 'submitted' &&
      card?.fullName === TARGET && state.turn === 6;
    if (!observe) return originalDispatch.value.apply(this, args);
    assert.equal(nativeAttempt, null);
    const before = view(state);
    const logCount = state.logs.length;
    try {
      const response = originalDispatch.value.apply(this, args);
      const after = view(this.state);
      nativeAttempt = {
        status: 'returned', before, after,
        printedCardStillInHand: this.state.players[1 - SOURCE_SEAT]
          .hand.cards.includes(card),
        newNativeLogs: this.state.logs.slice(logCount)
          .map(log => ({message: log.message, params: log.params}))
      };
      phase = 'settled';
      return response;
    } catch (error) {
      nativeAttempt = {
        status: 'rejected', before, after: view(this.state),
        printedCardStillInHand: this.state.players[1 - SOURCE_SEAT]
          .hand.cards.includes(card),
        errorName: error?.name ?? null,
        errorMessage: String(error?.message ?? error),
        newNativeLogCount: this.state.logs.length - logCount
      };
      phase = 'rejected';
      throw error;
    }
  };

  let game = null, error = null;
  try {
    try { game = execute(); }
    catch (failure) {
      error = {name: failure?.name ?? null,
        message: String(failure?.message ?? failure)};
    }
    return {game, error, phase, preAction, nativeAttempt};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = originalBot;
    Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
  }
}

/**
 * Repeat one fixed published rank1/rank2 physical deal, with source
 * Stoutland Benched versus Active. No branch enters a win-rate denominator.
 * @returns {object}
 */
function runAudit() {
  const file = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const manifest = resolveManifestFile(file, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const decks = new Map(manifest.decks.map(row => [row.rank, row]));
  const champion = decks.get(1), source = decks.get(2);
  assert.ok(champion?.playableUnderEngine && source?.playableUnderEngine);
  assert.equal(champion.cardIds.length, 60);
  assert.equal(source.cardIds.length, 60);
  const request = {
    deckA: champion.cardIds, deckB: source.cardIds,
    seed: SEED, maxActions: 300, strictPromptValidation: true,
    grandTreeFirstTurnCorrection: true,
    captureDecisionTrace: true, captureGladionRootPrizeChoices: true,
    label: 'Retrospective owner-visible turn-six Sentinel Item retrieval control'
  };
  const baseline = runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE);
  assert.equal(baseline.firstTurnSlot, SOURCE_SEAT);
  assert.equal(sha256(baseline.rootActionLedger), ORIGINAL_ROOT_SHA256);

  /** @param {boolean} active */
  const arm = active => withObservedGrandTreeEvolution(() =>
    withOwnerVisibleSeekerAttempt(() =>
      runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE)),
    {promoteStoutland: active});
  const benched = arm(false);
  const active = arm(true);
  for (const comparison of [benched, active]) {
    assert.equal(comparison.audit.phase, 'complete',
      'Source Grand Tree sequence did not finish before probe');
    assert.ok(comparison.result.preAction);
    assert.ok(comparison.result.nativeAttempt,
      'A native root Supporter attempt was never observed');
    assert.equal(comparison.result.preAction.globalTurn, 6);
    assert.equal(comparison.result.preAction.ownerSupporterQuota, 0);
  }
  assert.deepEqual(benched.result.preAction.ownerHand,
    active.result.preAction.ownerHand,
    'Opposing physical hand differed across board-control branches');
  assert.deepEqual(benched.result.preAction.ownerDiscard,
    active.result.preAction.ownerDiscard,
    'Opposing public discard differed across board-control branches');
  assert.equal(benched.result.preAction.sourceActive, 'Fan Rotom SCR');
  assert.equal(active.result.preAction.sourceActive, 'Stoutland BCR');
  assert.equal(benched.result.nativeAttempt.status, 'returned',
    'Benched Stoutland did not permit a first ordinary Supporter');
  assert.equal(benched.result.nativeAttempt.printedCardStillInHand, false);
  assert.equal(benched.result.nativeAttempt.after.ownerSupporterQuota, 1);
  assert.equal(active.result.nativeAttempt.status, 'rejected',
    'Active Stoutland did not deny the same ordinary Supporter');
  assert.equal(active.result.nativeAttempt.printedCardStillInHand, true);
  assert.equal(active.result.nativeAttempt.newNativeLogCount, 0);
  assert.deepEqual(active.result.nativeAttempt.before.ownerHand,
    active.result.nativeAttempt.after.ownerHand);
  assert.equal(active.result.nativeAttempt.after.ownerSupporterQuota, 0);

  return {
    study: 'Source-authentic Stoutland Sentinel matched owner Supporter retrieval root',
    schema: 'agent40-retrospective-active-vs-benched-stoutland-native-vsseeker-v1',
    seed: SEED, sourceSeat: SOURCE_SEAT,
    printedCounts: [champion.cardIds.length, source.cardIds.length],
    enginePin: baseline.engine, sourceDeckHashes: baseline.deckHashes,
    originalRootLedgerSha256: ORIGINAL_ROOT_SHA256,
    originalPrizeRootOrdinal: PRIZE_ROOT_ORDINAL,
    controlBenched: {
      source: benched.audit, attempt: benched.result.nativeAttempt,
      before: benched.result.preAction,
      executionError: benched.result.error,
      gameFinished: benched.result.game?.finished ?? null
    },
    sentinelActive: {
      source: active.audit, attempt: active.result.nativeAttempt,
      before: active.result.preAction,
      executionError: active.result.error,
      gameFinished: null
    },
    competitiveGameQualified: false,
    caveat: 'Retrospectively selected original source deal, forced actor-visible Item retrieval then genuine Store Supporter attempt. This is a lock rule interaction diagnostic, not a playable policy evaluation or winner statistic.'
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(runAudit(), null, 2) + '\n');

module.exports = {runAudit, withOwnerVisibleSeekerAttempt};
