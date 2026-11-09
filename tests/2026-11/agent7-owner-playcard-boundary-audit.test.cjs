'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnPlayCardBoundary}=
  require('../../simulation/twinleaf/agent7-owner-playcard-boundary-audit.cjs');

class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class FakeStore{
  constructor(){
    const owner={id:22,hand:{cards:[{fullName:'Mysterious Treasure FLI'}]},
      deck:{cards:[]}};
    const opponent={id:11,hand:{cards:[]},deck:{cards:[]}};
    this.state={players:[opponent,owner],turn:2,prompts:[]};
  }
  dispatch(action){
    const owner=this.state.players[1];
    this.state.prompts=[{result:undefined,playerId:owner.id,
      constructor:{name:'ChooseCardsPrompt'},
      cards:owner.deck,options:{min:1,max:1}}];
    return action;
  }
}
test('native public printing and prompt boundary observed and restored',()=>{
  const store=new FakeStore();
  const headless={runMatch(request){
    assert.equal(request.label,'fixture 3:0:A:agent2-original-rank13-v8-common');
    store.dispatch(new PlayCardAction(22,0));
    return 'match-ended';
  }};
  const priorRun=headless.runMatch,priorDispatch=FakeStore.prototype.dispatch;
  const out=withOwnPlayCardBoundary(()=>headless.runMatch({
    label:'fixture 3:0:A:agent2-original-rank13-v8-common'
  }),{headless,Store:FakeStore,
    trialIds:['3:0:A:agent2-original-rank13-v8-common']});
  assert.equal(out.result,'match-ended');
  assert.deepEqual(out.events,[{
    trialId:'3:0:A:agent2-original-rank13-v8-common',
    seat:1,turnBefore:2,action:'PlayCardAction',
    publiclyPlayedPrinting:'Mysterious Treasure FLI',
    nativeAccepted:true,
    subsequentPrompt:{
      type:'ChooseCardsPrompt',message:null,actorSeat:1,
      zone:'acting-owner-deck',min:1,max:1
    },nextTurn:2
  }]);
  assert.strictEqual(headless.runMatch,priorRun);
  assert.strictEqual(FakeStore.prototype.dispatch,priorDispatch);
});
