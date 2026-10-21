'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {planBombRecipient} =
  require('../simulation/twinleaf/rank4-raichu-bomb-recipient-policy.cjs');

const types = {
  energySuperType: 'energy', ownPlayer: 1,
  activeSlot: 2, attachMessage: 77
};
/** @param {string} fullName @returns {object} */
const energy = fullName => ({fullName, superType: 'energy'});
function fixture() {
  const cards = [
    energy('Counter Energy CIN'), energy('Unit Energy LPM UPR'),
    energy('Reversal Energy PAL'), energy('Counter Energy CIN'),
    energy('Double Colorless Energy XY')
  ];
  const player = {
    id: 101,
    active: {getPokemonCard: () => ({fullName: 'Alolan Raichu UNM'})},
    bench: [{getPokemonCard: () => ({fullName: 'Electrode-GX CES'})}],
    discard: {cards}
  };
  const prompt = {
    playerId: player.id, cardList: player.discard,
    message: types.attachMessage, playerType: types.ownPlayer,
    slots: [types.activeSlot], options: {
      min: 3, max: 5, blocked: [], blockedTo: []
    },
    validate(result) {
      return result.length === 3 && result.every(row =>
        cards.includes(row.card) &&
        row.to.player === types.ownPlayer &&
        row.to.slot === types.activeSlot &&
        row.to.index === 0);
    }
  };
  return {player, prompt, cards};
}
test('chooses real owner-discard Energy identities for Active Raichu', () => {
  const {player, prompt, cards} = fixture();
  const result = planBombRecipient(prompt, player, types);
  assert.deepEqual(result.map(x => x.card), [cards[2], cards[0], cards[3]]);
  assert.ok(result.every(x => x.to.index === 0));
  assert.equal(new Set(result.map(x => x.card)).size, 3);
});
test('respects mandatory count, blocked cards and recipient restrictions', () => {
  const {player, prompt, cards} = fixture();
  prompt.options.blocked = [2];
  assert.deepEqual(planBombRecipient(prompt, player, types).map(x => x.card),
    [cards[0], cards[3], cards[1]]);
  prompt.options.blockedTo = [
    {player: types.ownPlayer, slot: types.activeSlot, index: 0}
  ];
  assert.equal(planBombRecipient(prompt, player, types), null);
  prompt.options.blockedTo = [];
  prompt.options.min = 6;
  assert.equal(planBombRecipient(prompt, player, types), null);
  prompt.options.min = 0;
  assert.equal(planBombRecipient(prompt, player, types), null);
  prompt.options.min = 3;
  prompt.options.max = 4;
  assert.equal(planBombRecipient(prompt, player, types), null);
});
test('does not intercept other prompts or non-Raichu recipients', () => {
  const {player, prompt} = fixture();
  prompt.message = 78;
  assert.equal(planBombRecipient(prompt, player, types), null);
  prompt.message = types.attachMessage;
  player.active.getPokemonCard = () => ({fullName: 'Crobat V DAA'});
  assert.equal(planBombRecipient(prompt, player, types), null);
  player.active.getPokemonCard = () => ({fullName: 'Alolan Raichu UNM'});
  player.bench = [];
  assert.equal(planBombRecipient(prompt, player, types), null);
});
test('recipient policy never consults any opponent or hidden owner zones', () => {
  const {player, prompt} = fixture();
  for (const zone of ['hand', 'deck', 'prizes', 'opponent']) {
    Object.defineProperty(player, zone, {
      get() {throw Error('Illegal hidden-zone access');}
    });
  }
  assert.equal(planBombRecipient(prompt, player, types).length, 3);
});
