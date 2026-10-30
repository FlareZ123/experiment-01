'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {paperMeloettaDonkWitness}=
  require('../scripts/agent3-rank26-paper-donk-witness.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');

test('original rank26 physical card inventory supports every paper witness card',()=>{
  const d=manifest.decks.find(x=>x.rank===26);
  assert.equal(d.archetype,'Meloetta Donk');
  const copies=name=>d.cards.filter(c=>c.name===name)
    .reduce((a,c)=>a+c.count,0);
  for(const [name,minimum] of [
    ['Bunnelby',1],['Meloetta ex',1],['Tapu Koko ♢',1],
    ['Unown',1],['Exeggcute',2],['Risky Ruins',1],
    ['Damage Pump',3],['Battle Compressor',1],['Escape Rope',1],
    ['Double Colorless Energy',1],['Lightning Energy',2],
    ['Technical Machine: Crisis Punch',1]
  ])assert.ok(copies(name)>=minimum,`Source missing ${name}`);
});

test('five Exeggcute self-KOs consume three Damage Pumps and never fill Bench',()=>{
  const x=paperMeloettaDonkWitness();
  assert.equal(x.winner,'source');
  assert.equal(x.candidateTakenPrizes,5);
  assert.equal(x.sourceTakenPrizes,1);
  assert.equal(x.damage,280);
  assert.equal(x.maxBench,4);
  assert.equal(x.spent.damagePump,3);
  assert.equal(x.spent.battleCompressor,1);
  assert.equal(x.spent.riskyRuins,1);
  assert.equal(x.spent.escapeRope,1);
  assert.equal(x.spent.crisisPunch,1);
  assert.equal(x.spent.dce,1);
  const KO=x.receipts.filter(x=>x.action.startsWith('Damage Pump'));
  assert.deepEqual(KO.map(x=>x.candidatePrizes),[4,2,1]);
  assert.deepEqual(KO.map(x=>x.action.includes('2 KO')),[true,true,false]);
});

test('two distinct Tapu Energy targets, surviving board and first-turn TM',()=>{
  const x=paperMeloettaDonkWitness();
  const dance=x.receipts.find(r=>r.action.startsWith('Tapu Koko Dance'));
  assert.ok(dance);
  assert.ok(dance.sourceLostZone.includes('tapu'));
  assert.ok(dance.bench.includes('melo'));
  assert.ok(dance.bench.includes('unown'));
  assert.deepEqual(dance.sourceEnergyMelo,['Lightning']);
  const end=x.receipts.at(-1);
  assert.equal(end.active,'melo');
  assert.deepEqual(end.sourceEnergyMelo,
    ['Lightning','Double Colorless']);
  assert.equal(end.candidatePrizes,1);
  assert.equal(end.sourcePrizes,5);
  assert.ok(end.bench.includes('bunnelby'));
  assert.equal(x.receipts.length,21);
});
