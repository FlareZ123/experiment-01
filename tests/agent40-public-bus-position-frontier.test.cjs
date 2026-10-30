'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePublicBusPositionTransition}=require(
  '../simulation/twinleaf/agent40-public-bus-position-frontier.cjs');

const catalog={basicEnergies:new Set(['Grass Energy MEE','Psychic Energy SVE']),
  stages:{BASIC:0,STAGE_1:1},
  specialConditions:{ASLEEP:2,PARALYZED:3}};
const pokemon=(printing,stage=0)=>({
  name:printing.split(/ (?:PRC|BUS|AOR|UNM|SFA)\b/)[0],printing,
  printed:{stage,retreatCost:[]},
  energies:[],tools:[],specialConditions:[],publicRestrictions:{},
  abilityDetails:[],attacks:[]
});
function state(){
  const b=pokemon('Bunnelby PRC');
  b.energies=['Grass Energy MEE'];
  b.printed.retreatCost=[9,9];
  return {
    decisionKind:'owner-root',globalTurn:18,
    ownHand:['Grass Energy MEE','Tag Call CEC'],
    ownTurnResources:{energyPlayedTurn:0,retreatedTurn:0,
      energyPlayLocked:false},
    ownPublic:{active:b,
      bench:[pokemon('Budew ASC'),pokemon('Vileplume BUS',2),
        pokemon('Vileplume AOR',2),null,null],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:pokemon('Mewtwo & Mew-GX UNM'),
      stadium:[]}
  };
}
const choose=v=>choosePublicBusPositionTransition(v,catalog);
test('held second Grass funds the source T18 Bench BUS retreat',()=>{
  const v=state();
  assert.deepEqual(choose(v),{
    kind:'attach-basic-energy',handIndex:0,printing:'Grass Energy MEE',
    slot:'active',index:0,reason:'fund-public-bus-lock-retreat'});
  v.ownPublic.active.energies.push('Grass Energy MEE');
  v.ownTurnResources.energyPlayedTurn=18;
  assert.deepEqual(choose(v),{
    kind:'paid-retreat',benchIndex:1,printing:'Vileplume BUS',
    retreatCostUnits:2,reason:'promote-active-bus-with-aor-item-lock'});
});
test('gates on real two-lock geometry and opponent Basic attacks',()=>{
  const v=state();
  v.ownPublic.bench[2]=null;
  assert.equal(choose(v),null);
  v.ownPublic.bench[2]=pokemon('Vileplume AOR',2);
  v.ownPublic.bench[1]=null;
  assert.equal(choose(v),null);
  v.ownPublic.bench[1]=pokemon('Vileplume BUS',2);
  v.opponentPublic.active.printed.stage=1;
  assert.equal(choose(v),null,
    'Active BUS only suppresses the opponent Basic attacks');
});
test('cannot stage attachment if already paid or no held Basic Energy',()=>{
  const v=state();
  v.ownTurnResources.energyPlayedTurn=18;
  assert.equal(choose(v),null);
  v.ownTurnResources.energyPlayedTurn=0;
  v.ownHand=['Tag Call CEC'];
  assert.equal(choose(v),null);
  v.ownHand=['Grass Energy MEE'];
  v.ownPublic.publicTurnRestrictions.energyPlayLocked=true;
  assert.equal(choose(v),null);
});
test('already paid retreat and target cost modifiers fail closed',()=>{
  const v=state();
  v.ownTurnResources.retreatedTurn=18;
  assert.equal(choose(v),null);
  v.ownTurnResources.retreatedTurn=0;
  v.ownPublic.active.tools=['Float Stone PLF'];
  assert.equal(choose(v),null);
  v.ownPublic.active.tools=[];
  v.ownPublic.active.printed.retreatCost=[9];
  assert.equal(choose(v),null);
});
test('Active status and unmodeled attached Special Energy disallow proposal',()=>{
  const v=state();
  v.ownPublic.active.specialConditions=[2];
  assert.equal(choose(v),null);
  v.ownPublic.active.specialConditions=[];
  v.ownPublic.active.energies=['Double Colorless Energy NXD'];
  assert.equal(choose(v),null);
});
test('strict owner public observable invariance under hidden-zone perturbations',()=>{
  const v=state(),w=state();
  v.opponentSecretHand=['one'];w.opponentSecretHand=['two'];
  v.ownerUnknownPrize=['Vileplume BUS'];
  w.ownerUnknownPrize=['Grass Energy MEE'];
  assert.deepEqual(choose(v),choose(w));
});

