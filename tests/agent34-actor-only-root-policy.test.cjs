'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={
  basics:new Set(['Shadow Rider Calyrex V CRE','Trubbish FST']),
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:5,Darkness:7},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
const base=()=>({
  decisionKind:'owner-root',globalTurn:2,
  ownHand:['Shadow Rider Calyrex V CRE','Psychic Energy MEE'],
  ownPublic:{
    active:{energies:[],attacks:[{name:'Shadow Mist',cost:[5],gxAttack:false}],
      specialConditions:[],publicRestrictions:{}},
    bench:[null,null,null,null,null],publicTurnRestrictions:{attackLockTurnsRemaining:0}
  },
  ownTurnResources:{
    energyPlayedTurn:0,energyPlayLocked:false,pokemonPlayLocked:false
  }
});

test('visible Basic bench precedes basic Energy',()=>{
  const intent=chooseActorRootIntent(base(),catalog);
  assert.deepEqual(intent,{kind:'bench-basic',handIndex:0,benchIndex:0,
    printing:'Shadow Rider Calyrex V CRE'});
});
test('Energy then printed-cost attack follows the same actor-only view',()=>{
  const view=base();
  view.ownHand=['Psychic Energy MEE','Energy Retrieval SVI'];
  view.ownPublic.bench=[{},null,null,null,null];
  const energy=chooseActorRootIntent(view,catalog);
  assert.equal(energy.kind,'attach-basic-energy');
  assert.equal(energy.handIndex,0);
  view.ownHand=[];
  view.ownPublic.active.energies=['Psychic Energy MEE'];
  view.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(chooseActorRootIntent(view,catalog),{
    kind:'attack',attackName:'Shadow Mist'});
});
test('unsupported hand cards and attack restrictions fail to actor-only Pass',()=>{
  const view=base();
  view.ownHand=['Shadow Rider Calyrex VMAX CRE','Double Colorless Energy SUM'];
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  view.ownHand=[];
  view.ownPublic.bench=[{},null,null,null,null];
  view.ownPublic.active.energies=['Psychic Energy MEE'];
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
});
test('real Store accepts native typed root, with reversible hook restoration',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.clientId=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.clientId=id;}}
  class Store{dispatch(){return true;}}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Generic hidden-state root must not run');}
  }
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  const view=base();
  view.ownHand=['Psychic Energy MEE'];
  view.ownPublic.bench=[{},null,null,null,null];
  const x=withActorOnlyRootPolicy(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction({
      players:[{id:10},{id:20}],activePlayer:0,prompts:[],turn:2
    });
    assert.ok(action instanceof PlayCardAction);
    assert.deepEqual(action.target,{player:0,slot:1,index:0});
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
  assert.equal(x.audit.selectedRootDecisions,1);
  assert.equal(x.audit.acceptedActorRoots,1);
  assert.equal(x.audit.rejectedActorRoots,0);
  assert.equal(x.audit.unsupportedPromptFallbacks,0);
  assert.equal(x.audit.competitiveGameQualified,false);
});
test('pending native prompt fallback counted and never qualified',()=>{
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'NATIVE_PROMPT_FALLBACK';}
  }
  class Store{dispatch(){}}
  const result=withActorOnlyRootPolicy(()=>new SimpleTacticsAi(10)
    .decodeNextAction({players:[{id:10},{id:20}],activePlayer:0,
      prompts:[{playerId:10,result:undefined}]}),{
    SimpleTacticsAi,Store,observe:()=>base(),getCatalog:()=>catalog,
    cardActions:{PlayCardAction:class{},PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction:class{},PassTurnAction:class{}}
  });
  assert.equal(result.result,'NATIVE_PROMPT_FALLBACK');
  assert.equal(result.audit.unsupportedPromptFallbacks,1);
  assert.equal(result.audit.selectedRootDecisions,0);
  assert.equal(result.audit.competitiveGameQualified,false);
});

test('numeric native colored and colorless attacks use numeric energy costs',()=>{
  for(const cost of [[5],[9],[5,9]]){
    const view=base();
    view.ownHand=[];
    view.ownPublic.bench=[{},null,null,null,null];
    view.ownPublic.active.energies=cost.length===2?['Psychic Energy MEE','Psychic Energy MEE']:['Psychic Energy MEE'];
    view.ownPublic.active.attacks=[{name:'Paid Attack',cost,gxAttack:false}];
    view.ownTurnResources.energyPlayedTurn=2;
    assert.equal(chooseActorRootIntent(view,catalog).kind,'attack');
  }
});
