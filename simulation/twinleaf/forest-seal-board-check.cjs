'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const out = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const mod = name => require(path.join(out, name));

/** Assert real board power discovery across Stadium and Tool changes. */
function checkBoardAbilities() {
  const manager = initializeCards();
  const {Store} = mod('game/store/store');
  const {Player} = mod('game/store/state/player');
  const {PokemonCardList} = mod('game/store/state/pokemon-card-list');
  const {CheckPokemonPowersEffect} = mod('game/store/effects/check-effects');
  const {GamePhase} = mod('game/store/state/state');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; b.id = 202;
  state.players = [a, b];
  state.activePlayer = 0;
  state.turn = 2;
  state.phase = GamePhase.PLAYER_TURN;
  const v = manager.getCardByName('Shadow Rider Calyrex V CRE');
  const vmax = manager.getCardByName('Shadow Rider Calyrex VMAX CRE');
  const stone = manager.getCardByName('Forest Seal Stone SIT');
  const peak = manager.getCardByName('Path to the Peak CRE');
  assert.ok(v && vmax && stone && peak, 'Expected pinned cards');
  a.active.cards.push(v);
  a.active.tools.push(stone);
  const slot = new PokemonCardList();
  slot.cards.push(vmax);
  a.bench.push(slot);
  const abilities = pokemon => {
    const e = new CheckPokemonPowersEffect(a, pokemon);
    store.reduceEffect(state, e);
    return e.powers.map(p => p.name);
  };
  assert.ok(abilities(v).includes('Star Alchemy'));
  assert.ok(abilities(vmax).includes('Underworld Door'));
  b.stadium.cards.push(peak);
  assert.ok(abilities(v).includes('Star Alchemy'), 'Tool Ability survives Path');
  assert.ok(!abilities(vmax).includes('Underworld Door'), 'VMAX Ability suppressed');
  b.stadium.cards.length = 0;
  assert.ok(abilities(vmax).includes('Underworld Door'));
  a.active.tools.length = 0;
  assert.ok(!abilities(v).includes('Star Alchemy'));
  return {passed:true, scenario:'Tool/Path in-play power discovery', engine:'a9905a76'};
}
if (require.main === module) console.log(JSON.stringify(checkBoardAbilities(), null, 2));
module.exports = {checkBoardAbilities};
