'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeLillieDrawSettlementAudit}=require('../simulation/twinleaf/agent24-native-lillie-settlement-audit.cjs');
class AddPlayerAction{}
class PlayCardAction{constructor(id,index){this.id=id;this.handIndex=index;}}
class ResolvePromptAction{}
class Store{
 constructor(draw=8){this.draw=draw;this.state={turn:2,prompts:[],players:[{id:101,supporterTurn:0,hand:{cards:[...Array.from({length:9},()=>({fullName:'other'})),{fullName:"Lillie's Determination M1L"}]},deck:{cards:Array.from({length:38},()=>({}))},prizes:Array.from({length:6},()=>({cards:[{}]}))}]};}
 dispatch(a){const p=this.state.players[0];if(a instanceof PlayCardAction){p.hand.cards.splice(a.handIndex,1);p.deck.cards.push(...p.hand.cards.splice(0));p.supporterTurn=1;this.state.prompts=[{result:undefined}];}if(a instanceof ResolvePromptAction){p.hand.cards.push(...p.deck.cards.splice(-this.draw));this.state.prompts=[];}return a;}
}
test('same-game prompt draw observed, incomplete one not certified',()=>{const before=Store.prototype.dispatch;const result=withNativeLillieDrawSettlementAudit(()=>{for(const draw of [8,7]){const store=new Store(draw);store.dispatch(new AddPlayerAction());store.dispatch(new PlayCardAction(101,9));store.dispatch(new ResolvePromptAction());}return 2;},{Store});assert.equal(result.result,2);assert.equal(result.audit.supportRoots,2);assert.equal(result.audit.printedDrawConfirmed,1);assert.equal(result.audit.events[0].lastObserved.deck,39);assert.strictEqual(Store.prototype.dispatch,before);});
