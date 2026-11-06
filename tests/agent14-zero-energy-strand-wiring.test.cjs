'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const psychic='Psychic Energy MEE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([psychic]),specialEnergies:new Set(),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};
function blank(printing){
  return {printing,printed:{stage:0,types:[5],retreatCost:[9]},
    energies:[],tools:[],attacks:[],specialConditions:[],
    publicRestrictions:{}};
}
function ownerView(){
  const mimikyu=blank('Mimikyu GRI');
  const vmax=blank('Shadow Rider Calyrex VMAX CRE');
  vmax.printed.stage=3;
  vmax.energies=[psychic,psychic,psychic];
  vmax.attacks=[{name:'Max Geist',damage:10,cost:[9,9,9],
    text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'}];
  return {
    decisionKind:'owner-root',globalTurn:34,
    ownHand:['Float Stone BKT'],
    ownTurnResources:{retreatedTurn:32,toolPlayLocked:false,
      pokemonPlayLocked:false,energyPlayedTurn:34},
    ownPublic:{active:mimikyu,
      bench:[blank('Dialga-GX FLI'),blank('Girafarig LOT'),vmax,
        blank('Trevenant & Dusknoir-GX PR-SM'),blank('Latias ex SSP')],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{
      printing:'Oranguru V ASR',hp:210,damage:130,
      printed:{types:[9],resistance:[]},tools:[]},
      bench:[blank('Garbodor BKP')],stadium:[]}
  };
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class PassTurnAction{constructor(id){this.id=id;}}
class RetreatAction{
  constructor(id,benchIndex){
    this.id=id;this.benchIndex=benchIndex;
  }
}
class Store{
  constructor(activePlayer,turn){
    const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
      energies:{cards:[]},tools:[],specialConditions:[]});
    const player=id=>({id,active:empty(),
      bench:Array.from({length:5},empty),hand:{cards:[]},
      deck:{cards:[]},prizes:[],stadium:{cards:[]},
      discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]}});
    this.state={players:[player(10),player(20)],
      activePlayer,turn,phase:2,prompts:[]};
  }
  dispatch(){return true;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
function run({seat=1,turn=34,enabled=true,attached=false,scopeAny=false}={}){
  const view=ownerView();
  view.globalTurn=turn;
  if(attached){
    view.ownPublic.active.tools=['Float Stone BKT'];
    view.ownHand=[];
  }
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store(seat,turn);
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(store.state.players[seat].id)
      .decodeNextAction(store.state);
    store.dispatch(action);
    return action;
  },{
    zeroEnergyStrandFloatStoneRoot:enabled,
    zeroEnergyStrandFloatStoneTargetTurn:scopeAny?null:34,
    zeroEnergyStrandFloatStoneOwnerSeat:scopeAny?null:1,
    observe:()=>view,getCatalog:()=>catalog,
    Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    cardActions:{
      PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},SlotType:{
        ACTIVE:1,BENCH:2
      }
    },
    gameActions:{
      PassTurnAction,RetreatAction,
      AttackAction:class{},UseAbilityAction:class{}
    }
  });
  return result;
}
test('real actor wrapper only enables scoped strand Tool on target seat and turn',()=>{
  const disabled=run({enabled:false});
  const wrongSeat=run({seat:0});
  const wrongTurn=run({turn:35});
  const active=run();
  assert.ok(disabled.result instanceof PassTurnAction);
  assert.ok(wrongSeat.result instanceof PassTurnAction);
  assert.ok(wrongTurn.result instanceof PassTurnAction);
  assert.ok(active.result instanceof PlayCardAction);
  assert.equal(active.result.handIndex,0);
  assert.deepEqual(active.result.target,{player:0,slot:1,index:0});
  assert.equal(active.audit.zeroEnergyStrandFloatStoneRootOptIn,true);
  assert.equal(active.audit.zeroEnergyStrandFloatStoneRootSelected,1);
  assert.equal(active.audit.competitiveGameQualified,false);
});
test('a separately attached Float Stone produces real RetreatAction on target seat',()=>{
  const active=run({attached:true});
  assert.ok(active.result instanceof RetreatAction);
  assert.equal(active.result.benchIndex,2);
  assert.equal(active.audit.zeroEnergyStrandFloatStoneRootSelected,1);
});

test('explicit prospective all-turn scope can select both real physical seats',()=>{
  for(const seat of [0,1]){
    for(const turn of [10,35]){
      const chosen=run({seat,turn,scopeAny:true});
      assert.ok(chosen.result instanceof PlayCardAction,
        'prospective all-turn owner should be allowed on both seats');
      assert.equal(chosen.audit.zeroEnergyStrandFloatStoneRootSelected,1);
      assert.equal(chosen.audit.zeroEnergyStrandFloatStoneTargetTurn,null);
      assert.equal(chosen.audit.zeroEnergyStrandFloatStoneOwnerSeat,null);
    }
  }
});
