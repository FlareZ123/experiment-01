'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseOwnerPreAttackAceTrainer } =
  require('../simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs');
const { withOwnerPreAttackAceTrainer } =
  require('../simulation/twinleaf/agent20-owner-pre-attack-ace-trainer-hook.cjs');

function fixture() {
  return {
    decisionKind: 'owner-root',
    ownHand: [
      'Lillie AOR',
      'Powerglass SFA',
      'Ace Trainer AOR',
      'Sky Field ROS',
      'Rescue Carrier SIT',
      'Mysterious Treasure FLI',
      'Forest Seal Stone SIT'
    ],
    ownTurnResources: {
      supporterPlayedTurn: 0,
      supporterPlayLocked: false
    },
    ownPublic: {
      prizeCount: 6,
      stadium: [],
      active: {
        printing: 'Unown AOR',
        hp: 60,
        damage: 0,
        energies: ['Psychic Energy SVE'],
        tools: [],
        abilities: [],
        printed: { types: ['Psychic'] },
        attacks: [{
          name: 'Hidden Power',
          cost: ['Colorless'],
          damage: '10',
          damageCalculation: null,
          text: ''
        }]
      }
    },
    opponentPublic: {
      prizeCount: 5,
      handCount: 10,
      stadium: [],
      active: {
        printing: 'Trubbish FST',
        hp: 70,
        damage: 60,
        tools: [],
        abilities: [],
        printed: { resistance: [] }
      }
    }
  };
}

test('selects Ace Trainer before a public one-energy lethal attack', () => {
  const view = fixture();
  const result = chooseOwnerPreAttackAceTrainer(view, { index: 0 });
  assert.equal(result.kind, 'play-ace-trainer');
  assert.equal(result.handIndex, 2);
  assert.equal(result.attackName, 'Hidden Power');
  assert.equal(result.targetRemainingHp, 10);
  assert.equal(result.opponentHandCount, 10);
  assert.equal(result.opponentHiddenHandRead, undefined);
});

test('does not play Ace Trainer when the Prize condition is false', () => {
  const view = fixture();
  view.ownPublic.prizeCount = 5;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play a second Supporter in the same turn', () => {
  const view = fixture();
  view.ownTurnResources.supporterPlayedTurn = 1;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play when the opponent hand is small or not larger', () => {
  const view = fixture();
  view.opponentPublic.handCount = 6;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.opponentPublic.handCount = 4;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play when the active attack cannot Knock Out the target', () => {
  const view = fixture();
  view.opponentPublic.active.damage = 50;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not infer a lethal attack from dynamic damage or attack text', () => {
  const view = fixture();
  view.ownPublic.active.attacks[0].damage = '10+';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownPublic.active.attacks[0].damage = '10';
  view.ownPublic.active.attacks[0].text = 'Flip a coin.';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not use an unpowered or ambiguous attack', () => {
  const view = fixture();
  view.ownPublic.active.energies = [];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownPublic.active.energies = ['Psychic Energy SVE'];
  view.ownPublic.active.attacks.push({
    name: 'Other attack',
    cost: ['Colorless'],
    damage: '20',
    damageCalculation: null,
    text: ''
  });
  assert.equal(chooseOwnerPreAttackAceTrainer(view, {}), null);
});

