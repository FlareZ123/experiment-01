'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

test('source Mega Lopunny paper printing and native registration remain separately visible',()=>{
  const archive=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../resources/cards/en/me2.json'),'utf8'));
  const bunny=archive.find(card=>card.id==='me2-83');
  const mega=archive.find(card=>card.id==='me2-84');
  assert.equal(bunny.name,'Buneary');
  assert.equal(mega.name,'Mega Lopunny ex');
  assert.equal(mega.evolvesFrom,'Buneary');
  assert.equal(mega.hp,'330');
  const gale=mega.attacks.find(a=>a.name==='Gale Thrust');
  assert.deepEqual(gale.cost,['Colorless']);
  assert.equal(gale.damage,'60+');
  const manager=initializeCards();
  const required=['Buneary PFL','Mega Lopunny ex PFL']
    .map(name=>({name,registered:!!manager.getCardByName(name)}));
  const related=[...new Set(manager.getAllCards()
    .filter(card=>/Buneary|Lopunny/i.test(card.name))
    .map(card=>card.name))].sort();
  console.log('SENTINEL_NATIVE_PRINTING_COVERAGE',JSON.stringify({
    sourceCardIds:[bunny.id,mega.id],required,related,
    nativeAttackFixturePossible:required.every(row=>row.registered),
    paperLegalityCertified:false,competitiveGames:0
  }));
});
