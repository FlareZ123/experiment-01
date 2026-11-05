'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const headless=require('../twinleaf/headless.cjs');
const {runAgent45GuzmaHalaRelaxedV9}=
  require('./agent45-issue25-ghala-relaxed-v9.cjs');
const {buildReceipt}=
  require('./agent1-issue25-v4-public-receipt.cjs');
const {withSourceAfterDceThunderVolt,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent5-source-paid-dce-thunder-volt.cjs');
const registration=require('../../results/aichi-2026/registrations/agent5-rank6-post-dce-thunder-volt-v10-20261105.json');

const VERSION='agent5-original-rank6-paid-ghala-dce-thunder-volt-native-v10';
const PREFIX='agent41-bilateral-v2-common-policy-development-';
const IDS=new Map(registration.targetBranches.map(b=>[b.id,b]));

/**
 * Replay original 8 Aichi source trials with the original v9 owner policy.
 * Treatment replaces the original source post-DCE Pass only on two
 * preregistered same-deal exact physical source turns. Six negative arms
 * must stay identical. No new contender, seed or policy budget is selected.
 * @param {{runBaseline?:Function,hook?:Function,headless?:object}} [deps]
 * @returns {object} Complete eight-arm paired native diagnostic.
 */
function run(deps={}){
  const runner=deps.runBaseline??runAgent45GuzmaHalaRelaxedV9;
  const engine=deps.headless??headless;
  const hook=deps.hook??withSourceAfterDceThunderVolt;
  const control=runner();
  const original=engine.runMatch;
  const witnesses=new Map();
  function treatmentMatch(request){
    const trialId=request.label?.startsWith(PREFIX)?
      request.label.slice(PREFIX.length):null;
    if(!IDS.has(trialId))return original(request);
    try{
      const witnessed=hook(()=>original(request),{trialId});
      witnesses.set(trialId,witnessed.audit);
      return witnessed.result;
    }catch(error){
      witnesses.set(trialId,error?.agent5AfterDceThunderVoltAudit??{
        schema:HOOK_VERSION,trialId,status:'hook-or-native-error-before-audit'
      });
      throw error;
    }
  }
  engine.runMatch=treatmentMatch;
  let treatment;
  try{
    treatment=runner();
  }finally{
    assert.strictEqual(engine.runMatch,treatmentMatch);
    engine.runMatch=original;
  }
  const before=buildReceipt(control,{
    policyEntryPoint:control.manifest.policyEntryPoint});
  const after=buildReceipt(treatment,{
    policyEntryPoint:treatment.manifest.policyEntryPoint});
  assert.equal(before.attempts.length,8);
  assert.equal(after.attempts.length,8);
  const byId=new Map(before.attempts.map(row=>[row.id,row]));
  const rows=after.attempts.map(row=>{
    const baseline=byId.get(row.id);
    assert.ok(baseline,'Frozen control attempt missing');
    const registrationTarget=IDS.get(row.id)??null;
    const compare=a=>({ordinal:a.actionOrdinal,turn:a.turnBefore,
      seat:a.playerSlot,action:a.action,card:a.card??null,
      attack:a.attack??null});
    const originalRoots=baseline.publicRootActions.map(compare);
    const treatmentRoots=row.publicRootActions.map(compare);
    const stablePrefix=registrationTarget?
      JSON.stringify(originalRoots.filter(x=>
        x.ordinal<=registrationTarget.sourceDceRootOrdinal))===
      JSON.stringify(treatmentRoots.filter(x=>
        x.ordinal<=registrationTarget.sourceDceRootOrdinal)):null;
    const unchangedAllRoots=!registrationTarget?
      JSON.stringify(originalRoots)===JSON.stringify(treatmentRoots):null;
    const exactInitialDeals=Boolean(
      row.sourceDealFingerprint===baseline.sourceDealFingerprint&&
      row.fullPhysicalDealFingerprint===baseline.fullPhysicalDealFingerprint);
    const baselineMatchesOriginal=registrationTarget?Boolean(
      baseline.sourceDealFingerprint===registrationTarget.sourceInitialPhysicalSha256&&
      baseline.fullPhysicalDealFingerprint===registrationTarget.fullInitialPhysicalSha256&&
      baseline.publicRootLedgerSha256Computed===
        registrationTarget.originalAllAcceptedRootTapeSha256&&
      baseline.publicRootLedgerDigestConsistent===true):null;
    return {
      id:row.id,sourceSeat:row.originalSourceSeat,
      originalDisposition:baseline.status,treatmentDisposition:row.status,
      baselineRootCount:baseline.nativeRootActionCount,
      treatmentRootCount:row.nativeRootActionCount,
      originalSourceAttackCount:
        baseline.actualSourceAttackSettlement?.declarations??null,
      treatmentSourceAttackCount:
        row.actualSourceAttackSettlement?.declarations??null,
      originalSourceAttackSettlement:
        baseline.actualSourceAttackSettlement??null,
      treatmentSourceAttackSettlement:
        row.actualSourceAttackSettlement??null,
      sameOriginalAndCandidateFullPhysicalDeal:exactInitialDeals,
      baselineTargetMatchesFrozenRegistration:baselineMatchesOriginal,
      originalAcceptedPublicRootTapeSha256:
        baseline.publicRootLedgerSha256Computed,
      treatmentAcceptedPublicRootTapeSha256:
        row.publicRootLedgerSha256Computed,
      unchangedSourceAcceptedPrefixThroughDce:stablePrefix,
      fullNonTargetPublicTapeUnchanged:unchangedAllRoots,
      originalAfterDceRoots:registrationTarget?
        originalRoots.filter(x=>x.ordinal>=
          registrationTarget.sourceDceRootOrdinal).slice(0,7):[],
      counterfactualAfterDceRoots:registrationTarget?
        treatmentRoots.filter(x=>x.ordinal>=
          registrationTarget.sourceDceRootOrdinal).slice(0,9):[],
      nativeSourceOwnerLineAudit:witnesses.get(row.id)??null,
      originalCompetitiveGameQualified:false,
      treatmentCompetitiveGameQualified:false
    };
  });
  assert.equal(byId.size,8);
  assert.equal(IDS.size,2);
  assert.equal(witnesses.size,2);
  assert.ok(rows.every(row=>row.sameOriginalAndCandidateFullPhysicalDeal));
  assert.ok(rows.filter(row=>row.unchangedSourceAcceptedPrefixThroughDce!==null)
    .every(row=>row.unchangedSourceAcceptedPrefixThroughDce&&
      row.baselineTargetMatchesFrozenRegistration));
  assert.ok(rows.filter(row=>row.fullNonTargetPublicTapeUnchanged!==null)
    .every(row=>row.fullNonTargetPublicTapeUnchanged));
  return {
    schema:VERSION,registrationPath:
      'results/aichi-2026/registrations/agent5-rank6-post-dce-thunder-volt-v10-20261105.json',
    originalPolicy:'agent45-original-v9-exact-eight-frozen',
    pinnedTwinleaf:registration.pin,
    originalTrials:8,retrospectiveNativeBranchTargets:2,
    originalAndCandidatePrintingsAndRootCapUnchanged:true,
    controlAndTreatmentSourceInitialDealsAllMatched:true,
    sixNonTargetPublicRootTapesIdentical:true,
    twoTargetPreDceAcceptedRootPrefixesIdentical:true,
    rows,competitiveGamesQualified:0,estimatedWinRate:null,
    archives:{control:before,treatment:after}
  };
}

/** @param {string} filename @param {object} data */
function writeLocked(filename,data){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const fd=fs.openSync(filename+'.lock','wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  const shaTmp=tmp+'.sha256';
  try{
    const body=JSON.stringify(data,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,filename);
    const sha=createHash('sha256').update(body).digest('hex');
    fs.writeFileSync(shaTmp,sha+'  '+path.basename(filename)+'\n',{flag:'wx'});
    fs.renameSync(shaTmp,filename+'.sha256');
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(filename+'.lock');
  }
}
if(require.main===module){
  const folder=process.env.AGENT5_THUNDER_VOLT_V10_DIR;
  assert.ok(folder,'Set AGENT5_THUNDER_VOLT_V10_DIR');
  const result=run();
  const originalReceipt=result.archives.control;
  const treatmentReceipt=result.archives.treatment;
  const summary={...result,archives:undefined};
  writeLocked(path.join(folder,'agent5-v10-summary.json'),summary);
  // Preserve already-built complete native receipt objects, not a second
  // execution. This avoids inadvertently changing physical game state.
  writeLocked(path.join(folder,'control-complete.json'),originalReceipt);
  writeLocked(path.join(folder,'treatment-complete.json'),treatmentReceipt);
  process.stdout.write(JSON.stringify({
    schema:VERSION,
    targetAcceptances:result.rows.filter(x=>
      x.nativeSourceOwnerLineAudit?.physicalThunderToStadiumSettlements>0)
      .length,
    sourceAttackRoots:result.rows.reduce((n,x)=>n+
      (x.nativeSourceOwnerLineAudit?.acceptedVoltCycloneAttackRoots??0),0),
    genuineMandatoryMoves:result.rows.reduce((n,x)=>n+
      (x.nativeSourceOwnerLineAudit?.nativeSettledMandatoryEnergyMoves??0),0),
    qualifiedCompetitiveGames:0
  })+'\n');
  // Postgame-only reporting, built from native accepted public Store roots.
  // Emit every registered arm, including errors and capped negatives. This
  // instrument cannot enter an acting player's information set or policy.
  process.stdout.write(JSON.stringify({
    schema:VERSION+'-public-opponent-response-audit-v1',
    source:'actualSourceAttackSettlement and accepted public root actions',
    arms:result.rows.map(row=>({
      id:row.id,sourceSeat:row.sourceSeat,
      disposition:row.treatmentDisposition,
      originalDisposition:row.originalDisposition,
      sameDeal:row.sameOriginalAndCandidateFullPhysicalDeal,
      sourceAttackCount:row.treatmentSourceAttackCount,
      mandatoryDceMoved:row.nativeSourceOwnerLineAudit?.
        nativeSettledMandatoryEnergyMoves??0,
      hookOpponentResponseFlag:row.nativeSourceOwnerLineAudit?.
        opponentResponseObserved??false,
      postgameSourceAttacks:(row.treatmentSourceAttackSettlement?.attacks??[])
        .map(a=>({
          ordinal:a.actionOrdinal,globalTurn:a.turnBefore,
          name:a.attackName,settled:a.settledPromptChain,
          completionOrdinal:a.completionRootOrdinal,
          physicalPrizesBefore:a.prizesBefore,
          physicalPrizesAfter:a.prizesAfter,
          nextOpponentSameEpochProven:a.nextSourceSameEpochProven,
          nextOpponentRoot:a.nextSourceRoot,
          boardBefore:a.publicBoardBefore,
          boardAfter:a.publicBoardAfter
        })),
      observedOriginalNextRoots:row.originalAfterDceRoots,
      observedTreatmentNextRoots:row.counterfactualAfterDceRoots
    })),
    qualifiedCompetitiveGames:0
  })+'\n');
}
module.exports={VERSION,IDS,run,writeLocked};
