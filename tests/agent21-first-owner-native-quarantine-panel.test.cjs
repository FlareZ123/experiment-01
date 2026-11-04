'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  runFirstOwnerDecoderPanel
}=require('../simulation/evaluation/agent21-first-owner-native-quarantine-panel.cjs');
const {
  CODE
}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const trials=[
  {id:'5:0:A:champion-reference',rank:5,repeat:0,
    candidateSlot:'A',candidateId:'champion-reference',seed:112},
  {id:'5:0:B:champion-reference',rank:5,repeat:0,
    candidateSlot:'B',candidateId:'champion-reference',seed:224}
];
const preflight=()=>({
  profile:{selectedPolicyOptions:{actorOnlyComposition:true},
    pinnedVendorRevision:'TEST_VENDOR',allowAdditionalOriginalSourceRanks:[]},
  trials,codeProvenance:{changedCodeCells:[]}
});

test('both physical seats report the first blocked native decoder without hidden contents',()=>{
  const invoked=[];
  const result=runFirstOwnerDecoderPanel({
    preflight,
    runner:options=>{
      invoked.push(options.registeredTrials[0].id);
      return {attempted:1,rows:[{trial:{id:options.registeredTrials[0].id}}]};
    },
    quarantine:run=>{
      run();
      const error=new Error('raw native owner decision rejected');
      error.code=CODE;
      error.nativeRawStateFallbackQuarantine={
        rawStateFallbackCalls:1,originalNativeDecoderExecuted:false,
        records:[{seat:0,turn:1,phase:2,
          decisionKind:'root-or-setup',promptType:null}],
        recordsOmitted:0
      };
      throw error;
    },pinNative:false
  });
  assert.deepEqual(invoked,trials.map(t=>t.id));
  assert.deepEqual(result.attempts.map(a=>a.sourceSeat),[1,0]);
  assert.ok(result.attempts.every(a=>a.status===CODE));
  assert.ok(result.attempts.every(a=>
    a.firstBlockedDecision.decisionKind==='root-or-setup'));
  assert.ok(result.attempts.every(a=>
    a.originalNativeDecoderExecuted===false));
  assert.equal(result.competitivelyQualifiedGames,0);
});

test('zero decoder calls alone remains explicitly unqualified',()=>{
  const result=runFirstOwnerDecoderPanel({
    preflight,runner:options=>({attempted:1,
      rows:[{trial:options.registeredTrials[0]}]}),
    quarantine:run=>({result:run(),audit:{
      rawStateFallbackCalls:0,originalNativeDecoderExecuted:false,
      records:[],recordsOmitted:0
    }}),pinNative:false
  });
  assert.equal(result.attempts.length,2);
  assert.ok(result.attempts.every(a=>
    a.status==='NO_RAW_DECODER_CALL_OBSERVED_UNQUALIFIED'));
  assert.ok(result.attempts.every(a=>a.returnedRows===1));
  assert.equal(result.gameWinRateVerified,false);
});

test('unrelated abort is preserved as unqualified without inventing a decoder violation',()=>{
  const result=runFirstOwnerDecoderPanel({
    preflight,runner:()=>{throw Error('native Store error');},
    quarantine:run=>run(),pinNative:false
  });
  assert.ok(result.attempts.every(a=>
    a.status==='OTHER_NATIVE_OR_PREFLIGHT_ERROR'));
  assert.ok(result.attempts.every(a=>
    a.rawStateFallbackCalls===null));
});

test('different historical physical deal seeds are required for the two-seat panel',()=>{
  assert.throws(()=>runFirstOwnerDecoderPanel({
    preflight:()=>({...preflight(),trials:[
      trials[0],{...trials[1],seed:trials[0].seed}
    ]}),runner:()=>{},pinNative:false
  }),/distinct historical registered seeds/);
});
