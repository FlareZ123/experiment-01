'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  loadTypes
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs');
const {
  withNativeRawStateFallbackQuarantine,
  QUARANTINE_ACTIVE
} = require('../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {
  withSnapTrapOwnerPolicyV2,
  withSnapTrapInsideNativeMatchesV2
} = require('../../simulation/twinleaf/agent36/snap-trap-owner-prompt-policy-v2.cjs');

const types = loadTypes();
const {CardTag, CardType, EnergyType, GameMessage, SuperType} = types;

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
  constructor(player, cards, id = 173) {
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

class Store {
  constructor(state) {
    this.state = state;
  }

  prompt(state, prompt) {
    state.prompts.push(prompt);
    return prompt;
  }

  dispatch(action) {
    if (!(action instanceof ResolvePromptAction)) {
      throw new Error('Unexpected fake Store action: ' + action?.constructor?.name);
    }
    const prompt = this.state.prompts.find(item => item.id === action.promptId);
    assert.ok(prompt);
    prompt.result = action.result;
    const sourceOwner = this.state.players.find(player => player.id === prompt.playerId);
    const attacker = this.state.players.find(player => player.active === prompt.cards);
    const sourceCard = sourceOwner.active.getPokemonCard();
    const effect = new MoveCardsEffect(
      attacker.active,
      attacker.discard,
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
    const attacker = state.players.find(player => player.active === effect.source);
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
    throw new Error('unquarantined native decoder must never be reached');
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

function hiddenZone() {
  return new Proxy({}, {
    get(_target, property) {
      hiddenReads++;
      throw new Error('hidden-zone read: ' + String(property));
    }
  });
}

/**
 * @param {number} sourceSeat
 * @param {object[]} energyCards
 * @param {object[]} attacks
 * @returns {object}
 */
function makeFixture(sourceSeat, energyCards, attacks) {
  hiddenReads = 0;
  nextId = 1;
  const sourceEffect = {name: 'Snap Trap'};
  const sourceCard = {
    id: nextId++,
    fullName: 'Galarian Stunfisk SSH',
    powers: [sourceEffect]
  };
  const attackerPokemon = {
    id: nextId++,
    fullName: 'Marshadow UNB',
    attacks,
    hasTag() {
      return false;
    }
  };
  const sourceOwner = {
    id: 101,
    active: new PokemonCardList(sourceCard),
    hand: hiddenZone(),
    deck: hiddenZone(),
    prizes: hiddenZone(),
    discard: {cards: []},
    lostzone: {cards: []}
  };
  const attackerOwner = {
    id: 202,
    active: new PokemonCardList(attackerPokemon, energyCards),
    hand: hiddenZone(),
    deck: hiddenZone(),
    prizes: hiddenZone(),
    discard: {cards: []},
    lostzone: {cards: []}
  };
  const attackerSeat = 1 - sourceSeat;
  const players = sourceSeat === 0
    ? [sourceOwner, attackerOwner]
    : [attackerOwner, sourceOwner];
  const prompt = new ChooseCardsPrompt(sourceOwner, attackerOwner.active);
  const state = {players, prompts: [], turn: 54};
  const proof = {
    sourcePrinting: 'Galarian Stunfisk SSH',
    sourceAbility: 'Snap Trap',
    sourceSeat,
    sourceZone: 'owner-active-pokemon-list',
    attackerSeat,
    attackerZone: 'opponent-active-pokemon-list',
    turn: 54,
    promptType: 'ChooseCardsPrompt',
    promptMessage: 'CHOOSE_CARD_TO_DISCARD',
    filterKeys: ['superType'],
    sourceCardPublic: true,
    promptOwnerSeat: sourceSeat,
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
    promptPlayerId: sourceOwner.id,
    sourceStoreIdentityCaptured: true
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
    energyCards
  };
}

/**
 * @param {object} fixture
 * @param {object} store
 * @param {object} [options]
 * @returns {object}
 */
function policyDependencies(fixture, store, options = {}) {
  return {
    getRootStore: () => store,
    markerLayer: run => ({
      result: run(
        prompt => prompt === fixture.prompt ? fixture.proof : null,
        prompt => prompt === fixture.prompt ? store : null
      ),
      audit: {stampedPromptCount: 1, privateStoreIdentityCaptures: 1}
    }),
    SimpleTacticsAi,
    Store,
    ResolvePromptAction,
    ChooseCardsPrompt,
    MoveCardsEffect,
    types,
    ...options
  };
}

/**
 * @param {object} fixture
 * @param {object} store
 * @param {{tamper?:(fixture:object)=>void,otherPromptStore?:object}} [options]
 * @returns {object}
 */
function executeFixture(fixture, store, options = {}) {
  const promptStore = options.otherPromptStore ?? store;
  promptStore.prompt(fixture.state, fixture.prompt);
  const ai = new SimpleTacticsAi({id: fixture.sourceOwner.id});
  const action = ai.decodeNextAction(fixture.state);
  assert.ok(action instanceof ResolvePromptAction);
  options.tamper?.(fixture);
  store.dispatch(action);
  return {store, ai, action};
}

function runProtectedFixture(fixture, options = {}) {
  let rootStore = null;
  const outcome = withNativeRawStateFallbackQuarantine(
    () => withSnapTrapOwnerPolicyV2(() => {
      const store = options.rootStore ?? new Store(fixture.state);
      rootStore = store;
      return executeFixture(fixture, store, options);
    }, {
      ...policyDependencies(fixture, {
        getRootStore: () => rootStore
      }, options.policyOptions),
      getRootStore: () => rootStore
    }),
    {SimpleTacticsAi}
  );
  return outcome;
}

test('marker v3, exact root Store, live State and one physical Energy receipt settle ordinary Energy', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const doubleColorless = energy('Double Colorless Energy', [
    CardType.COLORLESS,
    CardType.COLORLESS
  ], {special: true});
  const fixture = makeFixture(0, [psychic, doubleColorless], [
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

  const outcome = runProtectedFixture(fixture);
  const policy = outcome.result.audit.ownerPolicy;

  assert.equal(outcome.audit.activeMarkerInstalled, true);
  assert.equal(outcome.audit.rawStateFallbackCalls, 0);
  assert.equal(policy.quarantineActiveAtInstall, true);
  assert.equal(policy.promptStoreJoins, 1);
  assert.equal(policy.markerStoreIdentityJoins, 1);
  assert.equal(policy.exactPromptIdentityJoins, 1);
  assert.equal(policy.dispatchRevalidations, 1);
  assert.equal(policy.moveCardsEffectReceiptCount, 1);
  assert.equal(policy.physicalSettlements, 1);
  assert.equal(policy.choices[0].energyPrinting, 'Double Colorless Energy');
  assert.deepEqual(policy.choices[0].deniedAttacks, [
    'Colorless Barrage',
    'Psychic Nova'
  ]);
  assert.ok(fixture.attackerOwner.discard.cards.includes(doubleColorless));
  assert.ok(fixture.attackerOwner.active.energies.cards.includes(psychic));
  assert.equal(hiddenReads, 0);
  assert.equal(policy.hiddenCardIdentitiesInspected, false);
  assert.equal(SimpleTacticsAi.prototype[QUARANTINE_ACTIVE], undefined);
});

test('exact root Store owner policy handles source owner in seat 1 and routes Prism Star to Lost Zone', () => {
  const psychicA = energy('Psychic Energy A', [CardType.PSYCHIC]);
  const psychicB = energy('Psychic Energy B', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true
  });
  const fixture = makeFixture(1, [psychicA, psychicB, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);

  const outcome = runProtectedFixture(fixture);
  const policy = outcome.result.audit.ownerPolicy;

  assert.equal(policy.choices[0].sourceSeat, 1);
  assert.equal(policy.choices[0].attackerSeat, 0);
  assert.equal(policy.choices[0].energyPrinting, 'Beast Energy FLI');
  assert.equal(policy.choices[0].actualDestination, 'lostzone');
  assert.ok(fixture.attackerOwner.lostzone.cards.includes(beast));
  assert.ok(!fixture.attackerOwner.discard.cards.includes(beast));
  assert.equal(policy.physicalSettlements, 1);
  assert.equal(hiddenReads, 0);
});

test('unmarked prompt delegates to the actual Agent4 quarantine', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture(0, [psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  let rootStore = null;
  let thrown;
  try {
    withNativeRawStateFallbackQuarantine(
      () => withSnapTrapOwnerPolicyV2(() => {
        const store = new Store(fixture.state);
        rootStore = store;
        store.prompt(fixture.state, fixture.prompt);
        const ai = new SimpleTacticsAi({id: fixture.sourceOwner.id});
        ai.decodeNextAction(fixture.state);
      }, {
        ...policyDependencies(fixture, null, {
          markerLayer: run => ({
            result: run(() => null, () => null),
            audit: {stampedPromptCount: 0}
          }),
          getRootStore: () => rootStore
        }),
        getRootStore: () => rootStore
      }),
      {SimpleTacticsAi}
    );
  } catch (error) {
    thrown = error;
  }

  assert.equal(thrown?.code, 'OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED');
  assert.equal(thrown?.nativeRawStateFallbackQuarantineAudit?.rawStateFallbackCalls, 1);
  assert.equal(thrown?.snapTrapOwnerPromptPolicyAudit?.delegatedUnmarkedPrompts, 1);
  assert.equal(hiddenReads, 0);
});

test('prompt Store mismatch fails closed before the AI can choose', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture(0, [psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const rootStore = new Store(fixture.state);
  const otherStore = new Store(fixture.state);
  let thrown;
  try {
    withNativeRawStateFallbackQuarantine(
      () => withSnapTrapOwnerPolicyV2(() => {
        rootStore.prompt(fixture.state, fixture.prompt);
      }, policyDependencies(fixture, rootStore, {
        markerLayer: run => ({
          result: run(
            prompt => prompt === fixture.prompt ? fixture.proof : null,
            prompt => prompt === fixture.prompt ? rootStore : null
          ),
          audit: {}
        })
      })),
      {SimpleTacticsAi}
    );
    otherStore.prompt(fixture.state, fixture.prompt);
  } catch (error) {
    thrown = error;
  }

  assert.match(thrown?.message ?? '', /Store.prompt receiver/);
  assert.equal(hiddenReads, 0);
});

test('dispatch-time prompt mutation is rejected before the native action resolves', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const fixture = makeFixture(0, [psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  let thrown;
  try {
    runProtectedFixture(fixture, {
      tamper(current) {
        current.prompt.filter.energyType = EnergyType.BASIC;
      }
    });
  } catch (error) {
    thrown = error;
  }

  assert.match(thrown?.message ?? '', /native prompt contract changed:.*exact Energy filter/);
  assert.equal(thrown?.snapTrapOwnerPromptPolicyAudit?.dispatchRevalidationFailures, 1);
  assert.ok(fixture.attackerOwner.active.energies.cards.includes(psychic));
  assert.equal(fixture.attackerOwner.discard.cards.length, 0);
  assert.equal(hiddenReads, 0);
});

test('native headless wrapper captures onRootStoreCreated and preserves the caller callback', () => {
  let currentFixture = null;
  let currentStore = null;
  let callbackStore = null;
  const headless = {
    runMatch(request) {
      currentFixture = makeFixture(1, [
        energy('Psychic Energy A', [CardType.PSYCHIC]),
        energy('Psychic Energy B', [CardType.PSYCHIC]),
        energy('Beast Energy FLI', [CardType.COLORLESS], {
          special: true,
          prismStar: true
        })
      ], [{name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}]);
      currentStore = new Store(currentFixture.state);
      request.onRootStoreCreated(currentStore);
      return executeFixture(currentFixture, currentStore);
    }
  };
  const originalRunMatch = headless.runMatch;
  const markerLayer = run => ({
    result: run(
      prompt => prompt === currentFixture?.prompt ? currentFixture.proof : null,
      prompt => prompt === currentFixture?.prompt ? currentStore : null
    ),
    audit: {stampedPromptCount: 1, privateStoreIdentityCaptures: 1}
  });
  const policyDeps = {
    SimpleTacticsAi,
    Store,
    ResolvePromptAction,
    ChooseCardsPrompt,
    MoveCardsEffect,
    types,
    markerLayer
  };
  const request = Object.freeze({
    label: 'seat-1-source',
    onRootStoreCreated(store) {
      callbackStore = store;
    }
  });

  const outcome = withNativeRawStateFallbackQuarantine(
    () => withSnapTrapInsideNativeMatchesV2(
      () => headless.runMatch(request),
      {headless, policyDeps}
    ),
    {SimpleTacticsAi}
  );

  assert.equal(outcome.result.audit.nativeMatchCalls, 1);
  assert.equal(outcome.result.audit.nativeMatchAttempts[0].rootStoreCaptureCount, 1);
  assert.equal(outcome.result.audit.nativeMatchAttempts[0].ownerPolicy.physicalSettlements, 1);
  assert.strictEqual(callbackStore, currentStore);
  assert.strictEqual(headless.runMatch, originalRunMatch);
  assert.equal(hiddenReads, 0);
});
