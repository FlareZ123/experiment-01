'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runWithResearchProfile, EXPANDED_SOURCE_PROFILE} =
  require('./policy-profiles.cjs');

const OUTPUT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const TRIAL_SEEDS = Object.freeze([20261101, 20261102, 20261103, 20261104]);
const ACTION_LIMIT = 300;
const SOURCE_PRINTING = 'Stoutland BCR';

/** @param {unknown} value @returns {string} */
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Read-only, reversible pinned native Store observer. There is no forced
 * source or opponent action and no inspection of hidden opponent inventory.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,observation:object}}
 */
function observeUnmodifiedSourceStoutland(sourceSeat, execute) {
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  const {Store} = require(path.join(OUTPUT, 'game/store/store'));
  const prior = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof prior?.value, 'function');
  let root = null, rootOrdinal = 0;
  let firstInPlay = null, firstActive = null;
  let inPlayRoots = 0, activeRoots = 0;
  let firstOpponentDecisionUnderActive = null;
  const herdierFirstSeen = new WeakMap();
  const lillipupFirstSeen = new WeakMap();

  Store.prototype.dispatch = function observe(...args) {
    const action = args[0];
    if (root === null && action?.constructor?.name === 'AddPlayerAction')
      root = this;
    const rootAction = this === root;
    if (rootAction) rootOrdinal++;
    const stateBefore = this.state;
    const actorBefore = rootAction && stateBefore?.players?.length === 2 &&
      action?.constructor?.name === 'PlayCardAction' ?
      stateBefore.players.find(player => player.id === action.id) : null;
    const printedPlayed = actorBefore?.hand?.cards?.[action.handIndex]
      ?.fullName ?? null;
    const beforePending = stateBefore?.prompts?.find(prompt =>
      prompt.result === undefined);
    const ownActiveStageBefore = rootAction && stateBefore?.players?.length === 2 ?
      stateBefore.players[sourceSeat].active.cards.map(card => card.fullName) : null;
    const nativeRootBefore = {
      action: action?.constructor?.name ?? null,
      printedCardPlayed: printedPlayed,
      sourceOrOpponentTurn: stateBefore?.activePlayer ?? null,
      pendingPrompt: beforePending?.constructor?.name ?? null,
      ownActiveStackBefore: ownActiveStageBefore
    };
    if (rootAction && firstOpponentDecisionUnderActive === null &&
        stateBefore?.players?.length === 2 &&
        stateBefore?.players?.[sourceSeat]?.active
          ?.getPokemonCard()?.fullName === SOURCE_PRINTING &&
        stateBefore.activePlayer === 1 - sourceSeat &&
        action?.constructor?.name !== 'ResolvePromptAction' &&
        action?.constructor?.name !== 'AddPlayerAction') {
      firstOpponentDecisionUnderActive = {
        turn: stateBefore.turn, rootOrdinal,
        action: action?.constructor?.name ?? null,
        sourceActive: SOURCE_PRINTING
      };
    }
    const result = prior.value.apply(this, args);
    if (rootAction && this.state?.players?.length === 2) {
      const state = this.state;
      const actor = state.players[sourceSeat];
      const boardSlots = [actor.active, ...actor.bench];
      const active = actor.active.getPokemonCard()?.fullName === SOURCE_PRINTING;
      for (const slot of boardSlots) for (const card of slot.cards) {
        if (card.fullName === 'Herdier SUM' && !herdierFirstSeen.has(card))
          herdierFirstSeen.set(card, {turn: state.turn, ordinal: rootOrdinal});
        if (card.fullName === 'Lillipup CEC' && !lillipupFirstSeen.has(card))
          lillipupFirstSeen.set(card, {turn: state.turn, ordinal: rootOrdinal});
      }
      const inPlay = boardSlots.some(slot =>
        slot.getPokemonCard()?.fullName === SOURCE_PRINTING);
      if (inPlay) {
        inPlayRoots++;
        if (firstInPlay === null) {
          const slot = boardSlots.find(board =>
            board.getPokemonCard()?.fullName === SOURCE_PRINTING);
          firstInPlay = {
            turn: state.turn, ordinal: rootOrdinal,
            position: active ? 'Active' : 'Bench',
            pokemonStageStack: slot?.cards?.map(card => card.fullName) ?? [],
            sourceActivePrinting: actor.active.getPokemonCard()?.fullName ?? null,
            sourceBenchPrintings: actor.bench.map(board =>
              board.getPokemonCard()?.fullName ?? null),
            rootBeforeNativeSettlement: nativeRootBefore
          };
        }
      }
      if (active) {
        activeRoots++;
        if (firstActive === null) firstActive = {
          turn: state.turn, ordinal: rootOrdinal,
          pokemonStageStack: actor.active.cards.map(card => card.fullName),
          parentHerdierFirstNativeInPlay: herdierFirstSeen.get(
            actor.active.cards.find(card => card.fullName === 'Herdier SUM')) ?? null,
          ancestralLillipupFirstNativeInPlay: lillipupFirstSeen.get(
            actor.active.cards.find(card => card.fullName === 'Lillipup CEC')) ?? null,
          rootBeforeNativeSettlement: nativeRootBefore
        };
      }
    }
    return result;
  };
  try {
    return {
      result: execute(),
      observation: {
        sourceSeat, firstInPlay, firstActive, inPlayRoots, activeRoots,
        firstOpponentDecisionUnderActive,
        observedRootDispatches: rootOrdinal,
        readOnly: true, forcedActions: false
      }
    };
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', prior);
  }
}

