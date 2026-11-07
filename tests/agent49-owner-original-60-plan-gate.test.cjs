'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json');
const {preflightOriginal60Plan}=
  require('../simulation/twinleaf/owner-original-60-plan-gate.cjs');

/** Source roster's exact named English-display printing inventory. */
function sourcePrintings(rank){
  const deck=roster.decks.find(d=>d.rank===rank);
  assert.ok(deck);
  const original60=deck.cards.flatMap(c=>
    Array(c.count).fill(c.name+' '+c.printing.set));
  assert.equal(original60.length,60);
  return original60;
}

test('original ranks 9/17/30 veto Fog at K0 even with a payable Box hand',()=>{
  const required=[{role:'secret-box-item-search-target',
    acceptablePrintings:['Fog Crystal CRE'],copies:1}];
  for(const rank of [9,17,30]){
    const result=preflightOriginal60Plan(sourcePrintings(rank),required);
    assert.equal(result.status,'blocked-impossible-original60');
    assert.equal(result.blockedBy.length,1);
    assert.equal(result.blockedBy[0].original60Copies,0);
    assert.equal(result.opponentHiddenCardsUsed,false);
    assert.equal(result.doesNotInspectUnsearchedDeck,true);
    assert.equal(result.qualifiedCompetitiveGames,0);
  }
});

test('original rank1/31 can have Fog but this does not certify current deck',()=>{
  const required=[{role:'fog-target',
    acceptablePrintings:['Fog Crystal CRE'],copies:1}];
  for(const rank of [1,31]){
    const result=preflightOriginal60Plan(sourcePrintings(rank),required);
    assert.equal(result.status,'not-disproven');
    assert.ok(result.required[0].original60Copies>=1);
    assert.equal(result.exactCurrentDeckMembershipCertified,false);
    assert.equal(result.nativeActionOrPromptCertified,false);
    assert.equal(result.paperLegalityCertified,false);
  }
});

test('declared equivalent printing alternatives are summed only within role',()=>{
  const original=Array(55).fill('Other A');
  original.push('Search Item A','Search Item B',
    'Basic Psychic A','Basic Psychic B','Basic Psychic B');
  const result=preflightOriginal60Plan(original,[
    {role:'search-item',acceptablePrintings:['Search Item A','Search Item B'],
      copies:2},
    {role:'energy-source',
      acceptablePrintings:['Basic Psychic A','Basic Psychic B'],
      copies:3}
  ]);
  assert.equal(result.status,'not-disproven');
  assert.equal(result.required[0].original60Copies,2);
  assert.equal(result.required[1].original60Copies,3);
  const needFour=preflightOriginal60Plan(original,[{
    role:'basic-source',
    acceptablePrintings:['Basic Psychic A','Basic Psychic B'],copies:4
  }]);
  assert.equal(needFour.status,'blocked-impossible-original60');
  assert.equal(needFour.blockedBy[0].original60Copies,3);
});

test('fail closed on incomplete 60 and double-counted compulsory targets',()=>{
  assert.throws(()=>preflightOriginal60Plan(['Fog Crystal CRE'],[{
    role:'fog',acceptablePrintings:['Fog Crystal CRE'],copies:1
  }]));
  assert.throws(()=>preflightOriginal60Plan(sourcePrintings(1),[
    {role:'first',acceptablePrintings:['Fog Crystal CRE'],copies:1},
    {role:'second',acceptablePrintings:['Fog Crystal CRE'],copies:1}
  ]),/Overlapping required printings/);
  assert.throws(()=>preflightOriginal60Plan(sourcePrintings(1),[
    {role:'dup',acceptablePrintings:['Fog Crystal CRE'],copies:1},
    {role:'dup',acceptablePrintings:['Psychic Energy CRE'],copies:1}
  ]),/Roles must be distinct/);
});
