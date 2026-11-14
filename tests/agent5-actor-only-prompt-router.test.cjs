'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  resolveActorOnlyPrompt,
  actorOnlyPromptReceipt
} = require('../simulation/twinleaf/agent5-actor-only-prompt-router.cjs');

class ChooseCardsPrompt {
  constructor({ id, playerId, message, cards, options = {}, validate }) {
    Object.assign(this, {
      id, playerId, message, cards,
      options: { allowCancel: true, ...options }
    });
    // Pinned Twinleaf ChooseCardsPrompt.validate(null) returns allowCancel
    // directly; it does not call the card-selection validator with null.
    this.validate = selected => selected === null
      ? this.options.allowCancel === true
      : validate(selected);
  }
}

class ConfirmPrompt {
  constructor({ id, playerId, message }) {
    Object.assign(this, { id, playerId, message });
  }
}

class ResolvePromptAction {
  constructor(promptId, result) {
    this.type = 'RESOLVE_PROMPT_ACTION';
    this.promptId = promptId;
    this.result = result;
  }
}

function card(fullName, extra = {}) {
  return { fullName, name: extra.name ?? fullName, ...extra };
}

function makePlayer(id, handCards = [], deckCards = []) {
  return {
    id,
    hand: { cards: handCards },
    deck: { cards: deckCards },
    discard: { cards: [] },
    lostZone: { cards: [] },
    prizes: { cards: [] },
    active: null,
    bench: [],
    supporterTurn: 0,
    retreatedTurn: false,
    energyPlayedTurn: false,
    stadiumPlayedTurn: false,
    stadiumUsedTurn: false,
    usedVSTAR: false
  };
}

function makeState(owner, pending) {
  const opponent = makePlayer('opponent');
  return {
    players: [owner, opponent],
    prompts: [pending],
    turn: 1,
    phase: 2,
    activePlayer: 0
  };
}

function observe(state, seat) {
  return Object.freeze({
    actorSeat: seat,
    decisionKind: 'owner-prompt',
    ownHand: state.players[seat].hand.cards.map(value => value.fullName),
    ownPublic: Object.freeze({ bench: [] }),
    opponentPublic: Object.freeze({ bench: [] })
  });
}

function routerDeps(extra = {}) {
  return {
    ResolvePromptAction,
    observe,
    ...extra
  };
}

test('Mysterious Treasure discard resolves an owner-hand physical card and records receipt', () => {
  const fog = card('Fog Crystal CRE 140');
  const sky1 = card('Sky Field ROS 89');
  const sky2 = card('Sky Field ROS 89');
  const energy = card('Psychic Energy SVE 5');
  const owner = makePlayer('owner', [fog, sky1, sky2, energy]);
  const pending = new ChooseCardsPrompt({
    id: 11,
    playerId: owner.id,
    message: 'CHOOSE_CARD_TO_DISCARD',
    cards: owner.hand,
    options: { min: 1, max: 1, allowCancel: false },
    validate: selected => selected.length === 1 &&
      selected.every(value => owner.hand.cards.includes(value))
  });
  const state = makeState(owner, pending);
  let policyInput;
  const action = resolveActorOnlyPrompt(state, 0, routerDeps({
    chooseDiscard(input) {
      policyInput = input;
      return { printings: ['Sky Field ROS 89'] };
    }
  }));
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.promptId, 11);
  assert.equal(action.result.length, 1);
  assert.ok([sky1, sky2].includes(action.result[0]));
  assert.equal(policyInput.actor.decisionKind, 'owner-prompt');
  assert.equal(policyInput.prompt.source, 'own-hand');
  assert.ok(!Object.values(policyInput.prompt).some(value => value === sky1));
  const receipt = actorOnlyPromptReceipt(action);
  assert.equal(receipt.version, VERSION);
  assert.equal(receipt.kind, 'owner-hand-discard');
  assert.equal(receipt.expectedZone, 'own-discard');
  assert.deepEqual(receipt.selectedPrintings, ['Sky Field ROS 89']);
  assert.equal(receipt.physicalCards[0], action.result[0]);
});

test('Quick Ball handTemp subset is authenticated by physical membership in owner hand', () => {
  const quickBall = card('Quick Ball SSH 179');
  const fog = card('Fog Crystal CRE 140');
  const sky1 = card('Sky Field ROS 89');
  const sky2 = card('Sky Field ROS 89');
  const owner = makePlayer('owner', [quickBall, fog, sky1, sky2]);
  const handTemp = { cards: [fog, sky1, sky2] };
  const pending = new ChooseCardsPrompt({
    id: 12,
    playerId: owner.id,
    message: 'CHOOSE_CARD_TO_DISCARD',
    cards: handTemp,
    options: { min: 1, max: 1, allowCancel: false },
    validate: selected => selected.length === 1 &&
      selected.every(value => handTemp.cards.includes(value))
  });
  const action = resolveActorOnlyPrompt(makeState(owner, pending), 0, routerDeps({
    chooseDiscard: () => ({ printings: ['Sky Field ROS 89'] })
  }));
  assert.ok(action instanceof ResolvePromptAction);
  assert.ok([sky1, sky2].includes(action.result[0]));
  assert.equal(actorOnlyPromptReceipt(action).source, 'own-hand-subset');
});

