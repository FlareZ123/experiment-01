'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerCompressorOpportunity,summarizeOpportunity}=
  require('../simulation/twinleaf/owner-compressor-opportunity-audit.cjs');
const {MEWTWO,GENGAR}=
  require('../simulation/twinleaf/new-moon-compressor-payload-policy.cjs');

/** @returns {{state:object,owner:object}} */
function fixture() {
  const owner={
    hand:{cards:[{name:'Battle Compressor',fullName:'Battle Compressor PHF'}]},
    active:{getPokemonCard:()=>({fullName:'Galarian Articuno V CRE'})},
    bench:[{getPokemonCard:()=>({fullName:MEWTWO})}],
    deck:{cards:[{name:'unknown'}, {name:'unknown'}]},
    discard:{cards:[]},
    cannotPlayItemCards:false
  };
  return {
    owner,
    state:{
      turn:2,phase:3,prompts:[],
      players:[owner,{
        hand:{cards:[{fullName:'private opponent hand'}]},
        deck:{cards:[{fullName:'concealed opponent deck'}]}
      }]
    }
  };
}

test('Benched Mewtwo offers anticipatory owner-only opportunity',()=>{
  const {owner,state}=fixture();
  const before=JSON.stringify(state);
  const report=ownerCompressorOpportunity(state,owner,3);
  assert.equal(report.handCompressorCount,1);
  assert.equal(report.activePokemon,'Galarian Articuno V CRE');
  assert.equal(report.mewtwoActive,false);
  assert.equal(report.mewtwoBenched,true);
  assert.equal(report.activeOnlyEligible,false);
  assert.equal(report.activeOrBenchEligible,true);
  assert.equal(report.ownDeckCardsRemaining,2);
  assert.equal(JSON.stringify(state),before);
});

test('existing Active opportunity retains same tactical eligibility',()=>{
  const {owner,state}=fixture();
  owner.active.getPokemonCard=()=>({fullName:MEWTWO});
  assert.equal(ownerCompressorOpportunity(state,owner,3).activeOnlyEligible,true);
});

test('public Item lock and owner-known accessible donor prohibit proposal',()=>{
  const {owner,state}=fixture();
  owner.cannotPlayItemCards=true;
  assert.equal(ownerCompressorOpportunity(state,owner,3).activeOrBenchEligible,false);
  owner.cannotPlayItemCards=false;
  owner.discard.cards=[{fullName:GENGAR}];
  assert.equal(ownerCompressorOpportunity(state,owner,3).activeOrBenchEligible,false);
});

test('late owner-only Powerglass and discarded Psychic are observed without hidden zones',()=>{
  const {owner,state}=fixture();
  owner.active.getPokemonCard=()=>({fullName:MEWTWO});
  owner.active.tools=[{fullName:'Powerglass SFA'}];
  owner.active.energies={cards:[{fullName:'Psychic Energy MEE'}]};
  owner.active.damage=200;
  owner.hand.cards.push({fullName:'Powerglass SFA'});
  owner.discard.cards=[
    {name:'Psychic Energy',fullName:'Psychic Energy MEE'},
    {name:'Telepathic Psychic Energy',fullName:'Telepathic Psychic Energy MEG'},
    {name:'Psychic Energy',fullName:'Psychic Energy MEE'}
  ];
  state.turn=33;
  const baseline=ownerCompressorOpportunity(state,owner,3);
  assert.equal(baseline.heldPowerglassCount,1);
  assert.equal(baseline.activePowerglassEquipped,true);
  assert.equal(baseline.ownerDiscardBasicPsychicCount,2);
  assert.equal(baseline.ownerActiveDamage,200);
  assert.deepEqual(baseline.ownerActiveEnergyPrintings,['Psychic Energy MEE']);
  assert.equal(baseline.activeOnlyEligible,false,'Historical turn limit unchanged');
  assert.equal(baseline.anyTurnEligible,true,'Unbounded proposal is owner-visible');
  state.players[1].hand.cards=[{name:'Psychic Energy'}];
  state.players[1].deck.cards=[{name:'Psychic Energy'}];
  owner.deck.cards=[{fullName:'opaque hidden identity C'}];
  assert.deepEqual(ownerCompressorOpportunity(state,owner,3),{
    ...baseline,ownDeckCardsRemaining:1
  },'Observer must ignore concealed owner/opponent deck identities');
});

test('opposing concealed zones cannot change owner eligibility or telemetry',()=>{
  const {owner,state}=fixture();
  const first=ownerCompressorOpportunity(state,owner,3);
  state.players[1].hand.cards=[{fullName:GENGAR}, {fullName:MEWTWO}];
  state.players[1].deck.cards=[{fullName:MEWTWO}];
  assert.deepEqual(ownerCompressorOpportunity(state,owner,3),first);
});

test('turn-level summaries do not treat multiple root states as independent turns',()=>{
  const events=[
    {turn:1,handCompressorCount:1,mewtwoActive:false,
      mewtwoBenched:true,activeOnlyEligible:false,activeOrBenchEligible:true},
    {turn:1,handCompressorCount:1,mewtwoActive:false,
      mewtwoBenched:true,activeOnlyEligible:false,activeOrBenchEligible:true},
    {turn:3,handCompressorCount:0,mewtwoActive:true,
      mewtwoBenched:false,activeOnlyEligible:false,activeOrBenchEligible:false}
  ];
  const r=summarizeOpportunity(events);
  assert.equal(r.observedOwnerRootDecisions,3);
  assert.equal(r.observedOwnTurns,2);
  assert.equal(r.heldCompressorTurns,1);
  assert.equal(r.mewtwoActiveTurns,1);
  assert.equal(r.mewtwoBenchedTurns,1);
  assert.equal(r.activeOnlyEligibleTurns,0);
  assert.equal(r.activeOrBenchEligibleTurns,1);
  assert.equal(r.benchExtensionOnlyTurns,1);
  assert.equal(r.ownerOnlyVisibleData,true);
});
