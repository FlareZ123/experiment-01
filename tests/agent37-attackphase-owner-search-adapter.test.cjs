'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withActorOwnerSingleSearch,actorSingleSearchInput}=
  require('../simulation/twinleaf/agent41-actor-owner-single-search.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  /** @param {number} id @param {object[]|null} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class Store{
  constructor(){this.state=null;this.actions=[];}
  dispatch(action){
    this.actions.push(action);
    if(action instanceof ResolvePromptAction){
      const pending=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(pending.validate(action.result));
      pending.result=action.result;
    }
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'NATIVE_FALLBACK';}
}

/** @param {object} owner @param {object} cards @param {number} id */
function choose(owner,cards,id){
  class ChooseCardsPrompt{}
  return Object.assign(new ChooseCardsPrompt(),{
    id,playerId:owner.id,result:undefined,
    message:'CHOOSE_CARD_TO_HAND',cards,options:{min:1,max:1,allowCancel:false},
    validate:result=>Array.isArray(result)&&result.length===1&&
      cards.cards.includes(result[0])
  });
}

/** @param {number} seat @param {number} [phase] */
function fixture(seat,phase=6){
  const first={id:101,deck:{cards:[{fullName:'Psychic Energy SVE'}]},
    hand:{cards:[]},discard:{cards:[]}};
  const second={id:202,deck:{cards:[{fullName:'Double Colorless Energy SUM'}]},
    hand:{cards:[]},discard:{cards:[]}};
  const players=[first,second],owner=players[seat];
  return {owner,state:{players,turn:1,activePlayer:seat,phase,
    prompts:[choose(owner,owner.deck,100+seat)]}};
}

function run(optIn,phase=6){
  const initialDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const initialDispatch=Store.prototype.dispatch;
  const observed=[];
  const result=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    for(const [seat,id] of [[0,101],[1,202]]){
      const {owner,state}=fixture(seat,phase);
      store.state=state;
      const bot=new SimpleTacticsAi(id);
      const next=bot.decodeNextAction(state);
      observed.push({seat,isAction:next instanceof ResolvePromptAction,
        printing:next instanceof ResolvePromptAction?
          next.result[0]?.fullName:null,promptId:next?.id??null});
      if(next instanceof ResolvePromptAction)
        assert.equal(store.dispatch(next),true);
      else assert.equal(next,'NATIVE_FALLBACK');
      if(next instanceof ResolvePromptAction)
        assert.equal(state.prompts[0].result[0],owner.deck.cards[0]);
    }
    return observed;
  },{SimpleTacticsAi,Store,ResolvePromptAction,
    GamePhase:{PLAYER_TURN:5,ATTACK:6},
    attackPhaseSearch:optIn,
    observe:(state,seat)=>actorSingleSearchInput(state,seat,()=>({
      decisionKind:'owner-prompt',actorSeat:seat,globalTurn:state.turn
    }))});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,initialDecode);
  assert.strictEqual(Store.prototype.dispatch,initialDispatch);
  return result;
}

test('default ATTACK phase keeps original generic fallback for both actors',()=>{
  const result=run(false);
  assert.deepEqual(result.result,[
    {seat:0,isAction:false,printing:null,promptId:null},
    {seat:1,isAction:false,printing:null,promptId:null}
  ]);
  assert.equal(result.audit.selected,0);
  assert.equal(result.audit.accepted,0);
  assert.equal('attackPhaseSearchOptIn' in result.audit,false);
});

test('explicitly opted in ATTACK owner deck prompt uses printed legal menu and two native-typed replies',()=>{
  const result=run(true);
  assert.deepEqual(result.result,[
    {seat:0,isAction:true,printing:'Psychic Energy SVE',promptId:100},
    {seat:1,isAction:true,printing:'Double Colorless Energy SUM',promptId:101}
  ]);
  assert.equal(result.audit.attackPhaseSearchOptIn,true);
  assert.match(result.audit.version,/agent37-owner-authenticated-attack-phase-search-v1/);
  assert.equal(result.audit.selected,2);
  assert.equal(result.audit.accepted,2);
  assert.equal(result.audit.nativePromptPostconditionsConfirmed,2);
  assert.deepEqual(result.audit.bySeat,{0:1,1:1});
  assert.equal(result.audit.competitiveGameQualified,false);
});

test('ATTACK opt-in cannot expand unsupported phase into an owner search',()=>{
  const result=run(true,9);
  assert.equal(result.audit.selected,0);
  assert.equal(result.audit.accepted,0);
  assert.equal(result.result.every(row=>row.isAction===false),true);
});
