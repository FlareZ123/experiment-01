'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent41-rank10-native-tool-original-source-panel-v1';
const PLAN='results/aichi-2026/registrations/agent41-rank10-native-tool-source-20261031.json';
const PLAN_SHA='bf46ca95a5a43937e1558a526d730ff44f86ff15';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Fetch and pin a precommitted original native source game plan. */
function plan(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',PLAN));
  const sha=createHash('sha1')
    .update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(sha,PLAN_SHA,'Original source Tool experiment plan changed');
  const p=JSON.parse(bytes.toString('utf8'));
  assert.equal(p.schema,
    'agent41-rank10-native-tool-source-selected-vs-control-20261031-v1');
  assert.equal(p.sourceRank,10);
  assert.equal(p.enginePin,ENGINE_PIN);
  assert.equal(p.sourceSeed,4246551499);
  assert.equal(p.candidateSlot,'A');
  assert.deepStrictEqual(p.modes,['control','selected']);
  assert.equal(p.trials.length,2);
  assert.deepStrictEqual(p.trials.map(t=>t.candidateId).sort(),
    ['champion-reference','new-moon-lockbreaker-v1'].sort());
  assert.ok(p.trials.every(t=>t.rank===10&&t.seed===p.sourceSeed&&
    t.candidateSlot==='A'&&t.repeat===0));
  return p;
}

/**
 * Run original native A/B game histories under unchanged two-seat actor policy.
 * Selected mode only enables the bounded typed native Tool root, not any
 * candidate deck, source sixty, score or source decision override.
 */
function runMode(mode,registration){
  assert.ok(mode==='control'||mode==='selected');
  const saved=process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV;
  if(mode==='selected')process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV='true';
  else delete process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV;
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const native=runDevelopment({
      actorOnlyComposition:true,
      mandatoryOptionFallback:true,
      paperSupporterQuota:true,
      nativePressureWindows:true,
      nativeAcceptedTargets:true,
      sameRootProposalChoice:true,
      sameRootChoiceApply:mode==='selected',
      sameRootProbeAll:false,
      registeredTrials:registration.trials,
      registeredFrameName:PLAN,
      allowAdditionalOriginalSourceRanks:true
    });
    assert.equal(native.attempted,2);
    assert.equal(native.competitiveQualifiedGames,0);
    const rows=native.rows.map(row=>{
      const audit=row.actorOnlyDecisionCoverage
        ?.detailedComponentAudits?.root??null;
      const sameRoot=audit?.sameRootProposalChoice??null;
      const allAccepted=audit?.nativeRootAcceptances??[];
      const tools=allAccepted.filter(e=>
        e.kind==='attach-tool-candidate');
      return {
        id:row.trial.id,
        status:row.status??(row.finished?'engine-terminal':'censored'),
        error:row.error??null,
        nativeAbortEvidence:row.nativeAbortEvidence??null,
        sourceSeat:row.sourceSeat??null,
        sourceDealFingerprint:row.sourceDealFingerprint??null,
        physicalFullDealFingerprint:row.fullPhysicalDealFingerprint??null,
        nativeRootActionsSha256:row.rootActionLedgerSha256??null,
        rootActions:row.rootActionCount??null,
        ownerRoots:audit?.selectedRootDecisions??null,
        ownerToolOptIn:audit?.nativeToolAttachRootOptIn??null,
        sameRootProposedChanges:sameRoot?.changedRoots??null,
        ownerToolChangedSamples:(sameRoot?.changedSamples??[]).filter(s=>
          s.selectedSource==='owner-tool'),
        originalNativeStoreAcceptedToolActions:tools.map(event=>({
          globalTurn:event.globalTurn,seat:event.seat,
          policyDecisionOrdinal:event.policyDecisionOrdinal,
          intent:event.intent,
          accepted:event.accepted,
          nativePhysicalEffect:event.nativePhysicalEffect,
          publicZonesChanged:event.publicZonesChanged,
          turnOrPhaseChanged:event.turnOrPhaseChanged,
          before:event.before,after:event.after
        })),
        qualified:false
      };
    });
    return {mode,rows,raw:native};
  }finally{
    if(saved===undefined)delete process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV;
    else process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV=saved;
  }
}

/** Preserve every original native error/censor and first counterfactual action. */
function runPanel(){
  const registration=plan();
  const control=runMode('control',registration);
  const selected=runMode('selected',registration);
  const paired=registration.trials.map(t=>{
    const a=control.rows.find(x=>x.id===t.id);
    const b=selected.rows.find(x=>x.id===t.id);
    assert.ok(a&&b);
    return {id:t.id,sourceDealMatch:a.sourceDealFingerprint!==null&&
      a.sourceDealFingerprint===b.sourceDealFingerprint,
      physicalFullDealMatch:a.physicalFullDealFingerprint!==null&&
      a.physicalFullDealFingerprint===b.physicalFullDealFingerprint,
      controlStatus:a.status,selectedStatus:b.status,
      controlNativeSourceActions:a.nativeRootActionsSha256,
      selectedNativeSourceActions:b.nativeRootActionsSha256,
      changedNativeActionLedger:
        a.nativeRootActionsSha256!==b.nativeRootActionsSha256,
      selectedNativeToolAccepted:b.originalNativeStoreAcceptedToolActions
        .filter(x=>x.accepted===true).length,
      bothArmsFailureInclusive:true};
  });
  return {version:VERSION,registrationSha:PLAN_SHA,
    sourceRank:registration.sourceRank,sourceSeed:registration.sourceSeed,
    enginePin:ENGINE_PIN,paired,control,selected,
    competitiveQualifiedGames:0,
    caveat:'Development original source rank10 only; opt-in Tool action scoring may be strategically inferior. Store-accepted tool does not establish a game win or calibrated opponent response.'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runPanel(),null,2)+'\n');

module.exports={VERSION,PLAN_SHA,plan,runMode,runPanel};
