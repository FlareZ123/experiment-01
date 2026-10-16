'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {assertValidPromptAction}=require('../simulation/twinleaf/prompt-integrity.cjs');
class AttachEnergyPrompt {
 constructor(cards){this.id=3;this.result=undefined;this.filter={energyType:'BASIC'};this.cardList={filter:f=>cards.filter(c=>c.energyType===f.energyType)}}
 validate(v){return Array.isArray(v)&&v.length===1}
}
class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result}}
test('strict Energy prompt filter rejects Special while accepting Basic',()=>{
 const basic={energyType:'BASIC'},special={energyType:'SPECIAL'};
 const p=new AttachEnergyPrompt([basic,special]),state={prompts:[p]};
 const action=c=>new ResolvePromptAction(3,[{card:c}]);
 assert.equal(p.validate(action(special).result),true);
 assert.doesNotThrow(()=>assertValidPromptAction(state,action(basic)));
 assert.throws(()=>assertValidPromptAction(state,action(special)),/invalid result/);
});
