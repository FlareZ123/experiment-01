'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {printedAllPokemonEnergyScaling,choosePrintedScalingBasicKoAttachment} =
  require('../simulation/twinleaf/agent17-printed-scaling-basic-ko.cjs');

const catalog = {
  basicEnergies: new Set(['Psychic Energy MEE','Darkness Energy MEE']),
  basicEnergyTypes: {Psychic:5,Darkness:7},colorlessEnergyType:9
};
const GEIST = {name:'Max Geist',damage:10,cost:[9,9,9],gxAttack:false,
  text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'};
const first = {kind:'attack',attackName:'Max Geist'};

function state() {
  const active = {printing:'Shadow Rider Calyrex VMAX CRE',
    printed:{types:[5]},energies:Array(3).fill('Psychic Energy MEE'),
    attacks:[GEIST]};
  const bench = {printing:'Shadow Rider Calyrex V CRE',
    printed:{types:[5]},energies:[],attacks:[]};
  return {decisionKind:'owner-root',globalTurn:12,
    ownHand:['Psychic Energy MEE'],
    ownTurnResources:{energyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{active,bench:[null,bench,null,null,null],
      publicTurnRestrictions:{energyPlayLocked:false}},
    opponentPublic:{active:{hp:130,damage:0,
      printed:{weakness:[],resistance:[]}},bench:[]}};
}

test('printed Max Geist scaling is recognized, unrelated attack text fails closed',() => {
  assert.deepEqual(printedAllPokemonEnergyScaling(GEIST),{
    energyType:'Psychic',damagePerUnit:30,baseDamage:10});
  assert.equal(printedAllPokemonEnergyScaling({...GEIST,
    text:'Do 30 damage for each Psychic Energy in the discard pile.'}),null);
  assert.equal(printedAllPokemonEnergyScaling({...GEIST,damage:'10+'}),null);
  assert.equal(printedAllPokemonEnergyScaling({...GEIST,
    text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon. Then discard a card.'}),null);
});

test('source rank1 100-to-130 printed threshold selects a Bench attachment',() => {
  const v=state();
  assert.deepEqual(choosePrintedScalingBasicKoAttachment(v,catalog,first),{
    kind:'attach-basic-energy',handIndex:0,
    printing:'Psychic Energy MEE',slot:'bench',index:1});
  assert.equal(v.ownPublic.active.energies.length,3);
});

test('no offer for unreachable or already reachable KO or wrong held type',() => {
  const v=state();
  v.opponentPublic.active.hp=140;
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
  v.opponentPublic.active.hp=100;
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
  v.opponentPublic.active.hp=130;
  v.ownHand=['Darkness Energy MEE'];
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
});

test('quota, modifiers, and unmodeled Special Energy remain vetoes',() => {
  const v=state();
  v.ownTurnResources.energyPlayedTurn=12;
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
  v.ownTurnResources.energyPlayedTurn=0;
  v.opponentPublic.active.printed.weakness=[{type:5,value:2}];
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
  v.opponentPublic.active.printed.weakness=[];
  v.opponentPublic.active.printed.resistance=[{type:5,value:-30}];
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
  v.opponentPublic.active.printed.resistance=[];
  v.ownPublic.active.energies[0]='Double Dragon Energy ROS';
  assert.equal(choosePrintedScalingBasicKoAttachment(v,catalog,first),null);
});

test('opponent concealed cards and unknown deck order cannot influence choice',() => {
  const v=state();
  const before=choosePrintedScalingBasicKoAttachment(v,catalog,first);
  v.opponentSecret={hand:['Boss Orders'],prizes:['Ace Spec']};
  v.ownerUnknownDeckOrder=['Psychic Energy MEE'];
  assert.deepEqual(choosePrintedScalingBasicKoAttachment(v,catalog,first),before);
});

test('same public grammar supports another type without a matching Bench',() => {
  const v=state();
  v.ownPublic.active.attacks=[{name:'Synthetic scalable attack',damage:10,
    text:'This attack does 30 more damage for each Darkness Energy attached to all of your Pokémon.'}];
  v.ownPublic.active.energies=Array(3).fill('Darkness Energy MEE');
  v.ownHand=['Darkness Energy MEE'];
  assert.deepEqual(choosePrintedScalingBasicKoAttachment(v,catalog,{
    kind:'attack',attackName:'Synthetic scalable attack'}),{
    kind:'attach-basic-energy',handIndex:0,
    printing:'Darkness Energy MEE',slot:'active',index:0});
});

test('exact original rank1 and card printing support the constructed damage',() => {
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const source=manifest.decks.find(deck=>deck.rank===1);
  assert.ok(source);
  assert.equal(source.cards.find(card=>card.name==='Psychic Energy')?.count,11);
  assert.equal(source.cards.find(card=>card.name==='Shadow Rider Calyrex VMAX')?.count,4);
  const cards=require('../resources/cards/en/swsh6.json');
  const printed=cards.find(card=>card.id==='swsh6-75');
  assert.equal(printed.name,'Shadow Rider Calyrex VMAX');
  const max=printed.attacks.find(attack=>attack.name==='Max Geist');
  assert.deepEqual(max.cost,['Colorless','Colorless','Colorless']);
  assert.equal(max.damage,'10+');
  assert.equal(max.text,'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.');
  assert.deepEqual(printedAllPokemonEnergyScaling({...GEIST,text:max.text}),{
    energyType:'Psychic',damagePerUnit:30,baseDamage:10});
});


test('shared actor chooses printed scaling attachment only with opt-in',()=>{
  const {chooseActorRootIntent}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=state();
  v.ownTurnResources.pokemonPlayLocked=false;
  const c={...catalog,basics:new Set(),abilityBasics:new Set(),
    specialConditions:{ASLEEP:-1,PARALYZED:-2}};
  const baseline=chooseActorRootIntent(v,c,{energyRecipientFrontier:true});
  assert.deepEqual(baseline,{kind:'attack',attackName:'Max Geist'});
  const candidate=chooseActorRootIntent(v,c,{
    energyRecipientFrontier:true,printedScalingBasicKoBeforeAttack:true});
  assert.equal(candidate.kind,'attach-basic-energy');
  assert.equal(candidate.slot,'bench');
  v.ownPublic.bench[1].energies.push('Psychic Energy MEE');
  v.ownHand=[];
  v.ownTurnResources.energyPlayedTurn=12;
  assert.equal(chooseActorRootIntent(v,c,{
    energyRecipientFrontier:true,printedScalingBasicKoBeforeAttack:true}).kind,'attack');
});
