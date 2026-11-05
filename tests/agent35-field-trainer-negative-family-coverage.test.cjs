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
  assert.equal(x.copiesWithPotentialRestrictionFamily,6);
  assert.equal(x.copiesWithOnlyZeroDiscardPaymentAnnotation,0);
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

test('zero-discard coverage annotations do not count as conditional restrictions',()=>{
  const catalog=new Map(gates.payment);
  catalog.set('VS Seeker PHF',
    {options:[{mode:'no-owner-hand-discard-payment',discards:0}]});
  const out=surveyFieldTrainerGates(fixture(),{
    ...gates,payment:catalog
  });
  assert.equal(out.sourceTrainerCopies,9);
  assert.equal(out.copiesWithAnyExactNegativeFamily,9);
  assert.equal(out.copiesWithPotentialRestrictionFamily,6);
  assert.equal(out.copiesWithOnlyZeroDiscardPaymentAnnotation,3);
  assert.equal(out.copiesWithoutTheseFourFamilies,0);
  assert.equal(out.perDeck[0].copiesWithOnlyZeroDiscardPaymentAnnotation,3);
  assert.equal(out.perDeck[1].copiesWithPotentialRestrictionFamily,4);
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

test('pinned 29 original sources preserve historical core and explain catalog growth',()=>{
  const {COST_BY_PRINT} =
    require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');
  const {FIRST_OWNER_TURN_ONLY} =
    require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');
  const {PRINT_RULES} =
    require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');
  const {REMOVAL_PRINTINGS} =
    require('../simulation/twinleaf/agent6-public-removal-target-certificate.cjs');
  const full=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));

  // Earlier 287-copy expected coverage used the original explicit payment
  // registrations. Keep that historical census independently testable when
  // the shared payment catalog grows with source-confirmed zero-discard cards.
  const originalPayment=new Map([...COST_BY_PRINT].filter(([,spec])=>
    spec.options.every(option=>
      option.mode!=='no-owner-hand-discard-payment')));
  const historical=surveyFieldTrainerGates(full,{
    payment:originalPayment,temporal:FIRST_OWNER_TURN_ONLY,
    prize:PRINT_RULES,removal:REMOVAL_PRINTINGS
  });
  assert.equal(historical.authenticatedSourceSixties,29);
  assert.equal(historical.sourceTrainerCopies,1035);
  assert.equal(historical.sourceDistinctNameSetPrintings,125);
  assert.equal(historical.copiesWithAnyExactNegativeFamily,287);
  assert.equal(historical.copiesWithPotentialRestrictionFamily,254);
  assert.equal(historical.copiesWithOnlyZeroDiscardPaymentAnnotation,33);
  assert.equal(historical.copiesWithoutTheseFourFamilies,748);
  assert.equal(historical.distinctPrintingsWithAnyExactNegativeFamily,18);
  assert.equal(historical.knownPaymentModeCopies,259);
  assert.equal(historical.positiveDiscardOptionCopies,184);
  assert.equal(historical.largestUnmatchedSourcePrintings[0].printing,
    'VS Seeker PHF');
  assert.equal(historical.largestUnmatchedSourcePrintings[0].physicalCopies,59);

  // The expanded exact-print catalog has 48 extra zero-owner-hand-discard
  // registrations. Their 550 physical source copies include 21 already
  // covered by another negative family, so net union coverage grows by 529.
  const addedPayment=[...COST_BY_PRINT].filter(([key])=>
    !originalPayment.has(key));
  assert.equal(addedPayment.length,48);
  assert.ok(addedPayment.every(([,spec])=>
    spec.options.length>0 &&
    spec.options.every(option=>option.discards===0 &&
      option.mode==='no-owner-hand-discard-payment')));
  const addedKeys=new Set(addedPayment.map(([key])=>key));
  const addedSourceCopies=full.decks.reduce((n,deck)=>
    n+deck.cards.reduce((m,card)=>
      m+(card.category==='Trainer' &&
        addedKeys.has(card.name+' '+card.printing.set)?card.count:0),0),0);
  assert.equal(addedSourceCopies,550);

  const current=surveyFieldTrainerGates(full);
  assert.equal(current.authenticatedSourceSixties,29);
  assert.deepEqual(current.missingOriginalRanks,[23,25,28]);
  assert.equal(current.sourceTrainerCopies,1035);
  assert.equal(current.sourceDistinctNameSetPrintings,125);
  assert.equal(current.copiesWithAnyExactNegativeFamily,816);
  assert.equal(current.copiesWithPotentialRestrictionFamily,254);
  assert.equal(current.copiesWithOnlyZeroDiscardPaymentAnnotation,562);
  assert.equal(current.copiesWithoutTheseFourFamilies,219);
  assert.equal(current.distinctPrintingsWithAnyExactNegativeFamily,64);
  assert.equal(current.knownPaymentModeCopies,809);
  assert.equal(current.positiveDiscardOptionCopies,184);
  assert.equal(current.unavoidableHandDiscardCopies,164);
  assert.equal(current.printedTurnWindowCopies,43);
  assert.equal(current.publicPrizePrerequisiteCopies,15);
  assert.equal(current.publicRemovalTargetCopies,12);
  assert.equal(current.largestUnmatchedSourcePrintings[0].printing,
    "Lillie's Determination MEG");
  assert.equal(current.largestUnmatchedSourcePrintings[0].physicalCopies,19);
  assert.equal(current.copiesWithAnyExactNegativeFamily-
    historical.copiesWithAnyExactNegativeFamily,529);
  assert.equal(addedSourceCopies-
    (current.copiesWithAnyExactNegativeFamily-
      historical.copiesWithAnyExactNegativeFamily),21);
});
