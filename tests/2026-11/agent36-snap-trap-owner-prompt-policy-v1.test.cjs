'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  loadTypes
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs');
const {
  VERSION,
  withOwnerSnapTrapPromptResolution,
  withSnapTrapOwnerPolicy,
  withSnapTrapInsideNativeMatches
} = require('../../simulation/twinleaf/agent36/snap-trap-owner-prompt-policy-v1.cjs');

const types = loadTypes();
const {
  CardTag,
  CardType,
  EnergyType,
  GameMessage,
  SuperType
} = types;

let hiddenReads = 0;
let nextId = 1;

class PokemonCardList {
  constructor(pokemon, energies = []) {
    this.cards = [pokemon, ...energies];
    this.energies = {cards: [...energies]};
    this.pokemon = pokemon;
  }

  getPokemonCard() {
    return this.pokemon;
  }
}

class ChooseCardsPrompt {
  constructor(player, cards, energies, id = 173) {
    this.id = id;
    this.player = player;
    this.playerId = player.id;
    this.result = undefined;
    this.message = GameMessage.CHOOSE_CARD_TO_DISCARD;
    this.cards = cards;
    this.filter = {superType: SuperType.ENERGY};
    this.options = {
      min: 1,
      max: 1,
      allowCancel: false,
      isSecret: false,
      blocked: []
    };
    this.energies = energies;
  }

  validate(selected) {
    return Array.isArray(selected) &&
      selected.length === 1 &&
      this.cards.cards.includes(selected[0]) &&
      this.cards.energies.cards.includes(selected[0]) &&
      selected[0].superType === SuperType.ENERGY &&
      !this.options.blocked.includes(this.cards.cards.indexOf(selected[0]));
  }
}

class ResolvePromptAction {
  constructor(promptId, result) {
    this.promptId = promptId;
    this.result = result;
  }
}

class MoveCardsEffect {
  constructor(source, destination, cards, sourceCard, sourceEffect) {
    this.source = source;
    this.destination = destination;
    this.cards = cards;
    this.sourceCard = sourceCard;
    this.sourceEffect = sourceEffect;
  }
}

class AddPlayerAction {}

class Store {
  constructor(state) {
    this.state = state;
  }

  dispatch(action) {
    if (action instanceof AddPlayerAction) return this.state;
    if (!(action instanceof ResolvePromptAction)) {
      throw new Error('Unexpected fake Store action: ' + action?.constructor?.name);
    }
    const prompt = this.state.prompts.find(item => item.id === action.promptId);
    assert.ok(prompt);
    prompt.result = action.result;
    const sourceCard = this.state.players[0].active.getPokemonCard();
    const effect = new MoveCardsEffect(
      this.state.players[1].active,
      this.state.players[1].discard,
      action.result,
      sourceCard,
      sourceCard.powers[0]
    );
    this.reduceEffect(this.state, effect);
    return this.state;
  }

  reduceEffect(state, effect) {
    const card = effect.cards[0];
    effect.source.cards = effect.source.cards.filter(item => item !== card);
    effect.source.energies.cards = effect.source.energies.cards.filter(item => item !== card);
    const attacker = state.players[1];
    const destination = card.tags.includes(CardTag.PRISM_STAR)
      ? attacker.lostzone
      : attacker.discard;
    destination.cards.push(card);
    return state;
  }
}

class SimpleTacticsAi {
  constructor(client) {
    this.client = client;
  }

  decodeNextAction() {
    throw new Error('native raw-State fallback quarantine reached');
  }
}

/**
 * @param {string} name
 * @param {number[]} provides
 * @param {{special?:boolean,prismStar?:boolean}} [options]
 * @returns {object}
 */
function energy(name, provides, options = {}) {
  return {
    id: nextId++,
    fullName: name,
    superType: SuperType.ENERGY,
    energyType: options.special ? EnergyType.SPECIAL : EnergyType.BASIC,
    tags: options.prismStar ? [CardTag.PRISM_STAR] : [],
    provides: [...provides]
  };
}

/**
 * @param {object} energyCards
 * @param {object[]} attacks
 * @returns {object}
 */
