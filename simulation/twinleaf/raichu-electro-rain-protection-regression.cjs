'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Run one real AttackAction on a staged board with the printed damage
 * prevention of Shaymin DRI or effects-only immunity of Skeledirge SSP.
 * Each board is already established; no startup/evolution sequence is asserted.
 * @param {'Flower Curtain'|'Unaware'} protection
 * @param {boolean} corrected
 */
function runProtectionCase(protection, corrected) {
  const f = stagedRaichu(['Unit Energy LPM UPR'], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const victim = new PokemonCardList();
  const victimName = protection === 'Flower Curtain' ? 'Dratini OBF' : 'Skeledirge SSP';
  victim.cards.push(f.card(victimName));
  f.b.bench.push(victim);
  if (protection === 'Flower Curtain') {
    const support = new PokemonCardList();
    support.cards.push(f.card('Shaymin DRI'));
    f.b.bench.push(support);
  }
  for (const player of [f.a, f.b]) {
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  f.a.active.getPokemonCard().id = 1101;
  f.attached[0].id = 1102;
  victim.getPokemonCard().id = 2201;
  const resolve = () => {
    f.store.dispatch(new AttackAction(101, 'Electro Rain'));
    const events = [];
    for (let i = 0; i < 15; i++) {
      const p = f.state.prompts.find(prompt => prompt.result === undefined);
      if (!p) break;
      let choice;
      if (p.constructor.name === 'ChooseCardsPrompt') {
        choice = [...f.attached];
      } else if (p.constructor.name === 'PutDamagePrompt') {
        assert.equal(p.damage, 30);
        choice = [{target: {player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0}, damage: 30}];
      } else if (p.constructor.name === 'WaitPrompt') {
        choice = null;
      } else {
        throw new Error('Unrecognized Electro Rain prompt: ' + p.constructor.name);
      }
      assert.ok(p.validate(choice, f.state),
        'Invalid staged Electro Rain prompt ' + JSON.stringify({type:p.constructor.name,options:p.options}));
      events.push(p.constructor.name);
      f.store.dispatch(new ResolvePromptAction(p.id, choice));
    }
    assert.ok(!f.state.prompts.some(p => p.result === undefined));
    return {protection, corrected, events, damage: victim.damage};
  };
  return corrected ? withElectroRainDamageHook(resolve) : resolve();
}

function verifyProtection() {
  const curtainBaseline = runProtectionCase('Flower Curtain', false);
  const curtainFixed = runProtectionCase('Flower Curtain', true);
  const unawareBaseline = runProtectionCase('Unaware', false);
  const unawareFixed = runProtectionCase('Unaware', true);
  assert.equal(curtainBaseline.damage, 30,
    'Pinned Electro Rain incorrectly bypasses Flower Curtain attack-damage prevention');
  assert.equal(curtainFixed.damage, 0,
    'With damage semantics, Shaymin Flower Curtain prevents attacks on non-Rule-Box Bench');
  assert.equal(unawareBaseline.damage, 0,
    'Pinned Electro Rain incorrectly treats the attack damage as an effect');
  assert.equal(unawareFixed.damage, 30,
    'With damage semantics, Skeledirge Unaware must allow actual attack damage');
  return {kind:'conditional source-printed damage/effect prevention, no full game',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    curtainBaseline,curtainFixed,unawareBaseline,unawareFixed};
}

if(require.main===module)console.log(JSON.stringify(verifyProtection(),null,2));
module.exports={runProtectionCase,verifyProtection};
