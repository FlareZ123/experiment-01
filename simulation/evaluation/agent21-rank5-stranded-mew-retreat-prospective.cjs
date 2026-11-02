'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  preflight:preflightSelected,
  PROFILE_BLOB
} = require('./agent21-single-profile-rank5-canary.cjs');
const {gitBlobHash} =
  require('./agent36-profile-provenance-gate.cjs');
const {VERSION:HOOK_VERSION,withStrandedFusionMewPassRetreat} =
  require('../twinleaf/agent21-owner-stranded-mew-native-pass-retreat.cjs');

const ROOT = path.resolve(__dirname,'../..');
const VERSION = 'agent21-rank5-new-seed-control-vs-owner-paid-mew-retreat-v1';
const REGISTRATION =
  'results/aichi-2026/registrations/agent21-rank5-stranded-mew-retreat-fork-20261102.json';
const REGISTRATION_BLOB = '0d94e6c94296ab367e3780cc512cf99024af3aac';

/**
 * Externally preregistered seeds and unchanged selected baseline policy.
 * Full dynamic Store code closure remains unverified and is release-blocking.
 *
 * @param {{native:boolean}} [params]
 * @returns {object}
 */
function preflight({native=true}={}) {
  const base = preflightSelected({pinNative:native});
  const regBytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(regBytes),REGISTRATION_BLOB,
    'Prospective physical fork registration drifted after preregistration');
  const reg=JSON.parse(regBytes.toString('utf8'));
  assert.equal(reg.status,'PRE_REGISTERED_NEW_SEEDS_BEFORE_ANY_NATIVE_FORK_OUTCOME');
  assert.equal(reg.sourcePrinted60Sha256,base.profile.sourcePrinted60Sha256);
  assert.equal(reg.candidatePrintedProxyGitBlobSha,
    base.profile.candidatePrinted60Evidence.newMoonProxyGitBlobSha);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual(reg.treatmentModes,
    ['frozen-selected-policy-control',
      'frozen-selected-policy-plus-owner-pass-to-paid-retreat']);
  assert.equal(reg.groups.length,4);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,4);
  assert.deepEqual(reg.groups.map(x=>x.candidateSlot),['A','B','A','B']);
  assert.equal(reg.plannedNativeArms,16);
  assert.equal(HOOK_VERSION,
    'agent21-symmetric-owner-pass-to-paid-fusion-retreat-v1');
  const trials=reg.groups.flatMap(group=>reg.candidateIds.map(id=>({
    ...group,candidateId:id,
    id:[group.rank,group.repeat,group.candidateSlot,id].join(':')
  })));
  assert.equal(trials.length,8);
  return {profile:base.profile,registration:reg,trials};
}

/**
 * Retain ALL native attempted rows from both controls and treatments,
 * including caps, native errors and missing results.
 * @param {{runDevelopment?:Function,hook?:Function,native?:boolean}} [deps]
 * @returns {object}
 */
