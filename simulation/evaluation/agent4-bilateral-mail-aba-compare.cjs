'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const VERSION='agent4-bilateral-mail-native-original-eight-ABA-v2-public-choice-tape';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/**
 * Failure-inclusive physical-deal and control-tape comparison for eight arms.
 * @param {object} a Original selected-v5 precontrol
 * @param {object} b Both-seat Mail treatment
 * @param {object} c Same selected-v5 postcontrol
 * @param {object} audit Real native Store and physical prompt audit
 * @param {object} reg Prospective frozen eight-arm registration
 */
function compare(a,b,c,audit,reg){
  const map=result=>{
    const rows=result?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===8);
    return new Map(rows.map(r=>[r.trial?.id??r.id,r]));
  };
  const A=map(a),B=map(b),C=map(c);
  const panel=reg.seededOriginalTrialIds.map(id=>{
    const before=A.get(id),treated=B.get(id),after=C.get(id);
    assert.ok(before&&treated&&after,'Missing original arm');
    const roots=r=>r.rootActionLedger??
      r.nativeAbortEvidence?.rootActionLedger??[];
    const x=roots(before),y=roots(treated),z=roots(after);
    const different=x.findIndex((v,i)=>JSON.stringify(v)!==JSON.stringify(y[i]));
    const divergence=different>=0?different:
      x.length===y.length?null:Math.min(x.length,y.length);
    const sourceSeat=id.split(':')[2]==='A'?1:0;
    const publicRoot=row=>({
      ordinal:row.actionOrdinal??null,turn:row.turnBefore??null,
      seat:row.playerSlot??null,action:row.action??null,
      card:row.card??null,attack:row.attack??null,
      pendingPrompt:row.pendingPrompt??null
    });
    const changeAudit=divergence===null?null:{
      onlyPublicNativeActions:true,
      treatedPublicRootTape:y.map(publicRoot),
      baselinePublicRootTape:x.map(publicRoot),
      treatedSourceRoots:y.filter(r=>r.playerSlot===sourceSeat)
        .map(publicRoot),
      treatedCandidateRoots:y.filter(r=>r.playerSlot===1-sourceSeat)
        .map(publicRoot)
    };
    return {id,sourceSeat,changeAudit,fullOpeningParity:
        before.fullPhysicalDealFingerprint===treated.fullPhysicalDealFingerprint&&
        before.fullPhysicalDealFingerprint===after.fullPhysicalDealFingerprint,
      sourceOpeningParity:
        before.sourceDealFingerprint===treated.sourceDealFingerprint&&
        before.sourceDealFingerprint===after.sourceDealFingerprint,
      ARepeatRootTapeParity:sha(x)===sha(z),
      originalRootSha256:sha(x),treatedRootSha256:sha(y),
      repeatedRootSha256:sha(z),
      firstTreatedRootDivergence:divergence,
      originalDisposition:before.status??null,
      treatmentDisposition:treated.status??null,
      repeatedDisposition:after.status??null,
      originalRoots:x.length,treatedRoots:y.length,repeatedRoots:z.length};
  });
  return {schema:VERSION,trialIds:reg.seededOriginalTrialIds,
    policy:reg.selectedPolicy,pinnedTwinleaf:reg.pinnedTwinleaf,
    nativeObservedTwinleaf:a?.manifest?.observedTwinleafGitCommit??null,
    nativeGitRevision:process.env.GITHUB_SHA??null,
    sameAllPhysicalOpenings:panel.every(r=>r.fullOpeningParity&&r.sourceOpeningParity),
    ARepeatFullyDeterministic:panel.every(r=>r.ARepeatRootTapeParity),
    originalEight:panel.length,panel,bilateralMailAudit:audit,
    completePaperGames:0,qualifiedCompetitiveGames:0,winRate:null};
}
module.exports={VERSION,compare};
