'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {loadPrintingIndex,classifyPrintedPokemon,analyzeField} =
  require('../scripts/aichi-printed-defence-exposure.cjs');

const root = path.join(__dirname,'..');
const index = loadPrintingIndex(root);
const source = JSON.parse(fs.readFileSync(
  path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
const field = analyzeField(source, index);
const rank = n => field.find(x => x.rank === n);
const printed = (code,number,name) => {
  const card = index.get([code,String(number),name].join('\u0000'));
  assert.ok(card, code + '/' + number + ' ' + name + ' must exist');
  return classifyPrintedPokemon(card);
};

test('29 source Pokémon inventories resolve exact English printings, with no invented missing ranks', () => {
  assert.deepEqual(field.map(x => x.rank),
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,26,27,29,30,31,32]);
  for(const row of field) assert.ok(row.pokemonPrintedCount >= 4);
});

test('three exact Iron Thorns print inventories present the ex+Future+printed-Ability case', () => {
  for(const r of [6,24,29]) {
    const p=rank(r).pokemon;
    assert.equal(p.length,1);
    assert.equal(p[0].name,'Iron Thorns ex');
    assert.equal(p[0].count,4);
    assert.deepEqual(p[0].barrier,
      {crustleExAbility:true,mimikyuSafeguard:true,vulpixPostSnowMirage:true});
  }
});

test('Mew VMAX no Ability and printed bypass differ from live source Energy access', () => {
  const mew=printed('FST',114,'Mew VMAX');
  assert.equal(mew.printedAbility,false);
  assert.equal(mew.pokemonV,true);
  assert.deepEqual(mew.ignoresDefenderEffects,['Max Miracle']);
  const exactCard=index.get(['FST','114','Mew VMAX'].join('\u0000'));
  const max=exactCard.attacks.find(a=>a.name==='Max Miracle');
  assert.deepEqual(max.cost,['Psychic','Psychic']);
  const dce=index.get(['SUM','136','Double Colorless Energy'].join('\u0000'));
  assert.ok(dce);
  assert.match(dce.rules.join(' '),/ColorlessColorless Energy/i);
  assert.deepEqual(source.decks.find(d=>d.rank===5).cards
    .filter(c=>c.category==='Energy').map(c=>[c.name,c.count,c.printing.set,String(c.printing.number)]),
    [['Double Colorless Energy',4,'SUM','136']]);
  assert.equal(rank(5).pokemon.find(p => p.name==='Mew VMAX').count,3);
});

test('Regidrago, Absol and Dusknoir defeat naive rule-box-only protection inference', () => {
  const reg=printed('SIT',136,'Regidrago VSTAR');
  const absol=printed('MEG',86,'Mega Absol ex');
  const dusk=printed('PRE',37,'Dusknoir');
  assert.equal(reg.printedAbility,true);
  assert.equal(reg.pokemonV,true);
  assert.equal(absol.printedAbility,false);
  assert.equal(absol.ex,true);
  assert.deepEqual(absol.knockoutEffects,['Terminal Period']);
  assert.deepEqual(dusk.abilityCounterEffects,['Cursed Blast']);
  assert.ok(rank(31).effectOrCounterExceptions.some(p=>p.name==='Dusknoir'));
});

test('Garbodor Ability suppression and copied attack exceptions remain explicit threats', () => {
  assert.deepEqual(printed('BKP',57,'Garbodor').abilitySuppression,['Garbotoxin']);
  const drag=printed('TWM',130,'Dragapult ex');
  assert.deepEqual(drag.damageCounterEffects,['Phantom Dive']);
  const regidragoRanks=[10,12,13,14,18,20,21,27,32];
  assert.deepEqual(field.filter(x=>x.apexCanCopyShred).map(x=>x.rank),regidragoRanks);
  for (const r of regidragoRanks) {
    assert.ok(rank(r).pokemon.some(p=>p.name==='Regidrago VSTAR'));
    assert.ok(rank(r).effectOrCounterExceptions.some(p=>p.name==='Dragapult ex'));
  }
});


test('all nine Apex-to-Shred rosters include Dragon Energy and mixed natural Energy substrate', () => {
  const drago = index.get(['SIT','136','Regidrago VSTAR'].join('\u0000'));
  assert.deepEqual(drago.attacks.find(a => a.name === 'Apex Dragon').cost,
    ['Grass','Grass','Fire']);
  const doubleDragon = index.get(['ROS','97','Double Dragon Energy'].join('\u0000'));
  assert.ok(doubleDragon);
  assert.match(doubleDragon.rules.join(' '), /provides every type of Energy.*2 Energy at a time/i);
  for (const r of [10,12,13,14,18,20,21,27,32]) {
    const rows = source.decks.find(d => d.rank === r).cards;
    const count = name => rows.filter(c => c.name === name)
      .reduce((sum,c) => sum + c.count,0);
    assert.ok(count('Double Dragon Energy') >= 3, 'rank ' + r);
    assert.ok(count('Grass Energy') >= 2, 'rank ' + r);
    assert.ok(count('Fire Energy') >= 2, 'rank ' + r);
    assert.ok(count('Dialga-GX') >= 1, 'rank ' + r);
    assert.ok(count('Regidrago VSTAR') >= 3, 'rank ' + r);
  }
});


test('18 published GX supports have a printed Energy Drive attacker outside Safeguard', () => {
  const lele = index.get(['GRI','60','Tapu Lele-GX'].join('\u0000'));
  assert.ok(lele);
  assert.ok(lele.subtypes.includes('GX'));
  assert.ok(!lele.subtypes.includes('ex'));
  const attack = lele.attacks.find(a => a.name === 'Energy Drive');
  assert.deepEqual(attack.cost,['Colorless','Colorless']);
  assert.equal(attack.damage,'20×');
  assert.match(attack.text,/Energy attached to both Active Pokémon/);
  assert.deepEqual(field.filter(x=>x.tapuLeleEnergyDrive).map(x=>x.rank),
    [1,4,8,10,11,12,13,14,16,18,19,20,21,22,27,30,31,32]);
});
