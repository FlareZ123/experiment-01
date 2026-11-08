'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choosePotentialKnockout,typeAdjustedFixedDamage,VERSION}=
  require('../simulation/twinleaf/agent49-actor-potential-knockout.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const attack=(name,damage,extras={})=>({name,damage,cost:[5],
  damageCalculation:null,gxAttack:false,...extras});
const view=()=>({
  decisionKind:'owner-root',globalTurn:2,ownHand:[],
  ownTurnResources:{energyPlayedTurn:2,energyPlayLocked:false,
    pokemonPlayLocked:false},
  ownPublic:{active:{energies:['Psychic Energy MEE'],
    specialConditions:[],publicRestrictions:{},
    attacks:[attack('Setup',20),attack('Finish',60)]},
    bench:[null,null,null,null,null],
    publicTurnRestrictions:{attackLockTurnsRemaining:0}},
  opponentPublic:{active:{hp:100,damage:50}}
});
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}};

test('frozen common public-only scorer ranks a potential exact-base KO',()=>{
  const v=view(),moves=v.ownPublic.active.attacks;
  Object.freeze(moves);Object.freeze(v.opponentPublic.active);
  assert.equal(choosePotentialKnockout(v,moves),moves[1]);
  assert.equal(VERSION,'agent49-public-printed-potential-ko-v3-type-adjusted');
});

test('native-neutral root opt-in changes only printed payable attack choice',()=>{
  const v=view();
  assert.deepEqual(chooseActorRootIntent(v,catalog),
    {kind:'attack',attackName:'Setup'});
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Finish'});
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:false}),
    {kind:'attack',attackName:'Setup'});
});

test('variable damage, lower damage, and no public foe preserve first payable',()=>{
  const v=view();
  const one=attack('First',20), dynamic=attack('Variable',300,{damageCalculation:2});
  assert.equal(choosePotentialKnockout(v,[one,dynamic]),one);
  assert.equal(choosePotentialKnockout(v,[one,attack('Other',40)]),one);
  v.opponentPublic.active=null;
  assert.equal(choosePotentialKnockout(v,[one,attack('Finish',500)]),one);
});

test('GX-first remains unchanged to avoid overriding discrete once-game tradeoff',()=>{
  const v=view();const first=attack('GX-First',20,{gxAttack:true});
  assert.equal(choosePotentialKnockout(v,[first,attack('Non-GX',80)]),first);
});

test('opponent concealed information cannot influence printed potential selection',()=>{
  const a=view(),b=view();
  a.hiddenOpponentHand=['Double Colorless Energy'];
  b.hiddenOpponentHand=['N'];
  a.hiddenOpponentPrizeOrder=[1,2];b.hiddenOpponentPrizeOrder=[2,1];
  assert.deepEqual(chooseActorRootIntent(a,catalog,{potentialKoRoot:true}),
    chooseActorRootIntent(b,catalog,{potentialKoRoot:true}));
});

test('insufficient Energy or blocked attack still yields no selected root',()=>{
  const v=view();v.ownPublic.active.energies=[];
  assert.equal(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}).kind,'pass');
  v.ownPublic.active.energies=['Psychic Energy MEE'];
  v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}).kind,'pass');
});

test('public Psychic Weakness retains the already lethal first printed attack',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[5]};
  v.opponentPublic.active.hp=100;
  v.opponentPublic.active.damage=30;
  v.opponentPublic.active.printed={
    weakness:[{type:5,value:2}],resistance:[]
  };
  v.ownPublic.active.attacks=[
    attack('Weakness Finish',40),attack('Raw Finish',80)
  ];
  assert.equal(typeAdjustedFixedDamage(40,v.ownPublic.active,
    v.opponentPublic.active),80);
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,
    'Weakness Finish');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Weakness Finish'});
});

test('public Resistance vetoes a raw-damage false knockout',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[5]};
  v.opponentPublic.active.hp=100;
  v.opponentPublic.active.damage=30;
  v.opponentPublic.active.printed={
    weakness:[],resistance:[{type:5,value:-30}]
  };
  v.ownPublic.active.attacks=[attack('First',20),attack('False KO',80)];
  assert.equal(typeAdjustedFixedDamage(80,v.ownPublic.active,
    v.opponentPublic.active),50);
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,
    'First');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'First'});
});

test('Weakness followed by Resistance changes which later attack qualifies',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[5]};
  v.opponentPublic.active.hp=100;
  v.opponentPublic.active.damage=30;
  v.opponentPublic.active.printed={
    weakness:[{type:5,value:2}],
    resistance:[{type:5,value:-30}]
  };
  v.ownPublic.active.attacks=[attack('Setup',40),attack('Finish',60)];
  assert.equal(typeAdjustedFixedDamage(40,v.ownPublic.active,
    v.opponentPublic.active),50);
  assert.equal(typeAdjustedFixedDamage(60,v.ownPublic.active,
    v.opponentPublic.active),90);
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Finish'});
});

test('pinned native Weakness with omitted value means times two',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[5]};
  v.opponentPublic.active.hp=100;
  v.opponentPublic.active.damage=30;
  v.opponentPublic.active.printed={
    weakness:[{type:5,value:null}],resistance:[]
  };
  assert.equal(typeAdjustedFixedDamage(40,v.ownPublic.active,
    v.opponentPublic.active),80,
    'actorObservation maps the native undefined weakness multiplier to null');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Setup'},
    'printed Setup 20 x2 remains nonlethal; later Finish 60 x2 is lethal');
  v.ownPublic.active.attacks=[attack('Weakness Finish',40),attack('Raw Finish',80)];
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,
    'Weakness Finish');
  v.opponentPublic.active.printed.weakness=[{type:5}];
  assert.equal(typeAdjustedFixedDamage(40,v.ownPublic.active,
    v.opponentPublic.active),80,
    'omitted native value remains equivalent before observation');
});

test('unknown or incomplete printed modifiers never invent a guaranteed KO',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[5]};
  v.opponentPublic.active.printed={
    weakness:[{type:5,value:'unrecognized'}],resistance:[]
  };
  const moves=[attack('First',20),attack('Unknown',200)];
  assert.equal(typeAdjustedFixedDamage(200,v.ownPublic.active,
    v.opponentPublic.active),null);
  assert.equal(choosePotentialKnockout(v,moves),moves[0]);
  v.opponentPublic.active.printed={
    weakness:[],resistance:[{type:5,value:30}]
  };
  assert.equal(typeAdjustedFixedDamage(200,v.ownPublic.active,
    v.opponentPublic.active),null);
  assert.equal(choosePotentialKnockout(v,moves),moves[0]);
  v.opponentPublic.active.printed={weakness:[],resistance:[]};
  v.opponentPublic.hiddenHand=['Unseen card A'];
  const first=choosePotentialKnockout(v,moves);
  v.opponentPublic.hiddenHand=['Unseen card B'];
  assert.strictEqual(choosePotentialKnockout(v,moves),first);
});
