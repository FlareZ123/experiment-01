'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseGenericFundedFloatStone:choose,VERSION}=
  require('../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');

const dark='Darkness Energy MEE',psychic='Psychic Energy MEE';
const catalog={
  stages:{BASIC:0,STAGE_1:1},
  basicEnergyTypes:{Darkness:7,Psychic:5,Lightning:4,Fairy:8},
  colorlessEnergyType:9,
  basicEnergies:new Set([dark,psychic]),
  specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};

function absol(energyCount){
  return {printing:'Mega Absol ex M1L',name:'Mega Absol ex',
    printed:{stage:0,types:[7],retreatCost:[9,9]},
    energies:Array(energyCount).fill(dark),tools:[],
    attacks:[{name:'Claw of Darkness',damage:200,cost:[7,7,9]}],
    specialConditions:[],publicRestrictions:{}};
}
function sample(){
  return {decisionKind:'owner-root',globalTurn:12,
    ownHand:['Float Stone BKT','Guzma BUS'],
    ownTurnResources:{retreatedTurn:10,toolPlayLocked:false},
    ownPublic:{active:absol(1),bench:[absol(3)],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',tools:[]},
      bench:[],stadium:[]}};
}

test('source-independent rank11 Mega Absol 1-energy Active to funded Bench',()=>{
  const view=sample();
  const plan=choose(view,catalog);
  assert.equal(plan.kind,'attach-emergency-floatstone');
  assert.equal(plan.handIndex,0);
  assert.equal(plan.benchIndex,0);
  assert.equal(plan.targetAttackName,'Claw of Darkness');
  assert.equal(plan.projectedPrintedDamage,200);
  assert.equal(plan.source,VERSION);
  view.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(view,catalog).kind,'retreat-emergency-floatstone');
});

test('owner only: cannot infer opponents cards or unknown Prize identities',()=>{
  const view=sample();
  const hidden=new Proxy({},{get(){throw Error('hidden read');}});
  view.opponentPublic.hand=hidden;
  view.opponentPublic.deck=hidden;
  view.opponentPublic.prizes=hidden;
  view.ownPublic.prizes=hidden;
  const before=JSON.stringify({...view,opponentPublic:{
    ...view.opponentPublic,hand:null,deck:null,prizes:null},
    ownPublic:{...view.ownPublic,prizes:null}});
  assert.equal(choose(view,catalog).kind,'attach-emergency-floatstone');
  const after=JSON.stringify({...view,opponentPublic:{
    ...view.opponentPublic,hand:null,deck:null,prizes:null},
    ownPublic:{...view.ownPublic,prizes:null}});
  assert.equal(after,before);
});

test('declines already payable Active attack or insufficient funded Bench',()=>{
  const view=sample();
  view.ownPublic.active.energies=[dark,dark,dark];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.energies=[dark];
  view.ownPublic.bench[0].energies=[dark,dark];
  assert.equal(choose(view,catalog),null);
});

test('opponent Active Jammer and Stadium Tower veto; Benched Jammer does not',()=>{
  const view=sample();
  view.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(choose(view,catalog),null);
  view.opponentPublic.active.tools=[];
  view.opponentPublic.stadium=['Jamming Tower TWM'];
  assert.equal(choose(view,catalog),null);
  view.opponentPublic.stadium=[];
  view.opponentPublic.bench=[{tools:['Tool Jammer BST']}];
  assert.equal(choose(view,catalog).kind,'attach-emergency-floatstone');
});

test('attached Tool works under Tool-play lock; other attached Tool blocks',()=>{
  const view=sample();
  view.ownTurnResources.toolPlayLocked=true;
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(view,catalog).kind,'retreat-emergency-floatstone');
  view.ownPublic.active.tools=['Muscle Band XY'];
  assert.equal(choose(view,catalog),null);
});

