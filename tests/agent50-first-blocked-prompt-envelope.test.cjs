'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {CODE}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {withBlockedPromptEnvelope,publicRootActionMix}=
  require('../simulation/twinleaf/agent50-first-blocked-prompt-envelope.cjs');

test('typed prompt observer preserves error, redacts cards and restores interceptor',()=>{
  class Bot{
    constructor(){this.client={id:101};}
    decodeNextAction(){
      const error=new Error('quarantined');
      error.code=CODE;
      throw error;
    }
  }
  const raw=Bot.prototype.decodeNextAction;
  class Prompt{}
  const prompt=new Prompt();
  Object.assign(prompt,{playerId:101,result:undefined,
    message:'CHOOSE_FROM_ATTACK',
    options:{min:1,max:2,allowCancel:false}});
  Object.defineProperty(prompt,'cards',{get(){
    throw Error('inspected concealed card values');
  }});
  const p={id:101};
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(p,key,{get(){
      throw Error('inspected concealed player zone');
    }});
  const state={players:[p,{id:202}],prompts:[prompt],turn:9,phase:3};
  let caught=null;
  let audit=null;
  try{
    const wrapped=withBlockedPromptEnvelope(()=>
      new Bot().decodeNextAction(state),{engine:()=>({SimpleTacticsAi:Bot})});
    audit=wrapped.audit;
  }catch(error){caught=error;}
  assert.equal(caught?.code,CODE);
  assert.strictEqual(Bot.prototype.decodeNextAction,raw);
  // On thrown callbacks the wrapper rightly does not claim a result/audit.
  assert.equal(audit,null);
});

test('pure native Store root mix separates prompts from substantial actions',()=>{
  assert.deepEqual(publicRootActionMix([
    {action:'ResolvePromptAction'},{action:'ResolvePromptAction'},
    {action:'PlayCardAction'},{action:'AttackAction'},
    {action:'PassTurnAction'}
  ]),{
    total:5,byType:{
      ResolvePromptAction:2,PlayCardAction:1,
      AttackAction:1,PassTurnAction:1
    },modalAcks:2,attacks:1,passes:1,playedCards:1
  });
});
