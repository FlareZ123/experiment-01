'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseGenericFundedFloatStone}=
  require('../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');
const {chooseFlexiblePaidRetreatToFundedBench}=
  require('../../simulation/twinleaf/agent10-flexible-paid-retreat-frontier.cjs');
const {choosePaidRetreatToDamagingBench}=
  require('../../simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs');
const {chooseMultiBasicPaidRetreatInDeckRace,
  chooseMultiBasicPaidRetreatInDeckRaceGuarded}=
  require('../../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs');
const PSY='Psychic Energy MEE',DARK='Darkness Energy MEE';
const LOCK="As long as this Pokémon is in the Active Spot, Pokémon with a Rule Box in play (both yours and your opponent's) have no Abilities, except for Future Pokémon.";
const catalog={specialConditions:{ASLEEP:1,PARALYZED:2},
  colorlessEnergyType:9,basicEnergyTypes:{Psychic:5,Darkness:7},
  basicEnergies:new Set([PSY,DARK]),
  specialEnergies:new Set(['Prism Energy ASC','Telepath [P] Energy M3']),
  dragonPokemonPrintings:new Set()};
const mon=(energy,attack,fee=1)=>({
  printing:'Generic MEE',printed:{stage:0,types:[5],
    retreatCost:Array(fee).fill(9)},energies:energy,tools:[],
  attacks:[attack],specialConditions:[],publicRestrictions:{
    cannotAttackNextTurn:false
  }
});
const view=(active,bench)=>({
  decisionKind:'owner-root',globalTurn:12,ownHand:['Float Stone BKT'],
  ownTurnResources:{retreatedTurn:0,toolPlayLocked:false},
  ownPublic:{active,bench:[bench],stadium:[],
    publicTurnRestrictions:{attackLockTurnsRemaining:0}},
  opponentPublic:{active:{printing:'Lunatone OBF',hp:90,damage:0,
    tools:[]},bench:[],stadium:[],deckCount:30}
});
function lock(v){
  v.ownPublic.active.printing='Iron Thorns ex TWM';
  v.ownPublic.active.abilityDetails=[{name:'Initialization',text:LOCK}];
}
test('funded Float Stone retreat cannot drop continuous Active lock',()=>{
  const v=view(mon([DARK],{name:'Costly',damage:200,cost:[7,7,9]},2),
    mon([DARK,DARK,DARK],{name:'Heavy',damage:200,cost:[7,7,9]}));
  assert.equal(chooseGenericFundedFloatStone(v,catalog)?.kind,
    'attach-emergency-floatstone');
  lock(v);
  assert.equal(chooseGenericFundedFloatStone(v,catalog),null);
});
test('single-unit flexible paid retreat cannot drop continuous Active lock',()=>{
  const v=view(mon(['Prism Energy ASC'],{name:'Costly',damage:40,cost:[5,5]}),
    mon([DARK,DARK,DARK],{name:'Heavy',damage:200,cost:[7,7,9]}));
  assert.equal(chooseFlexiblePaidRetreatToFundedBench(v,catalog)?.kind,
    'paid-retreat');
  lock(v);
  assert.equal(chooseFlexiblePaidRetreatToFundedBench(v,catalog),null);
});
test('one-Basic paid retreat cannot drop continuous Active lock',()=>{
  const v=view(mon([PSY],{name:'Setup',damage:0,cost:[5]}),
    mon([PSY,PSY],{name:'Burst',damage:100,cost:[5,5]}));
  assert.equal(choosePaidRetreatToDamagingBench(v,catalog)?.kind,
    'paid-retreat');
  lock(v);
  assert.equal(choosePaidRetreatToDamagingBench(v,catalog),null);
});
test('multi-Basic deck-race retirement protects Active lock in both legacy and guarded plans',()=>{
  const v=view(mon([PSY,PSY,PSY],{name:'Setup',damage:0,cost:[9]},3),
    mon([PSY],{name:'Poke',damage:10,cost:[5]}));
  v.ownPublic.deckCount=19;
  assert.equal(chooseMultiBasicPaidRetreatInDeckRace(v,catalog)?.kind,
    'paid-retreat');
  assert.equal(chooseMultiBasicPaidRetreatInDeckRaceGuarded(v,catalog)?.kind,
    'paid-retreat');
  lock(v);
  assert.equal(chooseMultiBasicPaidRetreatInDeckRace(v,catalog),null);
  assert.equal(chooseMultiBasicPaidRetreatInDeckRaceGuarded(v,catalog),null);
});
test('equivalent printed replacement retains funded Float Stone access',()=>{
  const v=view(mon([DARK],{name:'Costly',damage:200,cost:[7,7,9]},2),
    mon([DARK,DARK,DARK],{name:'Heavy',damage:200,cost:[7,7,9]}));
  lock(v);
  v.ownPublic.bench[0].printing=v.ownPublic.active.printing;
  v.ownPublic.bench[0].abilityDetails=[{name:'Initialization',text:LOCK}];
  assert.equal(chooseGenericFundedFloatStone(v,catalog)?.benchIndex,0);
  v.ownPublic.bench[0].abilityDetails[0].text+=' ';
  assert.equal(chooseGenericFundedFloatStone(v,catalog),null);
});