test('status, positive attack lock and already retreated deny mobility',()=>{
  const view=sample();
  view.ownPublic.active.specialConditions=[catalog.specialConditions.PARALYZED];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.specialConditions=[];
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(choose(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  view.ownTurnResources.retreatedTurn=12;
  assert.equal(choose(view,catalog),null);
});

test('no turn-one, free printed retreat, zero-Energy or zero-attack recipient',()=>{
  const view=sample();
  view.globalTurn=1;assert.equal(choose(view,catalog),null);
  view.globalTurn=12;view.ownPublic.active.printed.retreatCost=[];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.printed.retreatCost=[9,9];
  view.ownPublic.active.energies=[];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.energies=[dark];
  view.ownPublic.bench[0].attacks[0].damage=20;
  assert.equal(choose(view,catalog),null);
});

test('rank30 style Rondo formula may justify cross-Pokemon funded mobility',()=>{
  const view=sample();
  view.ownPublic.active.printing='Dedenne-GX UNB';
  view.ownPublic.active.attacks=[{name:'Static Shock',damage:40,cost:[5,9]}];
  view.ownPublic.bench=[{
    printing:"Lillie's Clefairy ex JTG",
    printed:{stage:0,types:[5],retreatCost:[9]},
    energies:[psychic,psychic],tools:[],
    attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
    publicRestrictions:{},specialConditions:[]
  }];
  view.opponentPublic.bench=[{printing:'Pidgey MEW'},
    {printing:'Pidgey MEW'},{printing:'Pidgey MEW'}];
  const plan=choose(view,catalog);
  assert.equal(plan?.targetAttackName,'Full Moon Rondo');
  assert.equal(plan?.projectedPrintedDamage,100);
});

test('exactly chosen highest projected damage with deterministic tie break',()=>{
  const view=sample();
  view.ownPublic.bench.push(absol(3));
  view.ownPublic.bench[1].attacks[0].damage=230;
  assert.equal(choose(view,catalog)?.benchIndex,1);
  view.ownPublic.bench[1].attacks[0].damage=200;
  assert.equal(choose(view,catalog)?.benchIndex,0);
});

test('original rank1 Max Geist bracket-[P] scaling allows broad funded line',()=>{
  const view=sample();
  const move={name:'Max Geist',damage:10,cost:[9,9,9],
    text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'};
  const vmax=energies=>({
    printing:'Shadow Rider Calyrex VMAX CRE',
    printed:{stage:3,types:[5],retreatCost:[9,9]},
    energies,tools:[],attacks:[move],specialConditions:[],
    publicRestrictions:{}
  });
  view.ownPublic.active=vmax([psychic]);
  view.ownPublic.bench=[vmax(Array(6).fill(psychic))];
  const plan=choose(view,catalog);
  assert.equal(plan?.kind,'attach-emergency-floatstone');
  assert.equal(plan?.projectedPrintedDamage,220);
  assert.equal(plan?.targetAttackName,'Max Geist');
  view.ownPublic.active.energies=[psychic,psychic,psychic];
  assert.equal(choose(view,catalog),null,
    'already funded Max Geist Active is preserved');
});

test('unmodeled Special Energy makes Basic-only scaling projection abstain',()=>{
  const view=sample();
  const move={name:'Max Geist',damage:10,cost:[9,9,9],
    text:'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'};
  const vmax=energies=>({
    printing:'Shadow Rider Calyrex VMAX CRE',
    printed:{stage:3,types:[5],retreatCost:[9,9]},
    energies,tools:[],attacks:[move],specialConditions:[],
    publicRestrictions:{}
  });
  view.ownPublic.active=vmax([psychic]);
  view.ownPublic.bench=[vmax([
    psychic,psychic,psychic,psychic,psychic,
    'Double Colorless Energy EVO'])];
  const extended={...catalog,
    specialEnergies:new Set(['Double Colorless Energy EVO'])};
  assert.equal(choose(view,extended),null,
    'unknown scaling contribution cannot certify nominal target');
});
