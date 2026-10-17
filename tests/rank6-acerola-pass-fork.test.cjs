'use strict';
const assert=require('node:assert/strict');
const {withRank6AcerolaPassFork}=
  require('../simulation/twinleaf/rank6-acerola-pass-fork.cjs');
class AddPlayerAction {}
class PlayCardAction {constructor(handIndex){this.handIndex=handIndex;}}
class PassTurnAction {constructor(clientId){this.clientId=clientId;}}
const pokemon=name=>({getPokemonCard:()=>({name})});
function makeState() {
  return {turn:3,activePlayer:0,players:[
    {id:101,hand:{cards:[{name:'Acerola'}]},
      active:{...pokemon('Shadow Rider Calyrex VMAX'),damage:140,
        energies:{cards:[1,2]}},bench:[pokemon('Dialga-GX')]},
    {id:202}
  ]};
}
class Store {
  constructor(state){this.state=state;}
  dispatch(action){return action;}
}
class Bot {
  constructor(){this.client={id:101};}
  decodeNextAction(){Bot.proposals++;Math.random();Math.random();return new PlayCardAction(0);}
}
Bot.proposals=0;
const original=Bot.prototype.decodeNextAction;
const originalDispatch=Store.prototype.dispatch;
function trial(forcePass){
  const state=makeState(),store=new Store(state),bot=new Bot();
  return withRank6AcerolaPassFork({Store,Bot,PassTurnAction},()=>{
    store.dispatch(new AddPlayerAction());
    return store.dispatch(bot.decodeNextAction(store.state));
  },{forcePass});
}
let passive,forced;
const savedRandom=Math.random;
Math.random=()=>0.625;
try {passive=trial(false);forced=trial(true);}
finally{Math.random=savedRandom;}
assert.equal(passive.result.constructor.name,'PlayCardAction');
assert.equal(forced.result.constructor.name,'PassTurnAction');
assert.equal(forced.result.clientId,101);
assert.equal(passive.sourceChoices.length,1);
assert.equal(forced.sourceChoices.length,1);
assert.equal(passive.forced,false);
assert.equal(forced.forced,true);
assert.equal(Bot.proposals,2);
assert.equal(passive.sourceChoices[0].originalPolicyRandomDraws,2);
assert.equal(forced.sourceChoices[0].originalPolicyRandomDraws,2);
assert.equal(passive.sourceChoices[0].originalPolicyRandomValuesSha256,
  forced.sourceChoices[0].originalPolicyRandomValuesSha256);
assert.equal(Bot.prototype.decodeNextAction,original);
assert.equal(Store.prototype.dispatch,originalDispatch);
assert.equal(forced.sourceChoices[0].publicDamage,140);
assert.equal(forced.sourceChoices[0].selectedAction,'PassTurnAction');
console.log('rank6 Acerola source fork: 15 tests pass');
