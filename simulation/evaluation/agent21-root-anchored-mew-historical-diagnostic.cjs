'use strict';

const assert=require('node:assert/strict');
const {
  preflight,PROFILE_BLOB,REGISTRATION_BLOB
}=require('./agent21-single-profile-rank5-canary.cjs');
const {withRootAnchoredFusionMewRetreat,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs');

const VERSION='agent21-historical-fixed-eight-root-anchored-mew-v2-native-diagnostic';

/**
 * Input-free diagnostic on historical known seed cells only, both candidates.
 * No newly sampled cohort and no matchup/win-rate inference is allowed.
 *
 * @param {{runDevelopment?:Function,hook?:Function,native?:boolean}} [deps]
 * @returns {object} Full original native rows, failures and hook receipts.
 */
function replay(deps={}) {
  const {profile,trials}=preflight({pinNative:deps.native!==false});
  assert.equal(trials.length,8);
  const run=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const hook=deps.hook??withRootAnchoredFusionMewRetreat;
  const {result,audit}=hook(()=>run({
    ...profile.selectedPolicyOptions,
    registeredTrials:trials,
    registeredFrameName:VERSION,
    allowAdditionalOriginalSourceRanks:
      profile.allowAdditionalOriginalSourceRanks
  }));
  assert.equal(result.attempted,8);
  assert.equal(result.rows.length,8);
  assert.deepEqual(result.rows.map(row=>row.trial.id),
    trials.map(t=>t.id));
  const summary=result.rows.map(row=>({
    trialId:row.trial.id,
    sourceSeat:row.sourceSeat,
    sourceDeal:row.sourceDealFingerprint,
    sourceAttacks:row.attackDeclarations?.source??null,
    nativeTerminal:row.finished===true,
    actionCap:row.finished===false,
    turn:row.turns??null,
    competitivelyQualified:false
  }));
  return {
    schema:VERSION,
    experimentalHookVersion:HOOK_VERSION,
    priorRegisteredProfileBlob:PROFILE_BLOB,
    priorRegisteredTrialBlob:REGISTRATION_BLOB,
    pinnedVendorRevision:profile.pinnedVendorRevision,
    originalSourceRank:5,trialCount:8,
    historicalKnownSourceSeeds:true,
    independentlyProspective:false,
    newPolicyReleaseSelected:false,
    liveRootActionLedgerJoinVerified:false,
    hookAudit:audit,
    summary,
    rawNativeRows:result.rows,
    competitivelyQualifiedGames:0,
    officialPaperClockVerified:false,
    paperEffectVerified:false,
    caveat:'Opt-in old-seed diagnostic of source root anchoring and exact DCE paid Retreat. Never an independent matchup strength sample.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(replay(),null,2)+'\n');
}
module.exports={VERSION,replay};
