'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseTelepathicBasics, TELEPATH} =
  require('../simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs');

const TYPE = Object.freeze({
  Stage: {BASIC: 1, STAGE_1: 2},
  CardType: {PSYCHIC: 5, DARKNESS: 6},
  SuperType: {POKEMON: 1, TRAINER: 2},
  GameMessage: {CHOOSE_CARD_TO_PUT_ONTO_BENCH: 72}
});

/**
 * Construct a detachable legal owner-deck prompt rather than permitting a
 * hidden-deck peek at the root. This mock is not claimed as a native fixture.
 * @param {object} [opts]
 */
function fixture(opts = {}) {
  const psych = fullName => ({
    fullName, id: fullName.length, superType: TYPE.SuperType.POKEMON,
    stage: TYPE.Stage.BASIC, cardType: [TYPE.CardType.PSYCHIC]
  });
  const a = psych('Abra [P] SVI');
  const b = psych('Duskull [P] SFA');
  const darkness = {
    fullName: 'Darkrai', id: 99, superType: TYPE.SuperType.POKEMON,
    stage: TYPE.Stage.BASIC, cardType: [TYPE.CardType.DARKNESS]
  };
  const evolution = {
    fullName: 'Dusclops', id: 98, superType: TYPE.SuperType.POKEMON,
    stage: TYPE.Stage.STAGE_1, cardType: [TYPE.CardType.PSYCHIC]
  };
  const owner = {
    id: 100, deck: {cards: opts.cards ?? [b, darkness, evolution, a]},
    bench: Array.from({length: 5}, (_, index) => ({
      cards: index < (opts.filled ?? 0) ? [psych('Benched' + index)] : []
    }))
  };
  const state = {game: 'mock'};
  class ChooseCardsPrompt {
    constructor() {
      this.playerId = owner.id;
      this.result = undefined;
      this.cards = owner.deck;
      this.message = TYPE.GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH;
      this.filter = {stage: TYPE.Stage.BASIC,
        cardType: [TYPE.CardType.PSYCHIC]};
      this.options = {min: 0, max: opts.max ?? 2};
    }
    validate(chosen, candidateState) {
      return candidateState === state &&
        chosen.length <= this.options.max &&
        chosen.length <= owner.bench.filter(x => x.cards.length === 0).length &&
        chosen.every(x => this.cards.cards.includes(x) &&
          x.superType === TYPE.SuperType.POKEMON &&
          x.stage === TYPE.Stage.BASIC &&
          x.cardType.includes(TYPE.CardType.PSYCHIC));
    }
  }
  return {owner,prompt:new ChooseCardsPrompt(),state,a,b};
}

test('native proxy printing and owner-deck canonical two-card choice', () => {
  assert.equal(TELEPATH, 'Telepath [P] Energy M3');
  const f = fixture();
  assert.deepEqual(chooseTelepathicBasics(
    f.prompt, f.owner, TYPE, f.state).map(x => x.fullName),
  ['Abra [P] SVI','Duskull [P] SFA']);
});

test('bench contention limits choice, with no speculative third card', () => {
  const f = fixture({filled: 4});
  const chosen = chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state);
  assert.equal(chosen.length,1);
  assert.equal(chosen[0].fullName,'Abra [P] SVI');
});

test('empty eligible search may select zero only after authentic search opens', () => {
  const f = fixture({cards: []});
  assert.deepEqual(chooseTelepathicBasics(
    f.prompt,f.owner,TYPE,f.state), []);
});

test('full bench is a fail-closed nonproposal', () => {
  const f = fixture({filled: 5});
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
});

test('reject lookalike search with wrong owner deck, prompt owner, or message', () => {
  const f = fixture();
  f.prompt.cards = {cards: [...f.owner.deck.cards]};
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
  f.prompt.cards = f.owner.deck;
  f.prompt.playerId = -1;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
  f.prompt.playerId = f.owner.id;
  f.prompt.message = -1;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
});

test('reject non-Psychic, non-Basic, and nonoptional prompt shape', () => {
  const f = fixture();
  f.prompt.filter.cardType = [TYPE.CardType.DARKNESS];
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
  f.prompt.filter.cardType = [TYPE.CardType.PSYCHIC];
  f.prompt.filter.stage = TYPE.Stage.STAGE_1;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
  f.prompt.filter.stage = TYPE.Stage.BASIC;
  f.prompt.options.min = 1;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
  f.prompt.options.min = 0;
  f.prompt.options.max = 3;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
});

test('unopened deck cannot be traversed through a rejected root prompt', () => {
  const f = fixture();
  Object.defineProperty(f.owner.deck,'cards',{
    get() {throw new Error('unlicensed hidden deck read');}
  });
  f.prompt.message = -1;
  assert.equal(chooseTelepathicBasics(f.prompt,f.owner,TYPE,f.state),null);
});
