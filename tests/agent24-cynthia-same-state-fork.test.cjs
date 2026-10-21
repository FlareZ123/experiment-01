'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withFirstNativeCynthiaMode0
}=require('../simulation/twinleaf/agent24-cynthia-native-same-state-fork.cjs');

test('first native C&C interception leaves unrelated root and restores bot',()=>{
  const path=require('node:path');
  const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const mock=function(){return new ResolvePromptAction(8,null);};
  SimpleTacticsAi.prototype.decodeNextAction=mock;
  const actor={client:{id:101}};
  const relevant={
    constructor:{name:'SelectOptionPrompt'},
    id:8,result:undefined,playerId:101,
    sourceCard:{fullName:'Cynthia & Caitlin CEC'},
    values:[
      'Put a Supporter card from your discard pile into your hand.',
      'Put a Supporter card from your discard pile into your hand, and discard another card from your hand to draw 3 cards.'
    ],
    options:{allowCancel:true,defaultValue:0}
  };
  const state={prompts:[relevant],turn:9};
  try{
    const control=withFirstNativeCynthiaMode0(0,false,()=>{
      return [SimpleTacticsAi.prototype.decodeNextAction.call(actor,state).result];
    });
    assert.deepEqual(control.result,[null]);
    assert.equal(control.audit.changed,0);
    assert.equal(control.audit.observed?.sourcePrinting,'Cynthia & Caitlin CEC');
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,mock);
    const corrected=withFirstNativeCynthiaMode0(0,true,()=>{
      return [
        SimpleTacticsAi.prototype.decodeNextAction.call(actor,state).result,
        SimpleTacticsAi.prototype.decodeNextAction.call(actor,state).result
      ];
    });
    assert.deepEqual(corrected.result,[0,null]);
    assert.equal(corrected.audit.changed,1);
    const other=withFirstNativeCynthiaMode0(1,true,()=>{
      return [SimpleTacticsAi.prototype.decodeNextAction.call(actor,state).result];
    });
    assert.deepEqual(other.result,[null]);
    assert.equal(other.audit.changed,0);
    assert.throws(()=>withFirstNativeCynthiaMode0(0,true,()=>{
      throw new Error('Injected callback failure');
    }),/Injected callback failure/);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,mock);
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
});
