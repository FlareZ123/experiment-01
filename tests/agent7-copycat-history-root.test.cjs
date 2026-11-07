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
const BURROW_FIRST={...BURROW,barragePairIndex:0,barragePairRole:'first'};
const ROTOTILLER_SECOND={...ROTOTILLER,barragePairIndex:0,barragePairRole:'second'};
const ROTOTILLER_FIRST={...ROTOTILLER,barragePairIndex:0,barragePairRole:'first'};
const BURROW_SECOND={...BURROW,barragePairIndex:0,barragePairRole:'second'};

function makeView(rows,turn=14,activePrinting='Mimikyu GRI',energyCount=2,choices){
  const copycatChoices=choices===undefined?
    (rows===null?null:rows.filter(row=>!row.gxAttack&&!row.copycatAttack).slice(-1)):
    choices;
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
      opponentLastTurnAttacks:rows,opponentCopycatChoices:copycatChoices
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

test('attaches the latest stamped public snapshot and its exact Copycat choice set',()=>{
  const slot=printing=>({getPokemonCard:()=>printing?{fullName:printing,id:1}:null});
  const state={
    players:[
      {id:1,active:slot('Mimikyu GRI'),bench:[],marker:null,movedToActiveThisTurn:[]},
      {id:2,active:slot('Bunnelby PRC'),bench:[],marker:null,movedToActiveThisTurn:[]}
    ],
    activePlayer:0,turn:15
  };
  const base={actorSeat:0,globalTurn:15,decisionKind:'owner-root',
    ownPublic:{active:{name:'Mimikyu',attacks:[{name:'Filch'},{name:'Copycat'}]}}
  };
  const unknown=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:()=>null,getCopycatChoices:()=>[]
  });
  assert.equal(unknown.publicEventReceipt.opponentLastTurnAttacks,null);
  assert.equal(unknown.publicEventReceipt.opponentLastTurnTurn,null);
  assert.equal(unknown.publicEventReceipt.opponentCopycatChoices,null);
  assert.equal(unknown.publicEventReceipt.mimikyuCopycatCompatible,null);
  const nativeBurrow={playerId:2,turn:14,sourceCardFullName:'Bunnelby PRC',
    attackName:'Burrow',gxAttack:false,copycatAttack:false};
  const known=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:id=>{
      assert.equal(id,2);
      return {turn:14,attacks:[nativeBurrow]};
    },
    getCopycatChoices:()=>[nativeBurrow]
  });
  assert.equal(known.publicEventReceipt.opponentLastTurnTurn,14);
  assert.deepEqual(known.publicEventReceipt.opponentCopycatChoices,
    [known.publicEventReceipt.opponentLastTurnAttacks[0]]);
  assert.equal(known.publicEventReceipt.mimikyuCopycatCompatible,true);
  const nativeApex={playerId:2,turn:14,sourceCardName:'Regidrago VSTAR',
    sourceCardFullName:'Regidrago VSTAR SIT',attackName:'Apex Dragon',
    gxAttack:false,copycatAttack:true};
  const apex=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:()=>({turn:14,attacks:[nativeApex]}),
    getCopycatChoices:()=>[nativeApex]
  });
  assert.equal(apex.publicEventReceipt.mimikyuCopycatCompatible,true);
  assert.deepEqual(apex.publicEventReceipt.opponentCopycatChoices,
    [{turn:14,sourcePrinting:'Regidrago VSTAR SIT',attackName:'Apex Dragon',
      gxAttack:false,copycatAttack:true}]);
  assert.ok(Object.isFrozen(known));
  assert.ok(Object.isFrozen(known.publicEventReceipt));
  const empty=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:()=>({turn:14,attacks:[]}),
    getCopycatChoices:()=>[]
  });
  assert.deepEqual(empty.publicEventReceipt.opponentLastTurnAttacks,[]);
  assert.deepEqual(empty.publicEventReceipt.opponentCopycatChoices,[]);
  assert.equal(empty.publicEventReceipt.mimikyuCopycatCompatible,false);
  const nonMimikyu=attachPreviousOpponentTurnReceipt({
    ...base,ownPublic:{active:{name:'Pidgeot ex',attacks:[{name:'Quick Search'}]}}
  },state,0,{
    getPreviousTurnSnapshot:()=>({turn:14,attacks:[nativeBurrow]}),
    getCopycatChoices:()=>[nativeBurrow]
  });
  assert.equal(nonMimikyu.publicEventReceipt.mimikyuCopycatCompatible,false);
  const missingChoiceApi=attachPreviousOpponentTurnReceipt(base,state,0,{
    getPreviousTurnSnapshot:()=>({turn:14,attacks:[nativeBurrow]})
  });
  assert.equal(missingChoiceApi.publicEventReceipt.mimikyuCopycatCompatible,null);
});

