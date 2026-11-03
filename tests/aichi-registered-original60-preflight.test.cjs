'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const {
  printed60Sha256,pinnedGitlinkSha,preflightOriginalSourcePins
}=require('../scripts/aichi-registered-original60-preflight.cjs');

const ROOT=path.resolve(__dirname,'..');
const pins=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/registrations/agent47-rank26-original-source-native-pins-v1.json'),'utf8'));
const seedPlan=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/registrations/agent47-rank26-natural-owner-seed-plan-v2.json'),'utf8'));
const roster=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const admission=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/original-printed60-admission-v1.json'),'utf8'));
const same={roster,admission,gitlinkSha:pins.engineGitlinkSha};

/** @param {object} fields */
const edited=fields=>({...pins,...fields});

test('two original printed sixties and published admission agree with registered hashes',()=>{
  const receipt=preflightOriginalSourcePins(pins,same);
  assert.equal(receipt.nativeGamesExecuted,0);
  assert.equal(receipt.competitiveGamesQualified,0);
  assert.equal(receipt.sourcePrints.length,2);
  assert.deepEqual(receipt.sourcePrints.map(x=>x.rank),[26,6]);
  for(const item of pins.originalPrints){
    assert.equal(printed60Sha256(roster.decks.find(x=>x.rank===item.rank)),
      item.printed60Sha256);
  }
  assert.equal(pins.campaignId,seedPlan.campaignId);
});

test('real HEAD gitlink agrees before submodule checkout',()=>{
  assert.equal(pinnedGitlinkSha(),pins.engineGitlinkSha);
});

test('stale or substituted vendor gitlink fails closed',()=>{
  assert.throws(()=>preflightOriginalSourcePins(pins,{
    ...same,gitlinkSha:'0'.repeat(40)
  }),/gitlink drifted/);
});

test('mutated original rank26 card name fails registered digest',()=>{
  const mutant=structuredClone(roster);
  mutant.decks.find(x=>x.rank===26).cards[0].name='Wrong original Pokémon';
  assert.throws(()=>preflightOriginalSourcePins(pins,{
    ...same,roster:mutant
  }),/original rank 26 printed source drifted/);
});

test('mutated original rank6 printing identity fails registered digest',()=>{
  const mutant=structuredClone(roster);
  mutant.decks.find(x=>x.rank===6).cards[0].printing.number='999';
  assert.throws(()=>preflightOriginalSourcePins(pins,{
    ...same,roster:mutant
  }),/original rank 6 printed source drifted/);
});

test('inconsistent source admission record fails closed',()=>{
  const mutant=structuredClone(admission);
  mutant.rows.find(x=>x.rank===26).printed60Sha256='0'.repeat(64);
  assert.throws(()=>preflightOriginalSourcePins(pins,{
    ...same,admission:mutant
  }),/admission digest disagrees/);
});

test('source total 59 card copies fails physically fixed 60 check',()=>{
  const mutant=structuredClone(roster);
  mutant.decks.find(x=>x.rank===26).cards[0].count-=1;
  assert.throws(()=>preflightOriginalSourcePins(pins,{
    ...same,roster:mutant
  }),/exactly 60 printed cards/);
});

test('duplicate original print identity is rejected',()=>{
  assert.throws(()=>preflightOriginalSourcePins(edited({
    originalPrints:[pins.originalPrints[0],pins.originalPrints[0]]
  }),same),/repeated original source rank/);
});

test('source/opponent labels must be distinct',()=>{
  const duplicateRole=[
    {...pins.originalPrints[0],role:'source'},
    {...pins.originalPrints[1],role:'source'}
  ];
  assert.throws(()=>preflightOriginalSourcePins(edited({
    originalPrints:duplicateRole
  }),same),/2 !== 1/);
});

test('unregistered output path is rejected rather than placed outside artifact root',()=>{
  assert.throws(()=>preflightOriginalSourcePins(edited({
    outputFilename:'../arbitrary.json'
  }),same),/regular expression/);
});

test('output schema and energy-independent campaign identity stay versioned',()=>{
  assert.equal(pins.maxActions,120);
  assert.equal(pins.policyProfile,'rank26-autonomous-cologne-pump-propagation-v3');
  assert.equal(pins.outputFilename,'agent47-rank26-natural-owner-24-paired.json');
  assert.equal(seedPlan.expectedNativeAttempts,48);
});
