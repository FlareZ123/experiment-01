'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {test} = require('node:test');
const {
  hasExplicitGoFirstPermission, auditCardDirectory
} = require('../scripts/aichi-first-player-supporter-exceptions.cjs');

const make = (name, text) => ({
  id:'synthetic',name,supertype:'Trainer',subtypes:['Supporter'],rules:[text]
});

test('explicit authorization requires go-first and first-turn Supporter wording', () => {
  assert.equal(hasExplicitGoFirstPermission(make('Carmine',
    'If you go first, you may use this card during your first turn.')),true);
  assert.equal(hasExplicitGoFirstPermission(make('Beauty',
    'If you go first, you may play this card during your first turn.')),true);
  assert.equal(hasExplicitGoFirstPermission(make('Wally',
    'You can use this card during your first turn.')),false);
  assert.equal(hasExplicitGoFirstPermission(make('Jasmine',
    "If you go second and it's your first turn, search for 5 Metal Pokémon.")),false);
  assert.equal(hasExplicitGoFirstPermission({
    ...make('Fake', 'If you go first, you may play this card during your first turn.'),
    subtypes:['Item']
  }),false);
});

test('full provided card pool contains exactly three explicit go-first Supporter names', () => {
  const result = auditCardDirectory(path.resolve(__dirname,
    '../resources/cards/en'));
  assert.ok(result.sourceFiles >= 100);
  assert.ok(result.supporterPrintings >= 1000);
  assert.deepEqual(result.distinctNames,
    ['Beauty','Carmine',"Team Rocket's Proton"]);
  assert.ok(result.permissionPrintings.every(p =>
    result.distinctNames.includes(p.name)));
  assert.ok(result.firstTurnLanguagePrintings.some(p => p.name === 'Wally'));
  assert.ok(result.firstTurnLanguagePrintings.some(p => p.name === 'Lillie'));
});
