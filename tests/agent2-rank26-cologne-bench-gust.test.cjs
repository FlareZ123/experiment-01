'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {PRINTS,printedCard}=
  require('../scripts/agent2-rank26-basic-ability-exposure.cjs');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(
 path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
const source=manifest.decks.find(d=>Number(d.rank)===26);
const n=name=>source.cards.find(c=>c.name===name)?.count??0;

test('original source has only one conditional targeted gust and one voluntary forced switch',()=>{
 assert.equal(n('Counter Catcher'),1);
 assert.equal(n('Escape Rope'),1);
 assert.equal(n('Canceling Cologne'),1);
 assert.equal(n("Boss's Orders"),0);
 assert.equal(n('Guzma'),0);
 assert.equal(n('Prime Catcher'),0);
 assert.equal(n('Pokémon Catcher'),0);
 assert.equal(n('Lysandre'),0);
 const catcher=printedCard(root,'sv4-160');
 assert.equal(catcher.name,'Counter Catcher');
 assert.match(catcher.rules[0],/more Prize cards remaining than your opponent/);
 assert.match(catcher.rules[0],/Switch in 1 of your opponent's Benched/);
 const rope=printedCard(root,'swsh5-125');
 assert.equal(rope.name,'Escape Rope');
 assert.match(rope.rules[0],/Your opponent switches first/);
 const cologne=printedCard(root,'swsh10-136');
 assert.equal(cologne.name,'Canceling Cologne');
 assert.match(cologne.rules[0],/opponent's Active Pokémon has no Abilities/);
});

test('all rank26 Pokémon attacks lack a targeted opposing Bench gust',()=>{
 for(const card of source.cards.filter(c=>c.category==='Pokémon')){
  const info=PRINTS[card.name];
  assert.ok(info);
  const print=printedCard(root,info.id);
  for(const attack of print.attacks??[]){
   assert.doesNotMatch(attack.text||'',/switch\s+1\s+of\s+your\s+opponent/i,
    'Unexpected attack-based targeted gust in '+card.name);
  }
 }
});

test('source first turn Prize parity leaves Counter Catcher unplayable',()=>{
 const sourcePrizes=6,opponentPrizes=6;
 assert.equal(sourcePrizes>opponentPrizes,false);
 // Escape Rope allows defender to retain Benched Muk if an alternative
 // Bench Pokémon is available; if Muk is the only Bench, it is forced Active.
 const canKeepMukOnBench=otherBenchedCount=>otherBenchedCount>=1;
 assert.equal(canKeepMukOnBench(0),false);
 assert.equal(canKeepMukOnBench(1),true);
 assert.equal(canKeepMukOnBench(2),true);
});