/**
 * Eight independent source-frozen development specimens, without any
 * cherry-picking or outcome-based filtering.
 * @returns {object}
 */
function runAudit() {
  const file = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const manifest = resolveManifestFile(file, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const ranks = new Map(manifest.decks.map(x => [x.rank, x]));
  const rank1 = ranks.get(1), rank2 = ranks.get(2);
  assert.ok(rank1?.playableUnderEngine && rank2?.playableUnderEngine);
  assert.equal(rank1.cardIds.length, 60);
  assert.equal(rank2.cardIds.length, 60);
  const records = [];
  for (const seed of TRIAL_SEEDS) {
    for (const rank2Seat of [0, 1]) {
      const decks = rank2Seat === 0 ?
        [rank2.cardIds, rank1.cardIds] : [rank1.cardIds, rank2.cardIds];
      const trial = {seed, rank2Seat, sourceRank: 2, opponentRank: 1};
      try {
        const {result: game, observation} =
          observeUnmodifiedSourceStoutland(rank2Seat, () =>
            runWithResearchProfile({
              deckA: decks[0], deckB: decks[1],
              seed, maxActions: ACTION_LIMIT,
              strictPromptValidation: true,
              grandTreeFirstTurnCorrection: true,
              captureDecisionTrace: true,
              label: 'Frozen independent printed rank2 source Stoutland exposure'
            }, EXPANDED_SOURCE_PROFILE));
        assert.ok(game.rootActionLedger.length <=
          observation.observedRootDispatches,
          'In-game ledger cannot exceed root Store dispatches including setup');
        if (seed === 20261102 && rank2Seat === 0) {
          assert.equal(sha256(game.rootActionLedger),
            'f5364941c7799c9fb44acf143bd095ec9a04f09119f6ce92991a91c33a7cab09',
            'Add-only source stage observer changed genuine Store actions');
        }
        records.push({
          ...trial, engine: game.engine,
          verifiedFirstTurn: game.verifiedByDrawLog,
          actualFirstTurnSlot: game.firstTurnSlot,
          sourceStartsFirst: game.firstTurnSlot === rank2Seat,
          sourceDeckHash: game.deckHashes[rank2Seat],
          opponentDeckHash: game.deckHashes[1 - rank2Seat],
          actions: game.actions,
          finished: game.finished,
          winnerSlot: game.finished ? game.winner : null,
          endReason: game.endReason ?? null,
          lastPrizeCounts: game.prizesRemaining,
          rootLedgerSHA256: sha256(game.rootActionLedger),
          actualSourceGreatTreeActivations: game.rootActionLedger
            .filter(row => row.playerSlot === rank2Seat &&
              row.action === 'UseStadiumAction').length,
          observation, competitivelyQualified: false
        });
      } catch (error) {
        records.push({
          ...trial, failed: true,
          error: String(error?.stack || error),
          competitivelyQualified: false
        });
      }
    }
  }
  return {
    schema: 'agent40-unmodified-rank2-source-stoutland-eight-physical-deals-v1',
    preregisteredSeeds: TRIAL_SEEDS,
    eachPhysicalSeat: [0, 1],
    actionLimit: ACTION_LIMIT,
    sampleSize: records.length,
    diagnosticSuccesses: records.filter(x => !x.failed).length,
    diagnosticFailures: records.filter(x => x.failed).length,
    StoutlandEverInPlay: records.filter(x =>
      x.observation?.firstInPlay != null).length,
    StoutlandEverActive: records.filter(x =>
      x.observation?.firstActive != null).length,
    verifiedActualFirst: records.filter(x => x.sourceStartsFirst).length,
    verifiedActualSecond: records.filter(x =>
      x.sourceStartsFirst === false).length,
    trials: records,
    competitivelyQualifiedGames: 0,
    caveat: 'Eight predeclared seed-by-seat physical source deal diagnostics using four seed values, with possible dependence across paired reversed seats; existing generic bot and Expanded source profile, no additional forced actions. Not enough for competitive inference; censored matches remain censored; ordinary bot is unqualified.'
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(runAudit(), null, 2) + '\n');

module.exports = {
  TRIAL_SEEDS, ACTION_LIMIT, observeUnmodifiedSourceStoutland, runAudit
};
