'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {rank17ElectrodeBombNecessity,ENERGY_PRINTINGS,REQUIRED_CARDS} =
  require('../simulation/twinleaf/agent1-rank17-electrode-owner-necessity.cjs');
const source = require('../results/aichi-2026/full-decklists.json');

const energy = [
  'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'
];
const electrode = {
  name:'Electrode-GX',printing:'Electrode GX CES',
  abilities:['Extra Energy Bomb'],tools:[]
};
const raichu = {
  name:'Alolan Raichu',printing:'Alolan Raichu UNM',
  abilities:[],tools:[]
};

/** @param {string[]} discard @param {object} [options] */
function view(discard,options={}) {
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:6,
    ownPublic:{
      active:options.active ?? {name:'Pikachu',printing:'Pikachu XY',abilities:[],tools:[]},
      bench:options.bench ?? [electrode,raichu,null,null,null],
      discard,stadium:[]
    },
    opponentPublic:{
      active:options.opponentActive ?? null,
      bench:[],stadium:options.opponentStadium ?? []
    }
  };
}

test('original rank17 deck prints exactly twelve Special Energy cards',()=>{
  const rank17=source.decks.find(deck=>deck.rank===17);
  assert.ok(rank17);
  assert.equal(rank17.cards.reduce((sum,card)=>sum+card.count,0),60);
  const energyCards=rank17.cards.filter(card=>card.category==='Energy');
  assert.equal(energyCards.reduce((sum,card)=>sum+card.count,0),12);
  assert.deepEqual(energyCards.map(card=>[card.name,card.count]).sort(),
    [['Counter Energy',4],['Reversal Energy',4],['Unit Energy LPM',4]]);
  assert.deepEqual([...ENERGY_PRINTINGS].sort(),energy.slice().sort());
  assert.equal(REQUIRED_CARDS,5);
  assert.equal(rank17.cards.filter(card=>card.name==='Electrode-GX')
    .reduce((sum,card)=>sum+card.count,0),3);
});

test('five physical Special Energy cards satisfy ONLY source line prerequisites',()=>{
  const r=rank17ElectrodeBombNecessity(view([
    energy[0],energy[0],energy[1],energy[1],energy[2]
  ]));
  assert.equal(r.physicalNecessaryConditionsMet,true);
  assert.equal(r.physicalDiscardEnergyCards,5);
  assert.equal(r.paperLegality,'UNVERIFIED');
  assert.equal(r.fivePhysicalCardTransfersVerified,false);
  assert.equal(r.competitiveGameQualified,false);
  assert.deepEqual(r.physicalBlockers,[]);
});

test('four physical Special Energy cards fail, even if they could provide more than five Energy units',()=>{
  const r=rank17ElectrodeBombNecessity(view([
    energy[0],energy[0],energy[1],energy[2]
  ]));
  assert.equal(r.physicalNecessaryConditionsMet,false);
  assert.deepEqual(r.physicalBlockers,[
    'fewer-than-five-discarded-physical-energy-cards'
  ]);
});

test('missing Stage 1 Electrode means no Extra Energy Bomb source line',()=>{
  const r=rank17ElectrodeBombNecessity(view(energy.concat(energy),{
    bench:[raichu,null,null,null,null]
  }));
  assert.equal(r.physicalNecessaryConditionsMet,false);
  assert.ok(r.physicalBlockers.includes('no-source-electrode-gx-in-play'));
});

test('missing Alolan Raichu is a line constraint, not a proof of Ability illegality',()=>{
  const r=rank17ElectrodeBombNecessity(view(energy.concat(energy),{
    bench:[electrode,null,null,null,null]
  }));
  assert.ok(r.physicalBlockers.includes('no-source-alolan-raichu-unm-recipient-in-play'));
  assert.equal(r.paperLegality,'UNVERIFIED');
});

test('public Ability suppression is a warning, without invented complete lock adjudication',()=>{
  const r=rank17ElectrodeBombNecessity(view(energy.concat(energy),{
    opponentActive:{name:'Wobbuffet',printing:'Wobbuffet PHF',
      abilities:['Bide Barricade'],tools:[]},
    opponentStadium:['Path to the Peak CRE']
  }));
  assert.equal(r.physicalNecessaryConditionsMet,true);
  assert.deepEqual(r.visibleAbilitySuppressionClues,
    ['opposing-active-bide-barricade','path-to-the-peak']);
  assert.equal(r.paperLegality,'UNVERIFIED');
});

test('actor-visible data is sufficient; hidden deck or Prize identities are unused',()=>{
  const a=view(energy.concat(energy));
  const b={...a,secretOpponentHand:['arbitrary'],
    opponentDeck:['unknown'],ownerPrizeCards:['hidden']};
  assert.deepEqual(rank17ElectrodeBombNecessity(a),
    rank17ElectrodeBombNecessity(b));
});