test('declines when public protection or resistance makes the KO uncertain', () => {
  const view = fixture();
  view.opponentPublic.active.tools = ['Big Charm'];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.opponentPublic.active.tools = [];
  view.opponentPublic.active.printed.resistance = [{ type: 'Psychic', value: -20 }];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('declines when the Supporter is absent or locked', () => {
  const view = fixture();
  view.ownHand = view.ownHand.filter(x => !x.includes('Ace Trainer'));
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownHand.push('Ace Trainer AOR');
  view.ownTurnResources.supporterPlayLocked = true;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not inspect opponent hand identities', () => {
  const view = fixture();
  Object.defineProperty(view, 'opponentHand', {
    get() { throw new Error('opponent hidden hand was accessed'); }
  });
  Object.defineProperty(view.opponentPublic, 'hand', {
    get() { throw new Error('opponent public wrapper exposed hidden hand'); }
  });
  assert.equal(
    chooseOwnerPreAttackAceTrainer(view, { index: 0 }).kind,
    'play-ace-trainer'
  );
});

test('requires an owner-root observation', () => {
  const view = fixture();
  view.decisionKind = 'opponent-root';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('resolves a multi-attack Pokémon by the AttackAction attackName', () => {
  const view = fixture();
  view.ownPublic.active.attacks.push({
    name: 'Other attack',
    cost: ['Colorless'],
    damage: '20',
    damageCalculation: null,
    text: ''
  });
  const result = chooseOwnerPreAttackAceTrainer(view, {
    attackName: 'Hidden Power'
  });
  assert.equal(result.attackIndex, 0);
  assert.equal(result.attackName, 'Hidden Power');
});


function nativePokemon(fullName, name, hp, attacks = [], cardType = ['Psychic']) {
  return {
    fullName, name, hp, stage: 'Basic', cardType, retreat: [],
    weakness: [], resistance: [], attacks, powers: []
  };
}

function nativeSlot(pokemon, damage, energies = []) {
  return {
    getPokemonCard() { return pokemon; },
    cards: [pokemon],
    damage,
    pokemonPlayedTurn: 1,
    energies: { cards: energies },
    tools: [],
    specialConditions: [],
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function nativePlayer(id, handCards, prizeCount, pokemon, damage, energies = []) {
  return {
    id,
    active: nativeSlot(pokemon, damage, energies),
    bench: [],
    stadium: { cards: [] },
    discard: { cards: [] },
    lostzone: { cards: [] },
    supporter: { cards: [] },
    hand: { cards: handCards },
    deck: { cards: [] },
    prizes: Array.from({ length: prizeCount }, () => ({ cards: [{}] })),
    supporterTurn: 0,
    retreatedTurn: 0,
    energyPlayedTurn: 0,
    stadiumPlayedTurn: 0,
    stadiumUsedTurn: 0,
    usedVSTAR: false,
    cannotPlayPokemonCards: false,
    cannotPlayPokemonWithAbilities: false,
    cannotEvolvePokemonCards: false,
    cannotPlayItemCards: false,
    cannotPlaySupporterCards: false,
    cannotPlayStadiumCards: false,
    cannotPlayToolCards: false,
    cannotPlayEnergyCards: false,
    cannotPlaySpecialEnergyCards: false
  };
}

function nativeAceTrainerHarness(seat, actorIdOverride) {
  const ownerId = seat === 0 ? 101 : 202;
  const opponentId = seat === 0 ? 202 : 101;
  const hiddenHand = Array.from({ length: 10 }, () => {
    const card = {};
    Object.defineProperty(card, 'fullName', {
      get() { throw new Error('opponent hidden hand identity was accessed'); }
    });
    return card;
  });
  const ownerHand = [
    'Lillie AOR', 'Powerglass SFA', 'Ace Trainer AOR',
    'Sky Field ROS', 'Rescue Carrier EVS',
    'Mysterious Treasure FLI', 'Forest Seal Stone SIT'
  ].map(fullName => ({ fullName }));
  const ownerPokemon = nativePokemon('Unown AOR', 'Unown', 60, [{
    name: 'Hidden Power', cost: ['Colorless'], damage: '10',
    damageCalculation: null, text: ''
  }]);
  const opponentPokemon = nativePokemon(
    'Trubbish FST', 'Trubbish', 70, [], ['Darkness']
  );
  const owner = nativePlayer(ownerId, ownerHand, 6, ownerPokemon, 0,
    [{ fullName: 'Psychic Energy SVE' }]);
  const opponent = nativePlayer(opponentId, hiddenHand, 5,
    opponentPokemon, 60);
  const players = seat === 0 ? [owner, opponent] : [opponent, owner];
  const state = { players, activePlayer: seat, phase: 2, turn: 14, prompts: [] };
  const dispatched = [];
  const originalDispatch = action => {
    dispatched.push(action);
    return action;
  };
  const store = { state, dispatch: originalDispatch };
  class AttackAction {
    constructor(id, index) {
      this.id = id;
      this.index = index;
      this.name = 'Hidden Power';
    }
  }
  class PlayCardAction {
    constructor(id, handIndex, target) {
      this.id = id;
      this.handIndex = handIndex;
      this.target = target;
    }
  }
  const headless = {
    runMatch(request) {
      request.onRootStoreCreated?.(store);
      const action = new AttackAction(
        actorIdOverride === undefined ? ownerId : actorIdOverride, 0
      );
      store.dispatch(action);
      request.onRootActionDispatched?.(store, action, 1, seat, state.turn);
      return {
        rootActionLedger: [{
          actionOrdinal: 1, action: 'AttackAction', attack: 'Hidden Power'
        }],
        store, dispatched, originalDispatch
      };
    }
  };
  const native = modulePath => {
    if (modulePath === 'game/store/actions/game-actions') return { AttackAction };
    if (modulePath === 'game/store/actions/play-card-action') {
      return {
        PlayCardAction,
        PlayerType: { ANY: 'ANY' },
        SlotType: { BOARD: 'BOARD' }
      };
    }
    throw new Error('Unexpected native module: ' + modulePath);
  };
  return {
    ownerId, headless, native, state, dispatched,
    originalDispatch, PlayCardAction, AttackAction
  };
}

test('native Store hook resolves numeric player IDs in both physical seats without reading opponent hand identities', () => {
  for (const seat of [0, 1]) {
    const harness = nativeAceTrainerHarness(seat);
    const wrapped = withOwnerPreAttackAceTrainer(
      () => harness.headless.runMatch({}),
      {},
      { headless: harness.headless, native: harness.native }
    );
    assert.equal(wrapped.audit.storeInstances, 1);
    assert.equal(wrapped.audit.attackDispatchCalls, 1);
    assert.equal(wrapped.audit.invalidActorIdAttempts, 0);
    assert.equal(wrapped.audit.attempts.length, 1);
    assert.equal(wrapped.audit.attempts[0].actorIdType, 'number');
    assert.equal(wrapped.audit.attempts[0].actorSeat, seat);
    assert.equal(wrapped.audit.decisions.length, 1);
    assert.equal(wrapped.audit.decisions[0].accepted, true);
    assert.equal(wrapped.result.dispatched.length, 1);
    assert.ok(wrapped.result.dispatched[0] instanceof harness.PlayCardAction);
    assert.equal(wrapped.result.dispatched[0].id, harness.ownerId);
    assert.equal(wrapped.result.rootActionLedger[0].action, 'PlayCardAction');
    assert.equal(wrapped.result.rootActionLedger[0].card, 'Ace Trainer');
    assert.equal(wrapped.result.rootActionLedger[0].replacedAction, 'AttackAction');
    assert.equal(wrapped.result.store.dispatch, harness.originalDispatch);
  }
});

test('native Store hook delegates an actor ID that does not strictly match the numeric player ID', () => {
  const harness = nativeAceTrainerHarness(0, '101');
  const wrapped = withOwnerPreAttackAceTrainer(
    () => harness.headless.runMatch({}),
    {},
    { headless: harness.headless, native: harness.native }
  );
  assert.equal(wrapped.audit.invalidActorIdAttempts, 1);
  assert.equal(wrapped.audit.attempts[0].policyStatus, 'declined-invalid-actor-id');
  assert.equal(wrapped.audit.decisions.length, 0);
  assert.equal(wrapped.result.dispatched.length, 1);
  assert.ok(wrapped.result.dispatched[0] instanceof harness.AttackAction);
  assert.equal(wrapped.result.rootActionLedger[0].action, 'AttackAction');
  assert.equal(wrapped.result.rootActionLedger[0].card, undefined);
});
