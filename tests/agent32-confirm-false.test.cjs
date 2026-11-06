'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerConfirmDefaultFalse}=require('../simulation/twinleaf/agent32-owner-confirm-default-false.cjs');
test('resolves owner Confirm prompts with the default false choice',()=>{
 class ConfirmPrompt{constructor(playerId,message,id){this.playerId=playerId;this.message=message;this.id=id;this.result=undefined;}}
 class ResolvePromptAction{constructor(promptId,result){this.promptId=promptId;this.result=result;}}
 class Ai{constructor(id){this.client={id};}decodeNextAction(){return 'delegated';}}
 class Store{constructor(state){this.state=state;this.other=0;}dispatch(action){if(action instanceof ResolvePromptAction){this.state.prompts.find(p=>p.id===action.promptId).result=action.result;return true;}this.other++;return false;}}
 const state={turn:22,players:[{id:1},{id:2}],prompts:[new ConfirmPrompt(1,'WANT_TO_USE_ABILITY','a'),new ConfirmPrompt(2,'WANT_TO_USE_ABILITY','b')]};
 const original=Ai.prototype.decodeNextAction;
 const out=withOwnerConfirmDefaultFalse(()=>{const store=new Store(state);const a=new Ai(1).decodeNextAction(state);const b=new Ai(2).decodeNextAction(state);store.dispatch(a);store.dispatch(b);assert.equal(new Ai(1).decodeNextAction({players:state.players,prompts:[{playerId:1}]}),'delegated');store.dispatch({type:'other'});return store.other;},{SimpleTacticsAi:Ai,Store,ConfirmPrompt,ResolvePromptAction,assertValidPromptAction:()=>{}});
 assert.equal(out.result,1);assert.equal(state.prompts[0].result,false);assert.equal(state.prompts[1].result,false);assert.equal(out.audit.nativeAccepted,2);assert.equal(out.audit.nativeRejected,0);assert.equal(out.audit.nativeUnsettled,0);assert.equal(out.audit.bySeat[0],1);assert.equal(out.audit.bySeat[1],1);assert.equal(out.audit.byMessage.WANT_TO_USE_ABILITY,2);assert.equal(Ai.prototype.decodeNextAction,original);
});
