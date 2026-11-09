'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {manifestWithDriftAudit} =
  require('../agent4-v3-two-unknown-power-readout.cjs');
const {withSameRuntime,effectiveOptions} =
  require('../agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment} =
  require('../agent41-bilateral-v2-development.cjs');
const {rowSummary} =
  require('./agent4-hood-owner-rank6-prospective-32.cjs');
const {
  withHeldHoodToolPriority,withProtectedHoodUnderworld
} = require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');
const {writeAtomicLocked} =
  require('../agent20-frozen-rank6-canary-v1.cjs');
const registration = require('../../../results/aichi-2026/registrations/agent4-hood-arven-search-original-rank6-v3-20261109.json');
const HOOD = require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');

const VERSION = 'agent4-original-rank6-held-hood-plus-arven-native-v3';
const candidateSeat = trial => trial.candidateSlot === 'A' ? 0 : 1;

/**
 * Build an independent new-seed original-rank6 comparison. Both arms retain
 * the v2 physically held-Hood and protected-Underworld adapters. The only
 * v3 treatment switch is the already implemented native Arven-to-Hood
 * owner-root and owner-deck-prompt policy. Never inspect hidden source zones.
 *
 * @param {{registration?:object,runner?:Function,manifest?:Function,runtime?:Function}} [deps]
 * @returns {object}
 */
function runArvenPhase(deps={}) {
  const reg = deps.registration ?? registration;
  assert.equal(reg.schema,
    'agent4-hood-physical-v3-native-arven-search-before-evaluation');
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.candidateRosterGitBlob,
    '24ace2d6feb9ce5d9056bcf271827cfe31b7357b');
  assert.equal(reg.trialRows.length,16);
  assert.equal(new Set(reg.independentSeedDraws).size,8);
  assert.equal(HOOD.cards.reduce((n,c)=>n+c.count,0),60);
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const mode=checked.manifest.modes.find(m=>
    m.id==='selected-v3-paper-plus-funded-mobility');
  assert.ok(mode);
  assert.equal(reg.nativeRootCap,checked.manifest.nativeActionCap);
  const options={
    ...effectiveOptions(checked.manifest,mode),
    registeredFrameName:VERSION,
    registeredTrials:reg.trialRows,
    registeredCandidateDecks:{'hood-shield-v1':HOOD},
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const runner=deps.runner??runDevelopment;
  const withRuntime=deps.runtime??withSameRuntime;
  /** @param {boolean} enableArven */
  const execute=enableArven=>withRuntime(()=>
    withHeldHoodToolPriority(()=>
      withProtectedHoodUnderworld(()=>
        runner({...options,actorArvenHoodSearchRoot:enableArven}))));
  const control=execute(false);
  const treatment=execute(true);
  assert.equal(control.result.attempted,16);
  assert.equal(treatment.result.attempted,16);
  const project=root=>({
    action:root.action,card:root.card,attack:root.attack,
    ability:root.ability,power:root.power,playerSlot:root.playerSlot
  });
  const rows=reg.trialRows.map((trial,i)=>{
    const a=control.result.rows[i],b=treatment.result.rows[i];
    assert.equal(a.trial?.id,trial.id);
    assert.equal(b.trial?.id,trial.id);
    const base=rowSummary(a),changed=rowSummary(b);
    const seat=candidateSeat(trial);
    const countArven=game=>(game.rootActionLedger??[]).filter(root=>
      root.playerSlot===seat&&root.action==='PlayCardAction'&&
      typeof root.card==='string'&&root.card.startsWith('Arven')).length;
    let firstAcceptedRootDifference=null;
    const rootsA=a.rootActionLedger??[],rootsB=b.rootActionLedger??[];
    for(let j=0;j<Math.max(rootsA.length,rootsB.length);j++){
      const left=rootsA[j]?project(rootsA[j]):null;
      const right=rootsB[j]?project(rootsB[j]):null;
      if(JSON.stringify(left)!==JSON.stringify(right)){
        firstAcceptedRootDifference={index:j,left,right};
        break;
      }
    }
    return {
      id:trial.id,seed:trial.seed,candidateSlot:trial.candidateSlot,
      sameFullPhysicalStart:base.fullPhysicalStart!==null&&
        JSON.stringify(base.fullPhysicalStart)===
          JSON.stringify(changed.fullPhysicalStart),
      sameOriginalSourcePhysicalStart:
        base.originalSourcePhysicalStart!==null&&
        JSON.stringify(base.originalSourcePhysicalStart)===
          JSON.stringify(changed.originalSourcePhysicalStart),
      acceptedOwnerArvenControl:countArven(a),
      acceptedOwnerArvenTreatment:countArven(b),
      baselineNativeError:a.error??null,
      treatmentNativeError:b.error??null,
      treatmentNativeStoreCauseStack:b.nativeStoreCauseStack??null,
      baseline:base,treatment:changed,
      firstAcceptedRootDifference
    };
  });
  const gates={
    thirtyTwoNativeAttempts:
      control.result.attempted===16&&treatment.result.attempted===16,
    originalSixtiesAndNativePinUnchanged:
      reg.sourceAndCandidateUnchanged===true&&
      control.audit.originalSixtiesChanged===false&&
      treatment.audit.originalSixtiesChanged===false,
    physicallyMatchedOriginalStarts:
      rows.every(r=>r.sameFullPhysicalStart&&r.sameOriginalSourcePhysicalStart),
    bothArmsOwnerPublicPolicy:
      control.audit.privateOpponentRead===false&&
      treatment.audit.privateOpponentRead===false
  };
  return {
    schema:VERSION,registration:reg.schema,
    enginePin:reg.enginePin,originalSourceRank:6,
    candidateId:'hood-shield-v1',nativeRootCap:reg.nativeRootCap,
    independentSeedCount:8,physicalStartPairs:16,nativeAttempts:32,
    controlOptions:{heldHood:true,protectedDoor:true,arvenHood:false},
    treatmentOptions:{heldHood:true,protectedDoor:true,arvenHood:true},
    actualNativeOwnerArvenControl:rows.reduce((n,r)=>n+r.acceptedOwnerArvenControl,0),
    actualNativeOwnerArvenTreatment:rows.reduce((n,r)=>n+r.acceptedOwnerArvenTreatment,0),
    actualNativeHoodControl:rows.reduce((n,r)=>
      n+r.baseline.actualHoodToolNativeActionRoots,0),
    actualNativeHoodTreatment:rows.reduce((n,r)=>
      n+r.treatment.actualHoodToolNativeActionRoots,0),
    actualNativeDoorControl:rows.reduce((n,r)=>
      n+r.baseline.paidHoodNativeSequence.acceptedDoorCount,0),
    actualNativeDoorTreatment:rows.reduce((n,r)=>
      n+r.treatment.paidHoodNativeSequence.acceptedDoorCount,0),
    controlTerminalCount:rows.filter(r=>r.baseline.naturalTerminal).length,
    treatmentTerminalCount:rows.filter(r=>r.treatment.naturalTerminal).length,
    controlEngineErrors:rows.filter(r=>r.baseline.anyNativeError).length,
    treatmentEngineErrors:rows.filter(r=>r.treatment.anyNativeError).length,
    physicalOwnerSequenceOnly:true,
    physicalSameSourceHoodDoorCertified:false,
    paidArvenToolRetrievalIndependentlyCertified:false,
    paperQualifiedGames:0,fieldWinRate:null,
    historicalManifestDrift:checked.audit,
    gates,rows
  };
}

if(require.main===module){
  const output=process.env.AGENT4_ARVEN_V3_OUTPUT;
  assert.ok(output,'Specify locked atomic result filename');
  const result=runArvenPhase();
  const contents=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,contents);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(contents).digest('hex')+
    '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_HOOD_ARVEN_V3_NATIVE32 '+JSON.stringify({
    gates:result.gates,
    nativeArven:[result.actualNativeOwnerArvenControl,
      result.actualNativeOwnerArvenTreatment],
    hood:[result.actualNativeHoodControl,result.actualNativeHoodTreatment],
    door:[result.actualNativeDoorControl,result.actualNativeDoorTreatment],
    terminals:[result.controlTerminalCount,result.treatmentTerminalCount],
    errors:[result.controlEngineErrors,result.treatmentEngineErrors],
    errorRows:result.rows.filter(r=>r.treatmentNativeError).map(r=>({
      id:r.id,
      error:r.treatmentNativeError,
      nativeStoreCauseStack:r.treatmentNativeStoreCauseStack
    })),
    firstDifferences:result.rows.filter(r=>r.firstAcceptedRootDifference)
      .map(r=>({id:r.id,first:r.firstAcceptedRootDifference})),
    paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,runArvenPhase};
