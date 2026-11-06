'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {fundedPerfectionPassEligibility,createFundedPerfectionPassSampler}=
  require('../simulation/twinleaf/agent24-funded-perfection-postpass-stratum.cjs');

/** @param {string} name @param {'GX'|'EX'|null} tag @returns {object} */
function pokemon(name,tag=null){
  return {name,fullName:name+' PRINT',attacks:[{name:'Test attack'}],
    hasTag(kind){return kind===tag;}};
}

/** @param {number} energy @param {boolean} donor @returns {object} */
function ownerState(energy=0,donor=false) {
  const actor={id:123,active:{
    getPokemonCard(){return pokemon('Mewtwo & Mew-GX','GX');},
    energies:{cards:Array.from({length:energy},(_,i)=>({name:'Energy '+i}))}
  },bench:[{getPokemonCard(){
    return donor?pokemon('Gengar & Mimikyu-GX','GX'):pokemon('Duskull');
  }}],discard:{cards:[]}};
  const opponent={id:456};
  Object.defineProperty(opponent,'hand',{get(){
    throw new Error('Opponent hidden hand must never be inspected');
  }});
  Object.defineProperty(opponent,'deck',{get(){
    throw new Error('Opponent hidden deck must never be inspected');
  }});
  return {activePlayer:0,players:[actor,opponent],prompts:[]};
}

test('early Mewtwo Pass with no Energy is explicitly not probed',()=>{
  const state=ownerState(0,true);
  const check=fundedPerfectionPassEligibility(state,123);
  assert.equal(check.eligible,false);
  assert.equal(check.reason,'no-physical-active-energy');
});

test('physical Energy with no public GX/EX donor is not enough',()=>{
  const check=fundedPerfectionPassEligibility(ownerState(1,false),123);
  assert.equal(check.eligible,false);
  assert.equal(check.reason,'no-public-ex-or-gx-donor');
});

test('known funded Gengar donor is eligible for true detached prompt probe',()=>{
  const check=fundedPerfectionPassEligibility(ownerState(1,true),123);
  assert.equal(check.eligible,true);
  assert.equal(check.energyCards,1);
  assert.equal(check.donorCount,1);
});

test('actor identity and turn owner cannot cross native physical seats',()=>{
  const state=ownerState(1,true);
  assert.equal(fundedPerfectionPassEligibility(state,456).eligible,false);
  assert.equal(fundedPerfectionPassEligibility(state,999).eligible,false);
  state.activePlayer=1;
  assert.equal(fundedPerfectionPassEligibility(state,123).eligible,false);
});

test('pending prompt veto is checked before searching public donors',()=>{
  const state=ownerState(1,true);
  state.prompts=[{result:undefined}];
  assert.equal(fundedPerfectionPassEligibility(state,123).reason,'unresolved-prompt');
});

test('non-Mewtwo Active is outside the audited copied-attack channel',()=>{
  const state=ownerState(1,true);
  state.players[0].active.getPokemonCard=()=>pokemon('Duskull');
  assert.equal(fundedPerfectionPassEligibility(state,123).reason,
    'not-mewtwo-active');
});

test('rank11 sequence of five unfunded Passes reserves both funded later probes',()=>{
  let calls=0;
  const sampler=createFundedPerfectionPassSampler({maxRecords:2,
    probe(){calls++;return {activationAccepted:true,
      validAttackNames:['Horror House-GX']};}});
  for(const ordinal of [46,55,63,71,79])
    assert.equal(sampler.observe(ownerState(0,true),123,
      'PassTurnAction',ordinal),null);
  const one=sampler.observe(ownerState(1,true),123,'PassTurnAction',91);
  const two=sampler.observe(ownerState(2,true),123,'PassTurnAction',99);
  assert.equal(one.actionOrdinal,91);
  assert.equal(two.actionOrdinal,99);
  assert.deepEqual(sampler.summary().sampledActionOrdinals,[91,99]);
  assert.equal(sampler.summary().passRootsChecked,7);
  assert.equal(sampler.summary().noEnergyOrDonorOrWrongOwner,5);
  assert.equal(calls,2);
  assert.equal(one.optionPaperAffordabilityCertified,false);
});

test('bounded budget excludes later successes without pretending a full census',()=>{
  let calls=0;
  const sampler=createFundedPerfectionPassSampler({maxRecords:1,
    probe(){calls++;return {validAttackNames:[]};}});
  assert.ok(sampler.observe(ownerState(1,true),123,'PassTurnAction',91));
  assert.equal(sampler.observe(ownerState(2,true),123,'PassTurnAction',99),null);
  assert.equal(calls,1);
  assert.equal(sampler.summary().budgetCensored,1);
  assert.equal(sampler.summary().completeOpportunityCensus,false);
});

test('sampling never performs an action or probes before policy chooses Pass',()=>{
  let calls=0;
  const sampler=createFundedPerfectionPassSampler({probe(){
    calls++;return {};
  }});
  assert.equal(sampler.observe(ownerState(2,true),123,
    'PlayCardAction',87),null);
  assert.equal(calls,0);
  assert.equal(sampler.summary().passRootsChecked,0);
});

test('a detached probe error is captured in a sample without changing choice',()=>{
  const sampler=createFundedPerfectionPassSampler({probe(){
    throw new Error('native clone rejected');
  }});
  const sample=sampler.observe(ownerState(1,true),123,'PassTurnAction',91);
  assert.match(sample.detachedMenu.auditError,/native clone rejected/);
  assert.equal(sampler.summary().recorded,1);
});

test('funded sampling cannot read the opponent concealed hand or deck',()=>{
  const sampler=createFundedPerfectionPassSampler({probe(){
    return {activationAccepted:false,validAttackNames:[]};
  }});
  const sample=sampler.observe(ownerState(1,true),123,'PassTurnAction',91);
  assert.equal(sample.opponentHiddenZonesInspectedBySampler,false);
});

test('invalid sample capacity is rejected',()=>{
  assert.throws(()=>createFundedPerfectionPassSampler({maxRecords:0}));
  assert.throws(()=>createFundedPerfectionPassSampler({maxRecords:65}));
});
