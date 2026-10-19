'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {source,TARGETS,audit,printedCard}=
  require('../scripts/aichi-unrepresented-mechanics.cjs');

test('all five unrepresented archetypes have exact printed source mechanisms',()=>{
  const {manifest,sets}=source();
  const result=audit(manifest,sets);
  assert.deepEqual(result.sourceRanks,[9,15,19,30,31]);
  assert.equal(result.rows.length,5);
  assert.deepEqual(result.rows.map(row=>row.physicalCards),[60,60,60,60,60]);
  assert.deepEqual(result.rows.map(row=>row.mechanics.length),
    [4,4,3,4,6]);
  assert.ok(result.rows.every(row=>
    row.mechanics.every(m=>m.count>=1&&m.printedText.length>0)));
  assert.equal(result.competitiveQualifiedGames,0);
});

test('same-name Vileplume and Dusknoir require distinct source-print identities',()=>{
  const {manifest,sets}=source();
  const result=audit(manifest,sets);
  const vile=result.rows.find(row=>row.rank===15).mechanics;
  assert.equal(vile[0].mechanic,'Irritating Pollen');
  assert.equal(vile[1].mechanic,'Disgusting Pollen');
  assert.notEqual(vile[0].printing,vile[1].printing);
  const dusk=result.rows.find(row=>row.rank===31).mechanics;
  assert.equal(dusk[1].mechanic,'Cursed Blast');
  assert.equal(dusk[2].mechanic,'Sinister Hand');
  assert.notEqual(dusk[1].printing,dusk[2].printing);
});

test('source-print swap is rejected even if its Pokémon name still matches',()=>{
  const {manifest,sets}=source();
  const copy=structuredClone(manifest);
  const target=copy.decks.find(deck=>deck.rank===15).cards.find(row=>
    row.name==='Vileplume'&&row.printing.set==='AOR');
  target.printing={...target.printing,set:'BUS',number:'6'};
  assert.throws(()=>audit(copy,sets),/Source missing printing Vileplume AOR 3/);
});

test('literal source attack bounds keep printed Energy/damage conventions',()=>{
  const {manifest,sets}=source();
  const bounds=audit(manifest,sets).boundedPrintedArithmetic;
  assert.deepEqual(bounds,{
    rank19PhysicalBasicEnergyCards:9,
    rank19BellowingThunderFiveBasicDiscards:350,
    rank19MinDiscardsFor320HP:5,
    rank30RondoAtTenCombinedBenched:220,
    rank30RondoAtSixteenCombinedBenched:340,
    rank30MinCombinedBenchedToReach320:15,
    rank9SableyeCrazyClawsAtSixCounters:370,
    rank15GaleThrustAfterBenchToActive:230
  });
  assert.equal(printedCard(sets,{set:'PRE',number:'37'}).name,'Dusknoir');
  assert.equal(TARGETS.length,5);
});