test('common actor defaults remain unchanged; opt-in picks T18 two-step source plan',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const c={...catalog,abilityBasics:new Set(),basics:new Set(),
    colorlessEnergyType:9};
  const v=state();
  const baseline=chooseActorRootIntent(v,c,{});
  const selected=chooseActorRootIntent(v,c,{busLockPositionRoot:true});
  assert.equal(baseline.kind,'attach-basic-energy');
  assert.equal(selected.kind,'attach-basic-energy');
  assert.equal(selected.reason,'fund-public-bus-lock-retreat');
  v.ownPublic.active.energies.push('Grass Energy MEE');
  v.ownTurnResources.energyPlayedTurn=18;
  const second=chooseActorRootIntent(v,c,{busLockPositionRoot:true});
  assert.equal(second.kind,'paid-retreat');
  assert.equal(second.benchIndex,1);
  assert.equal(second.retreatCostUnits,2);
});

test('direct held Jet promotes BUS while preserving a single Grass',()=>{
  const v=state();
  v.ownHand=['Grass Energy MEE','Jet Energy PAL'];
  const c={...catalog,specialEnergies:new Set(['Jet Energy PAL'])};
  const selected=choosePublicBusPositionTransition(v,c);
  assert.deepEqual(selected,{
    kind:'attach-special-energy',handIndex:1,printing:'Jet Energy PAL',
    slot:'bench',index:1,
    reason:'jet-promote-active-bus-with-aor-item-lock'});
  // Once two Basics already pay ordinary retreat, retain the held Jet.
  v.ownPublic.active.energies.push('Grass Energy MEE');
  assert.equal(choosePublicBusPositionTransition(v,c).kind,'paid-retreat');
});
test('Jet promotion bypasses ordinary retreat restriction and Sleep',()=>{
  const v=state();
  v.ownHand=['Jet Energy PAL'];
  const c={...catalog,specialEnergies:new Set(['Jet Energy PAL'])};
  v.ownPublic.active.specialConditions=[c.specialConditions.ASLEEP];
  v.ownTurnResources.retreatedTurn=18;
  v.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(choosePublicBusPositionTransition(v,c).kind,
    'attach-special-energy',
    'A Jet effect switches a Benched target even when retreat is prohibited');
});
test('Temple of Sinnoh prevents Jet forced-switch proposal',()=>{
  const v=state();
  const c={...catalog,specialEnergies:new Set(['Jet Energy PAL'])};
  v.ownHand=['Jet Energy PAL'];
  v.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choosePublicBusPositionTransition(v,c),null);
  v.opponentPublic.stadium=[];
  v.ownTurnResources.specialEnergyPlayLocked=true;
  assert.equal(choosePublicBusPositionTransition(v,c),null);
  v.ownTurnResources.specialEnergyPlayLocked=false;
  v.ownTurnResources.energyPlayedTurn=18;
  assert.equal(choosePublicBusPositionTransition(v,c),null);
});
test('shared actor typed opt-in attaches Jet to the BUS actual Bench index',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=state();
  v.ownHand=['Jet Energy PAL'];
  const c={...catalog,basics:new Set(),abilityBasics:new Set(),
    specialEnergies:new Set(['Jet Energy PAL']),colorlessEnergyType:9};
  const selected=chooseActorRootIntent(v,c,{busLockPositionRoot:true});
  assert.equal(selected.kind,'attach-special-energy');
  assert.equal(selected.printing,'Jet Energy PAL');
  assert.equal(selected.slot,'bench');
  assert.equal(selected.index,1);
});
