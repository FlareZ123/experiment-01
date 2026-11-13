'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withActorOnlyRootPolicy
} = require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {VERSION, RANGER} =
  require('../simulation/twinleaf/agent6-budew-ranger-itemlock.cjs');

class Marker {
  getMarkersBySourceType() { return []; }
  removeAttackEffects() {}
}
class Slot {
  constructor() {
    this.marker = new Marker();
    this.cards = [];
    this.damage = 0;
    this.specialConditions = [];
    this.energies = {cards: []};
    this.tools = [];
  }
  getPokemonCard() { return null; }
  removeAttackEffects() {}
}
class Player {
  constructor(id, itemLocked = false) {
    this.id = id;
    this.marker = new Marker();
    this.active = new Slot();
    this.bench = Array.from({length: 5}, () => new Slot());
    this.hand = {cards: itemLocked ? [
      {fullName: RANGER}, {fullName: 'Fog Crystal CRE'}
    ] : []};
    this.deck = {cards: []};
    this.prizes = [];
    this.stadium = {cards: []};
    this.discard = {cards: []};
    this.lostzone = {cards: []};
    this.supporter = {cards: []};
    this.supporterTurn = 0;
    this.cannotPlaySupporterCards = false;
    this.cannotPlayItemCards = itemLocked;
    this.playLocksTurnsRemaining = itemLocked ? 1 : 0;
  }
  removeAttackEffectsFromPlayerAndPokemon() {
    this.cannotPlayItemCards = false;
    this.playLocksTurnsRemaining = 0;
    this.marker.removeAttackEffects();
    this.active.removeAttackEffects();
    this.bench.forEach(slot => slot.removeAttackEffects());
  }
}
class AddPlayerAction {}
class PlayCardAction {
  constructor(id, handIndex, target) {
    this.id = id;
    this.handIndex = handIndex;
    this.target = target;
  }
}
class AttackAction {}
class PassTurnAction {}
class Store {
  constructor() {
    this.state = {
      players: [new Player(10), new Player(20, true)],
      activePlayer: 1,
      prompts: [],
      turn: 2,
      phase: 2,
      playerLastAttack: {
        10: {
          attack: {name: 'Itchy Pollen'},
          sourceCard: {name: 'Budew', fullName: 'Budew ASC'}
        }
      }
    };
  }
  dispatch() { return true; }
}
class SimpleTacticsAi {
  constructor(id) { this.client = {id}; }
  decodeNextAction() {
    throw new Error('generic hidden-state root must not run');
  }
}

