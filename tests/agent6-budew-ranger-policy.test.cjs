'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RANGER,
  observePublicBudewItemLock,
  playerWouldLoseOtherAttackEffects,
  proposeRangerForBudewItemLock
} = require('../simulation/twinleaf/agent6-budew-ranger-itemlock.cjs');
const {chooseActorRootIntent} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

class Marker {
  constructor(markers = []) { this.markers = markers; }
  getMarkersBySourceType(type) {
    return this.markers.filter(marker => marker.sourceType === type);
  }
  removeAttackEffects() {
    this.markers = this.markers.filter(marker => marker.sourceType !== 'attack');
  }
}
class PokemonSlot {
  constructor() {
    this.marker = new Marker();
    this.cannotAttackNextTurn = false;
    this.cards = [];
    this.energies = [];
    this.tools = [];
  }
  removeAttackEffects() {
    this.marker.removeAttackEffects();
    this.cannotAttackNextTurn = false;
  }
}
class Player {
  constructor(id) {
    this.id = id;
    this.marker = new Marker();
    this.active = new PokemonSlot();
    this.bench = Array.from({length: 5}, () => new PokemonSlot());
    this.cannotPlayItemCards = false;
    this.cannotPlaySupporterCards = false;
    this.playLocksTurnsRemaining = 0;
    this.attackPowerSuppressions = [];
    this.pendingEndOfTurnEffects = [];
    this.usedAlteredCreation = false;
    this.alteredCreationDamage = false;
    for (const zone of ['hand', 'deck', 'prizes', 'discard', 'lostzone']) {
      Object.defineProperty(this, zone, {
        enumerable: true,
        get() { throw new Error('concealed/public card zone read: ' + zone); }
      });
    }
  }
  clearPlayLocks() {
    this.cannotPlayItemCards = false;
    this.cannotPlaySupporterCards = false;
    this.playLocksTurnsRemaining = 0;
  }
  removeAttackEffects() {
    this.marker.removeAttackEffects();
    this.clearPlayLocks();
    this.attackPowerSuppressions = [];
    this.pendingEndOfTurnEffects = [];
    this.usedAlteredCreation = false;
    this.alteredCreationDamage = false;
  }
  removeAttackEffectsFromPlayerAndPokemon() {
    this.removeAttackEffects();
    this.active.removeAttackEffects();
    this.bench.forEach(slot => slot.removeAttackEffects());
  }
}

