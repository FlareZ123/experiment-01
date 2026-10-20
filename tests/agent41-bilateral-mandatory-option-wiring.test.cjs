'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const sourcePath=path.join(__dirname,
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const source=fs.readFileSync(sourcePath,'utf8');

/**
 * Test the native runner request boundary without invoking Twinleaf.
 * This verifies opt-in plumbing only; it does not establish that an engine
 * option prompt was reached, resolved or strategically selected.
 * @returns {{executeDevelopment:Function,getRequest:()=>object|null}}
 */
function isolateRunner(){
  let request=null;
  const registration={
    maxRootActions:260,enginePin:'test-engine',
    frozenFlags:{supporterDecisionCorrection:true}
  };
  const fakeRequire=specifier=>{
    if(specifier==='node:fs')return{
      readFileSync:()=>JSON.stringify(registration)
    };
    if(specifier==='./agent41-crossrank-actual-decisions.cjs')return{
      scheduledArms:()=>[],assertManifest:()=>{}
    };
    if(specifier==='./agent41-bilateral-common-policy.cjs')return{
      POLICY_VERSION:'test-common-v0',
      withBilateralCommonCandidatePolicy:(seat,execute)=>execute()
    };
    if(specifier==='./agent37-candidate-attack-settlement.cjs')return{
      candidateAttackSettlement:()=>({})
    };
    if(specifier==='../twinleaf/headless.cjs')return{
      runMatch:value=>{
        request=value;
        throw new Error('CAPTURED_NATIVE_REQUEST');
      }
    };
    if(specifier==='../twinleaf/rank11-direct-boostshake.cjs')return{
      withRank11DirectBoostShake:(seat,execute)=>execute()
    };
    if(specifier==='../twinleaf/rank6-broad-thorns-policy.cjs')return{
      withBroadThornsSourceAttack:execute=>execute(),
      discardOrder:Array(8).fill('unused')
    };
    return require(specifier);
  };
  const isolatedModule={exports:{}};
  vm.runInNewContext(source,{
    require:fakeRequire,module:isolatedModule,
    __dirname:path.dirname(sourcePath),
    process:{env:{},stdout:{write(){}}}
  },{filename:sourcePath,timeout:1000});
  return {
    executeDevelopment:isolatedModule.exports.executeDevelopment,
    getRequest:()=>request
  };
}

for(const rank of [6,11]){
  for(const seat of ['A','B']){
    for(const enabled of [false,true]){
      test(`rank ${rank} candidate seat ${seat} mandatory fallback ${enabled}`,()=>{
        const {executeDevelopment,getRequest}=isolateRunner();
        const trial={
          rank,candidateSlot:seat,candidateId:'fixed-candidate',
          id:'test-physical-deal',seed:20261020
        };
        const candidate=Array(60).fill('candidate');
        const source60=Array(60).fill('source');
        const candidates=new Map([['fixed-candidate',{plan:{
          candidate:{cards:candidate},
          opponents:[{rank,status:'ready',cards:source60}]
        }}]]);
        assert.throws(()=>executeDevelopment(trial,candidates,{
          mandatoryOptionFallback:enabled
        }),/CAPTURED_NATIVE_REQUEST/);
        const request=getRequest();
        assert.equal(request.mandatoryOptionFallback,enabled);
        assert.equal(request.supporterDecisionCorrection,true);
        assert.equal(request.enforceVisiblePlayLockBothSeats,true);
        assert.equal(request.deckA[0],seat==='A'?'candidate':'source');
        assert.equal(request.deckB[0],seat==='B'?'candidate':'source');
        assert.equal(request.seed,trial.seed);
      });
    }
  }
}
