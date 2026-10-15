'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { preparedRegidrago } = require('./apex-attack-action.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @param {number} copies @param {boolean} temple */
function preparedDoubleDragon(copies, temple) {
  const f = preparedRegidrago();
  const manager = initializeCards();
  const dragon = f.attacking.active;
  dragon.cards = dragon.cards.filter(card => card.name !== 'Grass Energy');
  dragon.energies.cards = [];
  for (let i = 0; i < copies; i++) {
    const energy = manager.getCardByName('Double Dragon Energy ROS');
    assert.ok(energy);
    dragon.cards.push(energy);
    dragon.energies.cards.push(energy);
  }
  if (temple) {
    const stadium = manager.getCardByName('Temple of Sinnoh ASR');
    assert.ok(stadium);
    f.defending.stadium.cards.push(stadium);
  }
  return f;
}

/** Paid Dragon attack vs 1 and 2 Double Dragon Energy and Temple of Sinnoh. */
function testDoubleDragonUnderTemple() {
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { CheckProvidedEnergyEffect } = load('game/store/effects/check-effects');
  const { CardType } = load('game/store/card/card-types');

  const one = preparedDoubleDragon(1, false);
  assert.throws(() => one.store.dispatch(new AttackAction(101, 'Apex Dragon')),
    'One Double Dragon supplies only two Energy, short of Apex GGF');

  const two = preparedDoubleDragon(2, false);
  const energyCheck = new CheckProvidedEnergyEffect(two.attacking);
  two.store.reduceEffect(two.state, energyCheck);
  const payable = energyCheck.energyMap.flatMap(entry => entry.provides);
  assert.equal(payable.length, 4);
  assert.ok(payable.every(type => type === CardType.ANY),
    'Two Double Dragon provide four Energy of any type');
  two.store.dispatch(new AttackAction(101, 'Apex Dragon'));
  const prompt = two.state.prompts.find(p => p.result === undefined && p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt, 'Two Double Dragon should pay for Apex Dragon');
  two.store.dispatch(new ResolvePromptAction(prompt.id, two.dratini.attacks[0]));
  assert.equal(two.defending.active.damage, 20, 'Paid copied Tail Snap should damage target');

  const temple = preparedDoubleDragon(2, true);
  const blockedEnergy = new CheckProvidedEnergyEffect(temple.attacking);
  temple.store.reduceEffect(temple.state, blockedEnergy);
  const provided = blockedEnergy.energyMap.flatMap(entry => entry.provides);
  assert.deepEqual(provided, [CardType.COLORLESS, CardType.COLORLESS],
    'Temple converts the two Special Energy cards to one Colorless each');
  assert.throws(() => temple.store.dispatch(new AttackAction(101, 'Apex Dragon')),
    'Temple should prevent paying typed Grass+Grass+Fire with Double Dragon');

  return {
    oneDoubleDragon: 'rejected',
    twoDoubleDragon: { payable: true, copiedDamage: two.defending.active.damage },
    twoDoubleDragonWithTemple: { payable: false, providedEnergy: 2, type: 'Colorless' },
    scope: 'Injected Active board, source effects and normal AttackAction; no complete game or player policy'
  };
}

if (require.main === module) console.log(JSON.stringify(testDoubleDragonUnderTemple(), null, 2));
module.exports = { testDoubleDragonUnderTemple };
