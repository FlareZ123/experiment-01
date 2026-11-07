'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  attachPreviousOpponentTurnReceipt,chooseMimikyuBurrowCopycat,VERSION
}=require('../simulation/twinleaf/agent7-copycat-history-root.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const BURROW={turn:14,sourcePrinting:'Bunnelby PRC',
  attackName:'Burrow',gxAttack:false,copycatAttack:false};
const ROTOTILLER={turn:14,sourcePrinting:'Bunnelby PRC',
  attackName:'Rototiller',gxAttack:false,copycatAttack:false};

function makeView(rows,turn=14,activePrinting='Mimikyu GRI',energyCount=2){
  return {
    actorSeat:1,globalTurn:15,decisionKind:'owner-root',ownHand:[],
    ownPublic:{
      active:{
        printing:activePrinting,name:'Mimikyu',
        energies:Array.from({length:energyCount},()=> 'Psychic Energy SVE'),
        attacks:[
          {name:'Filch',cost:[0],gxAttack:false},
          {name:'Copycat',cost:[5,0],gxAttack:false}
        ],
        printed:{types:[5]},specialConditions:[],publicRestrictions:{}
      },
      bench:[],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      publicTurnRestrictions:{
        gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
        cannotUseGXAttacks:false,pokemonPlayLocked:false,
        abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
        itemPlayLocked:false,supporterPlayLocked:false,
        stadiumPlayLocked:false,toolPlayLocked:false,
        energyPlayLocked:false,specialEnergyPlayLocked:false
      }
    },
    opponentPublic:{
      active:null,bench:[],stadium:[],discard:[],lostZone:[],
      handCount:5,deckCount:20,prizeCount:6
    },
    ownTurnResources:{
      supporterPlayedTurn:0,retreatedTurn:0,energyPlayedTurn:0,
      stadiumPlayedTurn:0,stadiumUsedTurn:0,vstarUsed:false,
      pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
      evolutionPlayLocked:false,itemPlayLocked:false,
      supporterPlayLocked:false,stadiumPlayLocked:false,
      toolPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false
    },
    publicEventReceipt:{
      actorSeat:1,turn:15,opponentLastTurnTurn:turn,
      opponentLastTurnAttacks:rows
    }
  };
}
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy SVE']),
  basicEnergyTypes:{Psychic:5,Lightning:4,Fairy:6},
  colorlessEnergyType:0,
  specialConditions:{ASLEEP:1,PARALYZED:2,CONFUSED:3}
};

test('attaches the latest stamped public opponent snapshot without collapsing null and empty',()=>{
  const slot=printing=>({getPokemonCard:()=>printing?{fullName:printing,id:1}:null});
  const state={
    players:[
      {id:1,active:slot('Mimikyu GRI'),bench:[],marker:null,movedToActiveThisTurn:[]},
      {id:2,active:slot('Bunnelby PRC'),bench:[],marker:null,movedToActiveThisTurn:[]}
    ],
    activePlayer:0,turn:15
  };
  const base={actorSeat:0,globalTurn:15,decisionKind:'owner-root'};
  const unknown=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:()=>null
  });
  assert.equal(unknown.publicEventReceipt.opponentLastTurnAttacks,null);
  assert.equal(unknown.publicEventReceipt.opponentLastTurnTurn,null);
  const empty=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:id=>{
      assert.equal(id,2);
      return {turn:14,attacks:[]};
    }
  });
  assert.deepEqual(empty.publicEventReceipt.opponentLastTurnAttacks,[]);
  assert.equal(empty.publicEventReceipt.opponentLastTurnTurn,14);
  assert.ok(Object.isFrozen(empty));
  assert.ok(Object.isFrozen(empty.publicEventReceipt));
});

test('selects Copycat for one exact prior-turn Bunnelby Burrow and passes it into the actor-root chooser',()=>{
  const view=makeView([BURROW]);
  const expected={
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousTurn:14,previousSource:'Bunnelby PRC',previousAttack:'Burrow'
  };
  assert.deepEqual(chooseMimikyuBurrowCopycat(view),expected);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),expected);
});

test('fails closed for unavailable and known-empty previous turns',()=>{
  for(const rows of [null,[]]){
    const view=makeView(rows);
    assert.equal(chooseMimikyuBurrowCopycat(view),null);
    assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),
      {kind:'attack',attackName:'Filch'});
  }
});

test('fails closed for multiattack turns until Ω Barrage pair eligibility is explicit',()=>{
  const view=makeView([BURROW,ROTOTILLER]);
  assert.equal(chooseMimikyuBurrowCopycat(view),null);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),
    {kind:'attack',attackName:'Filch'});
});

test('rejects GX, Copycat, wrong source, wrong attack, stale stamp, and non-Mimikyu actors',()=>{
  const rows=[
    {...BURROW,gxAttack:true},
    {...BURROW,copycatAttack:true},
    {...BURROW,sourcePrinting:'Regidrago VSTAR SIT'},
    {...BURROW,attackName:'Rototiller'}
  ];
  for(const row of rows)assert.equal(
    chooseMimikyuBurrowCopycat(makeView([row])),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView([BURROW],13)),null);
  assert.equal(chooseMimikyuBurrowCopycat(
    makeView([BURROW],14,'Mew VMAX FST')),null);
});

test('Copycat still requires native-payable attack cost',()=>{
  const view=makeView([BURROW],14,'Mimikyu GRI',1);
  assert.deepEqual(chooseMimikyuBurrowCopycat(view),{
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousTurn:14,previousSource:'Bunnelby PRC',previousAttack:'Burrow'
  });
  assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),
    {kind:'attack',attackName:'Filch'});
});
