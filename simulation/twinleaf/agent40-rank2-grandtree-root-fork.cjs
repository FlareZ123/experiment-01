'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runWithResearchProfile, EXPANDED_SOURCE_PROFILE} =
  require('./policy-profiles.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const SOURCE_SEAT = 1;
const SEED = 20261024;
const PRIZE_ROOT_ORDINAL = 47;
const ORIGINAL_ROOT_SHA256 =
  '0a4ff8e373a47d71a70699ace31ad409485850ad503f7949c1b26b4b73b39b40';

/** @param {unknown} value @returns {string} */
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * The deck may only be inspected during a genuine pending own-deck search.
 * The caller must already have established that the associated prompt is live.
 * @param {object} state
 * @param {object} player
 * @param {object} prompt
 * @param {string} printedName
 * @param {Function} ResolvePromptAction
 * @returns {object|null}
 */
function selectLiveDeckEvolution(state, player, prompt, printedName,
  ResolvePromptAction) {
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.playerId !== player.id ||
      prompt.cards !== player.deck) return null;
  const choice = prompt.cards.cards.find(card =>
    card.fullName === printedName);
  return choice && prompt.validate([choice], state) ?
    new ResolvePromptAction(prompt.id, [choice]) : null;
}

/**
 * Source-seat, post-Gladion, original-deal development fork.
 * The original root actions through 47 remain chosen by the original bot.
 * This only acts at a legally visible Stadium prompt and owner deck searches.
 * @template T
 * @param {()=>T} execute
 * @param {{promoteStoutland?:boolean,observeOpponentTurn6?:boolean}} [configuration]
 * @returns {{result:T,audit:object}}
 */
