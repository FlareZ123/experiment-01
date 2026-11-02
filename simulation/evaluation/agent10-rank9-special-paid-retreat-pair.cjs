'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms}=require('./agent10-original-rank9-absol-electrode-development.cjs');
const {run:runControl,treatmentOptions,VERSION:CONTROL_VERSION}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {VERSION:SELECTOR_VERSION}=
  require('../twinleaf/agent10-rank9-special-paid-retreat.cjs');
const VERSION='agent10-rank9-retreat-original-source-paired-native-v1';

/** Preserve exact original 60s, registered seeds, common bot and both seats. */
function run(){
  const registered=scheduledArms();
  assert.equal(registered.length,4);
  const control=runControl();
  assert.equal(control.version,CONTROL_VERSION);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  let treatment;
  try{
    const root=path.resolve(__dirname,'../..');
    const {assertPinnedNativeStore}=require(
      './agent41-frozen-bilateral-development-v1.cjs');
    assertPinnedNativeStore(root,profile);
    treatment=require('./agent41-bilateral-v2-development.cjs')
      .runDevelopment({
        ...treatmentOptions(),
        actorRank9SpecialPaidRetreatSource:true,
        registeredFrameName:VERSION
      });
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  function nativeRoots(row,seat,action){
    return (row?.rootActionLedger??[]).filter(x=>
      x.playerSlot===seat&&x.action===action).map(x=>({
        ordinal:x.actionOrdinal,turn:x.turnBefore,
        attack:x.attack??null,card:x.card??null
      }));
  }
  const pairs=registered.map((trial,i)=>{
    const b=control.rows?.[i]??null,t=treatment.rows?.[i]??null;
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const nativeDealSame=b?.sourceDealFingerprint!=null&&
      b.sourceDealFingerprint===t?.sourceDealFingerprint;
    const fullDealSame=b?.fullPhysicalDealFingerprint!=null&&
      b.fullPhysicalDealFingerprint===t?.fullPhysicalDealFingerprint;
    return {
      id:trial.id,seed:trial.seed,sourceSeat,
      baselineSourceDeal:b?.sourceDealFingerprint??null,
      treatmentSourceDeal:t?.sourceDealFingerprint??null,
      baselineFullDeal:b?.fullPhysicalDealFingerprint??null,
      treatmentFullDeal:t?.fullPhysicalDealFingerprint??null,
      sourceDealSame:nativeDealSame,fullDealSame,
      sameActualStarter:b?.actualStarterSeat===t?.actualStarterSeat,
      baselineRootSha:b?.rootActionLedgerSha256??null,
      treatmentRootSha:t?.rootActionLedgerSha256??null,
      baselineStatus:{finished:b?.finished??false,winner:b?.winner??null,
        actionCount:b?.actionCount??null,error:b?.error??null},
      treatmentStatus:{finished:t?.finished??false,winner:t?.winner??null,
        actionCount:t?.actionCount??null,error:t?.error??null},
      baselineSourceRetreats:nativeRoots(b,sourceSeat,'RetreatAction'),
      treatmentSourceRetreats:nativeRoots(t,sourceSeat,'RetreatAction'),
      treatmentSourceAttacks:nativeRoots(t,sourceSeat,'AttackAction'),
      treatmentSourceAttackSettlement:t?.sourceAttackSettlement??null,
      treatmentSourceRootIntents:
        t?.actorOnlyDecisionCoverage?.typedIntentCounts??null,
      firstDifferentNativeRootIndex:(()=>{
        const a=b?.rootActionLedger??[],z=t?.rootActionLedger??[];
        const limit=Math.min(a.length,z.length);
        for(let j=0;j<limit;j++){
          if(JSON.stringify(a[j])!==JSON.stringify(z[j]))return j;
        }
        return a.length===z.length?null:limit;
      })(),
      qualification:'retrospective native diagnostic, not a certified paper match'
    };
  });
  return {
    version:VERSION,selectorVersion:SELECTOR_VERSION,
    researchHeadCommit:process.env.GITHUB_SHA??null,
    pinnedVendorRevision:profile.pinnedVendorRevision,
    unchangedFixedSourceSixties:true,
    sourceOnlyTreatment:true,originalRegisteredAttempts:4,
    attemptedControl:control.attempted,attemptedTreatment:treatment.attempted,
    completeControl:control.complete,
    completeTreatment:treatment.attempted===4&&
      Array.isArray(treatment.rows)&&treatment.rows.length===4,
    physicalDealParity:pairs.every(x=>x.sourceDealSame&&x.fullDealSame),
    pairs,rawControl:control,rawTreatment:treatment,
    competitiveQualifiedGames:0,
    caveat:'Historical selected physical deals. Only actor source seat receives exact funded Bench retreat proposal. Native payment, attack settlement and opponent follow-through require inspection; no official clock or competitive win inference.'
  };
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(!r.completeControl||!r.completeTreatment||!r.physicalDealParity)
    process.exitCode=1;
}
module.exports={VERSION,run};
