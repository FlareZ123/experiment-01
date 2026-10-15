'use strict';
const assert = require('node:assert/strict');
const field = require('../results/aichi-2026/full-decklists.json');

const SET_PATHS = {
  CRE: '../resources/cards/en/swsh6.json',
  JTG: '../resources/cards/en/sv9.json',
  GRI: '../resources/cards/en/sm2.json',
  SMP: '../resources/cards/en/smp.json',
  SSP: '../resources/cards/en/sv8.json',
  UPR: '../resources/cards/en/sm5.json',
  LOT: '../resources/cards/en/sm8.json',
  UNB: '../resources/cards/en/sm10.json',
  CRZ: '../resources/cards/en/swsh12pt5.json'
};

/**
 * Return source-printing cards and their printed Ability suppression exposure.
 * Input rows use exact Limitless English-display IDs for the champion.
 */
function championAbilityExposure() {
  const champion = field.decks.find(d => d.rank === 1);
  assert.ok(champion);
  const pokemon = champion.cards.filter(c => c.category === 'Pokémon');
  const printingCards = [];
  for (const item of pokemon) {
    const path = SET_PATHS[item.printing.set];
    assert.ok(path, 'Unknown set code: ' + item.printing.set);
    const printed = require(path);
    const number = item.printing.set === 'SMP' ? 'SM' + item.printing.number : item.printing.number;
    const expectedId = {
      CRE: 'swsh6', JTG: 'sv9', GRI: 'sm2', SMP: 'smp',
      SSP: 'sv8', UPR: 'sm5', LOT: 'sm8', UNB: 'sm10', CRZ: 'swsh12pt5'
    }[item.printing.set] + '-' + number;
    const card = printed.find(x => x.id === expectedId);
    assert.ok(card, 'Missing printing: ' + item.name + ' ' + expectedId);
    assert.equal(card.name, item.name);
    printingCards.push({
      printing: item.printing.set + ' ' + item.printing.number,
      name: card.name, count: item.count,
      hasRuleBox: Array.isArray(card.rules) && card.rules.length > 0,
      future: Array.isArray(card.subtypes) && card.subtypes.includes('Future'),
      abilities: (card.abilities || []).map(a => a.name)
    });
  }
  const withAbilities = printingCards.filter(c => c.abilities.length > 0);
  const suppressed = withAbilities.filter(c => c.hasRuleBox && !c.future);
  const retained = withAbilities.filter(c => !c.hasRuleBox || c.future);
  const sum = rows => rows.reduce((s, c) => s + c.count, 0);
  assert.equal(sum(printingCards), 18);
  assert.equal(sum(withAbilities), 11);
  assert.equal(sum(suppressed), 10);
  assert.equal(sum(retained), 1);
  assert.deepEqual(retained.map(c => c.name), ['Marshadow']);
  return {
    champion: champion.player,
    printingScoped: true,
    pokemonCards: sum(printingCards),
    abilityBearingCopies: sum(withAbilities),
    suppressedAbilityCopiesUnderActiveInitialization: sum(suppressed),
    retainedAbilityCopiesUnderActiveInitialization: sum(retained),
    suppressed,
    retained,
    noAbilityPrinted: printingCards.filter(c => c.abilities.length === 0),
    scope: 'Printed Ability presence and Rule Box/Future traits; actual effect value depends on gameplay, matchups and state.'
  };
}

if (require.main === module) console.log(JSON.stringify(championAbilityExposure(), null, 2));
module.exports = {championAbilityExposure};
