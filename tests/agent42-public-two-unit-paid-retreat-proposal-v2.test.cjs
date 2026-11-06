'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,twoPsychicPayment,postRetreatPrintedDamage,
  proposeTwoUnitPaidRetreatV2:choose
}=require('../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const P='Psychic Energy MEE',C=9;
const catalog={
  stages:{BASIC:0,STAGE_1:1,VMAX:5},
  basicEnergies:new Set([P,'Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:5,Darkness:7},
  specialEnergies:new Set(['Double Colorless Energy EVO','Prism Energy ASC']),
  dragonPokemonPrintings:new Set(),
  ruleboxPokemonPrintings:new Set(),
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:1,PARALYZED:2}
};
const restrictions=()=>({
  cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
  blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
  onlyAllowedAttackNameNextTurn:null,cannotRetreatNextTurn:false,
  cannotRetreatWhileActive:false
});
function fixture(){
  const active={
    printing:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    hp:320,damage:0,printed:{stage:5,types:[5],retreatCost:[C,C],resistance:[]},
    energies:[P,P],tools:[],specialConditions:[],
    publicRestrictions:restrictions(),
    attacks:[{name:'Max Geist',cost:[C,C,C],damage:10,
      damageCalculation:null,gxAttack:false}]
  };
  const latias={
    printing:'Latias ex SSP',name:'Latias ex',hp:210,damage:0,
    printed:{stage:0,types:[5],retreatCost:[C,C],resistance:[]},
    energies:[P,P,P],tools:[],specialConditions:[],
    abilityDetails:[{name:'Skyliner',text:'Your Basic Pokémon in play have no Retreat Cost.'}],
    publicRestrictions:restrictions(),
    attacks:[{name:'Eon Blade',cost:[5,5,C],damage:200,
      damageCalculation:null,gxAttack:false}]
  };
  const defender={
    printing:'Lunatone OBF',name:'Lunatone',hp:90,damage:10,
    printed:{stage:0,types:[5],retreatCost:[C],resistance:[]},
    energies:[],tools:[],specialConditions:[],
    publicRestrictions:restrictions(),abilities:['New Moon'],
    abilityDetails:[{name:'New Moon',
      text:'If you have Solrock in play, prevent all effects of any Stadium done to your Pokémon in play.'}],
    attacks:[]
  };
  const view={
    decisionKind:'owner-root',globalTurn:22,ownHand:[],
    ownTurnResources:{retreatedTurn:0,toolPlayLocked:false},
    ownPublic:{active,bench:[latias],prizeCount:1,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false,
        cannotUseGXAttacks:false,toolPlayLocked:false}},
    opponentPublic:{active:defender,bench:[],prizeCount:6,stadium:[]}
  };
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw Error('opponent hidden information must not be accessed');}
  });
  return view;
}

test('v2 recognizes the rank1 two-Psychic Latias Eon Blade final-Prize line',()=>{
  const view=fixture(),plan=choose(view,catalog);
  assert.match(VERSION,/terminal-v2/);
  assert.deepEqual(twoPsychicPayment(view.ownPublic.active,catalog),
    {indices:[0,1],printings:[P,P]});
  assert.equal(plan?.kind,'two-unit-paid-retreat-proposal-v2');
  assert.equal(plan?.benchIndex,0);
  assert.equal(plan?.printing,'Latias ex SSP');
  assert.equal(plan?.attackName,'Eon Blade');
  assert.deepEqual(plan?.discardEnergyIndices,[0,1]);
  assert.equal(plan?.projectedPrintedDamage,200);
  assert.equal(plan?.opponentActiveRemainingHp,80);
  assert.equal(plan?.projectedPrizeCount,1);
  assert.equal(plan?.projectedTerminalWin,true);
  assert.equal(plan?.nativeStorePaymentVerified,false);
  assert.equal(plan?.nativeTerminalVerified,false);
  assert.equal(plan?.competitiveGameQualified,false);
});

test('Max Geist projection removes the exact two Psychic payment cards',()=>{
  const view=fixture();
  const vmax={...view.ownPublic.bench[0],
    printing:'Shadow Rider Calyrex VMAX CRE',energies:[P,P,P],
    attacks:[{name:'Max Geist',cost:[C,C,C],damage:10,
      damageCalculation:null,gxAttack:false}]};
  const donor={...view.ownPublic.bench[0],printing:'Girafarig LOT',energies:[P,P],attacks:[]};
  view.ownPublic.bench=[vmax,donor];
  assert.equal(postRetreatPrintedDamage(view,vmax,vmax.attacks[0],
    {indices:[0,1]},catalog),160);
  assert.equal(choose(view,catalog)?.projectedPrintedDamage,160);
});

