'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withOwnerCursedBlastAfterPass:withPolicy}=require(
  '../../simulation/twinleaf/agent15/owner-cursed-blast-after-pass.cjs');

class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class OtherAction{constructor(clientId){this.clientId=clientId;}}
class AddPlayerAction{}
class UseAbilityAction{
  constructor(clientId,name,target){this.clientId=clientId;this.name=name;this.target=target;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Store{
  constructor(state){this.state=state;this.receipts=[];}
  dispatch(action){
    this.receipts.push(action);
    if(action instanceof UseAbilityAction){
      this.state.prompts=[{
        id:50,playerId:action.clientId,
        constructor:{name:'ChoosePokemonPrompt'},
        validate:(choice)=>choice.length===1&&
          choice[0]===this.state.players[1-this.state.activePlayer].active
      }];
    }
    if(action instanceof ResolvePromptAction)this.state.prompts=[];
    return true;
  }
}
class SimpleTacticsAi{
  constructor(clientId,other=false){this.client={id:clientId};this.other=other;}
  decodeNextAction(){
    return this.other?new OtherAction(this.client.id):
      new PassTurnAction(this.client.id);
  }
}
const depsNative={
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
  'game/store/store':{Store},
  'game/store/actions/game-actions':{UseAbilityAction},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/store/actions/play-card-action':{
    PlayerType:{BOTTOM_PLAYER:1},SlotType:{BENCH:2}
  }
};
const native=name=>{
  assert.ok(depsNative[name],'Missing mocked native dependency '+name);
  return depsNative[name];
};

function testScenario(seat,{opponentPrizes=3,ordinaryOther=false}={}){
  const owner={id:seat===0?11:22};
  const opponent={id:seat===0?22:11};
  const target={getPokemonCard:()=>({fullName:'Shadow Rider Calyrex V CRE'})};
  opponent.active=target;opponent.bench=[];
  const state={turn:3,activePlayer:seat,prompts:[],
    players:seat===0?[owner,opponent]:[opponent,owner]};
  const store=new Store(state);
  const ai=new SimpleTacticsAi(owner.id,ordinaryOther);
  const headless={runMatch(request){
    assert.equal(request.deckA.length,60);
    assert.equal(request.deckB.length,60);
    store.dispatch(new AddPlayerAction());
    const clone={...state};
    assert.ok(ai.decodeNextAction(clone) instanceof
      (ordinaryOther?OtherAction:PassTurnAction));
    const root=ai.decodeNextAction(state);
    store.dispatch(root);
    const followup=state.prompts.length?ai.decodeNextAction(state):null;
    if(followup)store.dispatch(followup);
    return {root,followup,receiptCount:store.receipts.length};
  }};
  const observed=[];
  const observeOwner=(s,actorSeat)=>{
    assert.strictEqual(s,state);
    assert.equal(actorSeat,seat);
    observed.push(actorSeat);
    return {decisionKind:'owner-root',globalTurn:3,
      ownPublic:{prizeCount:3,bench:[{printing:'Dusclops PRE',
        abilities:['Cursed Blast'],publicRestrictions:{}}]},
      opponentPublic:{prizeCount:opponentPrizes,active:{
        printing:'Shadow Rider Calyrex V CRE',hp:210,damage:200},
        bench:[]}};
  };
  const beforeBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const receipt=withPolicy(
    ()=>headless.runMatch({
      deckA:Array(60).fill('A'),deckB:Array(60).fill('B')
    }),{headless,native,observeOwner});
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),beforeBot);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),beforeStore);
  assert.equal(state.prompts.length,0);
  return {...receipt,observed,receipts:store.receipts};
}

for(const seat of [0,1]){
  test('both-seat real native interception chooses Ability and physical target '+seat,()=>{
    const r=testScenario(seat);
    assert.ok(r.result.root instanceof UseAbilityAction);
    assert.equal(r.result.root.name,'Cursed Blast');
    assert.equal(r.result.root.target.index,0);
    assert.ok(r.result.followup instanceof ResolvePromptAction);
    assert.equal(r.result.followup.id,50);
    assert.equal(r.audit.actionProposals,1);
    assert.equal(r.audit.acceptedAbilityRoots,1);
    assert.equal(r.audit.acceptedTargetReplies,1);
    assert.deepEqual(r.observed,[seat]);
    assert.equal(r.audit.nativeErrors.length,0);
    assert.equal(r.audit.qualifiedCompetitiveGames,0);
  });
}
test('opponent last Prize veto preserves ordinary Pass and native prototype',()=>{
  const r=testScenario(0,{opponentPrizes:1});
  assert.ok(r.result.root instanceof PassTurnAction);
  assert.equal(r.result.followup,null);
  assert.equal(r.audit.actionProposals,0);
});

test('existing non-Pass native decision takes priority',()=>{
  const r=testScenario(1,{ordinaryOther:true});
  assert.ok(r.result.root instanceof OtherAction);
  assert.equal(r.audit.ownerPassObservations,0);
  assert.deepEqual(r.observed,[]);
});