function makeFixture(energyCards, attacks) {
  hiddenReads = 0;
  nextId = 1;
  const hidden = new Proxy({}, {
    get(_target, property) {
      hiddenReads++;
      throw new Error('hidden-zone property read: ' + String(property));
    }
  });
  const sourceEffect = {name: 'Snap Trap'};
  const sourceCard = {
    id: nextId++,
    fullName: 'Galarian Stunfisk SSH',
    powers: [sourceEffect]
  };
  const attackerPokemon = {
    id: nextId++,
    fullName: 'Marshadow UNB',
    attacks
  };
  const sourceOwner = {
    id: 101,
    active: new PokemonCardList(sourceCard),
    hand: hidden,
    deck: hidden,
    prizes: hidden,
    discard: {cards: []},
    lostzone: {cards: []}
  };
  const attackerOwner = {
    id: 202,
    active: new PokemonCardList(attackerPokemon, energyCards),
    hand: hidden,
    deck: hidden,
    prizes: hidden,
    discard: {cards: []},
    lostzone: {cards: []}
  };
  const prompt = new ChooseCardsPrompt(
    sourceOwner,
    attackerOwner.active,
    attackerOwner.active.energies.cards
  );
  const state = {
    players: [sourceOwner, attackerOwner],
    prompts: [prompt],
    turn: 54
  };
  const proof = {
    sourcePrinting: 'Galarian Stunfisk SSH',
    sourceAbility: 'Snap Trap',
    sourceSeat: 0,
    sourceZone: 'owner-active-pokemon-list',
    attackerSeat: 1,
    attackerPrinting: attackerPokemon.fullName,
    attackerZone: 'opponent-active-pokemon-list',
    turn: 54,
    promptType: 'ChooseCardsPrompt',
    promptMessage: 'CHOOSE_CARD_TO_DISCARD',
    filterKeys: ['superType'],
    sourceCardPublic: true,
    promptOwnerSeat: 0,
    promptCardsIsAttackingPokemonList: true,
    promptEnergyListIsAttackingEnergySublist: true,
    promptCardsClass: 'PokemonCardList',
    eligibleSubzone: 'attacker-active-energies',
    eligibleEnergyCount: energyCards.length,
    eligibleEnergyPrintings: energyCards.map(card => card.fullName),
    min: 1,
    max: 1,
    allowCancel: false,
    isSecret: false,
    promptSourceCardMetadataPresent: false,
    moveSourceCard: 'Galarian Stunfisk SSH',
    moveSourceEffect: 'Snap Trap',
    promptIdBeforeStore: 0,
    promptIdAfterStore: prompt.id,
    promptIdAssignedByStore: true,
    pendingNativePromptId: String(prompt.id),
    promptPlayerId: sourceOwner.id
  };
  return {
    state,
    prompt,
    proof,
    sourceOwner,
    attackerOwner,
    sourceCard,
    sourceEffect,
    attackerPokemon,
    energyCards,
    hiddenReads
  };
}

function dependencies(fixture, overrides = {}) {
  return {
    getOriginForPrompt: prompt => prompt === fixture.prompt ? fixture.proof : null,
    SimpleTacticsAi,
    Store,
    ResolvePromptAction,
    ChooseCardsPrompt,
    MoveCardsEffect,
    types,
    ...overrides
  };
}

function runFixture(fixture, deps = dependencies(fixture)) {
  const store = new Store(fixture.state);
  store.dispatch(new AddPlayerAction());
  const ai = new SimpleTacticsAi({id: fixture.sourceOwner.id});
  const action = ai.decodeNextAction(fixture.state);
  assert.ok(action instanceof ResolvePromptAction);
  store.dispatch(action);
  return {store, ai, action};
}

test('source-marked owner policy selects and settles the physical Energy that denies most attacks', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const doubleColorless = energy('Double Colorless Energy', [
    CardType.COLORLESS,
    CardType.COLORLESS
  ], {special: true});
  const fixture = makeFixture([psychic, doubleColorless], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10},
    {name: 'Colorless Barrage', cost: [
      CardType.COLORLESS,
      CardType.COLORLESS
    ], damage: 100},
    {name: 'Psychic Nova', cost: [
      CardType.PSYCHIC,
      CardType.COLORLESS,
      CardType.COLORLESS
    ], damage: 50}
  ]);

  const outcome = withOwnerSnapTrapPromptResolution(
    () => runFixture(fixture),
    dependencies(fixture)
  );

  assert.equal(outcome.audit.liveStoresObserved, 1);
  assert.equal(outcome.audit.sourceProofPromptsSeen, 1);
  assert.equal(outcome.audit.exactPromptContracts, 1);
  assert.equal(outcome.audit.ownerChoices, 1);
  assert.equal(outcome.audit.physicalSettlements, 1);
  assert.equal(outcome.audit.physicalSettlementFailures, 0);
  assert.equal(outcome.audit.choices[0].energyPrinting, 'Double Colorless Energy');
  assert.equal(outcome.audit.choices[0].denialScore, 150);
  assert.deepEqual(outcome.audit.choices[0].deniedAttacks, [
    'Colorless Barrage',
    'Psychic Nova'
  ]);
  assert.ok(fixture.attackerOwner.discard.cards.includes(doubleColorless));
  assert.ok(fixture.attackerOwner.active.energies.cards.includes(psychic));
  assert.equal(hiddenReads, 0);
  assert.equal(outcome.audit.hiddenCardIdentitiesInspected, false);
  assert.equal(outcome.audit.competitiveGamesQualified, 0);
});