test('unused payable Active GX attack blocks Retreat; used GX does not',()=>{
  const view=fixture();
  view.ownPublic.active.attacks.push({
    name:'Shadow Storm-GX',gxAttack:true,cost:[5,5],damage:100,
    damageCalculation:null
  });
  assert.equal(choose(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(choose(view,catalog)?.attackName,'Eon Blade');
});

test('missing or malformed Active attack inventory fails closed',()=>{
  const view=fixture();
  delete view.ownPublic.active.attacks;
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.attacks=[{name:'broken',cost:null}];
  assert.equal(choose(view,catalog),null);
});

test('nonlethal retreat and empty Prize count are rejected',()=>{
  const view=fixture();
  view.opponentPublic.active.hp=240;
  assert.equal(choose(view,catalog),null);
  view.opponentPublic.active.hp=90;
  view.ownPublic.prizeCount=0;
  assert.equal(choose(view,catalog),null);
});

test('unknown Rule-Box Prize value, resistance, or visible Prize modifier fails closed',()=>{
  const a=fixture();
  catalog.ruleboxPokemonPrintings.add('Lunatone OBF');
  assert.equal(choose(a,catalog),null);
  catalog.ruleboxPokemonPrintings.delete('Lunatone OBF');
  const b=fixture();
  b.opponentPublic.active.printed.resistance=[{type:5,value:'-30'}];
  assert.equal(choose(b,catalog),null);
  const c=fixture();
  c.opponentPublic.bench=[{abilityDetails:[{name:'Prize Guard',
    text:'Your opponent takes no Prize cards when this Pokémon is Knocked Out.'}]}];
  assert.equal(choose(c,catalog),null);
});

test('only two distinct Basic Psychic Energy cards are admitted',()=>{
  const view=fixture();
  view.ownPublic.active.energies=['Double Colorless Energy EVO',P];
  assert.equal(choose(view,catalog),null);
  view.ownPublic.active.energies=[P,P,'Darkness Energy MEE'];
  assert.equal(choose(view,catalog),null);
  assert.equal(twoPsychicPayment({energies:['Double Colorless Energy EVO']},
    catalog),null);
});

test('attack, status, Stadium and target locks fail closed',()=>{
  const a=fixture();a.ownPublic.active.attacks[0].cost=[5,5];
  assert.equal(choose(a,catalog),null);
  const b=fixture();b.ownPublic.active.specialConditions=[2];
  assert.equal(choose(b,catalog),null);
  const c=fixture();c.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choose(c,catalog),null);
  const d=fixture();d.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(choose(d,catalog),null);
});

test('owner observation is immutable and opposing hidden information is untouched',()=>{
  const view=fixture(),before=JSON.stringify(view);
  assert.equal(choose(view,catalog)?.projectedTerminalWin,true);
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>choose(view,catalog),/owner-root/);
});


test('Skyliner and Snorlax Block are applied from the correct controller and Active state',()=>{
  const ownBasic=fixture();
  ownBasic.ownPublic.active.printed.stage=catalog.stages.BASIC;
  assert.equal(choose(ownBasic,catalog),null);
  const block=fixture();
  block.opponentPublic.active.printing='Snorlax PGO 55';
  block.opponentPublic.active.abilityDetails=[{name:'Block',
    text:"As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat."}];
  assert.equal(choose(block,catalog),null);
  const unknown=fixture();
  unknown.ownPublic.bench[0].abilityDetails=[{name:'Unknown',
    text:'Your Pokémon have a different Retreat Cost.'}];
  assert.equal(choose(unknown,catalog),null);
  const opponentSkyliner=fixture();
  opponentSkyliner.ownPublic.bench[0].abilityDetails=[];
  opponentSkyliner.ownPublic.active.printed.stage=catalog.stages.BASIC;
  opponentSkyliner.opponentPublic.bench=[{printing:'Latias ex SSP',tools:[],
    abilityDetails:[{name:'Skyliner',
      text:'Your Basic Pokémon in play have no Retreat Cost.'}]}];
  assert.equal(choose(opponentSkyliner,catalog)?.attackName,'Eon Blade');
});
