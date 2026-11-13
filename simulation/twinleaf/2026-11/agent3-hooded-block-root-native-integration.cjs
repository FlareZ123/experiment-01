'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { initializeCards } = require('../headless.cjs');
const { actorObservation } = require('../actor-observation-contract.cjs');
const {
  withActorOnlyRootPolicy,
  actorNativeActionReceipt,
  bindActorNativeStoreOrdinal
} = require('../agent34-actor-only-root-policy.cjs');
const {
  VERSION: ROOT_VERSION
} = require('../agent43-hooded-block-bench-attack-root.cjs');
const {
  VERSION: SHARED_HELPER_VERSION
} = require('../agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const PINNED_TWINLEAF =
  'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const repositoryRoot = path.resolve(__dirname, '../../..');
const twinleafRoot = path.resolve(repositoryRoot, 'vendor/twinleaf');
const output = path.resolve(twinleafRoot, 'ptcg-server/output');
const native = name => require(path.join(output, name));

function publicOpponentSnapshot(player) {
  return {
    active: player.active.getPokemonCard()?.fullName ?? null,
    activeDamage: player.active.damage,
    activeTools: player.active.tools.map(card => card.fullName),
    bench: player.bench.map(slot => slot.getPokemonCard()?.fullName ?? null),
    handCount: player.hand.cards.length,
    deckCount: player.deck.cards.length,
    prizeCount: player.prizes.length,
    discard: player.discard.cards.map(card => card.fullName)
  };
}

/**
 * Actual Agent34 root wrapper + actual Agent43 chooser + real actorObservation
 * + genuine pinned Store. The staged board is intentionally minimal so it
 * passes PR45's current fail-closed guards; the rank-7 Latias/Mimikyu false
 * vetoes remain separate work. No source-dealt access or full game is claimed.
 */
function runNativeHoodedBlockRootCase(candidateSeat) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  const researchCommit = execFileSync('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD'],
    { encoding: 'utf8' }).trim();
  const engineCommit = execFileSync('git', ['-C', twinleafRoot, 'rev-parse', 'HEAD'],
    { encoding: 'utf8' }).trim();
  assert.equal(engineCommit, PINNED_TWINLEAF,
    'The checked-out Twinleaf submodule must match the recorded engine pin');
  const {
    Store
  } = native('game/store/store');
  const {
    Player
  } = native('game/store/state/player');
  const {
    PokemonCardList
  } = native('game/store/state/pokemon-card-list');
  const {
    CardList
  } = native('game/store/state/card-list');
  const {
    GamePhase
  } = native('game/store/state/state');
  const {
    Format
  } = native('game/store/card/card-types');
  const cardActions = native('game/store/actions/play-card-action');
  const gameActions = native('game/store/actions/game-actions');
  const {
    PlayCardAction,
    PlayerType,
    SlotType
  } = cardActions;
  const {
    RetreatAction,
    PassTurnAction
  } = gameActions;

  const manager = initializeCards();
  let nextCardId = 940000 + candidateSeat * 1000;
  const card = printing => {
    const found = manager.getCardByName(printing);
    assert.ok(found, 'Pinned card missing: ' + printing);
    found.id = nextCardId++;
    return found;
  };

  const candidate = new Player();
  candidate.id = candidateSeat === 0 ? 101 : 202;
  candidate.name = 'candidate';
  candidate.retreatedTurn = 1;
  const opponent = new Player();
  opponent.id = candidateSeat === 0 ? 202 : 101;
  opponent.name = 'opponent';

  const vmaxSlot = candidate.active;
  vmaxSlot.cards.push(
    card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE')
  );
  const retreatEnergy = [
    card('Psychic Energy SVE'),
    card('Psychic Energy SVE')
  ];
  vmaxSlot.cards.push(...retreatEnergy);
  vmaxSlot.energies.cards.push(...retreatEnergy);

  const clefairySlot = new PokemonCardList();
  clefairySlot.cards.push(card("Lillie's Clefairy ex JTG"));
  const clefairyEnergy = Array.from({ length: 7 }, () =>
    card('Psychic Energy SVE'));
  clefairySlot.cards.push(...clefairyEnergy);
  clefairySlot.energies.cards.push(...clefairyEnergy);
  candidate.bench.push(clefairySlot);
  for (let i = 0; i < 4; i++) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Dratini OBF'));
    candidate.bench.push(bench);
  }

  opponent.active.cards.push(card('Snorlax PGO'));
  opponent.active.damage = 10;
  for (let i = 0; i < 5; i++) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Dratini OBF'));
    opponent.bench.push(bench);
  }

  candidate.hand.cards.push(card('Stealthy Hood UNB'));
  // Hidden opponent zones are deliberately populated so the observation
  // noninterference check is meaningful; the chooser must receive counts only.
  opponent.hand.cards.push(card('Tool Jammer BST'));
  for (let i = 0; i < 8; i++) {
    candidate.deck.cards.push(card('Dratini OBF'));
    opponent.deck.cards.push(card('Dratini OBF'));
  }
  for (const player of [candidate, opponent]) {
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = candidateSeat === 0 ?
    [candidate, opponent] : [opponent, candidate];
  state.activePlayer = candidateSeat;
  state.turn = 8;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  const opponentSeat = 1 - candidateSeat;

  // Prove the actual detached observation is invariant to hidden identities
  // and owner deck order while public counts remain unchanged.
  const beforeHiddenPermutation = actorObservation(state, candidateSeat);
  assert.equal(Object.isFrozen(beforeHiddenPermutation), true);
  assert.equal(beforeHiddenPermutation.opponentPublic.hand, undefined);
  assert.equal(beforeHiddenPermutation.opponentPublic.deck, undefined);
  assert.equal(beforeHiddenPermutation.opponentPrivate, undefined);
  assert.equal(beforeHiddenPermutation.ownDeck, undefined);
  assert.equal(beforeHiddenPermutation.ownDeckOrder, undefined);
  assert.equal(beforeHiddenPermutation.opponentPublic.handCount, 1);
  assert.equal(beforeHiddenPermutation.opponentPublic.deckCount, 8);
  opponent.hand.cards[0] = card('Field Blower GRI');
  opponent.deck.cards.reverse();
  candidate.deck.cards.reverse();
  const afterHiddenPermutation = actorObservation(state, candidateSeat);
  assert.deepEqual(afterHiddenPermutation, beforeHiddenPermutation,
    'Opponent hand/deck identities and owner deck order must not enter actorObservation');

  const observedViews = [];
  const observe = (liveState, seat) => {
    const view = actorObservation(liveState, seat);
    observedViews.push({ seat, view });
    return view;
  };

  const frozenPolicyIdentity = Object.freeze({
    schema: 'candidate-only-hooded-block-root-identity-v1',
    rootVersion: ROOT_VERSION,
    sharedHelperVersion: SHARED_HELPER_VERSION,
    researchCommit,
    candidateSeat,
    engineCommit,
    options: Object.freeze({ hoodedBlockBenchAttackRoot: true })
  });
  const policyIdentitySha256 = createHash('sha256')
    .update(JSON.stringify(frozenPolicyIdentity))
    .digest('hex');
  assert.equal(Object.isFrozen(frozenPolicyIdentity), true);
  assert.equal(Object.isFrozen(frozenPolicyIdentity.options), true);

  // The non-owner's original decoder is a harmless PassTurnAction baseline.
  // The real Store, Agent34 wrapper, Agent43 chooser, action classes and
  // candidate root mapping are all the pinned implementation.
  class BaselineTacticsAi {
    constructor(playerId) {
      this.client = { id: playerId };
      this.baselineCalls = 0;
    }
    decodeNextAction() {
      this.baselineCalls++;
      return new PassTurnAction(this.client.id);
    }
  }

  let storeDispatchOrdinal = 0;
  const opponentBefore = publicOpponentSnapshot(opponent);
  let attachAction;
  let retreatAction;
  let opponentAction;
  const wrapped = withActorOnlyRootPolicy(() => {
    const candidateBot = new BaselineTacticsAi(candidate.id);

    attachAction = candidateBot.decodeNextAction(store.state);
    assert.ok(attachAction instanceof PlayCardAction,
      'The first typed root must map to a native Hood PlayCardAction');
    assert.equal(attachAction.player, PlayerType.BOTTOM_PLAYER);
    assert.equal(attachAction.slot, SlotType.ACTIVE);
    assert.equal(attachAction.index, 0);
    const attachMetadata = actorNativeActionReceipt(attachAction);
    assert.equal(attachMetadata?.kind, 'attach-stealthy-hood');
    assert.equal(attachMetadata?.seat, candidateSeat);
    const attachBound = bindActorNativeStoreOrdinal(
      attachAction, storeDispatchOrdinal++, candidateSeat);
    assert.equal(attachBound.nativeStoreActionOrdinal, 0);
    store.dispatch(attachAction);

    const liveCandidate = store.state.players[candidateSeat];
    assert.equal(liveCandidate.active.tools.some(tool =>
      tool.fullName === 'Stealthy Hood UNB'), true,
    'The native Store must physically attach Hood to the current Active VMAX');

    retreatAction = candidateBot.decodeNextAction(store.state);
    assert.ok(retreatAction instanceof RetreatAction,
      'The post-attachment real actorObservation must select paid-retreat');
    const retreatMetadata = actorNativeActionReceipt(retreatAction);
    assert.equal(retreatMetadata?.kind, 'paid-retreat');
    assert.equal(retreatMetadata?.seat, candidateSeat);
    const retreatBound = bindActorNativeStoreOrdinal(
      retreatAction, storeDispatchOrdinal++, candidateSeat);
    assert.equal(retreatBound.nativeStoreActionOrdinal, 1);
    store.dispatch(retreatAction);

    const liveAfterRetreat = store.state.players[candidateSeat];
    assert.equal(liveAfterRetreat.active.getPokemonCard()?.fullName,
      "Lillie's Clefairy ex JTG");
    assert.equal(liveAfterRetreat.active.energies.cards.length, 7);
    assert.equal(liveAfterRetreat.discard.cards.filter(item =>
      item.name === 'Psychic Energy').length, 2);
    const retreatedVmax = liveAfterRetreat.bench.find(slot =>
      slot.getPokemonCard()?.fullName === 'Shadow Rider Calyrex VMAX CRE');
    assert.ok(retreatedVmax);
    assert.equal(retreatedVmax.energies.cards.length, 0);
    assert.equal(retreatedVmax.tools.some(tool =>
      tool.fullName === 'Stealthy Hood UNB'), true);

    // The candidate-only policy must leave the other seat on its baseline
    // decoder, not apply the Hood root to the opponent.
    store.state.activePlayer = opponentSeat;
    const opponentBot = new BaselineTacticsAi(opponent.id);
    opponentAction = opponentBot.decodeNextAction(store.state);
    assert.ok(opponentAction instanceof PassTurnAction);
    assert.equal(opponentBot.baselineCalls, 1);

    return {
      attachActionType: attachAction.constructor.name,
      retreatActionType: retreatAction.constructor.name,
      opponentActionType: opponentAction.constructor.name,
      candidateActiveAfterRetreat:
        liveAfterRetreat.active.getPokemonCard()?.fullName,
      psychicEnergyDiscarded: liveAfterRetreat.discard.cards.filter(item =>
        item.name === 'Psychic Energy').length,
      hoodRemainsOnRetreatedVmax: retreatedVmax.tools.some(tool =>
        tool.fullName === 'Stealthy Hood UNB'),
      opponentSeat
    };
  }, {
    Store,
    SimpleTacticsAi: BaselineTacticsAi,
    cardActions,
    gameActions,
    stagedStore: store,
    policyOwnerSeat: frozenPolicyIdentity.candidateSeat,
    hoodedBlockBenchAttackRoot:
      frozenPolicyIdentity.options.hoodedBlockBenchAttackRoot,
    losslessNativeRootJoinOptIn: true,
    observe
  });

  const audit = wrapped.audit;
  assert.equal(audit.policyOwnerSeat, candidateSeat);
  assert.equal(audit.hoodedBlockBenchAttackRootOptIn, true);
  assert.equal(audit.hoodedBlockBenchAttackRootSelected, 2);
  assert.equal(audit.hoodedBlockBenchAttackRootHoodAttachmentsSelected, 1);
  assert.equal(audit.hoodedBlockBenchAttackRootRetreatsSelected, 1);
  assert.deepEqual(audit.hoodedBlockBenchAttackRootSelectedBySeat,
    candidateSeat === 0 ? [2, 0] : [0, 2]);
  assert.equal(audit.nonOwnerSeatBypassCalls, 1);
  assert.equal(audit.nativeRootAcceptances.length, 2);
  assert.equal(audit.nativeRootAcceptances.every(item =>
    item.accepted === true && item.seat === candidateSeat), true);
  assert.deepEqual(audit.nativeRootAcceptances.map(item => item.kind),
    ['attach-stealthy-hood', 'paid-retreat']);
  assert.equal(audit.nativeRootJoinReceipts.length, 2);
  assert.deepEqual(audit.nativeRootJoinReceipts.map(item => item.kind),
    ['attach-stealthy-hood', 'paid-retreat']);
  assert.deepEqual(audit.nativeRootJoinReceipts.map(item =>
    item.nativeStoreActionOrdinal), [0, 1]);
  assert.equal(audit.nativeRootJoinReceipts.every(item =>
    item.accepted === true && item.seat === candidateSeat), true);
  assert.equal(audit.hoodedBlockBenchAttackRootSelectedBySeat[opponentSeat], 0);
  assert.equal(observedViews.length, 2);
  assert.equal(observedViews.every(item => item.seat === candidateSeat), true);
  const postAttachmentView = observedViews[1].view;
  assert.equal(Object.isFrozen(postAttachmentView), true);
  assert.equal(postAttachmentView.ownPublic.active.tools.includes(
    'Stealthy Hood UNB'), true);
  assert.equal(postAttachmentView.ownHand.includes('Stealthy Hood UNB'), false);
  assert.deepEqual(publicOpponentSnapshot(opponent), opponentBefore,
    'Candidate root dispatches must not mutate the opponent role');
  assert.equal(policyIdentitySha256.length, 64);

  return {
    engine: 'twinleafgg/' + engineCommit,
    engineCommit,
    researchCommit,
    candidateSeat,
    opponentSeat,
    policyIdentitySha256,
    policyIdentityOwnerSeat: frozenPolicyIdentity.candidateSeat,
    policyRootVersion: frozenPolicyIdentity.rootVersion,
    policySharedHelperVersion: frozenPolicyIdentity.sharedHelperVersion,
    observedDecisionSeats: observedViews.map(item => item.seat),
    postAttachmentHoodVisible: true,
    typedIntents: audit.nativeRootAcceptances.map(item => item.kind),
    nativeRootJoinReceipts: audit.nativeRootJoinReceipts,
    candidateActiveAfterRetreat: wrapped.result.candidateActiveAfterRetreat,
    psychicEnergyDiscarded: wrapped.result.psychicEnergyDiscarded,
    hoodRemainsOnRetreatedVmax: wrapped.result.hoodRemainsOnRetreatedVmax,
    opponentBaselineCalls: 1,
    opponentPolicyRootsSelected: audit.hoodedBlockBenchAttackRootSelectedBySeat[opponentSeat],
    competitiveGameQualified: false
  };
}

module.exports = {
  runNativeHoodedBlockRootCase,
  PINNED_TWINLEAF,
  SHARED_HELPER_VERSION
};
