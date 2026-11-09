'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observedOpponentActiveForbidsRetreat:blocks}=
  require('../../simulation/twinleaf/agent35-opponent-active-retreat-lock.cjs');
const {chooseZeroEnergyStrandFloatStone:zeroEnergy}=
  require('../../simulation/twinleaf/agent31-zero-energy-strand-floatstone.cjs');
const {chooseOwnerFloatStoneMobility:freeMobility}=
  require('../../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');
const {chooseGenericFundedFloatStone:genericFunded}=
  require('../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');

const BLOCK_TEXT="As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat.";
const PSYCHIC='Psychic Energy MEE';
const DARKNESS='Darkness Energy MEE';
const catalog={
  basicEnergyTypes:{Psychic:5,Darkness:7},
  basicEnergies:new Set([PSYCHIC,DARKNESS]),
  specialEnergies:new Set(),colorlessEnergyType:9,
  specialConditions:{ASLEEP:1,PARALYZED:2},
  stages:{BASIC:0,STAGE_1:1},dragonPokemonPrintings:new Set()
};

/** Construct only public information from an actual face-up Snorlax PGO. */
function snorlax(){
  return {
    name:'Snorlax',printing:'Snorlax PGO',hp:150,damage:120,
    printed:{types:[9],resistance:[]},tools:[],
    abilities:['Block'],
    abilityDetails:[{name:'Block',powerType:'Ability',text:BLOCK_TEXT}]
  };
}
function pokemon(printing,energies=[],attack=null){
  return {
    printing,printed:{stage:0,types:[5],retreatCost:[9,9]},
    energies,tools:[],specialConditions:[],publicRestrictions:{},
    attacks:attack?[attack]:[]
  };
}
function zeroCase(){
  const active=pokemon('Shadow Rider Calyrex V CRE');
  const powered=pokemon('Shadow Rider Calyrex VMAX CRE',
    [PSYCHIC,PSYCHIC,PSYCHIC],{
      name:'Max Geist',damage:10,cost:[9,9,9],
      text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'
    });
  return {
    decisionKind:'owner-root',globalTurn:42,
    ownHand:['Float Stone BKT'],
    ownTurnResources:{retreatedTurn:0,toolPlayLocked:false},
    ownPublic:{active,bench:[powered],stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:snorlax(),bench:[],stadium:[]}
  };
}
test('exact printed Snorlax Block is detected from opponent Active-only public text',()=>{
  const view=zeroCase();
  assert.equal(blocks(view),true);
  view.opponentPublic.active.abilityDetails=[{name:'Other',
    text:'During your turn, you may draw a card.'}];
  assert.equal(blocks(view),false);
  view.opponentPublic.active.abilityDetails=[];
  assert.equal(blocks(view),false);
  view.opponentPublic.active.abilityDetails=[{name:'Block',text:BLOCK_TEXT}];
  assert.equal(blocks(view),true);
});

test('Block prevents BOTH proposed Tool attachment and attached Float Stone retreat',()=>{
  const view=zeroCase();
  view.opponentPublic.active.abilityDetails=[];
  assert.equal(zeroEnergy(view,catalog)?.kind,'attach-emergency-floatstone');
  view.opponentPublic.active.abilityDetails=[{
    name:'Block',powerType:'Ability',text:BLOCK_TEXT}];
  assert.equal(zeroEnergy(view,catalog),null);
  view.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(zeroEnergy(view,catalog),null);
  view.opponentPublic.active.abilityDetails=[];
  assert.equal(zeroEnergy(view,catalog)?.kind,'retreat-emergency-floatstone');
});

test('general zero-Energy and partially funded Float Stone planners abstain under Block',()=>{
  const view=zeroCase();
  assert.equal(freeMobility(view,catalog),null);
  const funded=zeroCase();
  funded.ownPublic.active.energies=[PSYCHIC];
  assert.equal(genericFunded(funded,catalog),null);
  funded.opponentPublic.active.abilityDetails=[];
  assert.equal(genericFunded(funded,catalog)?.kind,'attach-emergency-floatstone');
});

test('non-Snorlax printed Active no-retreat ability and absent opponent do not read private zones',()=>{
  const view=zeroCase();
  view.opponentPublic.active={...snorlax(),printing:'Omastar TEU',
    abilityDetails:[{name:'Primordial Tentacles',text:BLOCK_TEXT}]};
  view.opponentPublic.hand=new Proxy({},{get(){throw Error('opponent private hand read')}});
  view.opponentPublic.deck=new Proxy({},{get(){throw Error('opponent private deck read')}});
  view.opponentPublic.prizes=new Proxy({},{get(){throw Error('opponent private prizes read')}});
  assert.equal(blocks(view),true);
  assert.equal(freeMobility(view,catalog),null);
  view.opponentPublic.active=null;
  assert.equal(blocks(view),false);
  assert.equal(freeMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
});

test('Bench Snorlax does not prevent own retreat, nor does active-only name without printed Block text',()=>{
  const view=zeroCase();
  view.opponentPublic.bench=[snorlax()];
  view.opponentPublic.active=Object.assign(pokemon('Electrike PRC'),{
    hp:80,damage:0,abilityDetails:[]});
  assert.equal(blocks(view),false);
  assert.equal(freeMobility(view,catalog)?.kind,
    'attach-emergency-floatstone');
  view.opponentPublic.active.abilityDetails=[{
    name:'Block',text:'Once during your turn, draw a card.'}];
  assert.equal(blocks(view),false);
});
