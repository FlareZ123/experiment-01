'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withTreasurePhysicalZoneReceipt}=
  require('../../simulation/twinleaf/agent49/treasure-payment-zone-observer.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    const state=this.state;
    const prompt=state.prompts.find(p=>p.id===action.id&&
      p.result===undefined);
    assert.ok(prompt);
    const owner=state.players.find(p=>p.id===prompt.playerId);
    assert.ok(prompt.validate(action.result,state));
    const selected=action.result[0];
    if(prompt.cards===owner.hand){
      owner.hand.cards.splice(owner.hand.cards.indexOf(selected),1);
      owner.discard.cards.push(selected);
    }else if(prompt.cards===owner.deck){
      owner.deck.cards.splice(owner.deck.cards.indexOf(selected),1);
      owner.hand.cards.push(selected);
    }else throw Error('Unexpected prompt zone');
    prompt.result=action.result;
    return true;
  }
}
const card=(fullName,id)=>({fullName,id});
function game(){
  const treasure=card('Mysterious Treasure FLI',5);
  const crispin=card('Crispin SCR',6);
  const band=card('Muscle Band XY',7);
  const vstar=card('Regidrago VSTAR SIT',8);
  const owner={id:100,
    hand:{cards:[crispin,band]},
    deck:{cards:[vstar]},
    discard:{cards:[]}};
  const opponent={id:200,hand:{cards:[card('Secret',99)]}};
  const state={turn:1,players:[owner,opponent],prompts:[]};
  const store=new Store(state);
  const mkPrompt=(id,cards)=>({
    id,cards,playerId:100,sourceCard:treasure,result:undefined,
    constructor:{name:'ChooseCardsPrompt'},
    validate(answer){return answer.length===1&&cards.cards.includes(answer[0]);}
  });
  return {store,state,owner,opponent,crispin,band,vstar,mkPrompt};
}

for(const choice of ['crispin','band']){
  test('real owner payment + search retain physical identity: '+choice,()=>{
    const x=game();
    const expected=choice==='crispin'?x.crispin:x.band;
    const previous=Store.prototype.dispatch;
    const wrapped=withTreasurePhysicalZoneReceipt(()=>{
      x.store.dispatch(new AddPlayerAction());
      x.state.prompts.push(x.mkPrompt(1,x.owner.hand));
      x.store.dispatch(new ResolvePromptAction(1,[expected]));
      x.state.prompts.push(x.mkPrompt(2,x.owner.deck));
      x.store.dispatch(new ResolvePromptAction(2,[x.vstar]));
      return 'native-fixture-done';
    },{Store});
    assert.equal(wrapped.result,'native-fixture-done');
    assert.equal(wrapped.audit.verifiedOwnerPayments,1);
    assert.equal(wrapped.audit.verifiedOwnerSearches,1);
    assert.deepEqual(wrapped.audit.physicalReceipts.map(x=>
      [x.sourceZone,x.selectedPrinting,x.zoneMoveVerified]),[
      ['owner-hand',expected.fullName,true],
      ['owner-deck','Regidrago VSTAR SIT',true]
    ]);
    assert.strictEqual(Store.prototype.dispatch,previous);
    assert.deepEqual(x.opponent.hand.cards,[{fullName:'Secret',id:99}]);
  });
}

test('unregistered Store and unrelated source prompts remain untouched',()=>{
  const x=game();
  const wrapped=withTreasurePhysicalZoneReceipt(()=>{
    x.state.prompts.push(x.mkPrompt(5,x.owner.hand));
    x.store.dispatch(new ResolvePromptAction(5,[x.crispin]));
  },{Store});
  assert.equal(wrapped.audit.physicalReceipts.length,0);
});

test('failed native Store dispatch retains rejection rather than certifying a move',()=>{
  const x=game();
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  function fail(action){
    if(action.constructor.name==='ResolvePromptAction')throw Error('rejected');
    return old.value.call(this,action);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:fail});
  try{
    const result=withTreasurePhysicalZoneReceipt(()=>{
      x.store.dispatch(new AddPlayerAction());
      x.state.prompts.push(x.mkPrompt(9,x.owner.hand));
      assert.throws(()=>x.store.dispatch(
        new ResolvePromptAction(9,[x.crispin])),/rejected/);
      return true;
    },{Store});
    assert.equal(result.audit.rejectedObserved,1);
    assert.equal(result.audit.physicalReceipts[0].zoneMoveVerified,false);
  }finally{Object.defineProperty(Store.prototype,'dispatch',old);}
});
