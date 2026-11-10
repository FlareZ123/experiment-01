'use strict';

const assert=require('node:assert/strict');
const {runNativeBatch}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {runFreshPacket,writeArtifact}=
  require('../agent36-fresh-rank5-native-paper-packet.cjs');
const {withMewEnergyMixOwnerPrompt,VERSION:POLICY_VERSION}=
  require('../../twinleaf/2026-11/agent26-mew-energy-mix-owner-prompt.cjs');

const VERSION='agent26-rank5-postobserved-energy-mix-repair-v1';
const ORIGINAL_RUN_ID=42735807971;
const frozenDeals={
  '5:5000:A:new-moon-lockbreaker-v1':
    '381a75e1b1c7421827a28fe5de6d35bcc5c7911c595b0c3c0091824dc7e7b58d',
  '5:5001:B:new-moon-lockbreaker-v1':
    '49c156133a70c7203e62d7cb6a9fb36e1d8bbd088f18b39a41b69eaf3ec34d8e',
  '5:5002:A:new-moon-lockbreaker-v1':
    '06e2b1f2ec729713a304d3fc7201a3e75346ab69d3fa28af2a0428ba072354af',
  '5:5003:B:new-moon-lockbreaker-v1':
    '98176ce98693090daf6979f583fec813c329f4b371e72c7030d408c32ffc40d8'
};

/**
 * Re-execute exactly the four original physical deals after the observed
 * copied-Energy-Mix decoder abort. Policy repair was specified AFTER
 * historical root 136, so these cases are explicitly retrospective.
 * They can validate the mechanical native continuation but cannot be
 * admitted as a prospective comparative win-rate or paper-game sample.
 *
 * @param {object} [deps]
 * @returns {object}
 */
function runRetrospectiveContinuation(deps={}){
  let promptAudit=null;
  const packet=runFreshPacket({
    nativeBatch:deps.nativeBatch??runNativeBatch,
    // Install after the pre-existing delegated owner-decoder wrappers.
    // Outer installation is shadowed by the inner fail-closed decoder and
    // cannot reach its pending Energy Mix prompt.
    run:options=>{
      const session=withMewEnergyMixOwnerPrompt(
        ()=>(deps.run??runDevelopment)(options),
        deps.promptDependencies??{});
      promptAudit=session.audit;
      return session.result;
    }
  });
  assert.equal(packet.initialPhysicalStoreGameCount,4);
  for(const row of packet.gameRecords){
    assert.equal(row.initialFullPhysicalDeal,frozenDeals[row.trialId],
      'The original physical sixty shuffle/deal must remain unchanged');
  }
  return {...packet,schema:VERSION,
    postobserved:true,competitiveWinRateEvidence:false,
    originalRunId:ORIGINAL_RUN_ID,originalFullPhysicalDeals:frozenDeals,
    intervention:POLICY_VERSION,energyMixPromptAudit:promptAudit,
    mechanicalEnergyMixResolved:
      promptAudit?.physicalAttachmentsConfirmed>0,
    paperQualifiedGames:0,competitivelyAdmittedGames:0};
}

if(require.main===module){
  let report;
  try{report=runRetrospectiveContinuation();}
  catch(error){
    if(error?.partialPaperPacket){
      const saved=writeArtifact({...error.partialPaperPacket,
        schema:VERSION+'-abort-v1',postobserved:true,
        paperQualifiedGames:0,competitivelyAdmittedGames:0},
      'artifacts/agent26-rank5-energy-mix');
      process.stderr.write(JSON.stringify({status:'NATIVE_ABORT_ARCHIVED',
        saved,message:error.message})+'\n');
    }
    throw error;
  }
  const archive=writeArtifact(report,'artifacts/agent26-rank5-energy-mix');
  process.stdout.write(JSON.stringify({
    schema:VERSION,archive,originalRunId:ORIGINAL_RUN_ID,
    exactNativeActionReceiptCount:report.exactNativeActionReceiptCount,
    joinedNativeGames:report.joinedNativeGames,
    cleanOriginalPhysicalGames:report.cleanOriginalPhysicalGames,
    terminalNativeGames:report.terminalNativeGames,
    energyMixPromptAudit:report.energyMixPromptAudit,
    gameRecords:report.gameRecords.map(r=>({
      trialId:r.trialId,nativeFinished:r.nativeFinished,
      nativeWinner:r.nativeWinner,finalPrizes:r.finalPrizes,
      nativeError:r.nativeError,physicalDeal:r.initialFullPhysicalDeal,
      nativeRoots:r.storeRaw?.acceptedStoreRootCount??0
    })),competitivelyAdmittedGames:0
  })+'\n');
  if(report.joinedNativeGames!==4||
     !report.mechanicalEnergyMixResolved||
     report.gameRecords.find(x=>x.trialId.includes('5001:B'))?.nativeFinished!==true)
    process.exitCode=1;
}
module.exports={VERSION,ORIGINAL_RUN_ID,frozenDeals,runRetrospectiveContinuation};
