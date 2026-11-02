'use strict';

const assert=require('node:assert/strict');
const {
  preflight,PROFILE_BLOB,REGISTRATION_BLOB
}=require('./agent21-single-profile-rank5-canary.cjs');
const {withStrandedFusionMewPassRetreat,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent21-owner-stranded-mew-native-pass-retreat.cjs');

const VERSION='agent21-historical-fixed-8-source-mew-retreat-native-replay-v1';

/**
 * Diagnostic treatment-only replay of the eight *already known* archive
 * seeds. Deliberately excluded from independent outcome estimation. Compare
 * only exact physical source-deal fingerprints and preexisting root evidence.
 *
 * @param {{runDevelopment?:Function,hook?:Function,native?:boolean}} [deps]
 * @returns {object}
 */
function replay(deps={}){
  const {profile,trials}=preflight({pinNative:deps.native!==false});
  assert.equal(trials.length,8);
  const runner=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const hook=deps.hook??withStrandedFusionMewPassRetreat;
  const {result,audit}=hook(()=>runner({
    ...profile.selectedPolicyOptions,
    registeredTrials:trials,
    registeredFrameName:VERSION,
    allowAdditionalOriginalSourceRanks:profile.allowAdditionalOriginalSourceRanks
  }));
  assert.equal(result.attempted,8);
  assert.equal(result.rows.length,8);
  assert.deepEqual(result.rows.map(r=>r.trial.id),trials.map(t=>t.id));
  const summary=result.rows.map(row=>({
    trialId:row.trial.id,
    actualSourceSeat:row.sourceSeat,
    actualOriginalSourceDeal:row.sourceDealFingerprint,
    attackDeclarations:row.attackDeclarations?.source??null,
    nativeTerminal:row.finished===true,
    actionCapOrNonTerminal:row.finished===false,
    finalNativeTurn:row.turns??null,
    competitiveQualified:false
  }));
  return {
    schema:VERSION,
    originalPreregisteredControlBlobSha:REGISTRATION_BLOB,
    originalFrozenSelectedProfileBlobSha:PROFILE_BLOB,
    sourceRank:5,
    vendorPinnedRevision:profile.pinnedVendorRevision,
    hookVersion:HOOK_VERSION,
    retrospectiveSourceSeeds:true,
    independentlyProspective:false,
    trialCount:8,
    hookAudit:audit,
    summary,
    rawNativeRows:result.rows,
    competitiveQualifiedGames:0,
    paperLegalFullChainVerified:false,
    causalWinRateVerified:false,
    caveat:'Known historical 8 seeds replayed to debug missing source paid retreat action. Selective replays cannot estimate matchup strength or independent attack frequency.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(replay(),null,2)+'\n');
}
module.exports={VERSION,replay};
