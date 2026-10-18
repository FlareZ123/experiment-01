'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');
const {withNoPreviewApexBenchDde} =
  require('./dde-v4-first-seat-apex-bench-fork.cjs');
const {withSourceGuzmaPivot} =
  require('./dde-root133-guzma-pivot.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const CONTROL_DIGEST =
  'fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019';
const FORK_DIGEST =
  '66903ab886f2040605dbfe2bc6a5ff8ac19f563b005f21bac501f7907fe5f0a1';

/**
 * Public source board and the player's own discard, without hidden deck data.
 * @param {object} state Current actual Store state.
 * @param {number} actorId The attacker.
 * @returns {object}
 */
function visibleAttackState(state, actorId) {
  const self = state.players.find(player => player.id === actorId);
  const foe = state.players.find(player => player.id !== actorId);
  assert.ok(self && foe);
  const {SuperType, CardType} = require(path.join(root,
    'game/store/card/card-types'));
  const pokemon = slot => {
    const card = slot.getPokemonCard();
    return card ? {
      printing: card.fullName, damage: slot.damage,
      energy: slot.energies.cards.map(item => item.fullName),
      tools: slot.tools.map(item => item.fullName)
    } : null;
  };
  return {
    turn: state.turn, ownActive: pokemon(self.active),
    opposingActive: pokemon(foe.active),
    opposingBench: foe.bench.map(pokemon).filter(Boolean),
    ownDragonDiscard: self.discard.cards.filter(card =>
      card.superType === SuperType.POKEMON && Array.isArray(card.cardType) &&
      card.cardType.includes(CardType.DRAGON)).map(card => card.fullName),
    prizesRemaining: state.players.map(player =>
      player.prizes.filter(prize => prize.cards.length).length)
  };
}

/**
 * Record source-Store Apex/ChooseAttackPrompt resolutions with read-only values.
 * Speculative Simulator dispatches must not appear in this actual-game trace.
 * @template T
 * @param {Function} Store Real engine Store constructor.
 * @param {()=>T} execute Original game executor.
 * @returns {{result:T,attacks:object[]}}
 */
function withSourceApexCopyTrace(Store, execute) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  let rootStore = null, rootStep = -1, current = null;
  const attacks = [];
  const observedAttackActions = [];
  Store.prototype.dispatch = function observeApexCopy(action, ...args) {
    if (!rootStore && action?.constructor?.name === 'AddPlayerAction')
      rootStore = this;
    if (this !== rootStore)
      return descriptor.value.apply(this, [action, ...args]);
    rootStep++;
    const actionKind = action?.constructor?.name;
    const actorId = action?.id;
    const state = this.state;
    const currentTurn = state.turn;
    if (actionKind === 'AttackAction')
      observedAttackActions.push({rootStep, actorId, turn:currentTurn,
        name:action.name ?? null});
    const pending = actionKind === 'ResolvePromptAction' ?
      state.prompts.find(prompt => prompt.id === action.id) : null;
    if (current && currentTurn !== current.turn) {
      current.endOfTurn = visibleAttackState(state, 202);
      current = null;
    }
    if (actionKind === 'AttackAction' && actorId === 202 &&
        action.name === 'Apex Dragon') {
      current = {
        rootStep, turn: currentTurn, attacker: 'Regidrago VSTAR',
        before: visibleAttackState(state, actorId),
        copySelections: [], resolutionPrompts: []
      };
      attacks.push(current);
    }
    const selection = current && pending?.constructor?.name ===
      'ChooseAttackPrompt' && pending.playerId === 202 ? {
        rootStep, promptMessage: pending.message,
        available: pending.cards.flatMap((card, index) =>
          (card.attacks || []).map(attack => ({
            index, printing: card.fullName, name: attack.name,
            printedDamage: attack.damage, printedEnergyCount: attack.cost.length,
            blocked: pending.options.blocked.some(row =>
              row.index === index && row.attack === attack.name)
          }))),
        selectedName: action.result?.name ?? null,
        selectedPrinting: pending.cards.find(card =>
          (card.attacks || []).includes(action.result))?.fullName ?? null
      } : null;
    const result = descriptor.value.apply(this, [action, ...args]);
    if (current && currentTurn === current.turn) {
      if (selection) {
        current.copySelections.push({
          ...selection, after: visibleAttackState(this.state, 202)
        });
      } else if (actionKind === 'ResolvePromptAction') {
        current.resolutionPrompts.push({
          rootStep, promptKind: pending?.constructor?.name ?? null,
          promptMessage: pending?.message ?? null,
          selected: Array.isArray(action.result) ?
            action.result.map(x => x?.fullName ?? x?.name ?? null) :
            action.result?.name ?? null,
          after: visibleAttackState(this.state, 202)
        });
      }
    }
    return result;
  };
  try {
    const result = execute();
    if (current) current.lastObserved = visibleAttackState(rootStore.state, 202);
    return {result, attacks, observedAttackActions};
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
}

/** @returns {object} Exactly one source game with its actual copied attacks. */
function main() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  assert.ok(decks.get(1)?.playableUnderEngine &&
    decks.get(10)?.playableUnderEngine);
  const request = {
    deckA: decks.get(1).cardIds, deckB: decks.get(10).cardIds,
    seed: 4246551499, maxActions: 350,
    label: 'rank10-root133-Apex-copy-source-audit',
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  initializeCards();
  const {Store} = require(path.join(root, 'game/store/store'));
  const control = runMatch(request);
  const traced = withSourceApexCopyTrace(Store, () =>
    withNoPreviewApexBenchDde(Store, () =>
      withSourceGuzmaPivot(() => runMatch(request))));
  const repeat = runMatch(request);
  const fork = traced.result.result.result;
  assert.equal(observableDigest(control), CONTROL_DIGEST);
  assert.equal(observableDigest(repeat), CONTROL_DIGEST);
  assert.equal(observableDigest(fork), FORK_DIGEST);
  assert.equal(traced.result.overrides.length, 1);
  assert.equal(traced.result.result.guzmaProposed, true);
  assert.equal(traced.result.result.promotionPrompts, 1);
  assert.equal(traced.attacks.length, 3,
    JSON.stringify({sourceActions:traced.observedAttackActions,
      actualForkAttacks:fork.attackTrace.filter(row => row.seat === 1)}));
  return {
    kind: 'rank10-root133-source-copied-attack-selections',
    sources: {ranksBySeat: [1, 10], seed: request.seed,
      engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      policy: 'simplified DoubleDragonAttachTactic-v4 plus one Guzma pivot'},
    controlDigest: CONTROL_DIGEST, forkDigest: FORK_DIGEST,
    forkResult: {winner: fork.winner, turns: fork.turns, actions: fork.actions,
      prizesRemaining: fork.prizesRemaining},
    attacks: traced.attacks,
    sourceReplayMechanicsVerified: false,
    qualifiedForCompetitiveInference: false
  };
}
if (require.main === module) {
  const result = main();
  const summary = result.attacks.map(row => ({
    turn: row.turn,
    opponentBefore: row.before.opposingActive,
    ownDragonDiscard: row.before.ownDragonDiscard,
    choices: row.copySelections.map(choice => ({
      selectedName: choice.selectedName,
      selectedPrinting: choice.selectedPrinting,
      available: choice.available.map(option => ({
        source: option.printing, name: option.name,
        damage: option.printedDamage, costLength: option.printedEnergyCount
      })),
      prizesAfterChoice: choice.after.prizesRemaining,
      opponentAfterChoice: choice.after.opposingActive
    })),
    finalObserved: row.endOfTurn
  }));
  process.stderr.write('ROOT133_APEX_CHOICES ' + JSON.stringify(summary) + '\n');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
module.exports = {visibleAttackState, withSourceApexCopyTrace, main};
