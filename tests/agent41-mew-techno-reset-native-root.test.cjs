'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {
  MEW,GENESECT,DCE,chooseGuzmaMewCooldownReset
}=require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:3}
};

const mew=(energy=[],cooldown=false)=>({
  printing:MEW,energies:energy,
  printed:{retreatCost:[]},
  publicRestrictions:{cannotAttackNextTurn:cooldown},
  attacks:[{name:'Cross Fusion Strike',cost:[9,9],gxAttack:false}],
  specialConditions:[]
});

function mewState(){
  return {
    decisionKind:'owner-root',globalTurn:21,
    ownHand:['Guzma BUS 115'],
    ownPublic:{
      active:mew([DCE],true),
      bench:[{printing:GENESECT},mew(),null],
      stadium:[],resolvingSupporter:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,
        supporterPlayLocked:false}
    },
    ownTurnResources:{retreatedTurn:0,supporterPlayedTurn:0,
      supporterPlayLocked:false,energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false,pokemonPlayLocked:false},
    opponentPublic:{stadium:[],
      bench:[{printing:'Visible Target',hp:190,damage:0}]}
  };
}

test('canonical root only emits Mew-reset Guzma when the option is selected',()=>{
  const view=mewState();
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  const intent=chooseActorRootIntent(view,catalog,{mewTechnoReset:true});
  assert.equal(intent.kind,'play-guzma-mew-cooldown-reset');
  assert.equal(intent.handIndex,0);
  assert.equal(intent.benchIndex,1);
  assert.equal(intent.opponentBenchIndex,0);
});

test('canonical root only emits the second Retreat after physical cooldown clears',()=>{
  const view=mewState();
  view.ownPublic.active=mew();
  view.ownPublic.bench=[{printing:GENESECT},mew([DCE],false),null];
  view.ownHand=[];
  view.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  const intent=chooseActorRootIntent(view,catalog,{mewTechnoReset:true});
  assert.equal(intent.kind,'free-retreat');
  assert.equal(intent.benchIndex,1);
  assert.equal(intent.attackingEffectClearedUnverified,true);
});

test('public cooldown, native retreat budget and opponent Bench independently veto',()=>{
  const view=mewState();
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=false;
  assert.equal(chooseActorRootIntent(view,catalog,{mewTechnoReset:true})
    .kind,'pass');
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  view.ownTurnResources.retreatedTurn=21;
  assert.equal(chooseActorRootIntent(view,catalog,{mewTechnoReset:true})
    .kind,'pass');
  view.ownTurnResources.retreatedTurn=0;
  view.opponentPublic.bench=[];
  assert.equal(chooseActorRootIntent(view,catalog,{mewTechnoReset:true})
    .kind,'pass');
});

class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class RetreatAction{
  constructor(id,benchIndex){this.id=id;this.benchIndex=benchIndex;}
}
class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
class PassTurnAction{constructor(id){this.id=id;}}
function empty(){
  return {cards:[],energies:{cards:[]},tools:[],
    specialConditions:[],damage:0,getPokemonCard:()=>null};
}
class Store{
  constructor(){
    const player=id=>({
      id,active:empty(),bench:[empty(),empty(),empty()],
      hand:{cards:[]},deck:{cards:[]},prizes:[],
      stadium:{cards:[]},discard:{cards:[]},
      lostzone:{cards:[]},supporter:{cards:[]}
    });
    this.state={players:[player(101),player(202)],
      activePlayer:0,prompts:[],phase:2,turn:21};
  }
  dispatch(){return true;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('unqualified generic bot must not select root');}
}

function runOne(view){
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const observed=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(101).decodeNextAction(store.state);
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,mewTechnoReset:true,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,
      PlayerType:{ANY:0,BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2,BOARD:0}},
    gameActions:{AttackAction,PassTurnAction,RetreatAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
  assert.equal(observed.audit.selectedRootDecisions,1);
  assert.equal(observed.audit.rejectedActorRoots,0);
  assert.equal(observed.audit.competitiveGameQualified,false);
  return observed.result;
}

test('native bridge decodes first owner Mew reset intent to held-Guzma PlayCardAction',()=>{
  const view=mewState();
  const intent=chooseGuzmaMewCooldownReset(view,catalog);
  assert.equal(intent.kind,'play-guzma-mew-cooldown-reset');
  const action=runOne(view);
  assert.ok(action instanceof PlayCardAction);
  assert.equal(action.handIndex,0);
  assert.deepEqual(action.target,{player:0,slot:0,index:0});
});

test('native bridge decodes second reset intent to zero-cost RetreatAction',()=>{
  const view=mewState();
  view.ownPublic.active=mew();
  view.ownPublic.bench=[{printing:GENESECT},mew([DCE]),null];
  view.ownHand=[];
  view.ownTurnResources.supporterPlayedTurn=1;
  const action=runOne(view);
  assert.ok(action instanceof RetreatAction);
  assert.equal(action.benchIndex,1);
});

test('disabled option leaves original general policy behavior unchanged',()=>{
  const view=mewState();
  const baseline=chooseActorRootIntent(view,catalog);
  assert.equal(baseline.kind,'pass');
});
