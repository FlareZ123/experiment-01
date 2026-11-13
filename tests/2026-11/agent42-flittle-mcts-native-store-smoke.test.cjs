'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

const headless = require('../../simulation/twinleaf/headless.cjs');
const provider = require('../../simulation/twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs');
const { withActorOnlyRootPolicy } = require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const { inspectPhysicalCardZones, fixedDeckCountAnomalies } = require('../../simulation/twinleaf/physical-card-ledger.cjs');
const output = '../../vendor/twinleaf/ptcg-server/output/';
const { GamePhase } = require(output + 'game/store/state/state');
const { CardManager } = require(output + 'game/cards/card-manager');
const { Store } = require(output + 'game/store/store');
const { SimpleTacticsAi } = require(output + 'simple-bot/simple-tactics-ai');
const { PlayCardAction, PlayerType, SlotType } = require(output + 'game/store/actions/play-card-action');
const { AttackAction, PassTurnAction } = require(output + 'game/store/actions/game-actions');

const cards = provider.TEST_DECKLIST.cards.slice();
const candidateDecklist = { id: 'agent42-flittle-candidate-v1', cards: cards.slice() };
const opponentDecklist = { id: 'agent42-flittle-opponent-v1', cards: cards.slice() };
const enginePin = execFileSync('git', ['-C', 'vendor/twinleaf', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (process.env.AGENT36_TWINLEAF_COMMIT_SHA) {
  assert.equal(process.env.AGENT36_TWINLEAF_COMMIT_SHA, enginePin);
}
const initializedCardManager = headless.initializeCards();
assert.ok(initializedCardManager.getAllCards().length > 0);
const native = { GamePhase, CardManager, cardPoolInitialization: { enginePin } };

const cardsIn = zone => Array.isArray(zone?.cards) ? zone.cards : [];
function physicalCards(player) {
  const result = [
    ...cardsIn(player.deck), ...cardsIn(player.hand), ...cardsIn(player.discard),
    ...cardsIn(player.lostzone), ...cardsIn(player.stadium), ...cardsIn(player.supporter),
    ...(player.prizes ?? []).flatMap(prize => prize.cards ?? [])
  ];
  for (const slot of [player.active, ...(player.bench ?? [])]) {
    result.push(...(slot?.cards ?? []), ...(slot?.tools ?? []));
  }
  return result;
}

// Read both physical inventories only for trusted deck-registration preflight;
// the policy receives only this digest, never the opponent's hidden card faces.
function storeBindingReceipt(store, candidateSeat) {
  const state = store.state;
  assert.equal(state.players.length, 2);
  const ledger = inspectPhysicalCardZones(state);
  assert.deepEqual(fixedDeckCountAnomalies(ledger), []);
  assert.deepEqual(ledger.referenceDuplications, []);
  assert.deepEqual(ledger.energyWithoutPhysicalCard, []);
  assert.deepEqual(ledger.repeatedEnergyIndexes, []);
  const playerReceipts = state.players.map((player, seat) => {
    const located = physicalCards(player);
    assert.equal(located.length, 60);
    assert.equal(new Set(located).size, 60);
    const actual = located.map(card => card.fullName).sort();
    const expected = (seat === candidateSeat ? candidateDecklist : opponentDecklist).cards.slice().sort();
    assert.deepEqual(actual, expected);
    return {
      seat,
      count: located.length,
      decklistSha256: provider.decklistCardsSha256(actual),
      zones: [player.deck.cards.length, player.hand.cards.length,
        player.prizes.reduce((n, prize) => n + prize.cards.length, 0),
        player.active.cards.length, player.bench.reduce((n, slot) => n + slot.cards.length, 0),
        player.discard.cards.length, player.lostzone.cards.length]
    };
  });
  return {
    schema: provider.STORE_DECKLIST_BINDING_SCHEMA,
    verified: true,
    source: 'trusted-native-store-preflight',
    candidateDecklistId: candidateDecklist.id,
    opponentDecklistId: opponentDecklist.id,
    candidateDecklistSha256: provider.decklistCardsSha256(candidateDecklist.cards),
    opponentDecklistSha256: provider.decklistCardsSha256(opponentDecklist.cards),
    storeStateSha256: createHash('sha256').update(JSON.stringify({
      enginePin, turn: state.turn, phase: state.phase,
      activePlayer: state.activePlayer, canonicalCounts: ledger.canonicalCounts,
      players: playerReceipts
    })).digest('hex'),
    checkedPhysicalSeats: [0, 1]
  };
}

function matchesIntent(intent, action) {
  if (intent.kind === 'attach-basic-energy') return action instanceof PlayCardAction &&
    action.target?.player === PlayerType.BOTTOM_PLAYER && action.target?.slot === SlotType.ACTIVE && action.target?.index === 0;
  if (intent.kind === 'attack') return action instanceof AttackAction && action.name === intent.attackName;
  return intent.kind === 'pass' && action instanceof PassTurnAction;
}

function runNativeStoreCase(candidateSeat, opponentAttackBeforeRoot = false) {
  let store = null;
  let runtime = null;
  let opponentAttackAccepted = false;
  const providerDecisions = [];
  const accepted = [];
  const fallbackAccepted = [];
  let candidateDispatches = 0;
  const stop = new Error('stop after native Store receipt');

  const ensureRuntime = () => {
    assert.ok(store);
    if (!runtime) runtime = provider.createFlittleMctsRuntime({
      native, candidateSeat, enginePin, candidateDecklist, opponentDecklist,
      storeDecklistBindingReceipt: storeBindingReceipt(store, candidateSeat)
    });
    return runtime;
  };
  const rootIntentProvider = args => {
    const decision = ensureRuntime().rootIntentProvider(args);
    providerDecisions.push({ status: decision.status, reason: decision.reason ?? null });
    return decision;
  };
  const createRootSearchCapability = args => ensureRuntime().createRootSearchCapability(args);

  const onRootAgentsCreated = agents => {
    assert.equal(agents.length, 2);
    for (let seat = 0; seat < 2; seat++) {
      const agent = agents[seat];
      const original = agent.decodeNextAction.bind(agent);
      let prepared = false;
      let preparedTurn = null;
      let opponentAttacked = false;
      let candidateSkippedTurn = false;
      agent.decodeNextAction = state => {
        if (state.phase !== GamePhase.PLAYER_TURN || state.activePlayer !== seat ||
            state.prompts.some(prompt => prompt.result === undefined)) return original(state);
        const player = state.players[seat];
        if (!prepared) {
          prepared = true;
          preparedTurn = state.turn;
          const handIndex = player.hand.cards.findIndex(card => card.fullName === provider.PSYCHIC);
          assert.notEqual(handIndex, -1);
          return player.energyPlayedTurn < state.turn ?
            new PlayCardAction(player.id, handIndex, {
              player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
            }) : new PassTurnAction(player.id);
        }
        if (seat !== candidateSeat) {
          if (opponentAttackBeforeRoot && !opponentAttacked && state.turn > preparedTurn &&
              player.active.energies.cards.some(card => card.fullName === provider.PSYCHIC)) {
            opponentAttacked = true;
            return new AttackAction(player.id, 'Ram');
          }
          return new PassTurnAction(player.id);
        }
        if (state.turn === preparedTurn || runtime?.events.length > 0 || runtime?.failures.length > 0) {
          return new PassTurnAction(player.id);
        }
        if (opponentAttackBeforeRoot && !candidateSkippedTurn) {
          candidateSkippedTurn = true;
          return new PassTurnAction(player.id);
        }
        ensureRuntime();
        return original(state);
      };
    }
  };

  const onRootActionDispatched = (liveStore, action, ordinal, seat, turnBefore) => {
    if (seat !== candidateSeat) {
      if (action instanceof AttackAction) opponentAttackAccepted = true;
      return;
    }
    if (!(action instanceof PlayCardAction || action instanceof AttackAction || action instanceof PassTurnAction)) return;
    if (runtime?.events.length === 1 && accepted.length === 0) {
      const event = runtime.events[0];
      assert.equal(event.actorSeat, candidateSeat);
      assert.ok(matchesIntent(event.intent, action), 'Store action must match the MCTS typed intent');
      accepted.push({ actorSeat: seat, turnBefore, ordinal, actionClass: action.constructor.name, intentKind: event.intent.kind });
      throw stop;
    }
    if (opponentAttackBeforeRoot && runtime?.failures.length > 0 && runtime.events.length === 0 && fallbackAccepted.length === 0) {
      fallbackAccepted.push({ actorSeat: seat, turnBefore, ordinal, actionClass: action.constructor.name });
      throw stop;
    }
    if (!opponentAttackBeforeRoot && runtime?.failures.length > 0 && runtime.events.length === 0) {
      throw new Error('Unexpected MCTS provider failure: ' + JSON.stringify(runtime.failures[0]));
    }
    if (++candidateDispatches > 5 && !runtime?.events.length && !runtime?.failures.length) {
      throw new Error('MCTS provider was not reached within five candidate actions');
    }
  };

  const policyResult = withActorOnlyRootPolicy(() => {
    try {
      return headless.runMatch({
        deckA: cards.slice(), deckB: cards.slice(),
        seed: 20261113 + candidateSeat * 17 + (opponentAttackBeforeRoot ? 31 : 0),
        maxActions: 200,
        label: 'agent42-flittle-mcts-native-store-smoke',
        onRootStoreCreated: value => { store = value; },
        onRootAgentsCreated,
        onRootActionDispatched
      });
    } catch (error) {
      if (error === stop) return { boundedStop: true };
      throw error;
    }
  }, {
    policyOwnerSeat: candidateSeat,
    rootIntentProvider,
    createRootSearchCapability,
    rootIntentActionKey: intent => ensureRuntime().rootIntentActionKey(intent),
    rootIntentBudget: provider.PILOT_BUDGET,
    SimpleTacticsAi,
    Store
  });
  assert.equal(policyResult.result?.boundedStop, true,
    'Smoke must stop immediately after the target native dispatch');
  return { runtime, policyAudit: policyResult.audit, providerDecisions, accepted,
    fallbackAccepted, opponentAttackAccepted };
}

for (const seat of [0, 1]) {
  test(`pinned Store accepts a certified MCTS root intent for physical seat ${seat}`, { timeout: 30000 }, () => {
    const result = runNativeStoreCase(seat);
    assert.equal(result.runtime.events.length, 1);
    assert.equal(result.runtime.failures.length, 0);
    assert.deepEqual(result.providerDecisions, [{status: 'selected', reason: null}]);
    assert.equal(result.accepted.length, 1);
    assert.equal(result.accepted[0].actorSeat, seat);
    assert.ok(result.accepted[0].turnBefore >= 3);
    assert.equal(result.policyAudit.rootIntentProvider.attempts, 1);
    assert.equal(result.policyAudit.rootIntentProvider.selected, 1);
    assert.equal(result.policyAudit.rootIntentProvider.abstained, 0);
    assert.equal(result.policyAudit.rootIntentProvider.lastApplicabilityEnvelopeId, provider.ENVELOPE_ID);
    assert.ok(result.policyAudit.nativeRootAcceptances.some(item => item.accepted === true && item.seat === seat));
    const event = result.runtime.events[0];
    const audit = event.audit;
    assert.equal(event.actorSeat, seat);
    assert.equal(event.enginePin, enginePin);
    assert.deepEqual(event.budget, provider.PILOT_BUDGET);
    assert.equal(event.scope, 'one-root-decision-dispatch-smoke-test');
    assert.equal(event.fixtureOnly, true);
    assert.equal(event.competitiveGameQualified, false);
    assert.ok(['attach-basic-energy', 'attack', 'pass'].includes(event.intent.kind));
    assert.equal(audit.iterations, 16);
    assert.equal(audit.completedIterations, 16);
    assert.equal(audit.maxPlies, 1);
    assert.equal(audit.maxDecisionMs, 250);
    assert.equal(audit.timeoutStatus, 'completed');
    assert.ok(audit.elapsedMs >= 0 && audit.elapsedMs < 250);
    assert.equal(audit.frontierComplete, true);
    assert.equal(audit.bothSeatKnowledgeLedgersVerified, true);
    assert.equal(audit.ownerLedgerInInformationSetKey, true);
    assert.equal(audit.promptResolutionActorScoped, true);
    assert.deepEqual(audit.knowledgeModes, ['K1', 'K1']);
    assert.equal(audit.applicabilityEnvelopeId, provider.ENVELOPE_ID);
    assert.ok(audit.rootActionKeys.includes(audit.selectedActionKey));
    assert.equal(audit.bothRegisteredDecklistsMatchFixture, true);
    assert.equal(audit.storeDecklistBindingSchema, provider.STORE_DECKLIST_BINDING_SCHEMA);
    assert.equal(audit.storeStateSha256, result.runtime.storeDecklistBindingReceipt.storeStateSha256);
    assert.equal(audit.competitiveGameQualified, false);
    assert.equal(result.policyAudit.rootIntentProvider.lastIntentKind, event.intent.kind);
    assert.equal(result.policyAudit.rootIntentProvider.lastSearchAudit.selectedActionKey, audit.selectedActionKey);
  });
}

test('out-of-envelope native root abstains and the existing actor policy dispatches a fallback', { timeout: 30000 }, () => {
  const result = runNativeStoreCase(0, true);
  assert.equal(result.runtime.events.length, 0);
  assert.ok(result.runtime.failures.length >= 1);
  assert.deepEqual(result.providerDecisions, [{status: 'abstained', reason: 'outside-applicability-envelope'}]);
  assert.equal(result.fallbackAccepted.length, 1);
  assert.equal(result.fallbackAccepted[0].actorSeat, 0);
  assert.equal(result.opponentAttackAccepted, true);
  assert.equal(result.policyAudit.rootIntentProvider.attempts, 1);
  assert.equal(result.policyAudit.rootIntentProvider.selected, 0);
  assert.equal(result.policyAudit.rootIntentProvider.abstained, 1);
  assert.equal(result.policyAudit.rootIntentProvider.abstentionReasons['outside-applicability-envelope'], 1);
  assert.ok(result.policyAudit.nativeRootAcceptances.some(item => item.accepted === true && item.seat === 0));
});
