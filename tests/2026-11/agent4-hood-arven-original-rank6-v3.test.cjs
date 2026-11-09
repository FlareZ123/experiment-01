'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runArvenPhase}=
  require('../../simulation/evaluation/2026-11/agent4-hood-arven-original-rank6-v3.cjs');
const registration=require('../../results/aichi-2026/registrations/agent4-hood-arven-search-original-rank6-v3-20261109.json');

test('both paired owners retain exact physical deals and only treatment offers Arven',()=>{
  const invocations=[];
  const stub=options=>{
    invocations.push(options.actorArvenHoodSearchRoot);
    return {
      attempted:16,
      rows:options.registeredTrials.map(trial=>{
        const seat=trial.candidateSlot==='A'?0:1;
        return {
          trial,status:'action-capped',finished:false,
          rootActionLedger:options.actorArvenHoodSearchRoot?
            [{action:'PlayCardAction',card:'Arven SVI',playerSlot:seat}]:[],
          fullPhysicalDealFingerprint:{registeredId:trial.id},
          sourceDealFingerprint:{registeredId:trial.id},
          finalPrizes:[6,6]
        };
      })
    };
  };
  const result=runArvenPhase({
    registration,
    runner:stub,
    runtime:fn=>fn(),
    manifest:()=>({
      audit:{schema:'stub-matching-same-manifest'},
      manifest:{
        nativeActionCap:180,commonPolicy:{},
        modes:[{id:'selected-v3-paper-plus-funded-mobility',
          ownerGenericTrainerFrontier:true,
          actorFundedShadowRiderFloatStoneRoot:true}]
      }
    })
  });
  assert.deepEqual(invocations,[false,true]);
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.actualNativeOwnerArvenControl,0);
  assert.equal(result.actualNativeOwnerArvenTreatment,16);
  assert.equal(result.rows.every(r=>r.sameFullPhysicalStart),true);
  assert.equal(Object.values(result.gates).every(Boolean),true);
  assert.equal(result.paperQualifiedGames,0);
  assert.equal(process.env.AGENT4_HOOD_TOOL_ROOT_DEV,undefined);
});
