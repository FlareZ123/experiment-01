'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  opponentHasSpecialEnergy, withPaperEnhancedHammerCanPlay
} = require('../../simulation/twinleaf/agent5-enhanced-hammer-paper-canplay-hook.cjs');

class EnhancedHammer {
  canPlay() { return false; } // Pinned bug: looks in cardList.cards, not energies.
}
const runtime = {
  EnergyType: { BASIC: 'BASIC', SPECIAL: 'SPECIAL' },
  PlayerType: { TOP_PLAYER: 'TOP_PLAYER' },
  StateUtils: { getOpponent: state => state.opponent }
};
const energy = type => ({ energyType: type });
const pokemon = (...energies) => ({
  cards: [energy('SPECIAL')], // Deliberate decoy for incorrect .cards check.
  energies: { cards: energies }
});
const opponent = cards => ({
  forEachPokemon(role, cb) {
    assert.equal(role, 'TOP_PLAYER');
    cards.forEach(cardList => cb(cardList));
  }
});
const args = (cards, trial) => {
  const state = { opponent: opponent(cards) };
  return withPaperEnhancedHammerCanPlay(() => trial(state),
    { EnhancedHammer, runtime });
};

test('only attached Special Energy makes Enhanced Hammer playable', () => {
  const result = args([pokemon(energy('BASIC')),pokemon(energy('SPECIAL'))],
    state => new EnhancedHammer().canPlay(null,state,{}));
  assert.equal(result.result,true);
  assert.equal(result.audit.specialAttached,1);
  assert.equal(result.audit.paperQualifiedGames,0);
});
test('no false playability from Pokemon card list or basic attached Energies', () => {
  const result = args([pokemon(energy('BASIC')),pokemon()],
    state => new EnhancedHammer().canPlay(null,state,{}));
  assert.equal(result.result,false);
  assert.equal(result.audit.playable,0);
});
test('empty opponent board never produces a false positive', () => {
  assert.equal(opponentHasSpecialEnergy(opponent([]),
    runtime.PlayerType,runtime.EnergyType),false);
});
test('hook restores exact original descriptor after normal scope', () => {
  const previous = Object.getOwnPropertyDescriptor(EnhancedHammer.prototype,'canPlay');
  args([pokemon(energy('SPECIAL'))],
    state => new EnhancedHammer().canPlay(null,state,{}));
  assert.deepEqual(Object.getOwnPropertyDescriptor(EnhancedHammer.prototype,'canPlay'),previous);
});
test('hook also restores when wrapped work throws', () => {
  const before=EnhancedHammer.prototype.canPlay;
  assert.throws(() => args([pokemon(energy('SPECIAL'))], () => {
    throw new Error('test stop');
  }),/test stop/);
  assert.strictEqual(EnhancedHammer.prototype.canPlay,before);
});
