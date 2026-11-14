'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  projectPrompt,
  dispatchPromptChoice,
  enumerateCombinations,
  enumeratePermutations
} = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');

const PlayerType = { BOTTOM_PLAYER: 1, TOP_PLAYER: 2, ANY: 3 };
const SlotType = { ACTIVE: 1, BENCH: 2, HAND: 3, DECK: 4, DISCARD: 5, BOARD: 6 };

function pokemon(fullName) {
  return {
    fullName, name: fullName, hp: 60, stage: 'BASIC',
    subtypes: [], cardType: ['PSYCHIC'], retreat: [],
    weakness: [], resistance: [], attacks: [{ name: 'Copycat', cost: [], damage: '20' }],
    powers: []
  };
}

function slot(card = null, energies = []) {
  return {
    cards: card ? [card] : [],
    energies: { cards: energies },
    tools: [],
    getPokemonCard() { return card; }
  };
}

function player(id, activeCard, deckCards = []) {
  return {
    id,
    hand: { isPublic: false, cards: [] },
    deck: { cards: deckCards },
    discard: { cards: [] },
    lostzone: { cards: [] },
    stadium: { cards: [] },
    supporter: { cards: [] },
    active: slot(activeCard),
    bench: Array.from({ length: 5 }, () => slot()),
    prizes: Array.from({ length: 6 }, (_, index) => ({
      cards: [{ fullName: 'HIDDEN_PRIZE_' + id + '_' + index }],
      faceUpPrize: false
    }))
  };
}

function makeState({ phase = 2, prompt = null, opponentActive = null, opponentBench = null } = {}) {
  const ownActive = pokemon('Actor Active');
  const ownEnergy = [
    { fullName: 'Psychic Energy A', provides: ['PSYCHIC'] },
    { fullName: 'Psychic Energy B', provides: ['PSYCHIC'] },
    { fullName: 'Double Energy', provides: ['PSYCHIC', 'COLORLESS'] }
  ];
  const actor = player('p0', ownActive, [
    { fullName: 'Deck Search A' },
    { fullName: 'Deck Search B' },
    { fullName: 'Deck Search C' }
  ]);
  actor.active = slot(ownActive, ownEnergy);
  actor.discard.cards.push({ fullName: 'Quick Ball' });
  const opponent = player('p1', opponentActive ?? pokemon('Opponent Active'), []);
  if (opponentBench) opponent.bench[0] = slot(opponentBench);
  return {
    players: [actor, opponent],
    activePlayer: 0,
    phase,
    turn: 4,
    prompts: prompt ? [prompt] : []
  };
}

function provenance(sourceCard, effectName = 'Quick Ball') {
  return { getPromptProvenance: () => ({ sourceCard, effectName }) };
}

function basePrompt(Class, state, overrides = {}) {
  const prompt = new Class();
  Object.assign(prompt, {
    id: 7,
    playerId: 'p0',
    result: undefined,
    message: 'Choose an option',
    sourceCard: state.players[0].discard.cards[0],
    getPerspectivePlayerId() { return this.playerId; },
    options: {}
  }, overrides);
  if (typeof prompt.decode !== 'function') prompt.decode = value => value;
  if (typeof prompt.validate !== 'function') prompt.validate = () => true;
  state.prompts = [prompt];
  return prompt;
}

class ChooseCardsPrompt {
  decode(result) {
    if (result === null) return null;
    return result.map(index => this.cards.cards[index]);
  }
  validate(decoded) {
    if (decoded === null) return this.options.allowCancel === true;
    return decoded.length >= this.options.min &&
      decoded.length <= this.options.max &&
      decoded.every(card => this.cards.cards.includes(card));
  }
}

class ChoosePokemonPrompt {
  decode(result) { return result; }
  validate(result) { return result === null ? this.options.allowCancel === true : result.length > 0; }
}

class ChoosePrizePrompt {
  decode(result, state) {
    if (result === null) return null;
    const target = state.players[this.options.useOpponentPrizes ? 1 : 0];
    return result.map(index => target.prizes.filter(prize => prize.cards.length > 0)[index]);
  }
  validate(result) { return result === null ? this.options.allowCancel === true : result.length === this.options.count; }
}

