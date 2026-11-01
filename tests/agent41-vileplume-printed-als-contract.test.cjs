'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');

/** @param {string} set @param {string} number @returns {object} */
function printing(set,number){
  const cards=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/cards/en',set+'.json'),'utf8'));
  return cards.find(c=>c.id===set+'-'+number);
}

test('original Bunnelby PRC121 has Ω Barrage Ancient Trait and is Basic',()=>{
  const b=printing('xy5','121');
  assert.equal(b.name,'Bunnelby');
  assert.ok(b.subtypes.includes('Basic'));
  assert.equal(b.ancientTrait.name,'Ω Barrage');
  assert.match(b.ancientTrait.text,/attack twice a turn/i);
  assert.equal(b.abilities,undefined);
});

test('Guzma & Hala CEC193 and Tag Call CEC206 form a conditional connector',()=>{
  const g=printing('sm12','193');
  const tag=printing('sm12','206');
  assert.equal(g.name,'Guzma & Hala');
  assert.ok(g.subtypes.includes('Supporter'));
  assert.ok(g.subtypes.includes('TAG TEAM'));
  assert.ok(g.rules.some(x=>x.includes('Stadium')));
  assert.ok(g.rules.some(x=>/discard 2 other cards/.test(x)&&
    /Pokémon Tool/.test(x)&&/Special Energy/.test(x)));
  assert.equal(tag.name,'Tag Call');
  assert.ok(tag.subtypes.includes('Item'));
  assert.match(tag.rules.join(' '),/up to 2 TAG TEAM cards/);
});

test('TM Evolution PAR178 and Jet Energy PAL190 have printed attack/energy line',()=>{
  const tm=printing('sv4','178');
  const jet=printing('sv2','190');
  assert.equal(tm.name,'Technical Machine: Evolution');
  assert.ok(tm.subtypes.includes('Pokémon Tool'));
  assert.equal(tm.attacks.length,1);
  assert.equal(tm.attacks[0].name,'Evolution');
  assert.deepEqual(tm.attacks[0].cost,['Colorless']);
  assert.match(tm.attacks[0].text,/up to 2 of your Benched Pokémon/);
  assert.match(tm.rules.join(' '),/discard it at the end of your turn/);
  assert.equal(jet.name,'Jet Energy');
  assert.ok(jet.subtypes.includes('Special'));
  assert.match(jet.rules.join(' '),/provides Colorless Energy/);
  assert.match(jet.rules.join(' '),/attach this card from your hand to 1 of your Benched Pokémon/);
});
