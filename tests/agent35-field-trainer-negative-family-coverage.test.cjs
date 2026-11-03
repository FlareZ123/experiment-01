'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {surveyFieldTrainerGates}=
  require('../scripts/agent35-field-trainer-negative-family-coverage.cjs');

function trainer(name,set,count){
  return {category:'Trainer',name,count,
    printing:{set,number:'1',language:'en'}};
}
function energy(count){
  return {category:'Energy',name:'Psychic Energy',count,
    printing:{set:'MEE',number:'13',language:'en'}};
}
function fixture(){
  return {source:'fixture',missing_full_lists:[{rank:23}],
    decks:[
      {rank:1,archetype:'Synthetic A',cards:[
        trainer('Quick Ball','FST',2),trainer('VS Seeker','PHF',3),energy(55)]},
      {rank:2,archetype:'Synthetic B',cards:[
        trainer('Optional Fee','ONE',1),trainer('First Turn','ONE',1),
        trainer('Prize Gate','ONE',1),trainer('Tool Target','ONE',1),
        energy(56)]}
    ]};
}
const gates={
  payment:new Map([
    ['Quick Ball FST',{options:[{discards:1}]}],
    ['Optional Fee ONE',{options:[{discards:0},{discards:2}]}]
  ]),
  temporal:{'First Turn ONE':{}},
  prize:{'Prize Gate ONE':{}},
  removal:{'Tool Target ONE':{}}
};

test('source-first copy weights and distinct source name+set keys',()=>{
  const x=surveyFieldTrainerGates(fixture(),gates);
  assert.equal(x.sourceTrainerCopies,9);
  assert.equal(x.sourceDistinctNameSetPrintings,6);
  assert.equal(x.copiesWithAnyExactNegativeFamily,6);
  assert.equal(x.copiesWithoutTheseFourFamilies,3);
  assert.equal(x.knownPaymentModeCopies,3);
  assert.equal(x.positiveDiscardOptionCopies,3);
  assert.equal(x.unavoidableHandDiscardCopies,2);
  assert.equal(x.printedTurnWindowCopies,1);
  assert.equal(x.publicPrizePrerequisiteCopies,1);
  assert.equal(x.publicRemovalTargetCopies,1);
  assert.equal(x.authenticatedSourceSixties,2);
  assert.deepEqual(x.missingOriginalRanks,[23]);
  assert.equal(x.perDeck[0].copiesWithoutTheseFourFamilies,3);
  assert.equal(x.largestUnmatchedSourcePrintings[0].printing,'VS Seeker PHF');
  assert.equal(x.negativeOnly,true);
});

test('prevent duplicate ranks, non-60 lists and incorrect source printing language',()=>{
  const source=fixture();
  source.decks[1].rank=1;
  assert.throws(()=>surveyFieldTrainerGates(source,gates),/Duplicate/);
  source.decks[1].rank=2;
  source.decks[1].cards[4].count=55;
  assert.throws(()=>surveyFieldTrainerGates(source,gates),/exactly 60/);
  source.decks[1].cards[4].count=56;
  source.decks[0].cards[0].printing.language='ja';
  assert.throws(()=>surveyFieldTrainerGates(source,gates),/en/);
});

test('pinned 29 authenticated original source lists have exactly reproducible gate denominators',()=>{
  const full=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const x=surveyFieldTrainerGates(full);
  assert.equal(x.authenticatedSourceSixties,29);
  assert.deepEqual(x.missingOriginalRanks,[23,25,28]);
  assert.equal(x.sourceTrainerCopies,1035);
  assert.equal(x.sourceDistinctNameSetPrintings,125);
  assert.equal(x.copiesWithAnyExactNegativeFamily,287);
  assert.equal(x.copiesWithoutTheseFourFamilies,748);
  assert.equal(x.distinctPrintingsWithAnyExactNegativeFamily,18);
  assert.equal(x.knownPaymentModeCopies,259);
  assert.equal(x.positiveDiscardOptionCopies,184);
  assert.equal(x.printedTurnWindowCopies,43);
  assert.equal(x.publicPrizePrerequisiteCopies,15);
  assert.equal(x.publicRemovalTargetCopies,12);
  assert.equal(x.largestUnmatchedSourcePrintings[0].printing,'VS Seeker PHF');
  assert.equal(x.largestUnmatchedSourcePrintings[0].physicalCopies,59);
});