class ChooseEnergyPrompt {
  decode(result) {
    if (result === null) return null;
    return result.map(index => this.energy[index]);
  }
  validate(result) { return result === null ? this.options.allowCancel === true : result.length > 0; }
}

class ChooseAttackPrompt {
  decode(result) {
    if (result === null) return null;
    return this.cards[result.index].attacks.find(attack => attack.name === result.attack);
  }
  validate(result) { return result === null ? this.options.allowCancel === true : Boolean(result); }
}

class ConfirmPrompt {}
class OrderCardsPrompt {
  validate(result) {
    return result === null ? this.options.allowCancel === true :
      result.length === this.cards.cards.length &&
      new Set(result).size === result.length;
  }
}

class NightWatchPrompt extends ChooseCardsPrompt {}

const native = {
  PlayerType,
  SlotType,
  ResolvePromptAction: class ResolvePromptAction {
    constructor(promptId, result) { this.promptId = promptId; this.result = result; }
  }
};

test('bounded combination and permutation enumeration refuses combinatorial explosion', () => {
  assert.deepEqual(enumerateCombinations([0, 1, 2], 2, 2), [[0, 1], [0, 2], [1, 2]]);
  assert.equal(enumeratePermutations([0, 1, 2]).length, 6);
  assert.throws(() => enumerateCombinations(Array.from({ length: 20 }, (_, i) => i), 1, 10),
    error => error.code === 'PROMPT_FRONTIER_TOO_LARGE');
  assert.throws(() => enumeratePermutations([0, 1, 2, 3, 4, 5, 6]),
    error => error.code === 'PROMPT_FRONTIER_TOO_LARGE');
});

test('owner deck-search prompt exposes only actor-owned card choices and maps opaque tokens to native results', () => {
  const state = makeState();
  const prompt = basePrompt(ChooseCardsPrompt, state, {
    cards: state.players[0].deck,
    options: { min: 1, max: 1, blocked: [2], allowCancel: true, isSecret: true }
  });
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native,
    provenanceHook: provenance(prompt.sourceCard, 'Quick Ball')
  });
  assert.equal(projection.promptProjection.schema, protocol.PROMPT_SCHEMA);
  assert.equal(projection.promptProjection.actingSeat, 0);
  assert.equal(protocol.validatePrompt(projection.promptProjection, 0), projection.promptProjection);
  assert.equal(projection.promptProjection.source.sourceKind, 'card-effect');
  assert.equal(projection.promptProjection.source.sourcePrinting, 'Quick Ball');
  assert.equal(projection.promptProjection.choices.length, 3);
  assert.deepEqual(projection.promptProjection.choices.slice(0, 2).map(x => x.printing),
    ['Deck Search A', 'Deck Search B']);
  assert.equal(JSON.stringify(projection.promptProjection).includes('HIDDEN_PRIZE_'), false);
  assert.equal(projection.choiceByToken.get('prompt-0'), 0);
  assert.equal(projection.promptProjection.choices[0].kind, 'card');
  assert.equal(projection.promptProjection.publicMetadata.selectionType, 'card-combination');

  let dispatched = null;
  const store = {
    state,
    dispatch(action) { dispatched = action; return { ok: true }; }
  };
  const result = dispatchPromptChoice({
    store, prompt, state, actorSeat: 0, projection,
    decision: { kind: 'select-choices', tokens: ['prompt-0'] }, native
  });
  assert.deepEqual(result.rawResult, [0]);
  assert.equal(result.decoded[0].fullName, 'Deck Search A');
  assert.equal(dispatched.promptId, 7);
  assert.deepEqual(dispatched.result, [0]);
});

