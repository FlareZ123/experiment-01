'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {test}=require('node:test');
const {FROZEN,ledgerSha256,auditNativeOnePrizeBoxKo}=
  require('../simulation/evaluation/agent43-native-box-ko-postsettlement-audit.cjs');

test('public ledger SHA-256 is bounded to exact accepted source roots',()=>{
  assert.equal(ledgerSha256([]),
    '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945');
  const r=[{actionOrdinal:93,action:'PlayCardAction',card:'Secret Box'}];
  assert.equal(ledgerSha256(r).length,64);
  assert.notEqual(ledgerSha256(r),ledgerSha256([{...r[0],card:'Fog Crystal'}]));
});
const haveArchives=Boolean(process.env.AGENT43_ROOT93_ARCHIVE&&
  process.env.AGENT43_ROOT93_BOX_ARCHIVE);
function load(){
  const baseline=JSON.parse(fs.readFileSync(
    process.env.AGENT43_ROOT93_ARCHIVE,'utf8'));
  const treatment=JSON.parse(fs.readFileSync(
    process.env.AGENT43_ROOT93_BOX_ARCHIVE,'utf8'));
  return {baseline,treatment};
}
test('real accepted native Box -> Fog -> Basic -> Hidden Power KO and source reply',{
  skip:!haveArchives
},()=>{
  const {baseline,treatment}=load();
  const result=auditNativeOnePrizeBoxKo(baseline,treatment);
  assert.equal(result.originalRegisteredTrial,FROZEN.trial);
  assert.equal(result.mandatoryOtherCardsPaid,3);
  assert.equal(result.candidatePrizeAfter,5);
  assert.equal(result.nextSourceTurnHadAttack,false);
  assert.equal(result.nativeWinner,null);
  assert.equal(result.competitiveGamesQualified,0);
});
test('rejects a falsely represented native Prize change',{
  skip:!haveArchives
},()=>{
  const {baseline,treatment}=load();
  treatment.nativeAttempt.candidateAttackSettlement.attacks
    .find(x=>x.actionOrdinal===104).prizesAfter=[5,6];
  assert.throws(()=>auditNativeOnePrizeBoxKo(baseline,treatment));
});
test('rejects unverified physical mandatory Secret Box payment',{
  skip:!haveArchives
},()=>{
  const {baseline,treatment}=load();
  treatment.nativeAdapterAudit.agent43OneEnergyBoxKo.paperPaymentsAccepted=0;
  assert.throws(()=>auditNativeOnePrizeBoxKo(baseline,treatment));
});
test('rejects any altered predecision native Store root',{
  skip:!haveArchives
},()=>{
  const {baseline,treatment}=load();
  treatment.nativeAttempt.rootActionLedger[90].turnBefore=999;
  assert.throws(()=>auditNativeOnePrizeBoxKo(baseline,treatment));
});
