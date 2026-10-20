'use strict';

const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {compareNativeReadArchives}=
  require('../simulation/evaluation/agent41-hidden-read-pair-attestation.cjs');

/**
 * Run identical historical source-dealt cards, schedules, candidates,
 * opponents and policy twice in one engine process. The hidden-read observer
 * is the only changed flag. These outcomes are NEVER competitively qualified.
 *
 * @returns {{schema:string,control:object,instrumented:object,attestation:object}}
 */
function runPairedNativeReadAudit() {
  const options={
    mandatoryOptionFallback:process.env.AGENT41_MANDATORY_OPTION_DEV==='true',
    paperSupporterQuota:process.env.AGENT41_PAPER_SUPPORTER_DEV==='true',
    nativePressureWindows:process.env.AGENT41_NATIVE_PRESSURE_DEV==='true',
    sourceFirstRetrospective:process.env.AGENT41_SOURCEFIRST_RETRO_DEV==='true'
  };
  const control=runDevelopment({...options,
    nativeOpponentHiddenReadAudit:false});
  const instrumented=runDevelopment({...options,
    nativeOpponentHiddenReadAudit:true});
  const attestation=compareNativeReadArchives(control,instrumented);
  return {
    schema:'agent41-canonical-original-State-native-read-pair-v1',
    control,instrumented,attestation,
    competitiveQualifiedGames:0,
    strengthClaimPermitted:false,
    scope:'Historical four-arm diagnostic, never an Aichi field win estimate'
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(runPairedNativeReadAudit(),null,2)+'\n');
}
module.exports={runPairedNativeReadAudit};