const budew = {name: 'Budew', fullName: 'Budew ASC'};
const itchyPollen = {name: 'Itchy Pollen'};
function stagedState(seat = 0) {
  const players = [new Player(10), new Player(20)];
  const owner = players[seat];
  const opponent = players[1 - seat];
  owner.cannotPlayItemCards = true;
  owner.playLocksTurnsRemaining = 1;
  return {
    players,
    playerLastAttack: {
      [opponent.id]: {attack: itchyPollen, sourceCard: budew}
    }
  };
}
function actorView(seat = 0) {
  return {
    decisionKind: 'owner-root',
    actorSeat: seat,
    globalTurn: 4,
    ownHand: [RANGER, 'Fog Crystal CRE'],
    ownPublic: {
      active: {
        printing: 'Shadow Rider Calyrex V CRE',
        energies: [],
        tools: [],
        attacks: [],
        abilities: [],
        abilityDetails: [],
        specialConditions: [],
        publicRestrictions: {}
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
      active: {
        printing: 'Budew ASC',
        abilities: [],
        abilityDetails: []
      },
      bench: [null, null, null, null, null],
      stadium: [],
      publicTurnRestrictions: {}
    }
  };
}
const itemCatalog = {itemPrintings: new Set(['Fog Crystal CRE'])};

test('Budew Itchy Pollen last-attack attribution yields a safe owner-only opportunity in both seats', () => {
  for (const seat of [0, 1]) {
    const state = stagedState(seat);
    const base = actorView(seat);
    const observed = observePublicBudewItemLock(state, seat, base);
    assert.equal(observed.budewRangerOpportunity.active, true);
    assert.equal(observed.budewRangerOpportunity.safeToClear, true);
    assert.equal(observed.budewRangerOpportunity.sourcePrinting, 'Budew ASC');
    assert.equal(observed.budewRangerOpportunity.attackName, 'Itchy Pollen');
    assert.equal(proposeRangerForBudewItemLock(observed, itemCatalog).kind,
      'play-ranger-budew-item-lock');
  }
});

test('a Budew lock may be cleared without collateral when the only owner marker is the Budew player lock', () => {
  const state = stagedState(0);
  state.players[0].marker.markers.push({
    sourceType: 'attack', source: budew, targetScope: 'player'
  });
  const observed = observePublicBudewItemLock(state, 0, actorView(0));
  assert.equal(observed.budewRangerOpportunity.safeToClear, true);
});

test('wrong last attack or expired Item lock fails closed', () => {
  const state = stagedState(0);
  state.playerLastAttack[20] = {
    attack: {name: 'Quaking Punch'}, sourceCard: {name: 'Seismitoad-EX'}
  };
  assert.equal(observePublicBudewItemLock(state, 0, actorView(0))
    .budewRangerOpportunity.active, false);
  state.playerLastAttack[20] = {attack: itchyPollen, sourceCard: budew};
  state.players[0].playLocksTurnsRemaining = 0;
  assert.equal(observePublicBudewItemLock(state, 0, actorView(0))
    .budewRangerOpportunity.active, false);
});

test('Ranger is declined when it would erase another player or Pokémon attack effect', () => {
  const ownerEffect = stagedState(0);
  ownerEffect.players[0].usedAlteredCreation = true;
  assert.equal(observePublicBudewItemLock(ownerEffect, 0, actorView(0))
    .budewRangerOpportunity.safeToClear, false);

  const opponentEffect = stagedState(0);
  opponentEffect.players[1].pendingEndOfTurnEffects = [{name: 'delayed-knockout'}];
  assert.equal(observePublicBudewItemLock(opponentEffect, 0, actorView(0))
    .budewRangerOpportunity.safeToClear, false);

  const pokemonEffect = stagedState(0);
  pokemonEffect.players[0].active.cannotAttackNextTurn = true;
  assert.equal(observePublicBudewItemLock(pokemonEffect, 0, actorView(0))
    .budewRangerOpportunity.safeToClear, false);
});

test('effect probe never reads either player concealed card zones', () => {
  const state = stagedState(0);
  assert.equal(playerWouldLoseOtherAttackEffects(state.players[0], {
    allowBudewItemLock: true, budewSource: budew
  }), false);
  assert.equal(playerWouldLoseOtherAttackEffects(state.players[1]), false);
});

test('policy requires held Ranger, immediate Item payoff and an unused unblocked Supporter', () => {
  const view = observePublicBudewItemLock(stagedState(0), 0, actorView(0));
  assert.equal(proposeRangerForBudewItemLock(view, itemCatalog).kind,
    'play-ranger-budew-item-lock');

  const noRanger = {...view, ownHand: ['Fog Crystal CRE']};
  assert.equal(proposeRangerForBudewItemLock(noRanger, itemCatalog), null);

  const noItem = {...view, ownHand: [RANGER]};
  assert.equal(proposeRangerForBudewItemLock(noItem, itemCatalog), null);

  const supporterUsed = {...view, ownTurnResources: {
    ...view.ownTurnResources, supporterPlayedTurn: 1
  }};
  assert.equal(proposeRangerForBudewItemLock(supporterUsed, itemCatalog), null);

  const supporterLocked = {...view, ownTurnResources: {
    ...view.ownTurnResources, supporterPlayLocked: true
  }};
  assert.equal(proposeRangerForBudewItemLock(supporterLocked, itemCatalog), null);

  const unsafe = {...view, budewRangerOpportunity: {
    ...view.budewRangerOpportunity, safeToClear: false
  }};
  assert.equal(proposeRangerForBudewItemLock(unsafe, itemCatalog), null);
});

test('policy conservatively declines while Vileplume or Stoutland Ability locks remain', () => {
  const view = observePublicBudewItemLock(stagedState(0), 0, actorView(0));
  const vileplume = {...view, opponentPublic: {
    ...view.opponentPublic,
    bench: [{
      printing: 'Vileplume AOR',
      abilities: ['Irritating Pollen'],
      abilityDetails: [{name: 'Irritating Pollen',
        text: 'Each player cannot play Item cards from their hand.'}]
    }, null, null, null, null]
  }};
  assert.equal(proposeRangerForBudewItemLock(vileplume, itemCatalog), null);

  const stoutland = {...view, opponentPublic: {
    ...view.opponentPublic,
    active: {
      printing: 'Stoutland BCR',
      abilities: ['Sentinel'],
      abilityDetails: [{name: 'Sentinel',
        text: 'Your opponent cannot play Supporter cards from their hand.'}]
    }
  }};
  assert.equal(proposeRangerForBudewItemLock(stoutland, itemCatalog), null);
});

test('shared actor-only root exposes the Budew Ranger proposal only when explicitly opted in', () => {
  const observed = observePublicBudewItemLock(stagedState(0), 0, actorView(0));
  const catalog = {
    basics: new Set(),
    abilityBasics: new Set(),
    basicEnergies: new Set(),
    basicEnergyTypes: {},
    colorlessEnergyType: 0,
    specialConditions: {},
    itemPrintings: itemCatalog.itemPrintings
  };
  const expected = {
    kind: 'play-ranger-budew-item-lock',
    printing: RANGER,
    handIndex: 0,
    source: require('../simulation/twinleaf/agent6-budew-ranger-itemlock.cjs').VERSION,
    trigger: 'opponent-last-attack-Budew-Itchy-Pollen-item-lock'
  };
  assert.equal(chooseActorRootIntent(observed, catalog).kind, 'pass');
  assert.deepEqual(chooseActorRootIntent(observed, catalog, {
    rangerBudewItemLock: true
  }), expected);
});


test('effect-removal probe is non-mutating even when the Budew marker is present', () => {
  const state = stagedState(0);
  const owner = state.players[0];
  const marker = {
    sourceType: 'attack', source: budew, targetScope: 'player'
  };
  owner.marker.markers.push(marker);
  owner.attackPowerSuppressions = [];
  owner.pendingEndOfTurnEffects = [];
  const before = {
    cannotPlayItemCards: owner.cannotPlayItemCards,
    playLocksTurnsRemaining: owner.playLocksTurnsRemaining,
    markerArray: owner.marker.markers.slice(),
    attackPowerSuppressions: owner.attackPowerSuppressions,
    pendingEndOfTurnEffects: owner.pendingEndOfTurnEffects,
    activeFlag: owner.active.cannotAttackNextTurn,
    benchFlag: owner.bench[0].cannotAttackNextTurn
  };
  observePublicBudewItemLock(state, 0, actorView(0));
  assert.equal(owner.cannotPlayItemCards, before.cannotPlayItemCards);
  assert.equal(owner.playLocksTurnsRemaining, before.playLocksTurnsRemaining);
  assert.deepEqual(owner.marker.markers, before.markerArray);
  assert.strictEqual(owner.attackPowerSuppressions, before.attackPowerSuppressions);
  assert.strictEqual(owner.pendingEndOfTurnEffects, before.pendingEndOfTurnEffects);
  assert.equal(owner.active.cannotAttackNextTurn, before.activeFlag);
  assert.equal(owner.bench[0].cannotAttackNextTurn, before.benchFlag);
});


test('an unrelated attack marker on either player blocks Ranger', () => {
  const ownerState = stagedState(0);
  ownerState.players[0].marker.markers.push({
    sourceType: 'attack',
    source: {name: 'Other source', fullName: 'Other source'},
    targetScope: 'player'
  });
  assert.equal(observePublicBudewItemLock(ownerState, 0, actorView(0))
    .budewRangerOpportunity.safeToClear, false);

  const opponentState = stagedState(0);
  opponentState.players[1].marker.markers.push({
    sourceType: 'attack',
    source: {name: 'Other source', fullName: 'Other source'},
    targetScope: 'player'
  });
  assert.equal(observePublicBudewItemLock(opponentState, 0, actorView(0))
    .budewRangerOpportunity.safeToClear, false);
});