test('default-off Budew Ranger root dispatches a typed PlayCardAction when explicitly enabled', () => {
  const view = {
    decisionKind: 'owner-root',
    actorSeat: 1,
    globalTurn: 2,
    ownHand: [RANGER, 'Fog Crystal CRE'],
    ownPublic: {
      active: {
        printing: 'Shadow Rider Calyrex V CRE',
        energies: [], tools: [], attacks: [], abilities: [],
        abilityDetails: [], specialConditions: [], publicRestrictions: {}
      },
      bench: [null, null, null, null, null],
      stadium: [],
      resolvingSupporter: [],
      publicTurnRestrictions: {}
    },
    ownTurnResources: {
      energyPlayedTurn: 0,
      energyPlayLocked: false,
      pokemonPlayLocked: false,
      itemPlayLocked: true,
      supporterPlayedTurn: 0,
      supporterPlayLocked: false
    },
    opponentPublic: {
      active: {printing: 'Budew ASC', abilities: [], abilityDetails: []},
      bench: [null, null, null, null, null],
      stadium: [],
      publicTurnRestrictions: {}
    }
  };
  const catalog = {
    basics: new Set(),
    abilityBasics: new Set(),
    basicEnergies: new Set(),
    basicEnergyTypes: {},
    colorlessEnergyType: 0,
    specialConditions: {},
    itemPrintings: new Set(['Fog Crystal CRE'])
  };
  const priorBot = SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore = Store.prototype.dispatch;
  const result = withActorOnlyRootPolicy(() => {
    const store = new Store();
    store.dispatch(new AddPlayerAction());
    const action = new SimpleTacticsAi(20).decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    assert.deepEqual(action.target, {player: 2, slot: 3, index: 0});
    assert.equal(action.handIndex, 0);
    store.dispatch(action);
    return action;
  }, {
    SimpleTacticsAi,
    Store,
    GamePhase: {PLAYER_TURN: 2, FINISHED: 7},
    observe: () => Object.freeze(view),
    getCatalog: () => catalog,
    rangerBudewItemLock: true,
    cardActions: {
      PlayCardAction,
      PlayerType: {BOTTOM_PLAYER: 0, TOP_PLAYER: 1, ANY: 2},
      SlotType: {ACTIVE: 1, BENCH: 2, BOARD: 3}
    },
    gameActions: {AttackAction, PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, priorBot);
  assert.strictEqual(Store.prototype.dispatch, priorStore);
  assert.ok(result.result instanceof PlayCardAction);
  assert.equal(result.audit.rangerBudewItemLockOptIn, true);
  assert.equal(result.audit.rangerBudewItemLockVersion, VERSION);
  assert.equal(result.audit.policyOwnerSeat, 1);
  assert.equal(result.audit.selectedRootDecisions, 1);
  assert.equal(result.audit.acceptedActorRoots, 1);
  assert.equal(result.audit.competitiveGameQualified, false);
});


const {withCandidateOpponentPolicyRoles} =
  require('../simulation/twinleaf/agent44-role-scoped-policy-composition.cjs');

test('V3 role composer can enable Budew Ranger for candidate only', () => {
  const candidateView = {
    decisionKind: 'owner-root',
    actorSeat: 1,
    globalTurn: 2,
    ownHand: [RANGER, 'Fog Crystal CRE'],
    ownPublic: {
      active: {
        printing: 'Shadow Rider Calyrex V CRE',
        energies: [], tools: [], attacks: [], abilities: [],
        abilityDetails: [], specialConditions: [], publicRestrictions: {}
      },
      bench: [null, null, null, null, null],
      stadium: [], resolvingSupporter: [], publicTurnRestrictions: {}
    },
    ownTurnResources: {
      energyPlayedTurn: 0, energyPlayLocked: false, pokemonPlayLocked: false,
      itemPlayLocked: true, supporterPlayedTurn: 0, supporterPlayLocked: false
    },
    opponentPublic: {
      active: {printing: 'Budew ASC', abilities: [], abilityDetails: []},
      bench: [null, null, null, null, null],
      stadium: [], publicTurnRestrictions: {}
    }
  };
  const opponentView = {
    ...candidateView,
    actorSeat: 0,
    ownHand: [],
    ownTurnResources: {
      energyPlayedTurn: 0, energyPlayLocked: false, pokemonPlayLocked: false,
      itemPlayLocked: false, supporterPlayedTurn: 0, supporterPlayLocked: false
    },
    budewRangerOpportunity: undefined
  };
  const catalog = {
    basics: new Set(), abilityBasics: new Set(), basicEnergies: new Set(),
    basicEnergyTypes: {}, colorlessEnergyType: 0, specialConditions: {},
    itemPrintings: new Set(['Fog Crystal CRE'])
  };
  const commonDeps = {
    SimpleTacticsAi,
    Store,
    GamePhase: {PLAYER_TURN: 2, FINISHED: 7},
    observe: (state, seat) => Object.freeze(seat === 1 ? candidateView : opponentView),
    getCatalog: () => catalog,
    getNativeTrainerCatalog: () => ({}),
    promptActions: {ResolvePromptAction: class ResolvePromptAction {}},
    cardActions: {
      PlayCardAction,
      PlayerType: {BOTTOM_PLAYER: 0, TOP_PLAYER: 1, ANY: 2},
      SlotType: {ACTIVE: 1, BENCH: 2, BOARD: 3}
    },
    gameActions: {AttackAction, PassTurnAction}
  };
  const result = withCandidateOpponentPolicyRoles(() => {
    const store = new Store();
    store.dispatch(new AddPlayerAction());
    store.state.activePlayer = 1;
    const candidateAction = new SimpleTacticsAi(20).decodeNextAction(store.state);
    assert.ok(candidateAction instanceof PlayCardAction);
    assert.deepEqual(candidateAction.target, {player: 2, slot: 3, index: 0});
    store.dispatch(candidateAction);

    store.state.activePlayer = 0;
    assert.throws(
      () => new SimpleTacticsAi(10).decodeNextAction(store.state),
      /generic hidden-state root must not run/
    );
    return candidateAction;
  }, {
    candidateSeat: 1,
    opponentSeat: 0,
    commonDeps,
    candidatePolicyOptions: {rangerBudewItemLock: true},
    opponentPolicyOptions: {}
  });
  assert.equal(result.candidateAudit.rangerBudewItemLockOptIn, true);
  assert.equal(result.opponentAudit.rangerBudewItemLockOptIn, false);
  assert.equal(result.candidateAudit.policyOwnerSeat, 1);
  assert.equal(result.opponentAudit.policyOwnerSeat, 0);
  assert.equal(result.candidateAudit.acceptedActorRoots, 1);
  assert.equal(result.opponentAudit.acceptedActorRoots, 0);
  assert.deepEqual(result.roleSeatMap, {candidate: 1, opponent: 0});
});
