'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runV4}=
  require('../../simulation/evaluation/2026-11/agent4-hood-immediate-psychic-reserve-v4.cjs');

test('new same-print paired native runner isolates only the owner-funded Hood gate',()=>{
  const switches=[];
  const result=runV4({
    runtime:work=>work(),
    manifest:()=>({
      audit:{registered:true},
      manifest:{
        nativeActionCap:180,
        commonPolicy:{actorOnlyComposition:true,nativeRootActionLimit:180},
        modes:[{id:'selected-v3-paper-plus-funded-mobility',
          ownerGenericTrainerFrontier:true,
          actorFundedShadowRiderFloatStoneRoot:true}]
      }
    }),
    runner:opts=>{
      switches.push({
        hood:process.env.AGENT4_HOOD_TOOL_ROOT_DEV,
        immediate:process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV
      });
      return {
        attempted:16,
        rows:opts.registeredTrials.map(trial=>({
          trial,finished:false,status:'action-capped',
          rootActionLedger:[],
          fullPhysicalDealFingerprint:{id:trial.id},
          sourceDealFingerprint:{id:trial.id},
          finalPrizes:[6,6]
        }))
      };
    }
  });
  assert.deepEqual(switches,[
    {hood:'true',immediate:undefined},
    {hood:'true',immediate:'true'}
  ]);
  assert.equal(Object.values(result.gates).every(Boolean),true);
  assert.equal(result.nativeGameAttempts,32);
  assert.deepEqual(result.nativeWinnerReversal,[]);
  assert.equal(result.paperQualifiedGames,0);
  assert.equal(process.env.AGENT4_HOOD_TOOL_ROOT_DEV,undefined);
  assert.equal(process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV,undefined);
});
