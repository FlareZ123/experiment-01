'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withGuzmaOwnerPromptContinuation
}=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {
  nativeSinglePokemonChoices
}=require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(playerId,handIndex){
    this.playerId=playerId;
    this.handIndex=handIndex;
  }
}
class ResolvePromptAction{
  constructor(id,result){
    this.id=id;
    this.result=result;
  }
}
class ChoosePokemonPrompt{
  constructor(id,playerId,playerType){
    this.id=id;
    this.playerId=playerId;
    this.playerType=playerType;
    this.slots=[2];
    this.options={min:1,max:1};
    this.result=undefined;
  }
  getPerspectivePlayerId(){return this.playerId;}
  validate(value,state){
    if(!Array.isArray(value)||value.length!==1)return false;
    const owner=state.players.find(p=>p.id===this.playerId);
    const seat=state.players.indexOf(owner);
    const target=state.players[this.playerType===2?seat:1-seat];
    return target.bench.some(slot=>slot===value[0]&&!!slot.getPokemonCard());
  }
}
const slot=(fullName,id)=>({
  cards:fullName?[{fullName,id}]:[],
  getPokemonCard(){return this.cards[0]??null;}
});
function scenario(ownerSeat){
  let id=101;
  const owner={
    id:101,hand:{cards:[{fullName:'Guzma BUS'}]},
    active:slot('Stranded Active',id++),
    bench:[slot('Empty Support',id++),slot('Funded Attacker',id++),
      slot(null,0)]
  };
  const opponent={
    id:202,hand:{cards:[{fullName:'unavailable-private-info'}]},
    active:slot('Opponent Active',id++),
    bench:[slot('Opponent Target',id++),slot(null,0)]
  };
  return {turn:9,phase:2,activePlayer:ownerSeat,prompts:[],
    players:ownerSeat===0?[owner,opponent]:[opponent,owner]};
}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    const state=this.state;
    if(action instanceof AddPlayerAction)return true;
    const seat=state.activePlayer,owner=state.players[seat],
      opponent=state.players[1-seat];
    if(action instanceof PlayCardAction){
      assert.equal(action.playerId,owner.id);
      assert.equal(owner.hand.cards[action.handIndex]?.fullName,'Guzma BUS');
      owner.hand.cards.splice(action.handIndex,1);
      state.prompts=[new ChoosePokemonPrompt(20,owner.id,1)];
      return true;
    }
    assert.ok(action instanceof ResolvePromptAction);
    const pending=state.prompts.find(p=>p.id===action.id&&
      p.result===undefined);
    assert.ok(pending?.validate(action.result,state));
    const side=pending.playerType===1?opponent:owner;
    const incoming=action.result[0];
    const index=side.bench.indexOf(incoming);
    assert.ok(index>=0);
    side.bench[index]=side.active;
    side.active=incoming;
    pending.result=action.result;
    state.prompts=pending.playerType===1?
      [new ChoosePokemonPrompt(21,owner.id,2)]:[];
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(state){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(pending){
      const choices=nativeSinglePokemonChoices(state,pending);
      return new ResolvePromptAction(pending.id,[choices[0].physical]);
    }
    return new PlayCardAction(this.client.id,0);
  }
}
const observe=(state,seat)=>({
  decisionKind:'owner-root',actorSeat:seat,globalTurn:state.turn,
  ownHand:state.players[seat].hand.cards.map(c=>c.fullName)
});
const choosePlan=()=>({
  kind:'play-held-guzma-mobility',benchIndex:1,handIndex:0
});
const deps={Store,SimpleTacticsAi,ResolvePromptAction,
  observe,choosePlan,getCatalog:()=>({})};

/** @param {0|1} seat @param {boolean} [removeExpected] */
function execute(seat,removeExpected=false){
  const state=scenario(seat),store=new Store(state);
  store.dispatch(new AddPlayerAction());
  const bot=new SimpleTacticsAi(state.players[seat].id);
  const root=bot.decodeNextAction(state);
  store.dispatch(root);
  assert.equal(state.prompts[0].playerType,1);
  store.dispatch(bot.decodeNextAction(state));
  assert.equal(state.prompts[0].playerType,2);
  if(removeExpected){
    // Physical recipient removed after the first accepted effect.
    state.players[seat].bench[1]=slot(null,0);
  }
  store.dispatch(bot.decodeNextAction(state));
  return state.players[seat].active.getPokemonCard();
}

test('both genuine physical seats preserve a planned second Bench recipient',()=>{
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const run=withGuzmaOwnerPromptContinuation(()=>{
    return [execute(0),execute(1)];
  },deps);
  assert.match(VERSION,/native-prompt-continuation-v1$/);
  assert.deepEqual(run.result.map(x=>x.fullName),
    ['Funded Attacker','Funded Attacker']);
  assert.equal(run.audit.acceptedGuzmaRoots,2);
  assert.equal(run.audit.guzmaHandConsumptionConfirmed,2);
  assert.equal(run.audit.guzmaHandConsumptionUnconfirmed,0);
  assert.equal(run.audit.matchedMobilityPlans,2);
  assert.equal(run.audit.ownTargetProposals,2);
  assert.equal(run.audit.ownTargetAcceptances,2);
  assert.equal(run.audit.ownTargetPhysicalConfirmations,2);
  assert.equal(run.audit.ownTargetPhysicalMismatches,0);
  assert.equal(run.audit.opponentTargetDelegations,2);
  assert.deepEqual(run.audit.bySeat,{0:1,1:1});
  assert.deepEqual(run.audit.receipts.map(x=>x.expectedBenchIndex),[1,1]);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});

test('missing native-valid own Bench recipient delegates without an invalid action',()=>{
  const run=withGuzmaOwnerPromptContinuation(()=>execute(0,true),deps);
  assert.equal(run.result.fullName,'Empty Support');
  assert.equal(run.audit.acceptedGuzmaRoots,1);
  assert.equal(run.audit.missingPlannedRecipients,1);
  assert.equal(run.audit.ownTargetProposals,0);
  assert.equal(run.audit.ownTargetAcceptances,0);
  assert.equal(run.audit.receipts[0].kind,'missing-owner-recipient');
});

test('without bridge, existing bot chooses first eligible own Bench rather than planned second',()=>{
  const pokemon=execute(0);
  assert.equal(pokemon.fullName,'Empty Support');
});

test('only the owner-accessible accepted Guzma root can start a prompt plan',()=>{
  const state=scenario(0);
  state.players[0].hand.cards[0]={fullName:'Marnie SSH'};
  const run=withGuzmaOwnerPromptContinuation(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    const action=new PlayCardAction(state.players[0].id,0);
    assert.throws(()=>store.dispatch(action),/Guzma BUS/);
  },deps);
  assert.equal(run.audit.acceptedGuzmaRoots,0);
  assert.equal(run.audit.ownTargetProposals,0);
});

test('the post-root prompt plan cannot observe opponent private-hand identities',()=>{
  const a=scenario(0);
  const b=scenario(0);
  b.players[1].hand.cards=[{fullName:'another concealed source card'}];
  const run=withGuzmaOwnerPromptContinuation(()=>{
    const results=[];
    for(const state of [a,b]){
      const store=new Store(state);
      store.dispatch(new AddPlayerAction());
      const actor=new SimpleTacticsAi(101);
      for(let i=0;i<3;i++)store.dispatch(actor.decodeNextAction(state));
      results.push(state.players[0].active.getPokemonCard().fullName);
    }
    return results;
  },deps);
  assert.deepEqual(run.result,['Funded Attacker','Funded Attacker']);
  assert.equal(run.audit.ownTargetPhysicalConfirmations,2);
});
