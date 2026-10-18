'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');
const {withNoPreviewApexBenchDde} =
  require('./dde-v4-first-seat-apex-bench-fork.cjs');
const {withStoreDispatchTranscript} =
  require('./store-dispatch-transcript.cjs');
const {firstDecisionDifference} =
  require('./rank10-dde-policy-drift.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const EXPECTED_CONTROL_DIGEST =
  'fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019';

/**
 * The exact public board plus perspective hand window after a frozen source
 * root-133 alternative DDE attachment. Never reads the opposing hand/deck.
 * @param {object} state Pinned live Store state.
 * @param {number} actorId Own player ID.
 * @returns {object|null} Null outside the demonstrated source state.
 */
function inspectGuzmaWindow(state, actorId) {
  if (state.turn !== 27 || actorId !== 202 ||
      state.prompts.some(prompt => prompt.result === undefined)) return null;
  const owner = state.players.find(player => player.id === actorId);
  const opponent = state.players.find(player => player.id !== actorId);
  const bench = owner?.bench[5];
  if (owner?.active.getPokemonCard()?.fullName !== 'Koraidon ex TEF' ||
      bench?.getPokemonCard()?.fullName !== 'Regidrago VSTAR SIT') return null;
  const energy = bench.energies.cards.map(card => card.fullName);
  if (energy.filter(name => name === 'Grass Energy MEE').length !== 2 ||
      energy.filter(name => name === 'Double Dragon Energy ROS').length !== 1)
    return null;
  const handIndex = owner.hand.cards.findIndex(card => card.fullName === 'Guzma BUS');
  const opponentBenchCount = opponent.bench.filter(slot => slot.getPokemonCard()).length;
  return {
    turn: state.turn, actorId, handIndex,
    ownHandPrintings: owner.hand.cards.map(card => card.fullName),
    supporterTurn: owner.supporterTurn,
    supporterChannelOpen: owner.supporterTurn === 0,
    opponentBenchCount,
    readyToAttempt: owner.supporterTurn === 0 &&
      opponentBenchCount > 0 && handIndex >= 0,
    active: 'Koraidon ex TEF', targetBenchIndex: 5,
    target: 'Regidrago VSTAR SIT', targetEnergy: energy
  };
}

/**
 * Restrict all alterations to a single observable turn-27 source window:
 * after DDE was actually attached to Benched VSTAR, propose in-hand Guzma;
 * if the pinned prompt asks for the player's Benched Pokémon, choose that
 * same energized VSTAR. Opponent gust choice stays with the ordinary resolver.
 * @template T
 * @param {()=>T} execute Compiled-source match invocation.
 * @returns {{result:T,observedWindow:object|null,guzmaProposed:boolean,promotionPrompts:number}}
 */
function withSourceGuzmaPivot(execute) {
  const {SimpleTacticsAi} =
    require(path.join(output, 'simple-bot/simple-tactics-ai'));
  const {allPromptResolvers} =
    require(path.join(output, 'simple-bot/simple-bot-definitions'));
  const {ChoosePokemonPrompt} =
    require(path.join(output, 'game/store/prompts/choose-pokemon-prompt'));
  const {ResolvePromptAction} =
    require(path.join(output, 'game/store/actions/resolve-prompt-action'));
  const {PlayCardAction, PlayerType, SlotType} =
    require(path.join(output, 'game/store/actions/play-card-action'));
  const resolverIndex = allPromptResolvers.findIndex(
    Type => Type.name === 'ChoosePokemonPromptResolver');
  assert.ok(resolverIndex >= 0, 'Pinned Pokémon prompt resolver missing');
  const OriginalResolver = allPromptResolvers[resolverIndex];
  const originalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  let observedWindow = null, guzmaProposed = false, promotionPrompts = 0;
  const resolverName = 'SourceRoot133GuzmaPivotResolver';
  const PivotResolver = class extends OriginalResolver {
    resolvePrompt(state, player, prompt) {
      if (guzmaProposed && prompt instanceof ChoosePokemonPrompt &&
          prompt.playerId === 202 && prompt.playerType === PlayerType.BOTTOM_PLAYER &&
          prompt.slots.includes(SlotType.BENCH)) {
        const owner = state.players.find(entry => entry.id === 202);
        const target = owner?.bench[5];
        if (owner?.active.getPokemonCard()?.fullName === 'Koraidon ex TEF' &&
            target?.getPokemonCard()?.fullName === 'Regidrago VSTAR SIT' &&
            prompt.validate([target], state)) {
          promotionPrompts++;
          return new ResolvePromptAction(prompt.id, [target]);
        }
      }
      return super.resolvePrompt(state, player, prompt);
    }
  };
  Object.defineProperty(PivotResolver, 'name', {value: resolverName});
  allPromptResolvers[resolverIndex] = PivotResolver;
  SimpleTacticsAi.prototype.decodeNextAction = function sourcePivotDecode(state) {
    if (!observedWindow && this.client.id === 202) {
      const window = inspectGuzmaWindow(state, this.client.id);
      if (window) {
        observedWindow = window;
        if (window.readyToAttempt) {
          guzmaProposed = true;
          return new PlayCardAction(this.client.id, window.handIndex,
            {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
        }
      }
    }
    return originalDecode.call(this, state);
  };
  try {
    return {
      result: execute(), observedWindow, guzmaProposed, promotionPrompts
    };
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = originalDecode;
    allPromptResolvers[resolverIndex] = OriginalResolver;
  }
}

/** @param {object} match @returns {object} */
function summarize(match) {
  assert.equal(typeof match.finished, 'boolean', 'Expected a real game payload');
  return {
    finished: match.finished, endReason: match.endReason,
    winner: match.winner, turns: match.turns, actions: match.actions,
    firstTurnSlot: match.firstTurnSlot, prizesRemaining: match.prizesRemaining,
    apexAttacks: match.attackTrace.filter(row =>
      row.seat === 1 && row.attack === 'Apex Dragon').length,
    candidateAttacks: match.attackTrace.filter(row => row.seat === 1)
      .map(row => ({turn: row.turn, attacker: row.activePokemon, attack: row.attack})),
    turn27GuzmaActions: (match.decisionTrace || []).filter(row =>
      row.playerSlot === 1 && row.turnBefore === 27 &&
      row.action === 'PlayCardAction' && row.card === 'Guzma').length,
    observableDigest: observableDigest(match)
  };
}

/** @returns {object} Same-source two-action hypothesis test, including failed opportunities. */
function main() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  const champion = decks.get(1), regidrago = decks.get(10);
  assert.ok(champion?.playableUnderEngine && regidrago?.playableUnderEngine);
  const request = {
    deckA: champion.cardIds, deckB: regidrago.cardIds,
    seed: 4246551499, maxActions: 350,
    label: 'rank10-v4-root133-two-action-Guzma-counterfactual',
    doubleDragonRecovery: true, isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  initializeCards();
  const {Store} = require(path.join(output, 'game/store/store'));
  const capture = () => withStoreDispatchTranscript(
    Store, () => runMatch(request), {
      liveStoreOnly: true, typedActionValues: true,
      promptReferenceActionValues: true, sourceZoneEveryDispatch: true
    });
  const control = capture();
  const altered = withNoPreviewApexBenchDde(
    Store, () => withSourceGuzmaPivot(capture));
  const repeat = capture();
  assert.equal(observableDigest(control.result), EXPECTED_CONTROL_DIGEST,
    'Frozen original source has changed');
  assert.equal(observableDigest(repeat.result), EXPECTED_CONTROL_DIGEST,
    'Unmodified source changed after intervention');
  assert.equal(altered.overrides.length, 1,
    'Expected exactly the verified root133 DDE retarget');
  const firstDifference = firstDecisionDifference(
    control.actionTrace, altered.result.result.actionTrace);
  assert.equal(firstDifference?.rootStep, 133);
  assert.equal(firstDifference.control.beforeZone,
    firstDifference.corrected.beforeZone, 'Changed original source prefix');
  const baselineSummary = summarize(control.result);
  const experimentalSummary = summarize(altered.result.result.result);
  const pivot = altered.result;
  return {
    kind: 'rank10-first-source-root133-DDE-then-Guzma',
    source: {
      printedRanksByPhysicalSeat: [1, 10],
      seed: request.seed, pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      policy: 'simplified DoubleDragonAttachTactic-v4',
      hook: 'single physical DDE recipient fork plus at-most-one Guzma proposal'
    },
    frozenPrefixProvenEqual: true, firstDifference,
    physicalDdeRetarget: altered.overrides[0],
    window: pivot.observedWindow,
    guzmaProposed: pivot.guzmaProposed,
    ownPromotionPromptOverridden: pivot.promotionPrompts,
    control: baselineSummary, counterfactual: experimentalSummary,
    sourceReplayMechanicsVerified: false,
    qualifiedForCompetitiveInference: false,
    limitations: [
      'One actual-source deal; default opponent and post-fork bot policy unqualified',
      'Only a legal-looking proposed PlayCardAction plus target prompt is tested',
      'Guzma also gusts the opponent and may alter later game dynamics',
      'Root transcript pre-action equivalence is not full reducer/closure isolation',
      'No 32-rank match coverage or competitive win-rate inference'
    ]
  };
}
if (require.main === module) {
  const report = main();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}
module.exports = {inspectGuzmaWindow, withSourceGuzmaPivot, main};
