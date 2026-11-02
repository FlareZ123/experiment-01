'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {preflight,gitBlobSha}=require('./agent15-rank31-v10-natural-paired-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const RETRO='results/aichi-2026/registrations/agent15-rank31-owner-koffing-roxie-pass-retro-20261102.json';
const RETRO_BLOB='0ff37a9b39d2323c1fe6382bd95cb03d6118eac6';

/** @returns {object} */
function preflightRetro(){
  const bytes=fs.readFileSync(path.join(ROOT,RETRO));
  assert.equal(gitBlobSha(bytes),RETRO_BLOB);
  const registration=JSON.parse(bytes.toString('utf8'));
  const parent=preflight();
  assert.equal(registration.originalRegistrationGitBlob,
    'b0a3859fe16e8bd9bee54af57a95ba4401a09f69');
  assert.equal(registration.pregameAmendmentGitBlob,
    '7cdf9be1eab951568560e0535d39cf25e722fcae');
  assert.equal(registration.schema,
    'agent15-rank31-retro-owner-private-koffing-roxie-pass-census-v1');
  assert.deepEqual(registration.sourceSeeds,parent.registration.seeds);
  assert.equal(registration.enginePin,parent.registration.enginePin);
  assert.equal(registration.attempts,8);
  return {registration,parent};
}
/** @param {object} record */
function sample(record){
  const hand=record.ownerHandPrintings??[];
  const held=record.held??[];
  const copies=name=>hand.filter(x=>x===name).length;
  const roxie=held.find(x=>x.printing==='Roxie CEC')??null;
  const pass=record.nativePassReceipt??null;
  return {
    originalOwnerSeat:record.seat,
    turn:record.globalTurn,
    rootType:pass?'accepted-pass':'first-owner-root',
    sourceRoxieCopiesInHand:copies('Roxie CEC'),
    sourceKoffingCopiesInHand:copies('Koffing CEC'),
    sourceHandSize:hand.length,
    physicalRoxieKoffingCohold:
      copies('Roxie CEC')>=1&&copies('Koffing CEC')>=1,
    supporterQuotaOpen:record.quotaOpen===true,
    supporterPlayUnlocked:record.playUnlocked===true,
    firstPlayerFirstTurn:record.firstPlayerFirstTurn===true,
    roxieStructurallyOpen:roxie?.structurallyOpen??null,
    roxieFirstTurnScreen:roxie?.firstTurnScreen??null,
    ownerAcceptedPass:pass?.accepted===true,
    ownerPassTurnAdvanced:pass?.turnAdvanced??null
  };
}
/** @param {object} row */
function sourceCoholdSummary(row){
  const a=row.actorOnlyDecisionCoverage?.ownerSupporterOpportunityAudit??null;
  const seat=row.sourceSeat;
  if(!a)return {auditPresent:false,sourceSeat:seat,sourcePaperPaymentQualified:false};
  const first=(a.firstOwnerTurnSamples??[]).filter(x=>x.seat===seat).map(sample);
  const passes=(a.passSamples??[]).filter(x=>
    x.seat===seat&&x.nativePassReceipt?.accepted===true).map(sample);
  const held=records=>records.filter(x=>x.sourceRoxieCopiesInHand>0);
  const coheld=records=>records.filter(x=>x.physicalRoxieKoffingCohold);
  const eligibleFirst=first.filter(x=>x.roxieStructurallyOpen===true);
  const eligiblePass=passes.filter(x=>x.roxieStructurallyOpen===true);
  return {
    auditPresent:true,sourceSeat:seat,actualNativeStoreSeen:a.actualStoreSeen,
    sourceFirstOwnerTurns:first.length,
    sourceAcceptedPasses:passes.length,
    sourceFirstRootsHoldingRoxie:held(first).length,
    sourceAcceptedPassesHoldingRoxie:held(passes).length,
    sourceFirstRootsCoholdingKoffingAndRoxie:coheld(first).length,
    sourceAcceptedPassesCoholdingKoffingAndRoxie:coheld(passes).length,
    sourceFirstRootsStructurallyOpenRoxie:eligibleFirst.length,
    sourcePassesStructurallyOpenRoxie:eligiblePass.length,
    sourceCoholdPassSamples:coheld(passes),
    sourceNonCoholdRoxiePassSamples:held(passes)
      .filter(x=>!x.physicalRoxieKoffingCohold),
    sourceAcceptedSupporterRoots:
      (a.acceptedSupporterSamples??[]).filter(x=>x.seat===seat).length,
    sourceOwnedHandOnly:true,sourcePaperPaymentQualified:false,
    exactNonGXKoffingCoholdPhysicalEvidenceOnly:true,
    note:'Koffing CEC is a source-printed eligible non-GX/EX Pokémon in hand. A cohold alone cannot certify that spending the Supporter is optimal.'
  };
}
/** @returns {object} */
function run(){
  const {registration,parent}=preflightRetro();
  const fixed={...parent.registration.fixedOptions,
    ...parent.amendment.effectiveOverrides,
    registeredTrials:parent.registration.trials,
    registeredFrameName:parent.registration.schema,
    allowAdditionalOriginalSourceRanks:true,
    sharedPaperPaymentPortfolio:true};
  const before=process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV;
  let control,observed;
  try{
    process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV='false';
    control=runDevelopment(fixed);
    process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV='true';
    observed=runDevelopment(fixed);
  }finally{
    if(before===undefined)delete process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV;
    else process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV=before;
  }
  assert.equal(control.rows.length,4);
  assert.equal(observed.rows.length,4);
  const controls=new Map(control.rows.map(x=>[x.trial.id,x]));
  const pairs=observed.rows.map(x=>{
    const c=controls.get(x.trial.id);
    assert.ok(c);
    const firstBoth=c.nativeSetupCoinChoiceReceipt?.status===
      'consistent-accepted-native-setup-and-first-draw'&&
      x.nativeSetupCoinChoiceReceipt?.status===
      'consistent-accepted-native-setup-and-first-draw';
    const sameFull=typeof c.fullPhysicalDealFingerprint==='string'&&
      c.fullPhysicalDealFingerprint===x.fullPhysicalDealFingerprint;
    const sameSource=typeof c.sourceDealFingerprint==='string'&&
      c.sourceDealFingerprint===x.sourceDealFingerprint;
    const sameRoot=c.rootActionLedgerSha256===x.rootActionLedgerSha256;
    const sameOutcome=c.finished===x.finished&&c.winner===x.winner&&
      c.endReason===x.endReason;
    return {
      id:x.trial.id,seed:x.trial.seed,
      sourceSeat:x.sourceSeat,candidateSeat:x.candidateSeat,
      firstNativeSetupCertifiedBoth:firstBoth,
      sameFullPhysicalDeal:sameFull,sameSourcePhysicalDeal:sameSource,
      sameNativeRootLedger:sameRoot,sameNativeOutcome:sameOutcome,
      observerNoninterfering:firstBoth&&sameFull&&sameSource&&
        sameRoot&&sameOutcome,
      sourceCohold:sourceCoholdSummary(x)
    };
  });
  return {
    schema:'agent15-original-rank31-source-coheld-roxie-koffing-owner-pass-v1',
    retrospectiveNotIndependent:true,registrationGitBlob:RETRO_BLOB,
    sourceRank:31,pinnedEngine:registration.enginePin,
    allAttempted:8,pairs:pairs.length,
    allObserverNoninterfering:pairs.every(x=>x.observerNoninterfering),
    pairReceipts:pairs,control,observed,
    qualifiedCompetitiveGames:0,
    caveat:'Owner-private physical Koffing-Roxie cohold at accepted Pass establishes payment inventory, not card canPlay target legality, absence of other costs, tactical benefit, followup damage, or any win-rate evidence.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={RETRO,RETRO_BLOB,preflightRetro,sample,sourceCoholdSummary,run};
