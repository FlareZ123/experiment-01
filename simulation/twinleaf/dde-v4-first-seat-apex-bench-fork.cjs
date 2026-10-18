'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');
const {decisionSignature, firstDecisionDifference} =
  require('./rank10-dde-policy-drift.cjs');
const {withSourceDdeAttachmentTrace} =
  require('./dde-v4-first-seat-source-root-target.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const EXPECTED_DIGEST =
  'fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019';

/**
 * Check the physical, printed preconditions of exactly one frozen source choice.
 * Uses only this player's own hand and visible board. No hidden card access.
 * @param {object} state
 * @param {number} actorId
 * @param {number} rootStep
 * @returns {{handIndex:number, benchIndex:number}|null}
 */
function chooseApexBenchTarget(state, actorId, rootStep) {
  if (rootStep !== 133 || state.turn !== 27 || actorId !== 202 ||
      state.prompts.some(prompt => prompt.result === undefined)) return null;
  const owner = state.players.find(player => player.id === actorId);
  if (owner?.active?.getPokemonCard()?.fullName !== 'Koraidon ex TEF')
    return null;
  const benchIndex = 5;
  const slot = owner.bench[benchIndex];
  if (slot?.getPokemonCard()?.fullName !== 'Regidrago VSTAR SIT')
    return null;
  if (slot.energies.cards.length !== 2 ||
      slot.energies.cards.some(card => card.fullName !== 'Grass Energy MEE'))
    return null;
  const handIndex = owner.hand.cards.findIndex(card =>
    card.fullName === 'Double Dragon Energy ROS');
  return handIndex >= 0 ? {handIndex, benchIndex} : null;
}

/**
 * Retarget one source-root 133 Energy attachment directly. Do not evaluate the
 * original bot's speculative proposal at the decision. Restore both methods.
 * @template T
 * @param {Function} Store
 * @param {()=>T} execute
 * @returns {{result:T, overrides:object[]}}
 */
function withNoPreviewApexBenchDde(Store, execute) {
  const {SimpleTacticsAi} = require(path.join(root,
    'simple-bot/simple-tactics-ai'));
  const {PlayCardAction, PlayerType, SlotType} = require(path.join(root,
    'game/store/actions/play-card-action'));
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  const normalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  let sourceStore = null, nextSourceStep = 0;
  const overrides = [];
  Store.prototype.dispatch = function countSourceRoot(action, ...args) {
    if (!sourceStore && action?.constructor?.name === 'AddPlayerAction')
      sourceStore = this;
    if (this === sourceStore) nextSourceStep++;
    return descriptor.value.apply(this, [action, ...args]);
  };
  SimpleTacticsAi.prototype.decodeNextAction = function directApexDde(state) {
    if (overrides.length === 0) {
      const choice = chooseApexBenchTarget(state, this.client.id, nextSourceStep);
      if (choice) {
        const target = {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH,
          index: choice.benchIndex
        };
        overrides.push({
          rootStep: nextSourceStep,
          turn: state.turn, actorId: this.client.id,
          printing: 'Double Dragon Energy ROS',
          originalObservedRecipient: 'Active Koraidon ex TEF',
          chosenRecipient: 'Benched Regidrago VSTAR SIT',
          handIndex: choice.handIndex,
          target,
          suppressedOriginalBotEvaluation: true
        });
        return new PlayCardAction(this.client.id, choice.handIndex, target);
      }
    }
    return normalDecode.call(this, state);
  };
  try {
    return {result: execute(), overrides};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = normalDecode;
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
}

/** @param {object} match @returns {object} */
function summary(match) {
  assert.equal(typeof match.finished, 'boolean',
    'Unexpected source match summary type');
  return {
    finished: match.finished,
    endReason: match.endReason,
    winner: match.winner,
    actions: match.actions,
    turns: match.turns,
    prizesRemaining: match.prizesRemaining,
    firstTurnSlot: match.firstTurnSlot,
    candidateAttacks: (match.attackTrace || []).filter(x => x.seat === 1)
      .map(x => ({turn:x.turn,attacker:x.activePokemon,attack:x.attack})),
    observerDigest: observableDigest(match)
  };
}

function main() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  const champion = decks.get(1), regidrago = decks.get(10);
  assert.ok(champion?.playableUnderEngine && regidrago?.playableUnderEngine);
  const request = {
    deckA: champion.cardIds,
    deckB: regidrago.cardIds,
    seed: 4246551499,
    label: 'rank10-DDE-v4-first-source-action-capability',
    maxActions: 350,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  initializeCards();
  const {Store} = require(path.join(root,'game/store/store'));
  const capture = () => withSourceDdeAttachmentTrace(Store,
    () => withStoreDispatchTranscript(Store, () => runMatch(request), {
      liveStoreOnly: true,
      typedActionValues: true,
      promptReferenceActionValues: true,
      sourceZoneEveryDispatch: true
    }));
  const control = capture();
  const fork = withNoPreviewApexBenchDde(Store, capture);
  const repeat = capture();
  assert.equal(observableDigest(control.result.result), EXPECTED_DIGEST,
    'Capture no longer matches Agent20 frozen source first-seat game');
  assert.equal(observableDigest(repeat.result.result), EXPECTED_DIGEST,
    'Unmodified source game changed after the override');
  assert.deepEqual(repeat.result.actionTrace.map(decisionSignature),
    control.result.actionTrace.map(decisionSignature),
    'Actual unmodified root action trace changed after policy override');
  assert.equal(fork.overrides.length, 1, 'Expected exactly one source root 133 override');
  const first = firstDecisionDifference(control.result.actionTrace,
    fork.result.result.actionTrace);
  assert.equal(first?.rootStep, 133);
  assert.equal(first.control?.beforeZone, first.corrected?.beforeZone,
    'The source physical zone differs before the changed Energy attachment');
  const sourceDde = control.records.find(row => row.rootStep === 133);
  const retargetedDde = fork.result.records.find(row => row.rootStep === 133);
  assert.equal(sourceDde?.before.active.pokemon, 'Koraidon ex TEF');
  assert.equal(sourceDde?.after.active.energy.includes('Double Dragon Energy ROS'), true);
  assert.equal(retargetedDde?.after.bench[5].pokemon, 'Regidrago VSTAR SIT');
  assert.equal(retargetedDde?.after.bench[5].energy.includes(
    'Double Dragon Energy ROS'), true,
  'The chosen DDE did not actually attach to the intended Benched VSTAR');
  return {
    kind: 'rank10-first-seat-source-root133-ddr-benched-apex',
    source: {ranksBySeat:[1,10],seed:request.seed,
      policy:'simplified DoubleDragonAttachTactic-v4',
      engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'},
    preDecisionPhysicalZonesEqual: true,
    unmodifiedControlStable: true,
    suppressedOriginalBotEvaluation: true,
    override: fork.overrides[0],
    firstSourceDifference: first,
    sourceDde,
    retargetedDde,
    control: summary(control.result.result),
    alternate: summary(fork.result.result.result),
    sourceReplayMechanicsVerified: false,
    qualifiedForCompetitiveInference: false,
    limitations: [
      'Single observed source turn and scripted target, not a general intelligent bot',
      'Unqualified opposing decision policy and unresolved clone/rules fidelity',
      'The recipient has energy but may never reach a legal Active attack',
      'Other speculative bot calls still happen outside the one decision',
      'No independent seeds, both-seat replication or competitive win rate'
    ]
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');

module.exports = {chooseApexBenchTarget,withNoPreviewApexBenchDde,main};