function withObservedGrandTreeEvolution(execute,
  {promoteStoutland = false, observeOpponentTurn6 = false} = {}) {
  const engine = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {UseStadiumAction, RetreatAction} =
    engine('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = engine('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const steps = [];
  let phase = 'before-prize-choice';
  let settledBoard = null;
  let activeAfterRetreat = null;
  let firstOpponentOwnerDecision = null;

  SimpleTacticsAi.prototype.decodeNextAction = function sourceGrandTree(state) {
    const opponent = state.players[1 - SOURCE_SEAT];
    if (observeOpponentTurn6 &&
        firstOpponentOwnerDecision === null &&
        state.turn === 6 &&
        state.activePlayer === 1 - SOURCE_SEAT &&
        state.phase === GamePhase.PLAYER_TURN &&
        this.client?.id === opponent?.id &&
        !state.prompts.some(p => p.result === undefined)) {
      const action = original.call(this, state);
      firstOpponentOwnerDecision = {
        turn: state.turn,
        opponentOwnHandPrintings: opponent.hand.cards.map(c => c.fullName),
        opponentSupporterAlreadyPlayed: opponent.supporterTurn > 0,
        opponentActive: opponent.active.getPokemonCard()?.fullName ?? null,
        sourceActive: state.players[SOURCE_SEAT].active.getPokemonCard()?.fullName ?? null,
        originalBotChosenAction: action?.constructor?.name ?? null,
        chosenCard: action?.constructor?.name === 'PlayCardAction' ?
          opponent.hand.cards[action.handIndex]?.fullName ?? null : null,
        opponentOwnDeckOrPrizesAccessed: false
      };
      return action;
    }
    const player = state.players[SOURCE_SEAT];
    if (this.client?.id !== player?.id ||
        state.turn !== 5 ||
        state.activePlayer !== SOURCE_SEAT) {
      return original.call(this, state);
    }
    const pending = state.prompts.find(p => p.result === undefined);
    if (phase === 'before-prize-choice') {
      const ordinary = original.call(this, state);
      if (pending?.constructor?.name === 'ChoosePrizePrompt' &&
          pending.playerId === player.id &&
          player.supporter.cards.some(c => c.fullName === 'Gladion CIN') &&
          ordinary?.constructor?.name === 'ResolvePromptAction') {
        steps.push({phase: 'original-gladion-choice',
          originalAction: ordinary.constructor.name, turn: state.turn});
        phase = 'stadium';
      }
      return ordinary;
    }
    if (phase === 'stadium' && !pending &&
        state.phase === GamePhase.PLAYER_TURN &&
        player.stadium.cards.some(c => c.fullName === 'Great Tree SCR') &&
        player.stadiumUsedTurn < state.turn &&
        player.bench.some(slot =>
          slot.getPokemonCard()?.fullName === 'Lillipup CEC' &&
          slot.pokemonPlayedTurn !== state.turn)) {
      phase = 'basic-target';
      steps.push({phase: 'use-grand-tree', turn: state.turn});
      return new UseStadiumAction(player.id);
    }
    if (phase === 'basic-target' && pending?.constructor?.name ===
        'ChoosePokemonPrompt' && pending.playerId === player.id) {
      const slot = player.bench.find(s =>
        s.getPokemonCard()?.fullName === 'Lillipup CEC' &&
        s.pokemonPlayedTurn !== state.turn);
      if (slot && pending.validate([slot], state)) {
        phase = 'stage-one';
        steps.push({phase: 'choose-lillipup', turn: state.turn});
        return new ResolvePromptAction(pending.id, [slot]);
      }
    }
    if (phase === 'stage-one') {
      const action = selectLiveDeckEvolution(state, player, pending,
        'Herdier SUM', ResolvePromptAction);
      if (action) {
        phase = 'stage-two';
        steps.push({phase: 'search-herdier', turn: state.turn,
          knownOwnerDeckAtLivePrompt: true});
        return action;
      }
    }
    if (phase === 'stage-two') {
      const action = selectLiveDeckEvolution(state, player, pending,
        'Stoutland BCR', ResolvePromptAction);
      if (action) {
        phase = 'settle';
        steps.push({phase: 'search-stoutland', turn: state.turn,
          knownOwnerDeckAtLivePrompt: true});
        return action;
      }
    }
    if (phase === 'settle' && !pending) {
      const stoutland = player.bench.find(slot =>
        slot.getPokemonCard()?.fullName === 'Stoutland BCR');
      settledBoard = {
        turn: state.turn,
        stoutlandBenched: Boolean(stoutland),
        stoutlandStack: stoutland?.cards.map(c => c.fullName) ?? [],
        ownActive: player.active.getPokemonCard()?.fullName ?? null
      };
      steps.push({phase: 'post-effect-board', ...settledBoard});
      if (promoteStoutland && stoutland &&
          player.retreatedTurn !== state.turn &&
          player.active.energies.cards.length > 0) {
        phase = 'retreat-to-stoutland';
        steps.push({phase: 'request-real-retreat',
          benchIndex: player.bench.indexOf(stoutland),
          from: player.active.getPokemonCard()?.fullName ?? null,
          paidEnergyCandidates: player.active.energies.cards.map(c => c.fullName),
          turn: state.turn});
        return new RetreatAction(player.id, player.bench.indexOf(stoutland));
      }
      phase = 'complete';
    }
    if (phase === 'retreat-to-stoutland' && !pending) {
      activeAfterRetreat = {
        turn: state.turn,
        active: player.active.getPokemonCard()?.fullName ?? null,
        ownBench: player.bench.map(s =>
          s.getPokemonCard()?.fullName).filter(Boolean),
        activeSupporterLockPotential:
          player.active.getPokemonCard()?.fullName === 'Stoutland BCR'
      };
      steps.push({phase: 'post-real-retreat', ...activeAfterRetreat});
      phase = 'complete';
    }
    return original.call(this, state);
  };
  try {
    const result = execute();
    return {result, audit: {
      version: 'agent40-original-rank2-grandtree-retro-fork-v1',
      seed: SEED, sourceSeat: SOURCE_SEAT, afterRoot: PRIZE_ROOT_ORDINAL,
      phase, steps, settledBoard, activeAfterRetreat,
      promoteStoutland, observeOpponentTurn6,
      firstOpponentOwnerDecision, competitiveGameQualified: false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

/** @returns {object} */
function runAudit({promoteStoutland = false,
  observeOpponentTurn6 = false} = {}) {
  const file = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const manifest = resolveManifestFile(file, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const byRank = new Map(manifest.decks.map(x => [x.rank, x]));
  const reference = byRank.get(1), source = byRank.get(2);
  assert.ok(reference?.playableUnderEngine && source?.playableUnderEngine);
  assert.equal(reference.cardIds.length, 60);
  assert.equal(source.cardIds.length, 60);
  const request = {
    deckA: reference.cardIds, deckB: source.cardIds,
    seed: SEED, maxActions: 300,
    strictPromptValidation: true,
    grandTreeFirstTurnCorrection: true,
    captureDecisionTrace: true,
    captureGladionRootPrizeChoices: true,
    label: 'Frozen source rank2 Gladion root exposure'
  };
  const baseline = runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE);
  assert.equal(baseline.firstTurnSlot, SOURCE_SEAT);
  assert.equal(sha256(baseline.rootActionLedger), ORIGINAL_ROOT_SHA256);
  const fork = withObservedGrandTreeEvolution(() =>
    runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE),
  {promoteStoutland, observeOpponentTurn6});
  const unobserved = observeOpponentTurn6 ?
    withObservedGrandTreeEvolution(() =>
      runWithResearchProfile(request, EXPANDED_SOURCE_PROFILE),
    {promoteStoutland, observeOpponentTurn6: false}) : null;
  if (unobserved) {
    assert.deepEqual(fork.result.rootActionLedger,
      unobserved.result.rootActionLedger,
      'Read-only opponent owner observation altered genuine Store root actions');
    assert.deepEqual(fork.result.prizesRemaining,
      unobserved.result.prizesRemaining);
    assert.equal(fork.result.actions, unobserved.result.actions);
  }
  const baseRoots = baseline.rootActionLedger.filter(row =>
    row.actionOrdinal <= PRIZE_ROOT_ORDINAL);
  const forkRoots = fork.result.rootActionLedger.filter(row =>
    row.actionOrdinal <= PRIZE_ROOT_ORDINAL);
  assert.deepEqual(forkRoots, baseRoots,
    'Fork changed the original pre-Grand-Tree root Store actions');
  assert.deepEqual(fork.result.deckHashes, baseline.deckHashes);
  assert.equal(fork.result.firstTurnSlot, baseline.firstTurnSlot);
  assert.equal(fork.audit.phase, 'complete',
    'Grand Tree owner-visible evolution was not prompt-closed');
  assert.equal(fork.audit.settledBoard?.stoutlandBenched, true,
    'Stoutland was not established in the genuine Store');
  assert.deepEqual(fork.audit.settledBoard.stoutlandStack.slice(0, 3),
    ['Lillipup CEC', 'Herdier SUM', 'Stoutland BCR']);
  if (promoteStoutland) {
    assert.equal(fork.audit.activeAfterRetreat?.active, 'Stoutland BCR',
      'Real paid Retreat did not promote Stoutland to Active');
  }
  if (observeOpponentTurn6) {
    assert.ok(fork.audit.firstOpponentOwnerDecision,
      'No genuine opposing owner decision was observed on turn 6');
    if (promoteStoutland) {
      assert.equal(fork.audit.firstOpponentOwnerDecision.sourceActive,
        'Stoutland BCR',
        'Stoutland Active was not retained at first opponent decision');
    }
  }
  const nextOpponent = game => game.rootActionLedger.find(row =>
    row.actionOrdinal > PRIZE_ROOT_ORDINAL &&
    row.playerSlot !== SOURCE_SEAT &&
    row.action !== 'ResolvePromptAction') ?? null;
  assert.ok(nextOpponent(fork.result),
    'Alternative must reach an actual subsequent opponent root action');
  return {
    schema: promoteStoutland ?
      'agent40-rank2-grandtree-active-retreat-source-fork-v2' :
      'agent40-rank2-grandtree-retrospective-source-fork-v1',
    originalDecks: [reference.player, source.player],
    sourceCardCounts: [reference.cardIds.length, source.cardIds.length],
    enginePin: baseline.engine, seed: SEED, actualFirstTurn: baseline.firstTurnSlot,
    verifiedByDrawLog: baseline.verifiedByDrawLog,
    rootChoiceOrdinal: PRIZE_ROOT_ORDINAL,
    preForkPrefixIdentical: true,
    ownerTurn6ObservationNoninterfering: unobserved ? true : null,
    preForkPrefixSha256: sha256(baseRoots),
    originalLedgerSha256: ORIGINAL_ROOT_SHA256,
    sourceDeckHashes: baseline.deckHashes,
    original: {
      actions: baseline.actions, finished: baseline.finished,
      winner: baseline.finished ? baseline.winner : null,
      finalPrizes: baseline.prizesRemaining,
      firstOpposingRootAfterGladion: nextOpponent(baseline)
    },
    alternative: {
      actions: fork.result.actions, finished: fork.result.finished,
      winner: fork.result.finished ? fork.result.winner : null,
      finalPrizes: fork.result.prizesRemaining,
      firstOpposingRootAfterGladion: nextOpponent(fork.result),
      completeRootLedgerSha256: sha256(fork.result.rootActionLedger),
      audit: fork.audit
    },
    competitiveGameQualified: false,
    caveat: 'Retrospectively selected legal owner-Stadium and owner-deck prompt counterfactual. Game policies and timing remain unqualified.'
  };
}

if (require.main === module) {
  const promoteStoutland = process.argv.includes('--promote-stoutland');
  const observeOpponentTurn6 = process.argv.includes('--observe-opponent');
  process.stdout.write(JSON.stringify(runAudit({
    promoteStoutland, observeOpponentTurn6
  }), null, 2) + '\n');
}
module.exports = {
  SEED, SOURCE_SEAT, PRIZE_ROOT_ORDINAL, ORIGINAL_ROOT_SHA256,
  selectLiveDeckEvolution, withObservedGrandTreeEvolution, runAudit
};
