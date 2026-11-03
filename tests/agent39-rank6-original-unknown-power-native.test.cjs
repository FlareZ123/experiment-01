'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  selectedOriginalRank6Plan,runTypedRank6Forensic
}=require('../simulation/evaluation/agent39-rank6-original-unknown-power-native.cjs');

const ORIGINAL_SOURCE_SHA='1180bb8d34c5364ce202e23f94eebc5e3c0d83381b85bc2991ba1e002f70a0a7';
const ORIGINAL_PREFIX_SHA='75c90e10e1178b30a2579cfa689498b4f3e6a65389883ed615662fadec8edf97';
class AddPlayerAction{constructor(id){this.id=id;}}
class UseAbilityAction{
  constructor(id,abilityName,target){
    this.id=id;this.abilityName=abilityName;this.target=target;
  }
}
class FakeStore{
  constructor(){this.state={turn:8,phase:3};}
  dispatch(action){
    if(action.constructor.name==='UseAbilityAction')
      throw Error('UNKNOWN_POWER');
    return true;
  }
}

test('holds original published rank6 seed, both unchanged candidates',()=>{
  const p=selectedOriginalRank6Plan();
  assert.equal(p.trials.length,2);
  assert.deepEqual(p.trials.map(x=>x.id),[
    '6:300:A:champion-reference',
    '6:300:A:new-moon-lockbreaker-v1'
  ]);
  assert.equal(p.manifest.modes.length,2);
  assert.match(p.manifestSha256,/^[a-f0-9]{64}$/);
});

test('preserves typed rejected name and marks historical replay concordance',()=>{
  const calls=[];
  const mock=opts=>{
    calls.push(opts.registeredFrameName);
    return {rows:opts.registeredTrials.map((trial,i)=>{
      const store=new FakeStore();
      store.dispatch(new AddPlayerAction(101));
      assert.throws(()=>store.dispatch(new UseAbilityAction(101,
        'Underworld Door',{player:0,slot:1,index:0})),/UNKNOWN_POWER/);
      return {trial,status:'engine-error',error:'Error: UNKNOWN_POWER',
        nativeAbortEvidence:{
          sourceDealFingerprint:{digestSha256:ORIGINAL_SOURCE_SHA},
          rootActionLedgerSha256:i===0?ORIGINAL_PREFIX_SHA:'f'.repeat(64),
          actionName:'UseAbilityAction',actionOrdinal:43,turnBefore:8
        }};
    })};
  };
  const out=runTypedRank6Forensic(mock,{Store:FakeStore});
  assert.equal(out.competitiveQualifiedGames,0);
  assert.equal(out.modes.length,2);
  assert.equal(calls.length,2);
  for(const mode of out.modes){
    assert.equal(mode.liveStoreGameCount,2);
    assert.equal(mode.rows.length,2);
    assert.equal(mode.rows[0].sourceDealMatchesArchivedAbort,true);
    assert.equal(mode.rows[0].acceptedPrefixMatchesArchivedAbort,true);
    assert.equal(mode.rows[1].acceptedPrefixMatchesArchivedAbort,false);
    assert.equal(mode.rows[0].typedRejectedAbilityActions[0].abilityName,
      'Underworld Door');
    assert.equal(mode.rows[1].typedRejectedAbilityActions[0].liveGameIndex,1);
  }
});