test('ChoosePokemonPrompt keeps concealed opponent setup Pokémon identities out of choices', () => {
  const hiddenActive = pokemon('HIDDEN_OPPONENT_ACTIVE_SENTINEL');
  const hiddenBench = pokemon('HIDDEN_OPPONENT_BENCH_SENTINEL');
  const state = makeState({
    phase: 0,
    opponentActive: hiddenActive,
    opponentBench: hiddenBench
  });
  const prompt = basePrompt(ChoosePokemonPrompt, state, {
    playerType: PlayerType.ANY,
    slots: [SlotType.ACTIVE, SlotType.BENCH],
    options: { min: 1, max: 1, allowCancel: false, blocked: [] },
    decode(result) { return result; },
    validate(result) { return Array.isArray(result) && result.length === 1; }
  });
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native,
    provenanceHook: provenance(prompt.sourceCard, 'Choose a Pokémon')
  });
  const serialized = JSON.stringify(projection.promptProjection);
  assert.equal(serialized.includes('HIDDEN_OPPONENT_ACTIVE_SENTINEL'), false);
  assert.equal(serialized.includes('HIDDEN_OPPONENT_BENCH_SENTINEL'), false);
  assert.ok(projection.promptProjection.choices.some(choice => choice.label === 'Opponent active'));
  assert.ok(projection.promptProjection.choices.some(choice => choice.label === 'Opponent bench 1'));
});

test('ChoosePrizePrompt exposes slots but never face-down Prize identities', () => {
  const state = makeState();
  const prompt = basePrompt(ChoosePrizePrompt, state, {
    options: { useOpponentPrizes: true, count: 1, blocked: [], allowCancel: false },
    decode: ChoosePrizePrompt.prototype.decode,
    validate: ChoosePrizePrompt.prototype.validate
  });
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native,
    provenanceHook: provenance(prompt.sourceCard, 'Prize selection')
  });
  const serialized = JSON.stringify(projection.promptProjection);
  assert.equal(serialized.includes('HIDDEN_PRIZE_p1_'), false);
  assert.ok(projection.promptProjection.choices[0].label.startsWith('Opponent Prize slot'));
  assert.equal(projection.promptProjection.publicMetadata.isOwnerVisible, false);
});

test('energy and attack prompts are projected only from visible card objects', () => {
  const state = makeState();
  const energyPrompt = basePrompt(ChooseEnergyPrompt, state, {
    energy: state.players[0].active.energies.cards.map(card => ({ card, provides: card.provides })),
    cost: ['PSYCHIC', 'COLORLESS'],
    options: { allowCancel: false },
    decode: ChooseEnergyPrompt.prototype.decode,
    validate: ChooseEnergyPrompt.prototype.validate
  });
  const energyProjection = projectPrompt({
    prompt: energyPrompt, state, actorSeat: 0, native,
    provenanceHook: provenance(energyPrompt.sourceCard, 'Energy payment')
  });
  assert.ok(energyProjection.promptProjection.choices.length > 0);
  assert.ok(JSON.stringify(energyProjection.promptProjection).includes('Psychic Energy A'));
  assert.equal(energyProjection.promptProjection.choices.length, 3);
  assert.equal(energyProjection.promptProjection.publicMetadata.selectionType, 'energy-payment');
  const energyStore = { state, dispatch(action) { return action; } };
  const paid = dispatchPromptChoice({
    store: energyStore, prompt: energyPrompt, state, actorSeat: 0,
    projection: energyProjection,
    decision: { kind: 'select-choices', tokens: ['prompt-2', 'prompt-0'] },
    native
  });
  assert.deepEqual(paid.rawResult, [2, 0]);
  assert.equal(paid.decoded.length, 2);

  const opponentPokemon = state.players[1].active.getPokemonCard();
  const attackPrompt = basePrompt(ChooseAttackPrompt, state, {
    cards: [opponentPokemon],
    options: { blocked: [], allowCancel: false },
    decode: ChooseAttackPrompt.prototype.decode,
    validate: ChooseAttackPrompt.prototype.validate
  });
  const attackProjection = projectPrompt({
    prompt: attackPrompt, state, actorSeat: 0, native,
    provenanceHook: provenance(attackPrompt.sourceCard, 'Copycat attack')
  });
  assert.ok(attackProjection.promptProjection.choices.some(choice => choice.label.includes('Opponent Active')));
});