test('selects Copycat for one exact prior-turn Bunnelby Burrow and passes it into the actor-root chooser',()=>{
  const view=makeView([BURROW]);
  const expected={
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousTurn:14,previousSource:'Bunnelby PRC',previousAttack:'Burrow',
    previousChoiceIndex:0,previousBarragePairIndex:null,
    previousBarragePairRole:null
  };
  assert.deepEqual(chooseMimikyuBurrowCopycat(view),expected);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),expected);
});

test('fails closed for unavailable, known-empty, and ineligible latest attacks',()=>{
  for(const [rows,choices] of [[null,null],[[],[]],[[BURROW,ROTOTILLER],[ROTOTILLER]]]){
    const view=makeView(rows,14,'Mimikyu GRI',2,choices);
    assert.equal(chooseMimikyuBurrowCopycat(view),null);
    assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),
      {kind:'attack',attackName:'Filch'});
  }
});

test('uses only the tracker-certified two-member Ω Barrage pair, in either attack order',()=>{
  const first=makeView([BURROW_FIRST,ROTOTILLER_SECOND],14,'Mimikyu GRI',2,
    [BURROW_FIRST,ROTOTILLER_SECOND]);
  const firstIntent=chooseMimikyuBurrowCopycat(first);
  assert.equal(firstIntent.attackName,'Copycat');
  assert.equal(firstIntent.previousChoiceIndex,0);
  assert.equal(firstIntent.previousBarragePairIndex,0);
  assert.equal(firstIntent.previousBarragePairRole,'first');
  assert.deepEqual(chooseActorRootIntent(first,catalog,{copycatHistoryRoot:true}),
    firstIntent);
  const second=makeView([ROTOTILLER_FIRST,BURROW_SECOND],14,'Mimikyu GRI',2,
    [ROTOTILLER_FIRST,BURROW_SECOND]);
  const secondIntent=chooseMimikyuBurrowCopycat(second);
  assert.equal(secondIntent.attackName,'Copycat');
  assert.equal(secondIntent.previousChoiceIndex,1);
  assert.equal(secondIntent.previousBarragePairRole,'second');
  assert.deepEqual(chooseActorRootIntent(second,catalog,{copycatHistoryRoot:true}),
    secondIntent);
});

test('rejects incomplete, malformed, same-attack, stale, and wrong-actor choice sets',()=>{
  const incomplete=makeView([BURROW_FIRST],14,'Mimikyu GRI',2,[BURROW_FIRST]);
  assert.equal(chooseMimikyuBurrowCopycat(incomplete),null);
  const mismatchedPair=makeView([BURROW_FIRST,ROTOTILLER_SECOND],14,
    'Mimikyu GRI',2,[BURROW_FIRST,{...ROTOTILLER_SECOND,barragePairIndex:1}]);
  assert.equal(chooseMimikyuBurrowCopycat(mismatchedPair),null);
  const sameAttack=makeView([BURROW_FIRST,{...BURROW_SECOND}],14,
    'Mimikyu GRI',2,[BURROW_FIRST,{...BURROW_SECOND}]);
  assert.equal(chooseMimikyuBurrowCopycat(sameAttack),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView([BURROW],13)),null);
  assert.equal(chooseMimikyuBurrowCopycat(
    makeView([BURROW],14,'Mew VMAX FST')),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView(
    [{...BURROW,gxAttack:true}])),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView(
    [{...BURROW,copycatAttack:true}])),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView(
    [{...BURROW,sourcePrinting:'Regidrago VSTAR SIT'}])),null);
  assert.equal(chooseMimikyuBurrowCopycat(makeView(
    [{...BURROW,attackName:'Rototiller'}])),null);
});

test('Copycat still requires native-payable attack cost',()=>{
  const view=makeView([BURROW],14,'Mimikyu GRI',1);
  const expected=chooseMimikyuBurrowCopycat(view);
  assert.ok(expected);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{copycatHistoryRoot:true}),
    {kind:'attack',attackName:'Filch'});
});
