'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const runnerPath=path.join(__dirname,
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const source=fs.readFileSync(runnerPath,'utf8');

/**
 * Drive the canonical four-arm orchestration to the first native request.
 * All real Store operations deliberately abort; only routing is tested.
 * @returns {{runDevelopment:Function,requests:object[],observations:string[]}}
 */
function isolatedCampaign(){
  const requests=[];
  const observations=[];
  const arms=['6:0:A','11:2:B'].flatMap(prefix=>{
    const [rank,repeat,candidateSlot]=prefix.split(':');
    return ['champion-reference','new-moon-lockbreaker-v1'].map(candidateId=>({
      rank:Number(rank),repeat:Number(repeat),candidateSlot,candidateId,
      seed:20261020,id:prefix+':'+candidateId
    }));
  });
  const registration={
    enginePin:'fixture',maxRootActions:260,
    frozenFlags:{supporterDecisionCorrection:true}
  };
  const roster={decks:[{rank:1,cards:Array(60).fill('champion')}]};
  const fakeRequire=specifier=>{
    if(specifier==='node:fs')return{
      readFileSync:p=>JSON.stringify(String(p).includes('full-decklists.json')?
        roster:registration)
    };
    if(specifier==='./agent41-crossrank-actual-decisions.cjs')return{
      scheduledArms:()=>arms,assertManifest:()=>{}
    };
    if(specifier==='./agent41-bilateral-common-policy.cjs')return{
      POLICY_VERSION:'test-common-v0',
      withBilateralCommonCandidatePolicy:(seat,execute)=>execute()
    };
    if(specifier==='./agent37-candidate-attack-settlement.cjs')return{
      candidateAttackSettlement:()=>({})
    };
    if(specifier==='./aichi-pilot.cjs')return{
      planAichi:manifest=>({
        candidate:{cards:manifest.cards},
        opponents:[6,11].map(rank=>({
          rank,status:'ready',cards:Array(60).fill('source')
        }))
      })
    };
    if(specifier==='../../scripts/aichi-new-moon-candidate.cjs')return{
      loadNewMoonCandidate:()=>({cards:Array(60).fill('newmoon')})
    };
    if(specifier==='../twinleaf/headless.cjs')return{
      runMatch:request=>{
        requests.push(request);
        throw new Error('EXPECTED_NATIVE_ABORT');
      }
    };
    if(specifier==='../twinleaf/rank11-direct-boostshake.cjs')return{
      withRank11DirectBoostShake:(seat,execute)=>execute()
    };
    if(specifier==='../twinleaf/rank6-broad-thorns-policy.cjs')return{
      withBroadThornsSourceAttack:execute=>execute(),
      discardOrder:Array(8).fill('unused')
    };
    if(specifier==='../twinleaf/agent39-live-initialization-window.cjs')return{
      withLiveInitializationWindow:execute=>{
        observations.push('rank6');
        return execute();
      }
    };
    if(specifier==='../twinleaf/agent41-live-garbotoxin-ability-window.cjs')return{
      withLiveGarbodorAbilityWindow:execute=>{
        observations.push('rank11');
        return execute();
      }
    };
    return require(specifier);
  };
  const mock={exports:{}};
  vm.runInNewContext(source,{
    module:mock,require:fakeRequire,__dirname:path.dirname(runnerPath),
    process:{env:{},stdout:{write(){}}}
  },{filename:runnerPath,timeout:1000});
  return {runDevelopment:mock.exports.runDevelopment,requests,observations};
}

for(const flags of [
  {nativePressureWindows:false,mandatoryOptionFallback:false},
  {nativePressureWindows:true,mandatoryOptionFallback:false},
  {nativePressureWindows:true,mandatoryOptionFallback:true}
]){
  test(`canonical routing native windows ${flags.nativePressureWindows}, options ${flags.mandatoryOptionFallback}`,()=>{
    const fixture=isolatedCampaign();
    const output=fixture.runDevelopment(flags);
    assert.equal(output.attempted,4);
    assert.equal(output.errors,4);
    assert.equal(output.nativePressureWindowsOptIn,flags.nativePressureWindows);
    assert.equal(output.mandatoryOptionFallbackBothSeats,flags.mandatoryOptionFallback);
    assert.equal(fixture.requests.length,4);
    for(const request of fixture.requests){
      assert.equal(request.mandatoryOptionFallback,flags.mandatoryOptionFallback);
      assert.equal(request.enforceSelectOptionLegality,flags.mandatoryOptionFallback);
      assert.equal(request.enforceVisiblePlayLockBothSeats,true);
      assert.equal(request.supporterDecisionCorrection,true);
    }
    const expected=flags.nativePressureWindows?
      ['rank6','rank6','rank11','rank11']:[];
    assert.deepEqual(fixture.observations,expected);
    assert.equal(output.rows.every(row=>
      row.status==='engine-error'&&
      row.error.includes('EXPECTED_NATIVE_ABORT')),true);
    assert.equal(output.competitiveQualifiedGames,0);
    assert.equal(output.winRateCertified,false);
  });
}
