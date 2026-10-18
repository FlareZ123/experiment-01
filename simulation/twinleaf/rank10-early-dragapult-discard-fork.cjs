'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');
const {firstDecisionDifference} = require('./rank10-dde-policy-drift.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const SOURCE_SEED = 4246551500;
const SOURCE_TURN = 3;
const DRAGON_PRINTING = 'Dragapult ex TWM';

/**
 * Choose a genuinely held Dragon for a one-card discard-cost prompt. The
 * caller must separately establish that the source Item was actually played.
 * @param {object} state Pinned Store state with original hand references.
 * @param {object} prompt Pinned ChooseCardsPrompt.
 * @param {number} playerId Source rank-10 actor ID.
 * @param {unknown} discardMessage Pinned GameMessage discriminator.
 * @returns {object|null} Source card reference, if the move is legal.
 */
function eligibleDragonCost(state, prompt, playerId, discardMessage) {
  const owner = state.players.find(player => player.id === playerId);
  if (state.turn !== SOURCE_TURN || !owner ||
      prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.playerId !== playerId || prompt.cards !== owner.hand ||
      prompt.message !== discardMessage) return null;
  const card = owner.hand.cards.find(entry =>
    entry.fullName === DRAGON_PRINTING);
  return card && prompt.validate([card]) ? card : null;
}

/**
 * Alter one legal, source-bot-selected discard-cost answer. All search and
 * subsequent choices stay with the original bot. There is no card injection.
 * @template T
 * @param {()=>T} execute Actual unchanged-source match runner.
 * @returns {{result:T,forcedSelections:number,observed:number}}
 */
function withDragapultCostAnswer(Store, execute) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  const {GameMessage} = require(path.join(output, 'game/game-message'));
  const {ResolvePromptAction} = require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  let liveStore = null, treasurePlayed = false;
  let observed = 0, forcedSelections = 0;
  let originalChoice = null, physicalDiscardConfirmed = false;
  Store.prototype.dispatch = function actualDragonCost(action, ...args) {
    if (!liveStore && action?.constructor?.name === 'AddPlayerAction')
      liveStore = this;
    if (this !== liveStore)
      return descriptor.value.apply(this, [action, ...args]);
    const state = this.state;
    const owner = state.players.find(player => player.id === 202);
    const kind = action?.constructor?.name;
    if (state.turn === SOURCE_TURN && kind === 'PlayCardAction' &&
        action.id === 202 &&
        owner?.hand.cards[action.handIndex]?.fullName ===
        'Mysterious Treasure FLI') {
      treasurePlayed = true;
    }
    let submitted = action, chosen = null;
    if (treasurePlayed && !forcedSelections &&
        kind === 'ResolvePromptAction') {
      const pending = state.prompts.find(prompt =>
        prompt.id === action.id);
      chosen = eligibleDragonCost(state, pending, 202,
        GameMessage.CHOOSE_CARD_TO_DISCARD);
      if (chosen) {
        observed++;
        originalChoice = Array.isArray(action.result) ?
          action.result.map(card => card?.fullName ?? null) : null;
        submitted = new ResolvePromptAction(action.id, [chosen]);
        forcedSelections++;
      }
    }
    const result = descriptor.value.apply(this, [submitted, ...args]);
    if (chosen) {
      physicalDiscardConfirmed = owner.discard.cards.includes(chosen);
      assert.equal(physicalDiscardConfirmed, true,
        'Actual selected physical Dragon did not enter discard');
    }
    return result;
  };
  try {
    return {result: execute(), forcedSelections, observed,
      originalChoice, physicalDiscardConfirmed};
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
}

/**
 * Observe an already chosen physical discard answer at the actual Store root.
 * Assertions on card identity deliberately exclude speculative Simulator calls.
 * @template T
 * @param {Function} Store Pinned Store constructor.
 * @param {()=>T} execute A source game execution.
 * @returns {{result:T,costAnswers:object[]}}
 */
function withPhysicalDiscardObserver(Store, execute) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  let liveStore = null;
  let rootOrdinal = -1;
  const costAnswers = [];
  Store.prototype.dispatch = function observePhysicalCost(action, ...args) {
    if (!liveStore && action?.constructor?.name === 'AddPlayerAction')
      liveStore = this;
    if (this !== liveStore)
      return descriptor.value.apply(this, [action, ...args]);
    rootOrdinal++;
    const state = this.state;
    const owner = state.players.find(player => player.id === 202);
    const pending = action?.constructor?.name === 'ResolvePromptAction' ?
      state.prompts.find(prompt => prompt.id === action.id) : null;
    const selectingHand = state.turn === SOURCE_TURN && owner &&
      pending?.constructor?.name === 'ChooseCardsPrompt' &&
      pending.playerId === 202 && pending.cards === owner.hand;
    const selected = selectingHand && Array.isArray(action.result) ?
      action.result.filter(card => owner.hand.cards.includes(card)) : [];
    const record = selected.length ? {
      rootOrdinal, turn: state.turn,
      promptMessage: pending.message,
      selectedPrintings: selected.map(card => card.fullName)
    } : null;
    const result = descriptor.value.apply(this, [action, ...args]);
    if (record) {
      record.physicalDiscardConfirmed = selected.every(card =>
        owner.discard.cards.includes(card));
      costAnswers.push(record);
    }
    return result;
  };
  try {
    return {result: execute(), costAnswers};
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
}

/**
 * Find the source Item and its immediately following hand-discard selection.
 * @param {object[]} trace Original real-source decision trace.
 * @returns {{played:object,answer:object}}
 */
function findTreasureCost(trace) {
  const played = trace.find(row => row.playerSlot === 1 &&
    row.turnBefore === SOURCE_TURN && row.action === 'PlayCardAction' &&
    row.card === 'Mysterious Treasure');
  assert.ok(played, 'Source bot never played the anticipated printed Item');
  const answer = trace.find(row => row.playerSlot === 1 &&
    row.turnBefore === SOURCE_TURN && row.actionOrdinal > played.actionOrdinal &&
    row.cardSelection?.sourceZone === 'hand' &&
    row.cardSelection?.sourcePlayerSlot === 1);
  assert.ok(answer, 'Source Item discard-cost prompt missing');
  return {played: {ordinal: played.actionOrdinal, turn: played.turnBefore},
    answer: {ordinal: answer.actionOrdinal,
      printings: answer.cardSelection.selectedCards}};
}

/** @param {object} game @returns {object} */
function summarize(game) {
  return {firstTurnSlot:game.firstTurnSlot, finished:game.finished,
    endReason:game.endReason, winner:game.winner,
    actions:game.actions, turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    rank10Attacks:game.attackTrace.filter(row => row.seat === 1).map(row =>
      ({turn:row.turn, attack:row.attack, active:row.activePokemon})),
    digest:observableDigest(game)};
}

/** @returns {object} Source-legal, one-prompt alternative discard experiment. */
function main() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),
  {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const ranks = new Map(field.decks.map(deck => [deck.rank,deck]));
  assert.ok(ranks.get(1)?.playableUnderEngine &&
    ranks.get(10)?.playableUnderEngine);
  const request = {deckA:ranks.get(1).cardIds,
    deckB:ranks.get(10).cardIds,seed:SOURCE_SEED,maxActions:350,
    doubleDragonRecovery:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    label:'rank10-source-early-Dragapult-Treasure-discard'};
  initializeCards();
  const {Store} = require(path.join(output,'game/store/store'));
  const capture = execute => withStoreDispatchTranscript(Store, () =>
    withPhysicalDiscardObserver(Store, execute),
      {liveStoreOnly:true,typedActionValues:true,
        promptReferenceActionValues:true,sourceZoneEveryDispatch:true});
  const control = capture(() => runMatch(request));
  const altered = capture(() => withDragapultCostAnswer(Store, () =>
    runMatch(request)));
  const repeat = capture(() => runMatch(request));
  const baseline = control.result.result;
  const fork = altered.result.result.result;
  assert.equal(observableDigest(baseline),observableDigest(repeat.result.result),
    'Unmodified source changed under the reversible selection hook');
  assert.equal(baseline.firstTurnSlot,1);
  assert.equal(altered.result.result.forcedSelections,1,
    'No uniquely legal source Dragapult discard option was found');
  const originalAnswer = findTreasureCost(baseline.decisionTrace);
  const alternativeBotProposal = findTreasureCost(fork.decisionTrace);
  assert.deepEqual(altered.result.result.originalChoice,
    originalAnswer.answer.printings,
    'Original bot proposal changed before root replacement');
  assert.ok(!originalAnswer.answer.printings.includes(DRAGON_PRINTING),
    'Default source already discarded the chosen Dragon');
  const cost = altered.result.costAnswers.find(row =>
    row.selectedPrintings.includes(DRAGON_PRINTING));
  assert.equal(cost?.physicalDiscardConfirmed,true,
    'Physical Dragon failed to enter actual discard after the chosen cost');
  const firstDifference = firstDecisionDifference(control.actionTrace,
    altered.actionTrace);
  assert.ok(firstDifference);
  assert.equal(firstDifference.control.beforeZone,
    firstDifference.corrected.beforeZone,
    'Source prefix changed before the one-answer counterfactual');
  return {
    kind:'rank10-first-source-early-Dragapult-Treasure-cost-counterfactual',
    source:{ranksBySeat:[1,10],seed:SOURCE_SEED,
      pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      policy:'DoubleDragonAttachTactic-v4'},
    originalAnswer,alternativeBotProposal,
    actualRootAnswer:cost,firstDifference,
    promptFork:{observed:altered.result.result.observed,
      forcedSelections:altered.result.result.forcedSelections,
      originalChoice:altered.result.result.originalChoice,
      physicalDiscardConfirmed:altered.result.result.physicalDiscardConfirmed,
      physicalCost:cost},
    original:summarize(baseline),counterfactual:summarize(fork),
    unmodifiedControlReplayed:true,
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={eligibleDragonCost,withDragapultCostAnswer,
  withPhysicalDiscardObserver,findTreasureCost,main};
