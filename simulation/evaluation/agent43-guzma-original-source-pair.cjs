'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

/** Persist a complete native archive with exclusive lock and atomic rename. */
function save(destination,value){
  const target=path.resolve(destination);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const lock=fs.openSync(target+'.lock','wx');
  const temp=target+'.'+process.pid+'.tmp';
  try{
    const fd=fs.openSync(temp,'wx');
    try{fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);}
    finally{fs.closeSync(fd);}
    fs.renameSync(temp,target);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(lock);
    fs.unlinkSync(target+'.lock');
  }
}

/** Bounded observation from a real source-dealt engine arm. */
function compact(row){
  const bridge=row.actorOnlyDecisionCoverage?.guzmaPromptAudit;
  return {
    id:row.trial.id,status:row.status??(row.finished?'terminal':'cap'),
    sourceFirst:row.sourceActuallyFirst??null,
    sourceDeal:row.sourceDealFingerprint??null,
    fullDeal:row.fullPhysicalDealFingerprint??null,
    actionCount:row.actionCount??null,
    rootDigest:row.rootActionLedgerSha256??null,
    sourceAttacks:row.attackDeclarations?.source??null,
    acceptedGuzma:bridge?.acceptedGuzmaRoots??null,
    matchedPlans:bridge?.matchedMobilityPlans??null,
    ownTargetAccepted:bridge?.ownTargetAcceptances??null,
    ownPhysicalConfirmed:bridge?.ownTargetPhysicalConfirmations??null,
    ownPhysicalMismatches:bridge?.ownTargetPhysicalMismatches??null,
    error:row.error??null,competitiveQualified:false
  };
}

/** Original source-first rank6/rank11 same-seed experiment, both profiles.
 * These historical seeds were selected after inspection.
 */
function execute(){
  const before=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  try{
    const opts={sourceFirstRetrospective:true,actorOnlyComposition:true,
      actorChoosePokemon:true,paperSupporterQuota:true,
      paperSameTargetAttachEnergy:true,nativeAcceptedTargets:true};
    const control=runDevelopment({...opts,actorGuzmaPromptContinuation:false});
    const treatment=runDevelopment({...opts,actorGuzmaPromptContinuation:true});
    assert.equal(control.rows.length,4);
    assert.equal(treatment.rows.length,4);
    const comparisons=control.rows.map((a,i)=>{
      const b=treatment.rows[i];
      assert.equal(a.trial.id,b.trial.id);
      const x=compact(a),y=compact(b);
      const observed=Boolean(x.fullDeal&&y.fullDeal);
      const sameDeal=observed?x.fullDeal===y.fullDeal:null;
      const original=a.rootActionLedger??[],changed=b.rootActionLedger??[];
      let divergentRoot=null;
      for(let j=0;j<Math.max(original.length,changed.length);j++){
        if(JSON.stringify(original[j]??null)!==
           JSON.stringify(changed[j]??null)){divergentRoot=j;break;}
      }
      return {trialId:a.trial.id,observedSameDeal:sameDeal,
        firstDivergentRootIndex:divergentRoot,control:x,treatment:y};
    });
    const report={schema:'agent43-sourcefirst-original-four-pairs-v1',
      registeredAs:'retrospectively selected development; not fresh',
      pinnedEngine:control.enginePin,
      gitSha:process.env.GITHUB_SHA??null,
      baselineRootPolicy:'owner held Guzma mobility opt-in both profiles',
      attemptedArms:8,control,treatment,comparisons,
      competitiveQualifiedGames:0,
      limitation:'Historical seeds and incomplete two-player policy. Engine terminals are developmental.'
    };
    if(process.env.AGENT43_NATIVE_OUTPUT)
      save(process.env.AGENT43_NATIVE_OUTPUT,report);
    process.stdout.write('AGENT43_SOURCE_PAIR '+JSON.stringify({
      schema:report.schema,gitSha:report.gitSha,
      pairs:comparisons.map(x=>({
        id:x.trialId,sameDeal:x.observedSameDeal,
        firstDivergence:x.firstDivergentRootIndex,
        controlStatus:x.control.status,treatmentStatus:x.treatment.status,
        acceptedGuzma:x.treatment.acceptedGuzma,
        ownPhysicalConfirmed:x.treatment.ownPhysicalConfirmed,
        ownPhysicalMismatches:x.treatment.ownPhysicalMismatches
      }))
    })+'\n');
    return report;
  }finally{
    if(before===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=before;
  }
}
if(require.main===module)execute();
module.exports={execute,compact,save};
