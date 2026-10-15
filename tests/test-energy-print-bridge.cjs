'use strict';
const assert = require('node:assert/strict');
const { resolveVerifiedBasicMirror, MIRRORS } = require('../simulation/twinleaf/energy-print-bridge.cjs');
const EnergyType = { BASIC: 'BASIC', SPECIAL: 'SPECIAL' };
const CardType = { GRASS:'GRASS', FIRE:'FIRE', WATER:'WATER', LIGHTNING:'LIGHTNING',
  PSYCHIC:'PSYCHIC', FIGHTING:'FIGHTING', DARK:'DARK' };
const manager = { getCardByName(fullName) {
  const name = fullName.slice(0, -4), mirror = MIRRORS[name];
  return mirror && { name, set:'SVE', setNumber:mirror.destNumber,
    energyType:EnergyType.BASIC, provides:[CardType[mirror.color]], text:'' };
} };
for (const [name, mirror] of Object.entries(MIRRORS)) {
  const source = { category:'Energy', name, printing:{set:'MEE', number:mirror.sourceNumber} };
  assert.equal(resolveVerifiedBasicMirror(source,manager,{EnergyType,CardType}),name+' SVE');
  assert.equal(resolveVerifiedBasicMirror({...source,category:'Trainer'},manager,{EnergyType,CardType}),null);
}
const invalid = {getCardByName(id) {return {...manager.getCardByName(id),energyType:EnergyType.SPECIAL};}};
assert.throws(() => resolveVerifiedBasicMirror({category:'Energy',name:'Grass Energy',printing:{set:'MEE',number:'9'}},invalid,{EnergyType,CardType}),/Unsafe/);
assert.equal(resolveVerifiedBasicMirror({category:'Energy',name:'Double Colorless Energy',printing:{set:'MEE',number:'13'}},manager,{EnergyType,CardType}),null);
console.log('PASS: MEE ordinary Basic Energy bridge');