test('owner deck search maps detached printing choice back to the physical card', () => {
  const target = card('Shadow Rider Calyrex V CRE 74', {
    pokemon: true,
    superType: 'Pokémon'
  });
  const energy = card('Psychic Energy SVE 5', { pokemon: false });
  const owner = makePlayer('owner', [], [energy, target]);
  const pending = new ChooseCardsPrompt({
    id: 13,
    playerId: owner.id,
    message: 'CHOOSE_CARD_TO_HAND',
    cards: owner.deck,
    options: { min: 0, max: 1, allowCancel: false },
    validate: selected => selected.length <= 1 &&
      selected.every(value => value.pokemon === true)
  });
  let policyInput;
  const action = resolveActorOnlyPrompt(makeState(owner, pending), 0, routerDeps({
    chooseSearch(input) {
      policyInput = input;
      const entry = input.prompt.offered.find(value =>
        value.printing === target.fullName && value.selectableAlone);
      return { indices: [entry.index] };
    }
  }));
  assert.ok(action instanceof ResolvePromptAction);
  assert.deepEqual(action.result, [target]);
  assert.equal(policyInput.actor.decisionKind, 'owner-prompt');
  assert.equal(policyInput.prompt.source, 'own-deck');
  assert.equal(policyInput.prompt.canCancel, false);
  assert.ok(policyInput.prompt.offered.every(entry =>
    !Object.values(entry).includes(target)));
  const receipt = actorOnlyPromptReceipt(action);
  assert.equal(receipt.kind, 'owner-search-to-hand');
  assert.equal(receipt.expectedZone, 'own-hand');
  assert.deepEqual(receipt.selectedPrintings, [target.fullName]);
});

test('starting Pokémon prompt selects only legal cards and honors configured active priority', () => {
  const energy = card('Psychic Energy SVE 5', { basic: false });
  const clefairy = card("Lillie's Clefairy ex JTG 56", {
    basic: true,
    name: "Lillie's Clefairy ex"
  });
  const shadowRider = card('Shadow Rider Calyrex V CRE 74', {
    basic: true,
    name: 'Shadow Rider Calyrex V'
  });
  const owner = makePlayer('owner', [energy, clefairy, shadowRider]);
  const pending = new ChooseCardsPrompt({
    id: 14,
    playerId: owner.id,
    message: 'CHOOSE_STARTING_POKEMONS',
    cards: owner.hand,
    options: { min: 1, max: 6, blocked: [] },
    validate: selected => selected.length >= 1 && selected.length <= 6 &&
      selected.every(value => value.basic === true)
  });
  const action = resolveActorOnlyPrompt(makeState(owner, pending), 0, routerDeps({
    startingPokemonPriority: ['Shadow Rider Calyrex V']
  }));
  assert.ok(action instanceof ResolvePromptAction);
  assert.deepEqual(action.result, [shadowRider, clefairy]);
  const receipt = actorOnlyPromptReceipt(action);
  assert.equal(receipt.kind, 'starting-pokemon-selection');
  assert.equal(receipt.expectedZone, 'own-board');
});

test('GO_FIRST uses the explicit pinned baseline false choice', () => {
  const owner = makePlayer('owner');
  const pending = new ConfirmPrompt({
    id: 15,
    playerId: owner.id,
    message: 'GO_FIRST'
  });
  const action = resolveActorOnlyPrompt(makeState(owner, pending), 0, routerDeps());
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.result, false);
  assert.equal(actorOnlyPromptReceipt(action).kind, 'go-first-confirmation');
});

test('wrong-seat, unsupported, and illegal prompt selections are not resolved', () => {
  const owner = makePlayer('owner');
  const opponent = makePlayer('opponent');
  const wrongSeatPrompt = new ConfirmPrompt({
    id: 16,
    playerId: owner.id,
    message: 'GO_FIRST'
  });
  const state = makeState(owner, wrongSeatPrompt);
  assert.equal(resolveActorOnlyPrompt(state, 1, routerDeps()), null);

  const unsupported = new ConfirmPrompt({
    id: 17,
    playerId: owner.id,
    message: 'UNKNOWN_CONFIRM'
  });
  assert.equal(resolveActorOnlyPrompt(makeState(owner, unsupported), 0, routerDeps()), null);

  const basic = card('Shadow Rider Calyrex V CRE 74', {
    basic: true,
    name: 'Shadow Rider Calyrex V'
  });
  const hand = { cards: [basic] };
  const invalidStarting = new ChooseCardsPrompt({
    id: 18,
    playerId: owner.id,
    message: 'CHOOSE_STARTING_POKEMONS',
    cards: hand,
    options: { min: 1, max: 6 },
    validate: selected => selected.length >= 1 &&
      selected.every(value => value.basic === true)
  });
  const invalidState = makeState(owner, invalidStarting);
  invalidState.players[0].hand = hand;
  const invalidAction = resolveActorOnlyPrompt(invalidState, 0, routerDeps({
    chooseStartingPokemon: () => ({ indices: [99] })
  }));
  assert.equal(invalidAction, null);
  assert.ok(opponent);
});
