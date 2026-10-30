'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorAttackRecoveryInput}=require(
  '../simulation/twinleaf/agent37-attack-recovery-owner-prompt.cjs');
const {chooseActorSingleSearch,withActorOwnerSingleSearch}=require(
  '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');

class ChooseCardsPrompt{}
class AddPlayerAction{}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class Store{
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const p=this.state.prompts.find(x=>x.id===action.id);
      assert.equal(p.validate(action.result),true);
      p.result=action.result;
    }
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'FALLBACK';}
}
const GamePhase={PLAYER_TURN:5,ATTACK:6};
const observe=(state,seat)=>({
  decisionKind:'owner-prompt',globalTurn:state.turn,actorSeat:seat
});

function fixture(seat){
  const players=[101,202].map(id=>({
    id,deck:{cards:[]},hand:{cards:[]},discard:{cards:[
      {fullName:'Psychic Energy SVE'},{fullName:'Technical Machine: Evolution PAR'}
    ]}
  }));
  const owner=players[seat];
  const prompt=Object.assign(new ChooseCardsPrompt(),{
    id:seat+100,playerId:owner.id,message:'CHOOSE_CARD_TO_DECK',
    cards:owner.discard,options:{min:1,max:1,allowCancel:false},
    result:undefined,validate:cards=>Array.isArray(cards)&&
      cards.length===1&&owner.discard.cards.includes(cards[0])
  });
  return {owner,state:{turn:8,phase:6,players,prompts:[prompt]}};
}
test('genuine owner discard projection preserves source and native validator',()=>{
  const {state}=fixture(0);
  const p=actorAttackRecoveryInput(state,0,observe);
  assert.equal(p.prompt.source,'own-discard-to-deck');
  assert.deepEqual(p.prompt.offered.map(x=>x.printing),[
    'Psychic Energy SVE','Technical Machine: Evolution PAR'
  ]);
  assert.deepEqual(chooseActorSingleSearch(p),{indices:[0]});
  assert.equal(actorAttackRecoveryInput(state,1,observe),null);
});
test('opt-in recovered card decisions use typed owner prompt on both physical seats',()=>{
  const result=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    for(const seat of [0,1]){
      const {owner,state}=fixture(seat);
      store.state=state;
      const action=new SimpleTacticsAi(owner.id).decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.result[0],owner.discard.cards[0]);
      store.dispatch(action);
      assert.equal(state.prompts[0].result[0],owner.discard.cards[0]);
    }
  },{
    Store,SimpleTacticsAi,ResolvePromptAction,GamePhase,
    attackPhaseSearch:false,attackPhaseEvolution:false,
    attackPhaseRecovery:true,recoveryObserve:observe
  });
  assert.equal(result.audit.accepted,2);
  assert.equal(result.audit.nativePromptPostconditionsConfirmed,2);
  assert.equal(result.audit.attackPhaseRecoveryOptIn,true);
  assert.equal(result.audit.competitiveGameQualified,false);
});
test('default and unrelated ATTACK-phase messages preserve native fallback',()=>{
  const result=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const {state,owner}=fixture(0);
    store.state=state;
    return new SimpleTacticsAi(owner.id).decodeNextAction(state);
  },{
    Store,SimpleTacticsAi,ResolvePromptAction,GamePhase,
    attackPhaseRecovery:false,attackPhaseSearch:false,attackPhaseEvolution:false
  });
  assert.equal(result.result,'FALLBACK');
  assert.equal(result.audit.selected,0);
});
