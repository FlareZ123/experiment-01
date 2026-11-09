'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {manifestWithDriftAudit}=
  require('../agent4-v3-two-unknown-power-readout.cjs');
const {withSameRuntime,effectiveOptions}=
  require('../agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {rowSummary}=
  require('./agent4-hood-owner-rank6-prospective-32.cjs');
const {withHeldHoodToolPriority,withProtectedHoodUnderworld}=
  require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');
const {withImmediateFundedHoodOnly}=
  require('../../twinleaf/2026-11/agent4-immediate-hood-psychic-budget.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');
const reg=require('../../../results/aichi-2026/registrations/agent4-hood-immediate-psychic-reserve-v4-20261109.json');
const candidate=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const VERSION='agent4-real-psychic-funded-hood-reserve-v4-32-native';

/**
 * Two policy arms share exact printed 60s, source/opponent native policy,
 * physical starts, native cap, held Tool source and guarded Door.
 * The treatment restricts the Tool choice to immediately funded owner hand
 * and publicly sufficient deck reserve. No change to engine or card pool.
 *
 * @param {{runner?:Function,manifest?:Function,registration?:object,runtime?:Function}} [deps]
 * @returns {object}
 */
function runV4(deps={}){
  const registration=deps.registration??reg;
  assert.equal(registration.schema,
    'agent4-hood-immediate-psychic-and-five-card-reserve-v4-preregistered');
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.candidateBlob,
    '24ace2d6feb9ce5d9056bcf271827cfe31b7357b');
  assert.equal(new Set(registration.independentSeeds).size,8);
  assert.equal(registration.trialRows.length,16);
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const mode=checked.manifest.modes.find(m=>
    m.id==='selected-v3-paper-plus-funded-mobility');
  assert.ok(mode);
  assert.equal(registration.rootCap,checked.manifest.nativeActionCap);
  const options={
    ...effectiveOptions(checked.manifest,mode),
    registeredFrameName:VERSION,
    registeredTrials:registration.trialRows,
    registeredCandidateDecks:{'hood-shield-v1':candidate},
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const runner=deps.runner??runDevelopment;
  const runtime=deps.runtime??withSameRuntime;
  const execute=guard=>runtime(()=>
    withHeldHoodToolPriority(()=>
      guard?
        withImmediateFundedHoodOnly(()=>
          withProtectedHoodUnderworld(()=>runner(options))):
        withProtectedHoodUnderworld(()=>runner(options))));
  const baseline=execute(false);
  const treatment=execute(true);
  assert.equal(baseline.result.attempted,16);
  assert.equal(treatment.result.attempted,16);
  const project=root=>({
    action:root.action,card:root.card,attack:root.attack,
    ability:root.ability,power:root.power,playerSlot:root.playerSlot
  });
  const rows=registration.trialRows.map((trial,i)=>{
    const a=baseline.result.rows[i],b=treatment.result.rows[i];
    assert.equal(a.trial.id,trial.id);
    assert.equal(b.trial.id,trial.id);
    const before=rowSummary(a),after=rowSummary(b);
    const traceA=a.rootActionLedger??[],traceB=b.rootActionLedger??[];
    let firstRootDivergence=null;
    for(let j=0;j<Math.max(traceA.length,traceB.length);j++){
      const left=traceA[j]?project(traceA[j]):null;
      const right=traceB[j]?project(traceB[j]):null;
      if(JSON.stringify(left)!==JSON.stringify(right)){
        firstRootDivergence={ordinal:j,left,right};
        break;
      }
    }
    return {
      id:trial.id,seed:trial.seed,candidateSlot:trial.candidateSlot,
      samePhysicalStart:before.fullPhysicalStart!==null&&
        JSON.stringify(before.fullPhysicalStart)===
          JSON.stringify(after.fullPhysicalStart),
      sameSourcePhysicalStart:
        before.originalSourcePhysicalStart!==null&&
        JSON.stringify(before.originalSourcePhysicalStart)===
          JSON.stringify(after.originalSourcePhysicalStart),
      baseline:before,treatment:after,
      baselineError:a.error??null,treatmentError:b.error??null,
      firstRootDivergence
    };
  });
  const total=(arm,key)=>rows.reduce((n,r)=>
    n+r[arm].paidHoodNativeSequence[key],0);
  const count=(arm,predicate)=>rows.filter(r=>predicate(r[arm])).length;
  const nativeWinnerReversal=rows.filter(r=>
    r.baseline.naturalTerminal && r.treatment.naturalTerminal &&
    r.baseline.paidHoodNativeSequence.nativeWinner!==
      r.treatment.paidHoodNativeSequence.nativeWinner).map(r=>r.id);
  const gates={
    originalFullPhysicalDealMatched:rows.every(r=>
      r.samePhysicalStart&&r.sameSourcePhysicalStart),
    thirtyTwoNativeAttempts:
      baseline.result.attempted===16&&treatment.result.attempted===16,
    originalSixtiesUnchanged:
      baseline.audit.originalSixtiesChanged===false&&
      treatment.audit.originalSixtiesChanged===false,
    publicOwnerOnly:
      baseline.audit.privateOpponentRead===false&&
      treatment.audit.privateOpponentRead===false,
    experimentalSwitchRestored:
      process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV!=='true'&&
      process.env.AGENT4_HOOD_TOOL_ROOT_DEV!=='true'
  };
  return {
    schema:VERSION,registration:registration.schema,
    enginePin:registration.enginePin,originalSourceRank:6,
    unchangedCandidate:'hood-shield-v1',nativeRootCap:registration.rootCap,
    registeredIndependentSeeds:8,physicalDealGroups:16,nativeGameAttempts:32,
    baseline:{acceptedHood:total('baseline','acceptedHoodCount'),
      acceptedDoor:total('baseline','acceptedDoorCount'),
      candidateAttacks:total('baseline','candidateAttackCount'),
      sourceAttacks:total('baseline','originalSourceAttackCount'),
      terminals:count('baseline',r=>r.naturalTerminal),
      engineErrors:count('baseline',r=>r.anyNativeError)},
    treatment:{acceptedHood:total('treatment','acceptedHoodCount'),
      acceptedDoor:total('treatment','acceptedDoorCount'),
      candidateAttacks:total('treatment','candidateAttackCount'),
      sourceAttacks:total('treatment','originalSourceAttackCount'),
      terminals:count('treatment',r=>r.naturalTerminal),
      engineErrors:count('treatment',r=>r.anyNativeError)},
    nativeWinnerReversal,
    physicalSameSourceHoodDoorIndependentlyCertified:false,
    officialClockCertified:false,paperQualifiedGames:0,fieldWinRate:null,
    historicalManifestDrift:checked.audit,gates,rows
  };
}

if(require.main===module){
  const output=process.env.AGENT4_FUNDED_HOOD_V4_OUTPUT;
  assert.ok(output,'Specify locked atomic result filename');
  const result=runV4();
  const serialized=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,serialized);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(serialized).digest('hex')+
    '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_FUNDED_HOOD_V4_NATIVE32 '+JSON.stringify({
    gates:result.gates,baseline:result.baseline,treatment:result.treatment,
    nativeWinnerReversal:result.nativeWinnerReversal,
    divergences:result.rows.filter(r=>r.firstRootDivergence).map(r=>({
      id:r.id,first:r.firstRootDivergence,
      baseline:r.baseline.paidHoodNativeSequence,
      treatment:r.treatment.paidHoodNativeSequence
    })),
    errors:result.rows.filter(r=>r.baselineError||r.treatmentError)
      .map(r=>({id:r.id,control:r.baselineError,
        treatment:r.treatmentError})),
    paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,runV4};
