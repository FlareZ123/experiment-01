'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validAttachEnergyTargets}=require('../simulation/twinleaf/attach-energy-targets.cjs');
test('distinct recipient constraint',()=>{
 const a={player:2,slot:2,index:0},b={player:2,slot:2,index:1};
 const pool=[{target:a},{target:b}],one={provides:['LIGHTNING']},two={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:one,to:a},{card:two,to:b}],pool,{differentTargets:true}),true);
 assert.equal(validAttachEnergyTargets([{card:one,to:a},{card:two,to:{...a}}],pool,{differentTargets:true}),false);
 assert.equal(validAttachEnergyTargets([{card:one,to:a}],pool,{blockedTo:[{...a}]}),false);
});
test('differentTypes cannot be bypassed through a card-type restriction',()=>{
 const a={player:2,slot:2,index:0},b={player:2,slot:2,index:1};
 const pool=[{target:a},{target:b}];
 const e1={provides:['LIGHTNING']},e2={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:e1,to:a},{card:e2,to:b}],pool,
   {differentTypes:true,validCardTypes:['LIGHTNING']}),false);
 assert.equal(validAttachEnergyTargets([{card:e1,to:a},{card:e2,to:b}],pool,
   {sameTarget:true,validCardTypes:['LIGHTNING']}),false);
});
test('invalid and outside-player locations fail with real target geometry',()=>{
 const a={player:2,slot:2,index:0},pool=[{target:a}],e={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:e,to:{player:1,slot:2,index:0}}],pool),false);
 assert.equal(validAttachEnergyTargets([{card:e,to:{player:2,slot:2,index:4}}],pool),false);
 assert.equal(validAttachEnergyTargets([{}],pool),false);
 assert.equal(validAttachEnergyTargets(null,pool),false);
});
const {assertValidPromptAction}=require('../simulation/twinleaf/prompt-integrity.cjs');
class ResolvePromptAction {
 constructor(id,result){this.id=id;this.result=result;}
}
class AttachEnergyPrompt {
 constructor(options={}){
  this.id=17;this.result=undefined;this.playerId=101;
  this.slots=[2];this.playerType=2;this.message='Attach Energy';
  this.options={min:1,max:2,blockedTo:[],...options};
  this.cardList={cards:[this.one,this.two],filter(fn){return this.cards.filter(fn);}};
  this.filter=()=>true;
 }
 get one(){return AttachEnergyPrompt.one;}
 get two(){return AttachEnergyPrompt.two;}
 getPerspectivePlayerId(){return this.playerId;}
 validate(result){
  if(!Array.isArray(result)||result.length<1||result.length>2)return false;
  if(this.options.validCardTypes){
   return result.every(x=>this.options.validCardTypes.includes(x.card?.provides?.[0]));
  }
  return true;
 }
}
AttachEnergyPrompt.one={provides:['LIGHTNING']};
AttachEnergyPrompt.two={provides:['LIGHTNING']};
function nativeState(prompt){return {prompts:[prompt],players:[]};}