test('multi-select prompt projection emits per-item tokens and preserves card order', () => {
  const state = makeState();
  const cards = state.players[0].deck;
  const prompt = basePrompt(OrderCardsPrompt, state, {
    cards,
    options: { allowCancel: false },
    decode(result) { return result; },
    validate(result) {
      return Array.isArray(result) && result.length === cards.cards.length &&
        new Set(result).size === result.length;
    }
  });
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native,
    provenanceHook: provenance(prompt.sourceCard, 'Order cards')
  });
  assert.equal(projection.promptProjection.publicMetadata.selectionType, 'card-order');
  assert.equal(projection.promptProjection.choices.length, cards.cards.length);
  assert.ok(projection.promptProjection.choices.every(choice => choice.kind === 'card-order-item'));
  const store = { state, dispatch(action) { return action; } };
  const result = dispatchPromptChoice({
    store, prompt, state, actorSeat: 0, projection,
    decision: { kind: 'select-choices', tokens: ['prompt-2', 'prompt-0', 'prompt-1'] },
    native
  });
  assert.deepEqual(result.rawResult, [2, 0, 1]);
});

test('zero-minimum multi-select prompts expose one explicit empty-selection token', () => {
  const state = makeState();
  const prompt = basePrompt(ChooseCardsPrompt, state, {
    cards: state.players[0].deck,
    options: { min: 0, max: 2, blocked: [], allowCancel: false }
  });
  const projection = projectPrompt({
    prompt, state, actorSeat: 0, native,
    provenanceHook: provenance(prompt.sourceCard, 'Optional card selection')
  });
  const empty = projection.promptProjection.choices.filter(choice => choice.kind === 'empty-selection');
  assert.equal(empty.length, 1);
  assert.equal(protocol.validatePrompt(projection.promptProjection, 0), projection.promptProjection);
  const store = { state, dispatch(action) { return action; } };
  const result = dispatchPromptChoice({
    store, prompt, state, actorSeat: 0, projection,
    decision: { kind: 'select-choice', token: empty[0].token }, native
  });
  assert.deepEqual(result.rawResult, []);
});

test('host-only Night Watch and Copycat prompts fail closed rather than leaking unsupported choices', () => {
  const state = makeState();
  const nightWatch = basePrompt(NightWatchPrompt, state, {
    cards: state.players[1].hand,
    options: { min: 1, max: 1, allowCancel: false }
  });
  const hostOnly = projectPrompt({
    prompt: nightWatch, state, actorSeat: 0, native,
    provenanceHook: provenance(nightWatch.sourceCard, 'Night Watch')
  });
  assert.equal(hostOnly.hostOnly, true);
  assert.equal(hostOnly.reason, 'NightWatchPhysicalRandom');

  const copycat = basePrompt(ChooseAttackPrompt, state, {
    cards: [state.players[1].active.getPokemonCard()],
    options: { blocked: [], allowCancel: false },
    decode: ChooseAttackPrompt.prototype.decode,
    validate: ChooseAttackPrompt.prototype.validate
  });
  assert.throws(() => projectPrompt({
    prompt: copycat, state, actorSeat: 0, native,
    provenanceHook: provenance(copycat.sourceCard, 'Copycat')
  }), error => error.code === 'UNSUPPORTED_COPYCAT_PROMPT');
});

test('unknown prompt types and non-actor perspectives fail closed', () => {
  const state = makeState();
  class UnknownPrompt {}
  const unknown = basePrompt(UnknownPrompt, state);
  assert.throws(() => projectPrompt({
    prompt: unknown, state, actorSeat: 0, native,
    provenanceHook: provenance(unknown.sourceCard)
  }), error => error.code === 'UNSUPPORTED_NATIVE_PROMPT');

  const wrongPerspective = basePrompt(ConfirmPrompt, state, {
    getPerspectivePlayerId() { return 'p1'; }
  });
  assert.throws(() => projectPrompt({
    prompt: wrongPerspective, state, actorSeat: 0, native,
    provenanceHook: provenance(wrongPerspective.sourceCard)
  }), /prompt perspective must match/);
});
