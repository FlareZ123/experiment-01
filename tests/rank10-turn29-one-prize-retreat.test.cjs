'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOnePrizeRetreat}=require('../simulation/twinleaf/rank10-turn29-one-prize-retreat.cjs');
test('restores intercepted prototypes on failure',()=>{
 class Store{dispatch(){}}
 class Bot{decodeNextAction(){}}
 const before=Store.prototype.dispatch;
 assert.throws(()=>withOnePrizeRetreat({Store,Bot},()=>{throw Error('failed');},true),/failed/);
 assert.equal(Store.prototype.dispatch,before);
});

test('one-Prize retreat changes only the selected legal Bench index',()=>{
 for(const forced of [false,true]){
  class AddPlayerAction{}
  class RetreatAction{constructor(clientId,benchIndex){
   this.clientId=clientId;this.benchIndex=benchIndex;
  }}
  const state={turn:29,activePlayer:0,players:[
   {id:101,bench:['Dialga-GX UPR','Wobbuffet PHF']
     .map(fullName=>({getPokemonCard:()=>({fullName})}))},
   {getPrizeLeft:()=>2}
  ]};
  class Store{constructor(){this.state=state;}dispatch(){}}
  class Bot{constructor(){this.client={id:101};this.calls=0;}
   decodeNextAction(){this.calls++;return new RetreatAction(101,0);}
  }
  const result=withOnePrizeRetreat({Store,Bot,RetreatAction},()=>{
   const store=new Store(),bot=new Bot();
   for(let i=0;i<231;i++)store.dispatch(new AddPlayerAction());
   const action=bot.decodeNextAction(state);
   assert.equal(bot.calls,1);
   return action.benchIndex;
  },forced);
  assert.equal(result.result,forced?1:0);
  assert.equal(result.observation.normal,'Dialga-GX UPR');
  assert.equal(result.observation.alternative,'Wobbuffet PHF');
  assert.equal(result.observation.force,forced);
 }
});
