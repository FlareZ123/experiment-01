'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-enhanced-hammer-attached-special-energy-canplay-v1';

/**
 * Pinned Twinleaf a9905a76 reads opponent PokemonCardList.cards in
 * EnhancedHammer.canPlay, whereas all actual attached Energies are in
 * PokemonCardList.energies.cards. The resolved Trainer prompt already reads
 * energies.cards correctly. This pure predicate does not inspect hidden zones.
 */
function opponentHasSpecialEnergy(opponent, PlayerType, EnergyType) {
  if (!opponent || typeof opponent.forEachPokemon !== 'function') return false;
  let found = false;
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, cardList => {
    if (cardList?.energies?.cards?.some(card =>
      card?.energyType === EnergyType.SPECIAL)) found = true;
  });
  return found;
}

/**
 * Reversible research-side paper correctness hook. It does NOT select an Item
 * action or solve its two owner-visible native prompts. No upstream file edit.
 * Dependencies can be supplied by a fake Store/unit test without compiled TS.
 * Caller must hold the synchronous patch scope; never use across async work.
 */
function withPaperEnhancedHammerCanPlay(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const { EnhancedHammer } = deps.EnhancedHammer ?
    { EnhancedHammer: deps.EnhancedHammer } :
    require(path.join(output,
      'sets/10-scarlet-and-violet/set-twilight-masquerade/enhanced-hammer'));
  const runtime = deps.runtime ?? require(path.join(output, 'game'));
  const { StateUtils, PlayerType, EnergyType } = runtime;
  assert.equal(typeof StateUtils?.getOpponent, 'function');
  assert.notEqual(PlayerType?.TOP_PLAYER, undefined);
  assert.notEqual(EnergyType?.SPECIAL, undefined);
  const proto = EnhancedHammer.prototype;
  const original = Object.getOwnPropertyDescriptor(proto, 'canPlay');
  assert.equal(typeof original?.value, 'function');
  const audit = {
    version: VERSION, inspected: 0, specialAttached: 0,
    playable: 0, paperQualifiedGames: 0, nativePromptsVerified: false
  };
  function corrected(store, state, player) {
    audit.inspected++;
    const opponent = StateUtils.getOpponent(state, player);
    const viable = opponentHasSpecialEnergy(opponent, PlayerType, EnergyType);
    if (viable) { audit.specialAttached++; audit.playable++; }
    return viable;
  }
  Object.defineProperty(proto, 'canPlay', { ...original, value: corrected });
  try { return { result: execute(), audit }; }
  finally {
    assert.strictEqual(proto.canPlay, corrected,
      'Another hook modified Enhanced Hammer canPlay during the exclusive scope');
    Object.defineProperty(proto, 'canPlay', original);
  }
}
module.exports = { VERSION, opponentHasSpecialEnergy, withPaperEnhancedHammerCanPlay };
