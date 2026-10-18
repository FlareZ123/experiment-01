'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withGuzmaFork}=require('../simulation/twinleaf/rank10-turn29-guzma-fork.cjs');
test('source hook always restores Store and bot prototypes',()=>{
 class Store{dispatch(){}}
 class Bot{decodeNextAction(){}}
 const ds=Store.prototype.dispatch,db=Bot.prototype.decodeNextAction;
 assert.throws(()=>withGuzmaFork({Store,Bot},()=>{
   throw Error('source branch failure');
 },{forceGuzma:true}),/source branch failure/);
 assert.equal(Store.prototype.dispatch,ds);
 assert.equal(Bot.prototype.decodeNextAction,db);
});

test('spent source Supporter never yields an illegal Guzma action',()=>{
 class AddPlayerAction{}
 class RetreatAction{}
 const hand=['Mysterious Treasure FLI','Budew ASC','Guzma BUS']
   .map(fullName=>({fullName}));
 const player={id:101,hand:{cards:hand},supporterTurn:1};
 const state={turn:29,activePlayer:0,players:[player],prompts:[]};
 class Store{constructor(){this.state=state;}dispatch(){}}
 class Bot{constructor(){this.client={id:101};}
  decodeNextAction(){return new RetreatAction();}
 }
 const result=withGuzmaFork({Store,Bot},()=>{
  const store=new Store(),bot=new Bot();
  for(let i=0;i<231;i++)store.dispatch(new AddPlayerAction());
  return bot.decodeNextAction(state);
 },{forceGuzma:true});
 assert.ok(result.result instanceof RetreatAction);
 assert.equal(result.stage,'blocked');
 assert.equal(result.actions[0].supporterTurn,1);
 assert.equal(result.actions[0].preventedIllegalSupporter,true);
});
