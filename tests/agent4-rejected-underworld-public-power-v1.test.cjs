'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withCombinedUnderworldWitness,run}=
  require('../simulation/evaluation/agent4-rejected-underworld-public-power-v1.cjs');
const REG=require('../results/aichi-2026/registrations/agent4-underworld-public-lock-probe-v1-20261106.json');
const PAIRED_REG=require('../results/aichi-2026/registrations/agent4-v3-two-unknown-power-native-12-20261106.json');

test('two witness layers preserve exact native result and both audits',()=>{
  const observed=withCombinedUnderworldWitness(()=>42,{
    typed:work=>({result:work(),
      audit:{liveGameCount:4,abilityActions:[],auxiliaryAbilityDispatchCount:0}}),
    publicLock:work=>({result:work(),
      audit:{liveGameCount:4,events:[{liveGameIndex:0}]}})
  });
  assert.equal(observed.result,42);
  assert.equal(observed.audit.liveGameCount,4);
  assert.equal(observed.audit.nativeUnderworldRejectionAudit.liveGameCount,4);
  assert.equal(observed.audit.nativeUnderworldRejectionAudit.events.length,1);
});
function sample(tweak=()=>{}){
  const modes=PAIRED_REG.modes.map((modeId,m)=>({
    modeId,observedLiveStoreCount:4,
    nativeUnderworldRejectionAudit:{liveGameCount:4,events:[]},
    rows:[
      {id:REG.exactOriginalTargetIDs[0],status:'engine-error',
        rejectedUnknownPowerActions:[{name:'Underworld Door',
          rejection:'UNKNOWN_POWER'}],
        publicLockWitnessAtActualRejectedPower:[{
          preDispatchPublicContext:{
            opposingActive:'Iron Thorns ex',
            opposingActiveIronThornsEx:true,
            opposingActivePowerNames:['Initialization'],
            actingUnderworldSources:[{zone:'Bench',index:0,
              printing:'Shadow Rider Calyrex VMAX',powerName:'Underworld Door'}]
          },
          postRejectionSpecificNativePowerChecks:[
            {powerName:'Underworld Door',
              nativePowerBlockedAfterRejection:true}
          ],
          allPrintedUnderworldPowersBlocked:true
        }]
      },
      {id:REG.exactOriginalTargetIDs[1],status:'engine-error',
        rejectedUnknownPowerActions:[{name:'Underworld Door',
          rejection:'UNKNOWN_POWER'}],
        publicLockWitnessAtActualRejectedPower:[{
          preDispatchPublicContext:{
            opposingActive:'Iron Thorns ex',
            opposingActiveIronThornsEx:true,
            opposingActivePowerNames:['Initialization'],
            actingUnderworldSources:[{zone:'Active',index:null,
              printing:'Shadow Rider Calyrex VMAX',powerName:'Underworld Door'}]
          },
          postRejectionSpecificNativePowerChecks:[
            {powerName:'Underworld Door',
              nativePowerBlockedAfterRejection:true}
          ],
          allPrintedUnderworldPowersBlocked:true
        }]
      }
    ]
  }));
  // All four groups include exact same-seed companion candidate rows.
  for(const mode of modes){
    mode.rows.push({id:'6:401:A:new-moon-lockbreaker-v1',
      publicLockWitnessAtActualRejectedPower:[]});
    mode.rows.push({id:'6:402:B:new-moon-lockbreaker-v1',
      publicLockWitnessAtActualRejectedPower:[]});
  }
  const paired=Array.from({length:4},(_,i)=>({
    id:'trial'+i,sourceFingerprintMatchedAllThree:true,
    fullPhysicalDealMatchedAllThree:true,
    aRepeatExactAcceptedPrefixAndDisposition:true
  }));
  const original={actualNativeAttemptCount:12,modes,paired};
  tweak(original);
  return original;
}
test('all twelve genuine attempts and six posterror power receipts meet gate',()=>{
  const x=run({runner:()=>sample(),witness:()=>{}});
  assert.equal(x.allNamedRejectionPublicNativePowerChecks.length,6);
  assert.ok(Object.values(x.gates).every(Boolean));
  assert.equal(x.allNamedRejectionPublicNativePowerChecks[0]
    .opposingActiveIronThornsEx,true);
  assert.equal(x.qualifiedCompetitiveGames,0);
  assert.equal(x.winRate,null);
});
test('one missing typed receipt preserves failure rather than false admission',()=>{
  const x=run({runner:()=>sample(y=>{
    y.modes[2].rows[1].publicLockWitnessAtActualRejectedPower=[];
  })});
  assert.equal(x.gates.allSixPublicPostRejectPowerReceipts,false);
  assert.equal(x.allNamedRejectionPublicNativePowerChecks.length,5);
});
test('a code drift or physical mismatch never silently promotes paper games',()=>{
  const x=run({runner:()=>sample(y=>{
    y.paired[0].fullPhysicalDealMatchedAllThree=false;
  })});
  assert.equal(x.gates.allFourInitialDealsComparable,false);
  assert.equal(x.provenUniquePaperCause,false);
  assert.equal(x.qualifiedCompetitiveGames,0);
});
