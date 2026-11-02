'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {auditNativeArm,firstPublicRootDeviation}=
  require('./agent41-rank6-native-plumeria-common-choice-pair.cjs');

const VERSION='agent38-prospective-32-physical-native-plumeria-cost-v1';
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent38-plumeria-conservation-fresh-20261102.json';
const REGISTRATION_BLOB='6142a6bac7dcb3fc88eb135c38f60ed1d2083151';
const SWITCH='AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV';

/** @returns {{plan:object,trials:object[]}} Read an immutable prior plan. */
function registeredPlan(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REGISTRATION_PATH));
  const sha=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(sha,REGISTRATION_BLOB,'Prospective registration Git blob changed');
  const plan=JSON.parse(bytes.toString('utf8'));
  assert.equal(plan.schema,'agent38-prospective-native-plumeria-payment-conservation-v1');
  assert.equal(plan.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(plan.sourceRank,6);
  assert.deepEqual(plan.candidateSlots,['A','B']);
  assert.deepEqual(plan.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(plan.repeatsPerSlot,4);
  assert.equal(plan.originalSourceSeedGroups,8);
  assert.equal(plan.candidatePhysicalMatchupCases,16);
  assert.equal(plan.policyArms,2);
  assert.equal(plan.nativeAttempts,32);
  assert.equal(plan.nativeRootActionCap,260);
  const used=new Set(),trials=[];
  for(const slot of plan.candidateSlots){
    const seeds=plan.seeds?.[slot];
    assert.ok(Array.isArray(seeds)&&seeds.length===plan.repeatsPerSlot);
    for(let repeat=0;repeat<seeds.length;repeat++){
      const seed=seeds[repeat];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      assert.ok(!used.has(seed),'Prospectively drawn seed reused across seats');
      used.add(seed);
      for(const candidateId of plan.candidateIds){
        trials.push({rank:plan.sourceRank,repeat,seed,
          candidateSlot:slot,candidateId,
          id:[plan.sourceRank,repeat,slot,candidateId].join(':')});
      }
    }
  }
  assert.equal(used.size,8);
  assert.equal(trials.length,16);
  return {plan,trials};
}

/**
 * Compare every frozen same-deal original Store arm. Include all native
 * failures and root caps. The only treatment is one opt-in payment screen.
 * @param {object} off Native baseline result
 * @param {object} on Native guarded result
 * @param {object[]} scheduled Registered trials
 * @returns {object} Verified paired native event record
 */
function compareProspectiveNative(off,on,scheduled){
  const failures=[];
  if(off.attempted!==scheduled.length||on.attempted!==scheduled.length)
    failures.push('native-attempt-count-mismatch');
  if(off.enginePin!==on.enginePin)
    failures.push('engine-pin-mismatch');
  if(off.competitiveQualifiedGames!==0||
     on.competitiveQualifiedGames!==0)
    failures.push('unqualified-competitive-claim');
  const byOff=new Map((off.rows??[]).map(x=>[x.trial?.id,x]));
  const byOn=new Map((on.rows??[]).map(x=>[x.trial?.id,x]));
  if(byOff.size!==scheduled.length||byOn.size!==scheduled.length)
    failures.push('missing-or-duplicate-trial-rows');
  const pairs=scheduled.map(trial=>{
    const a=byOff.get(trial.id),b=byOn.get(trial.id);
    if(!a||!b){
      failures.push('missing-arm:'+trial.id);
      return {trial,attempted:false,competitiveQualified:false};
    }
    const ap=auditNativeArm(a),bp=auditNativeArm(b);
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const fullDealMatched=ap.fullPhysicalDealFingerprint!=null&&
      ap.fullPhysicalDealFingerprint===bp.fullPhysicalDealFingerprint&&
      ap.sourceDealFingerprint!=null&&
      ap.sourceDealFingerprint===bp.sourceDealFingerprint;
    const flagged=ap.plumeriaCostConservationOptIn===false&&
      bp.plumeriaCostConservationOptIn===true;
    const sourceSeatMatched=a.sourceSeat===sourceSeat&&
      b.sourceSeat===sourceSeat;
    if(!fullDealMatched)failures.push('physical-deal-mismatch:'+trial.id);
    if(!flagged)failures.push('unverified-actual-policy-flag:'+trial.id);
    if(!sourceSeatMatched)failures.push('wrong-source-seat:'+trial.id);
    const firstDeviation=firstPublicRootDeviation(
      a.rootActionLedger,b.rootActionLedger,sourceSeat);
    const baseline=ap.acceptedPlumeria??0;
    const conserved=bp.acceptedPlumeria??0;
    return {
      trial,sourceSeat,
      sameFullPhysicalDeal:fullDealMatched,
      bothPolicyFlagsVerified:flagged,
      sourceSeatMatched,sourceActuallyFirst:a.sourceActuallyFirst??null,
      baseline:{
        status:ap.status,error:ap.error,
        acceptedPlumeria:ap.acceptedPlumeria,
        settledPlumeria:ap.settledPhysicalEnergyDiscards,
        ownerPayments:ap.physicalOwnerPayments,
        nativeRootHash:ap.rootActionLedgerSha256,
        selectedPlumeriaRoots:ap.selectedPlumeriaOwnerRoots
      },
      conservation:{
        status:bp.status,error:bp.error,
        acceptedPlumeria:bp.acceptedPlumeria,
        settledPlumeria:bp.settledPhysicalEnergyDiscards,
        ownerPayments:bp.physicalOwnerPayments,
        nativeRootHash:bp.rootActionLedgerSha256,
        selectedPlumeriaRoots:bp.selectedPlumeriaOwnerRoots
      },
      firstPublicDeviation:firstDeviation,
      changedNativeRootLedger:
        ap.rootActionLedgerSha256!==bp.rootActionLedgerSha256,
      nativePlumeriaPlayDifference:baseline-conserved,
      competitiveQualified:false
    };
  });
  const count=(key,value)=>pairs.filter(p=>
    p[key]===value).length;
  return {
    version:VERSION,enginePin:off.enginePin,
    registrationPath:REGISTRATION_PATH,registrationGitBlob:REGISTRATION_BLOB,
    matchedSourceSeedGroups:8,registeredPhysicalMatchupCases:16,
    actualNativeAttempts:off.attempted+on.attempted,
    validation:{passed:failures.length===0,failures},
    summary:{
      matchedPhysicalPairs:count('sameFullPhysicalDeal',true),
      policyFlagsConfirmed:count('bothPolicyFlagsVerified',true),
      changedNativeRootLedgerPairs:count('changedNativeRootLedger',true),
      baselineAcceptedPlumeria:pairs.reduce((n,p)=>
        n+(p.baseline?.acceptedPlumeria??0),0),
      conservationAcceptedPlumeria:pairs.reduce((n,p)=>
        n+(p.conservation?.acceptedPlumeria??0),0),
      baselineSettledPlumeria:pairs.reduce((n,p)=>
        n+(p.baseline?.settledPlumeria??0),0),
      conservationSettledPlumeria:pairs.reduce((n,p)=>
        n+(p.conservation?.settledPlumeria??0),0),
      byStatus:{
        baseline:pairs.reduce((m,p)=>{
          const k=p.baseline?.status??'missing';
          m[k]=(m[k]??0)+1;return m;
        },{}),
        conservation:pairs.reduce((m,p)=>{
          const k=p.conservation?.status??'missing';
          m[k]=(m[k]??0)+1;return m;
        },{})
      },
      competitiveQualifiedGames:0
    },
    pairs,competitiveQualifiedGames:0,
    caveat:'Fresh prospectively frozen original 8 source seeds, 16 candidate-specific physical deals and 32 original Store attempts. Heuristic both-seat policy is unqualified and 260-root caps censor unfinished games. Action changes are not proof of improved win rate.'
  };
}

/** @returns {object} Execute immutable fresh comparison on original Store. */
function runFreshNative(){
  const {plan,trials}=registeredPlan();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const prior=process.env[SWITCH];
  try{
    process.env[SWITCH]='false';
    const off=runDevelopment({...plan.frozenCommonRootOptions,
      registeredTrials:trials,registeredFrameName:REGISTRATION_PATH});
    process.env[SWITCH]='true';
    const on=runDevelopment({...plan.frozenCommonRootOptions,
      registeredTrials:trials,registeredFrameName:REGISTRATION_PATH});
    return compareProspectiveNative(off,on,trials);
  }finally{
    if(prior===undefined)delete process.env[SWITCH];
    else process.env[SWITCH]=prior;
  }
}

if(require.main===module){
  const value=runFreshNative();
  process.stdout.write(JSON.stringify(value,null,2)+'\n');
  if(!value.validation.passed)process.exitCode=1;
}
module.exports={VERSION,REGISTRATION_PATH,REGISTRATION_BLOB,
  registeredPlan,compareProspectiveNative,runFreshNative};
