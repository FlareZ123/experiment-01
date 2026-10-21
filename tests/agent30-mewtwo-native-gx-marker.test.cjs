'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

test('pinned native Miraculous Duo-GX lacks gxAttack flag despite printed GX text',()=>{
  const manager=initializeCards();
  const mewtwo=manager.getCardByName('Mewtwo & Mew-GX UNM');
  const gengar=manager.getCardByName('Gengar & Mimikyu-GX TEU');
  assert.ok(mewtwo);
  assert.ok(gengar);
  const miraculous=mewtwo.attacks.find(a=>a.name==='Miraculous Duo-GX');
  const horror=gengar.attacks.find(a=>a.name==='Horror House-GX');
  assert.ok(miraculous);
  assert.ok(horror);
  assert.equal(miraculous.gxAttack===true,false,
    'Revisit research alias if upstream fixes native metadata');
  assert.equal(horror.gxAttack,true,
    'Comparator printed GX donor must remain flagged');
  assert.ok(miraculous.text.includes('GX attack'));
});
