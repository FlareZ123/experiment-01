'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

function fakeAi(){
  const reads=[];
  class FakeAi{
    constructor(id){this.client={id};}
    decodeNextAction(state){
      reads.push([...state.players[1].hand.cards]);
      return {kind:'native-decision'};
    }
  }
  return {FakeAi,reads,original:FakeAi.prototype.decodeNextAction};
}
function fixture(ownerSeat,concealed){
  return {turn:13,phase:2,
    players:[{id:'zero',hand:{cards:['owner-public']}},
      {id:'one',hand:{cards:[...concealed]}}],
    prompts:[],ownerSeat};
}

test('closure with no delegated native decoder returns auditable zero and restores prototype',()=>{
  const {FakeAi,original}=fakeAi();
  const result=guard(()=>({realStore:true}),{SimpleTacticsAi:FakeAi});
  assert.deepEqual(result.result,{realStore:true});
  assert.equal(result.audit.rawStateFallbackCalls,0);
  assert.equal(result.audit.ownerInformationSafeWholePolicyCertified,false);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});

test('both seats abort before native scorer reads concealed state',()=>{
  for(const seat of [0,1])for(const order of [
    ['Guzma BUS','Genesect V FST'],['Genesect V FST','Guzma BUS']
  ]){
    const {FakeAi,reads,original}=fakeAi();
    const state=fixture(seat,order);
    const bot=new FakeAi(seat===0?'zero':'one');
    assert.throws(()=>guard(()=>bot.decodeNextAction(state),
      {SimpleTacticsAi:FakeAi}),error=>{
      assert.equal(error.code,CODE);
      assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
      assert.equal(error.nativeRawStateFallbackQuarantine.records[0].seat,seat);
      return true;
    });
    assert.equal(reads.length,0);
    assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
  }
});

test('runner swallowing fallback exception cannot pass guard',()=>{
  const {FakeAi,reads,original}=fakeAi();
  const bot=new FakeAi('zero');
  assert.throws(()=>guard(()=>{
    try{bot.decodeNextAction(fixture(0,['secret']));}
    catch(error){assert.equal(error.code,CODE);}
    return 'pretend success';
  },{SimpleTacticsAi:FakeAi}),{code:CODE});
  assert.equal(reads.length,0);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});

test('prompt fallback records category without retaining choices or cards',()=>{
  const {FakeAi,original}=fakeAi();
  const bot=new FakeAi('one');
  class ChooseCardsPrompt{
    constructor(){this.playerId='one';this.options=['secret'];}
  }
  const state=fixture(1,['private']);
  state.prompts=[new ChooseCardsPrompt()];
  assert.throws(()=>guard(()=>bot.decodeNextAction(state),
    {SimpleTacticsAi:FakeAi,maxRecords:0}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.nativeRawStateFallbackQuarantine.records.length,0);
    assert.equal(error.nativeRawStateFallbackQuarantine.recordsOmitted,1);
    return true;
  });
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});

test('unrelated exception propagates and restores native method',()=>{
  const {FakeAi,original}=fakeAi();
  const engineError=new Error('Store failed');
  assert.throws(()=>guard(()=>{throw engineError;},
    {SimpleTacticsAi:FakeAi}),error=>{
    assert.strictEqual(error,engineError);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,0);
    return true;
  });
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});

test('bad configuration fails without monkeypatch',()=>{
  const {FakeAi,original}=fakeAi();
  assert.throws(()=>guard(()=>{}, {SimpleTacticsAi:FakeAi,maxRecords:-1}),
    {name:'AssertionError'});
  assert.throws(()=>guard(null,{SimpleTacticsAi:FakeAi}),
    {name:'AssertionError'});
  assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
});
