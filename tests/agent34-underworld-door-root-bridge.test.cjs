'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {ownerUnderworldMarkerReceipt}=
  require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');

const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy MEE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([PSY]),basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:0}
};
const visible=(printing,abilities=[],types=[5])=>({
  printing,name:printing,abilities,printed:{types,retreatCost:[9]},
  energies:[],attacks:[],publicRestrictions:{},specialConditions:[]
});
function view(){
  return {
    decisionKind:'owner-root',globalTurn:6,ownHand:[PSY],
    ownPublic:{
      active:visible('Tapu Lele-GX GRI'),
      bench:[visible(VMAX,['Underworld Door']),
        visible('Shadow Rider Calyrex V CRE'),null,null,null],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    ownTurnResources:{
      pokemonPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0,retreatedTurn:0
    }
  };
}
const physical=fullName=>({
  fullName,name:fullName,cardType:[5],hp:210,stage:0,retreat:[9],
  weakness:[],resistance:[],attacks:[],
  powers:fullName===VMAX?[{name:'Underworld Door'}]:[]
});
function slot(fullName=null){
  const card=fullName?physical(fullName):null;
  return {
    cards:card?[card]:[],damage:0,specialConditions:[],
    energies:{cards:[]},tools:[],
    getPokemonCard(){return card;}
  };
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){
    Object.assign(this,{id,handIndex,target});
  }
}
class UseAbilityAction{
  constructor(clientId,abilityName,target){
    Object.assign(this,{clientId,abilityName,target});
  }
}
class AttackAction{constructor(clientId,name){Object.assign(this,{clientId,name});}}
class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class Store{
  constructor(used=false){
    this.state={
      players:[{
        id:10,active:slot('Tapu Lele-GX GRI'),
        bench:[slot(VMAX),slot('Shadow Rider Calyrex V CRE'),slot(),slot(),slot()],
        hand:{cards:[physical(PSY)]},deck:{cards:[]},
        prizes:[],stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]},
        marker:{hasMarker:(marker,card)=>{
          assert.equal(marker,'UNDERWORLD_DOOR_MARKER');
          return used&&card.fullName===VMAX;
        }}
      },{
        id:20,active:slot(),bench:[slot(),slot(),slot(),slot(),slot()],
        hand:{cards:[]},deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
        supporter:{cards:[]}
      }],
      activePlayer:0,turn:6,phase:2,prompts:[]
    };
  }
  dispatch(){return true;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Generic hidden-information selector used');}
}
/** @param {boolean} enabled @param {boolean} used */
function nativeRoot(enabled,used=false){
  const before=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  const got=withActorOnlyRootPolicy(()=>{
    const store=new Store(used);
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
    const marker=ownerUnderworldMarkerReceipt(store.state.players[0]);
    store.dispatch(action);
    return {action,marker};
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>view(),getCatalog:()=>catalog,
    underworldDoorRoot:enabled,
    cardActions:{PlayCardAction,
      PlayerType:{BOTTOM_PLAYER:2},SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{UseAbilityAction,AttackAction,PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
  return got;
}

test('default-OFF bridge preserves original Psychic attachment',()=>{
  const result=nativeRoot(false);
  assert.ok(result.result.action instanceof PlayCardAction);
  assert.equal(result.audit.underworldDoorRootSelected,0);
});
test('trusted unspent marker becomes typed owner-Bench UseAbilityAction',()=>{
  const result=nativeRoot(true);
  assert.ok(result.result.action instanceof UseAbilityAction);
  assert.equal(result.result.action.abilityName,'Underworld Door');
  assert.equal(result.result.action.clientId,10);
  assert.deepEqual(result.result.action.target,{
    player:2,slot:2,index:0
  });
  assert.equal(result.audit.underworldDoorRootSelected,1);
  assert.equal(result.audit.acceptedActorRoots,1,
    'Genuine Store wrapper accepted the owner root');
  assert.equal(result.audit.nativePhysicalUnconfirmed,1,
    'Mock Store without an Energy prompt cannot certify a real attachment');
  assert.deepEqual(result.result.marker,
    {activeUnspent:false,benchUnspent:[true,false,false,false,false]});
  assert.equal(result.audit.competitiveGameQualified,false);
});
test('already-spent source marker abstains and uses original attachment',()=>{
  const result=nativeRoot(true,true);
  assert.ok(result.result.action instanceof PlayCardAction);
  assert.equal(result.audit.underworldDoorRootSelected,0);
});
test('pure intent cannot propose without explicit authenticated marker receipt',()=>{
  const v=view();
  assert.equal(chooseActorRootIntent(v,catalog,{
    underworldDoorRoot:true
  }).kind,'attach-basic-energy');
  const proposal=chooseActorRootIntent(v,catalog,{
    underworldDoorRoot:true,
    underworldMarkerReceipt:{
      activeUnspent:false,benchUnspent:[true,false,false,false,false]
    }
  });
  assert.equal(proposal.kind,'use-underworld-door');
  assert.equal(proposal.sourceMarkerVerifiedUnspent,true);
});
