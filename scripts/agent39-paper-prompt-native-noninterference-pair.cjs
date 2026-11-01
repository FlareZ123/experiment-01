'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

const VERSION='agent39-same-head-original-4arm-paper-prompt-paired-v1';
const sha=v=>createHash('sha256')
  .update(JSON.stringify(v??null)).digest('hex');

function receipt(row){
  return {
    trialId:row.trial?.id??null,
    status:row.status??row.endReason??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    originalSourceDeal:row.sourceDealFingerprint??null,
    actualStarter:row.actualStarterSeat??null,
    rootCount:row.rootActionCount??null,
    rootLedgerSha256:row.rootActionLedgerSha256??null,
    nativePromptChoiceDigest:sha(row.nativePromptChoices??null),
    finalPublicBoardDigest:sha(row.finalBoard??null),
    finalPrizes:row.finalPrizes??null,
    winner:row.winner??null,
    finished:row.finished??null,
    actionCount:row.actionCount??null,
    turnCount:row.turns??null,
    paperVoltRootReceipt:row.paperPromptOriginalSourceRootReconciliation??null,
    sourceAttackSettlementDigest:sha(row.sourceAttackSettlement??null)
  };
}
/**
 * Same-process, same-head policy A/B with precisely one profile flag. The
 * experiment is a developmental hook noninterference test, not win-rate data.
 * @returns {object}
 */
function run(){
  const baseline=runDevelopment({paperPromptPortfolio:false});
  const checked=runDevelopment({paperPromptPortfolio:true});
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(checked.competitiveQualifiedGames,0);
  assert.equal(baseline.rows.length,4);
  assert.equal(checked.rows.length,4);
  const paired=baseline.rows.map((row,index)=>{
    const other=checked.rows[index];
    const off=receipt(row),on=receipt(other);
    assert.equal(off.trialId,on.trialId);
    const agreement={
      fullPhysicalDeal:off.fullPhysicalDeal===on.fullPhysicalDeal&&
        typeof off.fullPhysicalDeal==='string',
      sourceDeal:off.originalSourceDeal===on.originalSourceDeal&&
        typeof off.originalSourceDeal==='string',
      actualStarter:off.actualStarter===on.actualStarter,
      rootLedger:off.rootLedgerSha256===on.rootLedgerSha256&&
        typeof off.rootLedgerSha256==='string',
      nativePromptChoices:off.nativePromptChoiceDigest===
        on.nativePromptChoiceDigest,
      finalPublicBoard:off.finalPublicBoardDigest===
        on.finalPublicBoardDigest,
      prizes:JSON.stringify(off.finalPrizes)===
        JSON.stringify(on.finalPrizes),
      winner:off.winner===on.winner,
      endStatus:off.status===on.status,
      completion:off.finished===on.finished,
      actionCount:off.actionCount===on.actionCount,
      turnCount:off.turnCount===on.turnCount,
      sourceAttackSettlements:off.sourceAttackSettlementDigest===
        on.sourceAttackSettlementDigest
    };
    return {trialId:off.trialId,agreement,
      baseline:off,checked:on,
      fullyIdenticalExceptObserver:Object.values(agreement).every(Boolean)};
  });
  const report={schema:VERSION,enginePin:baseline.enginePin,
    baselinePolicy:'existing-bilateral-v2-paper-prompt-flag-off',
    observedPolicy:'identical-existing-bilateral-v2-paper-prompt-flag-on',
    paired,fullyNoninterferingFourArms:
      paired.every(x=>x.fullyIdenticalExceptObserver),
    matchingSourceDealAll:paired.every(x=>x.agreement.sourceDeal),
    realLivePromptRootAgreement:paired.every(x=>
      x.checked.paperVoltRootReceipt?.status===
      'LIVE_PRINTED_SOURCE_PROMPTS_MATCHED'||
      x.checked.paperVoltRootReceipt?.status==='NO_SOURCE_VOLT_PROMPTS'),
    originalTop32FullField:false,competitivelyQualifiedGames:0,
    winRateInferenceForbidden:true};
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(!report.fullyNoninterferingFourArms||
     !report.realLivePromptRootAgreement)
    process.exitCode=1;
  return report;
}
if(require.main===module)run();
module.exports={VERSION,receipt,run};