test('source-marked owner policy routes Prism Star Energy to Lost Zone after the requested discard effect', () => {
  const psychicA = energy('Psychic Energy A', [CardType.PSYCHIC]);
  const psychicB = energy('Psychic Energy B', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true
  });
  const fixture = makeFixture([psychicA, psychicB, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);

  const outcome = withOwnerSnapTrapPromptResolution(
    () => runFixture(fixture),
    dependencies(fixture)
  );

  assert.equal(outcome.audit.physicalSettlements, 1);
  assert.equal(outcome.audit.choices[0].energyPrinting, 'Beast Energy FLI');
  assert.equal(outcome.audit.choices[0].actualDestination, 'lostzone');
  assert.ok(fixture.attackerOwner.lostzone.cards.includes(beast));
  assert.ok(!fixture.attackerOwner.discard.cards.includes(beast));
  assert.ok(fixture.attackerOwner.active.energies.cards.includes(psychicA));
  assert.ok(fixture.attackerOwner.active.energies.cards.includes(psychicB));
  assert.equal(hiddenReads, 0);
});

test('unmarked prompts delegate to the previous fail-closed decoder', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const deps = dependencies(fixture, {getOriginForPrompt: () => null});
  let thrown;
  try {
    withOwnerSnapTrapPromptResolution(() => runFixture(fixture), deps);
  } catch (error) {
    thrown = error;
  }

  assert.match(thrown?.message ?? '', /raw-State fallback quarantine reached/);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.delegatedUnmarkedPrompts, 1);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.ownerChoices, 0);
  assert.equal(hiddenReads, 0);
});

test('a source proof with a mismatched prompt contract fails closed without delegating', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  fixture.prompt.filter.energyType = EnergyType.BASIC;
  let thrown;
  try {
    withOwnerSnapTrapPromptResolution(
      () => runFixture(fixture),
      dependencies(fixture)
    );
  } catch (error) {
    thrown = error;
  }

  assert.match(thrown?.message ?? '', /exact Energy filter/);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.promptContractFailures, 1);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.delegatedUnmarkedPrompts, 0);
  assert.equal(hiddenReads, 0);
});

test('a non-live State is delegated to the pre-existing decoder', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  let thrown;
  try {
    withOwnerSnapTrapPromptResolution(() => {
      const store = new Store(fixture.state);
      store.dispatch(new AddPlayerAction());
      const ai = new SimpleTacticsAi({id: fixture.sourceOwner.id});
      ai.decodeNextAction({...fixture.state});
    }, dependencies(fixture));
  } catch (error) {
    thrown = error;
  }

  assert.match(thrown?.message ?? '', /raw-State fallback quarantine reached/);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.delegatedNonLiveStates, 1);
  assert.equal(thrown.snapTrapOwnerPromptPolicyAudit.ownerChoices, 0);
  assert.equal(hiddenReads, 0);
});

test('combined marker and per-match wrapper installs after outer layers and restores headless.runMatch', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const markerLayer = run => ({
    result: run(prompt => prompt === fixture.prompt ? fixture.proof : null),
    audit: {stampedPromptCount: 1}
  });
  const headless = {
    runMatch() {
      return runFixture(fixture);
    }
  };
  const originalRunMatch = headless.runMatch;
  const policyDeps = dependencies(fixture, {markerLayer});

  const outcome = withSnapTrapInsideNativeMatches(
    () => headless.runMatch({label: 'source-rank6-new-moon'}),
    {headless, policyDeps}
  );

  assert.equal(outcome.audit.nativeMatchCalls, 1);
  assert.equal(outcome.audit.nativeMatchAttempts[0].disposition, 'returned-unqualified');
  assert.equal(outcome.audit.nativeMatchAttempts[0].marker.stampedPromptCount, 1);
  assert.equal(outcome.audit.nativeMatchAttempts[0].ownerPolicy.physicalSettlements, 1);
  assert.strictEqual(headless.runMatch, originalRunMatch);
  assert.equal(hiddenReads, 0);
  assert.equal(outcome.audit.competitiveGamesQualified, 0);
});
