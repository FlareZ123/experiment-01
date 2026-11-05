'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runLateLetter}=require('./agent35-rank11-letter-owner-late-v3.cjs');
const {paperOwnerLetterGate}=
  require('./agent49-rank11-first-letter-pass11.cjs');
const registration=require('../../results/aichi-2026/registrations/agent49-rank11-first-letter-pass11-20261105.json');

const VERSION='agent49-rank11-firstturn-letter-owner-search-v1';

/**
 * Execute the previously committed exact initial physical deal and original
 * source Pass11→Letter root, with Agent35's preexisting late-at-live-match
 * owner-only typed search resolver. No rival concealed zones used for choice.
 * @param {{runLate?:Function}} [deps] Pure unit-test override.
 * @returns {object} Entire eight-arm original native status, including errors.
 */
function run(deps={}){
  const record=(deps.runLate??runLateLetter)({registration});
  assert.equal(record.registrationId,registration.selectedOriginalId);
  assert.equal(record.originalBaselineSchema,
    'agent35-rank11-source-professor-letter-pass37-fork-v1');
  assert.equal(record.attemptedNativeOriginalRows,8);
  assert.equal(record.sourceDealMatched,true);
  assert.equal(record.entirePhysicalDealMatched,true);
  assert.equal(record.originalPreForkSourceRootTapeMatched,true);
  assert.equal(record.sourceOwnerCardAcceptedByNativeStore,true);
  assert.equal(record.nativeRootAtSelectedOrdinal?.actionOrdinal,11);
  assert.equal(record.nativeRootAtSelectedOrdinal?.turnBefore,2);
  assert.equal(record.nativeRootAtSelectedOrdinal?.playerSlot,1);
  const gate=paperOwnerLetterGate(record.sourceOwnerPreDecisionSnapshot);
  assert.equal(gate.heldSourceLetter,true);
  assert.equal(gate.paperItemUnlocked,true);
  assert.equal(gate.twoBasicDarknessTargetsGuaranteed,true);
  const audit=record.ownerLetterSearchAudit;
  assert.ok(audit && typeof audit==='object');
  const physicallySettled=audit.searchPromptsSettled===1&&
    audit.physicalDarknessToHand===2&&
    audit.physicalFailures===0;
  return {schema:VERSION,registration:registration.selectedOriginalId,
    exactOriginalDeal:true,originalPreRootTapeEqual:true,
    paperOwnerGate:gate,
    sourceFirstItemAccepted:true,
    ownerSearchAudits:audit,
    nativeSourceTwoDarknessTransferred:physicallySettled,
    actualSourcePromptRoots:record.sourceFollowthroughPrompts,
    actualSourceDarknessEnergyPlayRoots:
      record.sameTurnRealOwnerDarknessEnergyPlayRoots,
    sourceDisposition:record.originalSourceRowDisposition,
    sourceAbort:record.sourceDecoderFailure,
    sourceAcceptedRootCount:record.originalSourceAcceptedRoots,
    completeOriginalEight:record.allNativeArmDispositions,
    physicallyQualifiedGames:0,
    competitiveGameWinRate:null};
}
/**
 * Atomically save an exclusive native evidence packet with digest.
 * @param {string} dest
 * @param {object} value
 */
function write(dest,value){
  assert.equal(value.schema,VERSION);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  const lock=dest+'.lock',fd=fs.openSync(lock,'wx');
  const tmp=dest+'.'+process.pid+'.tmp';
  try{
    const contents=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(tmp,contents,{flag:'wx'});
    fs.renameSync(tmp,dest);
    return {bytes:Buffer.byteLength(contents),sha256:createHash('sha256')
      .update(contents).digest('hex')};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  const dest=process.env.AGENT49_EARLY_LETTER_TYPED_RECEIPT;
  assert.ok(dest,'Set AGENT49_EARLY_LETTER_TYPED_RECEIPT');
  const receipt=run();
  const saved=write(dest,receipt);
  const a=receipt.ownerSearchAudits;
  process.stdout.write('AGENT49_EARLY_LETTER_TYPED '+JSON.stringify({
    ...saved,
    ownerNativePrompt:a.legitimateOwnerDeckPrompts,
    ownerPromptAnswersSubmitted:a.searchChoicesSubmitted,
    ownerPromptSettled:a.searchPromptsSettled,
    physicalTwoDarkness:a.physicalDarknessToHand,
    actualEnergyAttachments:receipt.actualSourceDarknessEnergyPlayRoots.length,
    actualSourceDisposition:receipt.sourceDisposition,
    errors:receipt.completeOriginalEight.filter(x=>x.status==='engine-error').length,
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,run,write};
