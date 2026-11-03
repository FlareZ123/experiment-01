'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash,assertExternallyPinnedSelectedProfile}=
  require('./agent36-profile-provenance-gate.cjs');
const frozen=require('./agent41-frozen-bilateral-development-v1.cjs');
const {PROFILE_BLOB,REGISTRATION_BLOB}=
  require('./agent21-single-profile-rank5-canary.cjs');
const {withRootAnchoredFusionMewRetreat,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs');
const {reconcileBotPassToStoreRetreat}=
  require('./agent21-root-alias-action-join.cjs');

const ROOT=path.resolve(__dirname,'../..');
const PROFILE_PATH=
  'simulation/evaluation/agent21-selected-rank5-canary-profile-20261102.json';
const VERSION='agent21-changed-code-known-eight-root-anchored-mew-v2-diagnostic';

/**
 * Verify immutable historical deck/seed/profile evidence while explicitly
 * separating CURRENT executable research code from that historical profile.
 * A historical selected-policy preflight rightly rejects code drift. This
 * separate changed-code experiment cannot assert frozen release identity.
 *
 * @param {boolean} [pinNative]
 * @returns {{profile:object,trials:object[],codeProvenance:object}}
 */
function diagnosticPreflight(pinNative=true) {
  const profile=JSON.parse(fs.readFileSync(path.join(ROOT,PROFILE_PATH),'utf8'));
  assertExternallyPinnedSelectedProfile(ROOT,PROFILE_PATH,profile,PROFILE_BLOB);
  frozen.assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  const regBytes=fs.readFileSync(path.join(ROOT,profile.registeredFile));
  assert.equal(gitBlobHash(regBytes),REGISTRATION_BLOB,
    'Original registration changed');
  assert.equal(profile.registrationGitBlobSha,REGISTRATION_BLOB);
  const registration=JSON.parse(regBytes.toString('utf8'));
  assert.equal(registration.sourceRank,5);
  assert.equal(registration.sourcePrinted60Sha256,profile.sourcePrinted60Sha256);
  const anchored={
    [profile.originalRoster]:profile.originalRosterGitBlobSha,
    [profile.sourceAdmissionLedger]:profile.originalAdmissionLedgerGitBlobSha,
    [profile.candidatePrinted60Evidence.newMoonProxyPath]:
      profile.candidatePrinted60Evidence.newMoonProxyGitBlobSha,
    [profile.candidatePrinted60Evidence.newMoonOriginalJapanesePrintPath]:
      profile.candidatePrinted60Evidence.newMoonOriginalJapaneseGitBlobSha
  };
  for(const [file,expected] of Object.entries(anchored)){
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,file))),expected,
      'Physical roster or printed candidate evidence drift: '+file);
  }
  const codeProvenance=Object.entries(profile.selectedCodeGitBlobShas)
    .map(([file,historicalBlob])=>{
      const actualBlob=gitBlobHash(fs.readFileSync(path.join(ROOT,file)));
      return {file,historicalBlob,actualBlob,
        matchesHistorical:actualBlob===historicalBlob};
    });
  const trials=registration.registeredGroups.flatMap(group=>
    registration.candidateIds.map(candidateId=>({
      ...group,candidateId,
      id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')
    })));
  assert.equal(trials.length,8);
  assert.equal(new Set(registration.registeredGroups.map(g=>g.seed)).size,4);
  if(pinNative)frozen.assertPinnedNativeStore(ROOT,profile);
  return {profile,trials,codeProvenance:{
    changedCodeCells:codeProvenance.filter(r=>!r.matchesHistorical),
    allHistoricalCodeHashes:codeProvenance,
    historicalSelectedProfileUsedAsActualCodePin:false,
    changedExecutableCodeAcknowledged:true
  }};
}

/**
 * Retrospective changed-code source diagnostic with every attempted row.
 * @param {{runDevelopment?:Function,hook?:Function,native?:boolean}} [deps]
 * @returns {object}
 */
function replay(deps={}) {
  const {profile,trials,codeProvenance}=
    diagnosticPreflight(deps.native!==false);
  const run=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const hook=deps.hook??withRootAnchoredFusionMewRetreat;
  let result=null,audit=null,batchError=null;
  try {
    const wrapped=hook(()=>run({
      ...profile.selectedPolicyOptions,
      registeredTrials:trials,
      registeredFrameName:VERSION,
      allowAdditionalOriginalSourceRanks:
        profile.allowAdditionalOriginalSourceRanks
    }));
    result=wrapped.result;
    audit=wrapped.audit;
    assert.equal(result.attempted,8);
    assert.equal(result.rows.length,8);
    assert.deepEqual(result.rows.map(row=>row.trial.id),
      trials.map(t=>t.id));
  }catch(error){
    batchError=String(error?.stack??error);
    audit=error?.agent21RootAnchoredAudit??audit;
    result=null;
  }
  const summary=trials.map((trial,i)=>{
    const row=result?.rows?.[i]??null;
    return {
      trialId:trial.id,
      sourceSeat:row?.sourceSeat??null,
      sourceDeal:row?.sourceDealFingerprint??null,
      sourceAttacks:row?.attackDeclarations?.source??null,
      status:batchError?'BATCH_ABORT_UNEXECUTED_OR_UNKNOWN':
        row?.status??'NATIVE_DISPOSITION_UNVERIFIED',
      nativeTerminal:row?.finished===true,
      actionCap:row?.finished===false,
      turn:row?.turns??null,
      competitivelyQualified:false
    };
  });
  const botPassToStoreRetreatJoin=
    reconcileBotPassToStoreRetreat(result?.rows??[],audit);
  return {
    schema:VERSION,
    experimentalHookVersion:HOOK_VERSION,
    botPassToStoreRetreatJoin,
    priorRegisteredProfileBlob:PROFILE_BLOB,
    priorRegisteredTrialBlob:REGISTRATION_BLOB,
    pinnedVendorRevision:profile.pinnedVendorRevision,
    originalSourceRank:5,trialCount:8,
    codeProvenance,
    historicalKnownSourceSeeds:true,
    independentlyProspective:false,
    historicalSelectedCodeUsed:false,
    newPolicyReleaseSelected:false,
    selectedRootObjectAliasKnown:true,
    liveRootActionLedgerJoinVerified:false,
    batchError,
    hookAudit:audit,
    summary,
    rawNativeRows:result?.rows??[],
    competitivelyQualifiedGames:0,
    officialPaperClockVerified:false,
    paperEffectVerified:false,
    caveat:'Historical source seeds with CURRENT explicit code-drift profile. Root ledger pre-dispatch Pass may conceal Store-dispatched Retreat. This is a changed-code retrospective diagnostic, never prospective or comparable to frozen historic win rates.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(replay(),null,2)+'\n');
}
module.exports={VERSION,diagnosticPreflight,replay};
