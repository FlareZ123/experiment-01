'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {hasFirstPlayerPrintedAttackException}=require(
  '../simulation/twinleaf/agent37-firstturn-exception.cjs');
const {chooseActorRootIntent}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=require(
  '../simulation/twinleaf/actor-observation-contract.cjs');

const FAST_FLIGHT={
  name:'Fast Flight',cost:[0],damage:0,gxAttack:false,
  canUseOnFirstTurn:true,
  text:'If you go first, you can use this attack during your first turn. Discard your hand and draw 6 cards.'
};
const CATALOG={
  basics:new Set(),abilityBasics:new Set(),evolutions:new Map(),
  basicEnergies:new Set(['Fire Energy SVE']),
  basicEnergyTypes:{Fire:2},colorlessEnergyType:0,
  specialConditions:{ASLEEP:1,PARALYZED:2},
  specialEnergies:new Set()
};

/** @param {{globalTurn?:number,attack?:object,energy?:string[],status?:number[]}} [options] */
function view(options={}){
  const attack=options.attack??FAST_FLIGHT;
  return {
    decisionKind:'owner-root',globalTurn:options.globalTurn??1,
    ownHand:[],ownTurnResources:{
      pokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      energyPlayedTurn:1,supporterPlayedTurn:0,
      supporterPlayLocked:false,stadiumPlayLocked:false
    },
    ownPublic:{
      active:{name:'Talonflame V',printing:'Talonflame V VIV',
        attacks:[attack],energies:options.energy??['Fire Energy SVE'],
        tools:[],specialConditions:options.status??[],
        printed:{types:[]},publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      prizeCount:6,publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },
    opponentPublic:{bench:[null,null,null,null,null],stadium:[],prizeCount:6}
  };
}

test('known pinned print and exact player-one text permit a paid first-turn attack only when opted in',()=>{
  assert.equal(hasFirstPlayerPrintedAttackException(FAST_FLIGHT),true);
  assert.equal(chooseActorRootIntent(view(),CATALOG,{}).kind,'pass');
  assert.deepEqual(chooseActorRootIntent(view(),CATALOG,
    {printedFirstTurnAttackRoot:true}),{kind:'attack',attackName:'Fast Flight'});
  assert.deepEqual(chooseActorRootIntent(view({globalTurn:2}),CATALOG,{}),
    {kind:'attack',attackName:'Fast Flight'});
});

test('fail closed on printing mismatch: native flag and public attack text must independently agree',()=>{
  const variants=[
    {...FAST_FLIGHT,canUseOnFirstTurn:false},
    {...FAST_FLIGHT,text:'Discard your hand and draw 6 cards.'},
    {...FAST_FLIGHT,text:'If you go SECOND, you can use this attack on your first turn.'},
    {...FAST_FLIGHT,text:null},
    {...FAST_FLIGHT,canUseOnFirstTurn:undefined}
  ];
  for(const attack of variants){
    assert.equal(hasFirstPlayerPrintedAttackException(attack),false);
    assert.equal(chooseActorRootIntent(view({attack}),CATALOG,
      {printedFirstTurnAttackRoot:true}).kind,'pass');
  }
});

test('first-player exception remains subject to printed payment and public attack blocks',()=>{
  for(const v of [
    view({energy:[]}),
    view({status:[CATALOG.specialConditions.ASLEEP]}),
    view({status:[CATALOG.specialConditions.PARALYZED]})
  ]){
    assert.equal(chooseActorRootIntent(v,CATALOG,
      {printedFirstTurnAttackRoot:true}).kind,'pass');
  }
});

test('native actorObservation projects public exception without concealed-card reading',()=>{
  const fakeCard=name=>({fullName:name});
  const attacker={fullName:'Talonflame V VIV',name:'Talonflame V',
    hp:190,stage:0,cardType:[],retreat:[],weakness:[],resistance:[],
    powers:[],attacks:[FAST_FLIGHT]};
  const slot={getPokemonCard:()=>attacker,cards:[attacker],damage:0,
    energies:{cards:[fakeCard('Fire Energy SVE')]},tools:[]};
  const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
    energies:{cards:[]},tools:[]});
  const owner={id:101,active:slot,bench:Array.from({length:5},empty),
    hand:{cards:[]},deck:{cards:[fakeCard('Private owner deck')]},
    prizes:Array.from({length:6},()=>({cards:[fakeCard('Private owner prize')]})),
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:1,stadiumPlayedTurn:0};
  const opponent={...owner,id:202,active:slot,
    hand:{cards:[fakeCard('Opp hidden A')]},
    deck:{cards:[fakeCard('Opp deck A')]},
    prizes:Array.from({length:6},()=>({cards:[fakeCard('Opp prize A')]}))};
  const state={turn:1,phase:5,activePlayer:0,prompts:[],players:[owner,opponent]};
  const a=actorObservation(state,0);
  assert.equal(a.ownPublic.active.attacks[0].canUseOnFirstTurn,true);
  assert.deepEqual(chooseActorRootIntent(a,CATALOG,
    {printedFirstTurnAttackRoot:true}),
    {kind:'attack',attackName:'Fast Flight'});
  opponent.hand.cards=[fakeCard('Opp hidden B')];
  opponent.deck.cards=[fakeCard('Opp deck B')];
  opponent.prizes[0].cards=[fakeCard('Opp prize B')];
  owner.deck.cards=[fakeCard('Owner deck B')];
  owner.prizes[0].cards=[fakeCard('Owner prize B')];
  assert.deepEqual(actorObservation(state,0),a);
});

test('opposing and ordinary printed attacks do not inherit the first-turn exception',()=>{
  const ordinary={name:'Bright Wing',cost:[0],damage:160,
    canUseOnFirstTurn:false,text:'Discard an Energy from this Pokemon.'};
  const v=view({attack:ordinary});
  assert.equal(chooseActorRootIntent(v,CATALOG,
    {printedFirstTurnAttackRoot:true}).kind,'pass');
});

module.exports={FAST_FLIGHT};
