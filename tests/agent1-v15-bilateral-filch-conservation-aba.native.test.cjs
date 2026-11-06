'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runAgent1V15FilchAba,VERSION}=
  require('../simulation/evaluation/agent1-v15-bilateral-filch-conservation-aba.cjs');

/** Exclusive file lock and atomic artifact + independent checksum sidecar. */
function archive(report,directory){
  fs.mkdirSync(directory,{recursive:true});
  const file=path.resolve(directory,'agent1-v15-bilateral-filch-aba.json');
  const sidecar=file+'.sha256',lock=file+'.lock';
  const temp=file+'.'+process.pid+'.tmp';
  const sideTemp=sidecar+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
    const digest=createHash('sha256').update(bytes).digest('hex');
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(sideTemp,
      digest+'  '+path.basename(file)+'\n',{flag:'wx'});
    fs.renameSync(sideTemp,sidecar);
    return {file,bytes:bytes.length,sha256:digest};
  }finally{
    for(const p of [temp,sideTemp])if(fs.existsSync(p))fs.unlinkSync(p);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('native identical eight original printed sixties A/B/A: cautious owner Filch',()=>{
  const result=runAgent1V15FilchAba();
  const saved=process.env.AGENT1_V15_FILCH_ABA_DIR?
    archive(result,process.env.AGENT1_V15_FILCH_ABA_DIR):null;
  const {provenance:p}=result;
  const sums=result.recordsByArm.map(a=>({
    arm:a.arm,
    nativeFinished:a.outcomes.filter(x=>
      x.disposition==='native-engine-finished').length,
    nativeCap:a.outcomes.filter(x=>
      x.disposition==='action-limit-censored').length,
    nativeErrors:a.outcomes.filter(x=>
      x.disposition==='engine-error').length,
    outcomes:a.outcomes.map(x=>({
      id:x.id,sourceSeat:x.sourceSeat,disposition:x.disposition,
      roots:x.rootCount,winner:x.winner,
      finalPrizes:x.finalPrizes,
      finalDeckCountsBySeat:x.finalDeckCountsBySeat,
      sourceWinner:x.sourceWinner,
      sourceAttackCount:x.countsBySeat[x.sourceSeat].attack,
      contenderFilch:x.countsBySeat[1-x.sourceSeat].filch,
      contenderPass:x.countsBySeat[1-x.sourceSeat].pass
    }))
  }));
  console.log('AGENT1_V15_FILCH_ORIGINAL_EIGHT_ABA',JSON.stringify({
    schema:VERSION,registeredCount:result.originalRegisteredTrialCount,
    physicalMatched:p.sameAllEightFullPhysicalOpenings,
    sourceMatched:p.sameAllEightOriginalSourceOpenings,
    controlReplay:p.exactEightControlRepeatRootsAndOutcomes,
    everyTreatmentNativeTrialAudited:p.everyTreatmentNativeTrialAudited,
    allReplacementsNativePasses:p.everyReplacementMatchedToNativeAcceptedPass,
    noUnexplainedChanges:p.noUnexplainedTreatmentRootChanges,
    trialGuard:p.treatmentByTrial.map(x=>({
      id:x.id,proposals:x.proposals,
      selectedPasses:x.attemptedFilchToPassReplacements,
      nativeMatchedPasses:x.matchedNativePassRoots,
      commonPrefix:x.sharedControlPrefixRoots,
      diverged:x.hadAnyNativeRootDivergence
    })),
    sourceAndCandidateStatus:sums,archive:saved,
    competitiveGamesQualified:0
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.originalRegisteredTrialCount,8);
  assert.equal(result.recordsByArm.length,3);
  assert.ok(result.recordsByArm.every(a=>a.nativeRows.length===8));
  assert.equal(p.sameAllEightFullPhysicalOpenings,true);
  assert.equal(p.sameAllEightOriginalSourceOpenings,true);
  assert.equal(p.exactEightControlRepeatRootsAndOutcomes,true);
  assert.equal(p.everyTreatmentNativeTrialAudited,true);
  assert.equal(p.everyReplacementMatchedToNativeAcceptedPass,true);
  assert.equal(p.noUnexplainedTreatmentRootChanges,true);
  assert.ok(p.treatmentByTrial.some(x=>
    x.attemptedFilchToPassReplacements>0),
    'The owner policy must change at least one actually executing Filch');
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.winRateEstimate,null);
});
