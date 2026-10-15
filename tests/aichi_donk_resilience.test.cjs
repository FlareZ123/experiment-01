'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const {
  numberKey, printingResolver, barePsychicDamage, classifyBasic, defendAgainstDonk,
} = require('../scripts/aichi_donk_resilience.cjs');

test('printing normalization preserves exact set-number references', () => {
  assert.equal(numberKey('SWSH108'), '108');
  assert.equal(numberKey('SM065'), '65');
  assert.equal(numberKey('0004'), '4');
});

test('Psychic Crisis Punch damage follows printed Weakness and Resistance', () => {
  assert.equal(barePsychicDamage({weaknesses: [{type:'Psychic',value:'×2'}]}), 560);
  assert.equal(barePsychicDamage({resistances: [{type:'Psychic',value:'-30'}]}), 250);
  assert.equal(barePsychicDamage({weaknesses: [{type:'Fighting',value:'×2'}]}), 280);
});

test('known printed solo-Active defense classes distinguish HP and Abilities', () => {
  const mega = classifyBasic({
    name:'Mega Kangaskhan ex',subtypes:['Basic'],hp:'300',
    weaknesses:[{type:'Fighting',value:'×2'}],
  });
  assert.equal(mega.survivesBareHit,true);
  assert.deepEqual(mega.activeProtection,[]);
  const thorns = classifyBasic({
    name:'Iron Thorns ex',subtypes:['Basic'],hp:'230',
    abilities:[{name:'Initialization'}],
  });
  assert.equal(thorns.survivesBareHit,false);
  assert.equal(thorns.activeProtection.length,1);
  const empoleon = classifyBasic({
    name:'Empoleon V',subtypes:['Basic'],hp:'210',
    abilities:[{name:"Emperor's Eyes"}],
  });
  assert.equal(empoleon.activeProtection.length,0);
});

test('real Aichi set/number references resolve 29 full lists without fallback', () => {
  const root = path.resolve(__dirname,'..');
  const resolve = printingResolver(root);
  const mega = resolve({set:'MEG',number:'104'});
  assert.equal(mega.name,'Mega Kangaskhan ex');
  assert.equal(mega.hp,'300');
  const clefairy = resolve({set:'JTG',number:'56'});
  assert.equal(clefairy.name,"Lillie's Clefairy ex");
  const data = JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const rows = defendAgainstDonk(data.decks,resolve);
  assert.equal(rows.length,28);
  assert.equal(rows.find(row=>row.rank===6).abilityDependent,4);
  assert.equal(rows.find(row=>row.rank===18).hpSafe,1);
  assert.ok(rows.find(row=>row.rank===7).abilityDependent>=3);
  assert.ok(Math.abs(rows.find(row=>row.rank===1).plainVulnerabilityPost - 0.3750679602308215)<1e-12);
});
