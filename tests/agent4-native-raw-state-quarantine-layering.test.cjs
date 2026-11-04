'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

test('outer guard allows owner-safe adapter root but blocks native delegation',()=>{
  const rawReads=[];
  class FakeAi{
    constructor(){this.client={id:'zero'};}
    decodeNextAction(state){rawReads.push(state.privateCard);return 'unsafe';}
  }
  const original=FakeAi.prototype.decodeNextAction;
  const bot=new FakeAi();
  function withActorAdapter(work){
    const previous=FakeAi.prototype.decodeNextAction;
    function ownerChoice(state){
      if(state.actorSupported)return 'owner-only-pass';
      return previous.call(this,state);
    }
    Object.defineProperty(FakeAi.prototype,'decodeNextAction',{
      configurable:true,writable:true,value:ownerChoice});
    try{return work();}
    finally{Object.defineProperty(FakeAi.prototype,'decodeNextAction',{
      configurable:true,writable:true,value:previous});}
  }

  const supported=guard(()=>withActorAdapter(()=>
    bot.decodeNextAction({privateCard:'concealed',actorSupported:true})),
    {SimpleTacticsAi:FakeAi});
  assert.equal(supported.result,'owner-only-pass');
  assert.equal(supported.audit.rawStateFallbackCalls,0);

  assert.throws(()=>guard(()=>withActorAdapter(()=>
    bot.decodeNextAction({privateCard:'concealed',actorSupported:false})),
    {SimpleTacticsAi:FakeAi}),{code:CODE});
  assert.deepEqual(rawReads,[]);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});