function runProspective(deps={}) {
  const {profile,registration,trials}=preflight({native:deps.native!==false});
  const runner=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const hook=deps.hook??withStrandedFusionMewPassRetreat;
  assert.equal(typeof runner,'function');
  assert.equal(typeof hook,'function');
  const modes=[];
  for(const mode of registration.treatmentModes){
    const usingHook=mode.endsWith('plus-owner-pass-to-paid-retreat');
    const run=()=>runner({
      ...profile.selectedPolicyOptions,
      registeredTrials:trials,
      registeredFrameName:VERSION+':'+mode,
      allowAdditionalOriginalSourceRanks:profile.allowAdditionalOriginalSourceRanks
    });
    let result=null,hookAudit=null,error=null;
    try {
      if(usingHook) {
        const wrapped=hook(run);
        result=wrapped.result;
        hookAudit=wrapped.audit;
      }else result=run();
      assert.equal(result?.attempted,trials.length);
      assert.equal(result.rows.length,trials.length);
      assert.deepEqual(result.rows.map(x=>x.trial.id),
        trials.map(x=>x.id),'Actual trial identity must match preregistration');
    }catch(e){
      error=String(e?.stack??e);
      result=null;
    }
    const attempts=trials.map((trial,i)=>{
      const row=result?.rows?.[i]??null;
      return {
        trial,
        sourceSeat:trial.candidateSlot==='A'?1:0,
        status:row?.status??(row?.finished===true?'NATIVE_TERMINAL_UNQUALIFIED':
          row?.finished===false?'CENSORED_OR_UNFINISHED':
            'BATCH_ABORT_OR_MISSING'),
        originalSourceDealFingerprint:row?.sourceDealFingerprint??null,
        sourceActuallyFirst:row?.sourceActuallyFirst??null,
        nativeFirstTurnVerified:row?.verifiedFirstTurn===true,
        sourceAttackDeclarations:row?.attackDeclarations?.source??null,
        nativeSourceAttackSettlement:row?.sourceAttackSettlement??null,
        candidateOwnerReplies:row?.candidateRepliesAfterSourceAttacks??null,
        nativeTurnCount:row?.turns??null,
        nativeActionCount:row?.actionCount??null,
        paperQualified:false,
        rawNativeRow:row
      };
    });
    modes.push({mode,usingHook,
      error,hookAudit,attempted:trials.length,
      returnedRows:result?.rows?.length??0,
      sourceAttacksDeclared:attempts.reduce((n,x)=>
        n+(x.sourceAttackDeclarations??0),0),
      nativeTerminalCount:attempts.filter(a=>
        a.rawNativeRow?.finished===true).length,
      actionCapCount:attempts.filter(a=>
        a.rawNativeRow?.finished===false).length,
      attempts});
  }
  const [control,treatment]=modes;
  const pairing=trials.map((trial,i)=>{
    const before=control.attempts[i].originalSourceDealFingerprint;
    const after=treatment.attempts[i].originalSourceDealFingerprint;
    return {trialId:trial.id,seed:trial.seed,
      originalSourceDealControl:before,
      originalSourceDealTreatment:after,
      exactPhysicalSourceDealMatched:!!(before&&after&&before===after),
      causalMatchedComparisonEligible:!!(before&&after&&before===after&&
        control.attempts[i].rawNativeRow&&treatment.attempts[i].rawNativeRow),
      paperQualified:false};
  });
  return {
    schema:VERSION,generatedFromRegistrationGitBlobSha:REGISTRATION_BLOB,
    originalSelectedBaselineProfileGitBlobSha:PROFILE_BLOB,
    sourceRank:5,sourcePrinted60Sha256:profile.sourcePrinted60Sha256,
    vendorPinnedRevision:profile.pinnedVendorRevision,
    newRandomSeedsRegisteredBeforeWork:true,
    eachModeUsesSameUnchangedCandidatePrinted60:true,
    registeredNativeArms:registration.plannedNativeArms,
    executedNativeArms:modes.reduce((n,m)=>n+m.returnedRows,0),
    hookVersion:HOOK_VERSION,modes,
    physicalPairing:pairing,
    exactPhysicalSourceDealMatchedCount:pairing.filter(x=>
      x.exactPhysicalSourceDealMatched).length,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    causalWinRateVerified:false,
    paperFullChainVerified:false,paperMatchClockVerified:false,
    opponentContinuationsCompetentVerified:false,
    caveat:'A native developmental policy fork, not a paper-legal game-strength trial. Real source physical deal must match within each candidate pair before attributing a difference to the action.'
  };
}
if(require.main===module){
  const x=process.argv.includes('--inspect-only') ?
    {schema:VERSION,...preflight({native:false}),
      executedNativeArms:0,competitiveQualifiedGames:0} :
    runProspective();
  process.stdout.write(JSON.stringify(x,null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,REGISTRATION_BLOB,
  preflight,runProspective};
