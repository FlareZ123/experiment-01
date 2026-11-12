'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {registration,receiptAlignment,paperCologneAuditReviewGate}=
  require('../../simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs');
const {auditAcceptedCologneRoots}=
  require('../../simulation/evaluation/agent48-cologne-native-ledger-audit.cjs');

const ROOT=path.resolve(__dirname,'../..');
const RAW_SCHEMA='agent36-live-paper-root-receipts-v2-attached-energy-custody';

test('frozen 4410 registration remains unchanged and is the V2 release producer',()=>{
  const {reg,registrationSha256}=registration();
  assert.equal(reg.schema,'agent44-first-independent-review-case-registration-v1');
  assert.equal(reg.caseId,'agent44-20261109-original-rank5-newmoon-fresh-4410B');
  assert.equal(reg.preRegisteredTrials.length,1);
  assert.equal(reg.preRegisteredTrials[0].id,'5:4410:B:new-moon-lockbreaker-v1');
  assert.equal(reg.preRegisteredTrials[0].seed,3861605836);
  assert.equal(reg.nativeRootCap,320);
  assert.equal(reg.enginePinnedCommit,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registrationSha256.length,64);
});

test('4410 contender binding resolves the frozen pointer to the actual Lockbreaker Japanese 60',()=>{
  const {reg,candidateManifestBinding,candidatePrintedInventorySha256,
    candidateOfficialJapaneseDeckCode,candidateDerivedFromOfficialJapaneseSourceDeckCode}=registration();
  assert.equal(reg.candidateId,'new-moon-lockbreaker-v1');
  assert.equal(reg.candidatePrintedManifest,'results/als/new-moon-perfection-source-60.json');
  assert.equal(candidateManifestBinding.schema,'agent44-candidate-print-manifest-binding-v1');
  assert.equal(candidateManifestBinding.status,
    'PRE_EXECUTION_CORRECTIVE_BINDING_NOT_A_NEW_REGISTRATION');
  assert.equal(candidateManifestBinding.registrationCandidateManifestPointerMatches,false);
  assert.equal(candidateManifestBinding.boundCandidateJapanesePrintManifest,
    'results/als/new-moon-lockbreak-japanese-print-60.json');
  assert.equal(candidateManifestBinding.candidateEnglishMechanicalProxyManifest,
    'results/als/new-moon-lockbreak-english-proxy-60.json');
  assert.equal(candidateManifestBinding.candidateJapanesePrintInventoryCanonicalSha256,
    '13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047');
  assert.equal(candidatePrintedInventorySha256,
    candidateManifestBinding.candidateJapanesePrintInventoryCanonicalSha256);
  assert.equal(candidateManifestBinding.candidatePrintedCardCount,60);
  assert.equal(candidateManifestBinding.candidateUniqueNameCount,34);
  assert.deepEqual(candidateManifestBinding.candidateNameCountParity,{names:34,cards:60});
  assert.equal(candidateManifestBinding.nativeCandidateLoaderNameCountParity,true);
  assert.deepEqual(candidateManifestBinding.nativeCandidateLoaderNameAliases,[
    {nativeName:'Psychic Energy',printedName:'Basic Psychic Energy',count:3}
  ]);
  assert.equal(candidateOfficialJapaneseDeckCode,null,
    'The derived candidate has no official Japanese deck code of its own');
  assert.equal(candidateDerivedFromOfficialJapaneseSourceDeckCode,
    'GxxDYx-a4rD4W-a8xYxc');
  assert.equal(candidateManifestBinding.paperLegalityIndependentlyCertified,false);
});

test("4410 producer receipt alignment matches the V2 builder's exact join contract",()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const raw={schema:RAW_SCHEMA,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  assert.deepEqual(receiptAlignment(roots,raw),{
    schema:true,originalPhysicalCardCount:120,ledgerCount:2,receiptCount:2,
    acceptedStoreRootCount:2,rootCountMatches:true,exactOrdinalSeatActionParity:true,
    rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatchCount:0,complete:true
  });
});

test('4410 producer receipt alignment fails closed on any physical or ordinal gap',()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const raw={schema:RAW_SCHEMA,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  assert.equal(receiptAlignment(roots,{...raw,acceptedStoreRootCount:1}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,receipts:[raw.receipts[1],raw.receipts[0]]}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,receipts:[raw.receipts[0],{...raw.receipts[1],action:'PlayCardAction'}]}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,rootOrdinalsUnique:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,settledPhysicalIdentityClean:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,originalPhysicalCards:raw.originalPhysicalCards.slice(1)}).complete,false);
});

test('4410 intake exposes registration pointer, runtime revision and exact builder parity object',()=>{
  const source=fs.readFileSync(path.join(ROOT,'simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs'),'utf8');
  assert.match(source,/registrationRef:REGPATH/);
  assert.match(source,/researchRevisionSha:process\.env\.GITHUB_SHA/);
  assert.match(source,/rootReceiptAlignment,/);
  assert.match(source,/candidateManifestBinding/);
  assert.match(source,/new-moon-lockbreak-japanese-print-60/);
  assert.match(source,/new-moon-lockbreak-english-proxy-60/);
  assert.match(source,/const rawNativeReceiptCaptureComplete=rootReceiptAlignment\.complete/);
  assert.match(source,/actualEngineCommit,reg\.enginePinnedCommit/);
});

test('V2 builder and fixture target the frozen 4410 producer, never held 4411',()=>{
  const builder=fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs'),'utf8');
  const builderTest=fs.readFileSync(path.join(__dirname,
    'agent45-agent44-v2-bundle-builder.test.cjs'),'utf8');
  assert.match(builder,/const REFERENCE='agent44-first-independent-rank5-newmoon-case-v2\.json'/);
  assert.match(builder,/original\.registration\.schema,'agent44-first-independent-review-case-registration-v1'/);
  assert.match(builder,/original\.intake\.caseId,'agent44-20261109-original-rank5-newmoon-fresh-4410B'/);
  assert.match(builder,/registrationRef:\s*'results\/aichi-2026\/registrations\/agent44-first-original-rank5-newmoon-case-20261109\.json'/);
  assert.match(builderTest,/const TRIAL='5:4410:B:new-moon-lockbreaker-v1'/);
  assert.match(builder,/settledPhysicalIdentityClean/);
  assert.match(builder,/acceptedStoreRootCount/);
  assert.match(builder,/original\.intake\.runtime\?\.researchRevisionSha/);
  assert.ok(builder.includes('clockEvidence')&&builder.includes('clockEvidenceRef'),
    'V2 bundle must accept externally supplied official clock evidence; absent input stays null');
  for(const field of [
    'nativePromptChoices','policyAudit','sourceAudit','supporterModalEvidence',
    'ownerSupporterOpportunityAudit','ownerCompressorOpportunityAudit',
    'candidateRepliesAfterSourceAttacks','candidateAttackSettlement',
    'sourceAttackSettlement','nativeAttackModalityLedger','nativeAttackPhysicalTape',
    'firstSettledPublicAttack','finalBoard','finalPrizes',
    'paperCologneNativePlayAudit','paperCologneReviewGate',
    'policyProvenance','policyProvenanceSha256','policyManifestSha256'
  ]) assert.ok(builder.includes(field),`V2 signed evidence envelope must bind ${field}`);
});


test('V2 contender bundle binds the corrected Lockbreaker manifest, not the source 60',()=>{
  const builder=fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs'),'utf8');
  const start=builder.indexOf("'contender-printed-60':");
  const end=builder.indexOf("'full-physical-deal':",start);
  assert.ok(start>=0&&end>start,'V2 bundle must retain a contender-printed-60 object');
  const contender=builder.slice(start,end);
  assert.match(contender,/candidateManifestBinding/,
    'Contender object must bind the producer correction');
  assert.match(contender,/boundCandidateJapanesePrintManifest/);
  assert.match(contender,/candidateJapanesePrintInventoryCanonicalSha256/);
  assert.match(contender,/registrationCandidateManifestPointer/);
  assert.match(contender,/candidateOfficialJapaneseDeckCode/);
  assert.match(contender,/candidateDerivedFromOfficialJapaneseSourceDeckCode/);
  assert.doesNotMatch(contender,/new-moon-perfection-source-60\.json/,
    'Unmodified source manifest must not be labelled as the contender');
});

test('4410 V2 workflow exposes optional external clock evidence without inventing a receipt',()=>{
  const workflow=fs.readFileSync(path.join(ROOT,
    '.github/workflows/agent44-rank5-m4-paper-source-native.yml'),'utf8');
  assert.ok(workflow.includes('clock_evidence_path'));
  assert.ok(workflow.includes('CLOCK_EVIDENCE_PATH'));
  assert.ok(workflow.includes('test -f "$CLOCK_EVIDENCE_PATH"'));
  assert.ok(workflow.includes('artifacts/agent44-first-release-nine-object-intake-v2.json "$CLOCK_EVIDENCE_PATH"'));
  assert.ok(workflow.includes('artifacts/agent44-first-release-nine-object-intake-v2.json\n          fi'));
});

function cologneRoot(actionOrdinal,turnBefore,turnAfter,playerSlot=0){
  return {actionOrdinal,turnBefore,turnAfter,playerSlot,
    action:'PlayCardAction',card:'Canceling Cologne'};
}

test('4410 Cologne review gate blocks missing audit and card-specific same-turn second uses',()=>{
  const missing=paperCologneAuditReviewGate(null,false);
  assert.equal(missing.disposition,'blocked-audit-missing');
  assert.equal(missing.paperRuleReviewBlocked,true);
  assert.equal(missing.rawCaptureRetainedRegardlessOfGate,true);

  const multipleRoots=[
    cologneRoot(0,1,1,0),
    cologneRoot(1,1,1,0)
  ];
  const audit=auditAcceptedCologneRoots(multipleRoots);
  assert.equal(audit.acceptedOncePerSeatTurn,false);
  assert.deepEqual(audit.duplicateAcceptedBySeatTurn,[
    {epoch:0,seat:0,turn:1,count:2}
  ]);
  const malformed=paperCologneAuditReviewGate({...audit,scope:null},false);
  assert.equal(malformed.disposition,'blocked-audit-malformed');
  assert.equal(malformed.paperRuleReviewBlocked,true);

  const gate=paperCologneAuditReviewGate(audit,false);
  assert.equal(gate.disposition,'blocked-card-specific-once-per-turn-violation');
  assert.equal(gate.auditShapeValid,true);
  assert.equal(gate.paperRuleReviewBlocked,true,
    'The official Canceling Cologne card-specific Q&A prohibits a second same-turn use');
  assert.deepEqual(gate.multipleAcceptedBySeatTurn,
    audit.duplicateAcceptedBySeatTurn);
  assert.equal(gate.cardSpecificOncePerTurnConformance,'fail');
  assert.equal(gate.paperItemLegalityReviewStatus,
    'blocked-card-specific-once-per-turn-violation');
  assert.equal(gate.requiresTargetAndEffectReview,true);
  assert.equal(gate.hookOptInEnabled,false,
    'The frozen 4410 profile does not enable the simulator correction hook');
  assert.equal(gate.paperLegalityCertified,false);
  assert.equal(gate.rawCaptureRetainedRegardlessOfGate,true);

  const hookEnabledGate=paperCologneAuditReviewGate(audit,true);
  assert.equal(hookEnabledGate.cardSpecificOncePerTurnConformance,'fail');
  assert.equal(hookEnabledGate.paperRuleReviewBlocked,true,
    'The paper ruling applies whether or not the simulator hook was enabled');
});

test('4410 Cologne audit segments authenticated sudden-death restarts before same-turn rule review',()=>{
  const roots=[
    cologneRoot(0,1,1,0),
    {actionOrdinal:1,turnBefore:1,turnAfter:0,playerSlot:0,
      action:'SuddenDeathRestartAction'},
    cologneRoot(2,1,1,0)
  ];
  const resets=[{actionOrdinal:1,fromTurn:1,toTurn:0,
    afterSuddenDeath:true,enteredSetup:true,action:'SuddenDeathRestartAction'}];
  const audit=auditAcceptedCologneRoots(roots,resets);
  assert.equal(audit.episodes,2);
  assert.equal(audit.authenticatedRestarts,1);
  assert.equal(audit.accepted,2);
  assert.equal(audit.acceptedOncePerSeatTurn,true);
  assert.deepEqual(audit.duplicateAcceptedBySeatTurn,[]);
  const gate=paperCologneAuditReviewGate(audit,false);
  assert.equal(gate.disposition,'eligible-pending-independent-paper-review');
  assert.equal(gate.paperRuleReviewBlocked,false);
  assert.equal(gate.cardSpecificOncePerTurnConformance,'pass');
  assert.equal(gate.requiresTargetAndEffectReview,true);
  assert.equal(gate.independentPaperReviewRequired,true);
  assert.equal(gate.paperLegalityCertified,false,
    'A clear count audit is not independent paper legality certification');
});

test('4410 intake exposes the raw Cologne audit and card-specific review gate without changing the frozen hook profile',()=>{
  const source=fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs'),'utf8');
  assert.match(source,/paperCologneNativePlayAudit:row\\.paperCologneNativePlayAudit\\?\\?null/);
  assert.match(source,/paperCologneReviewGate:paperCologneAuditReviewGate/);
  assert.match(source,/row\\.paperCologneQuotaOptIn===true/);
  assert.match(source,/cardSpecificOncePerTurnConformance/);
  assert.match(source,/requiresTargetAndEffectReview/);
  assert.match(source,/rawCaptureRetainedRegardlessOfGate:true/);
  assert.match(source,/paperLegalityCertified:false/);
  const optionsStart=source.indexOf('const policyOptions={');
  const optionsEnd=source.indexOf('};',optionsStart);
  assert.ok(optionsStart>=0&&optionsEnd>optionsStart,
    'The frozen runner must retain an inspectable policy option object');
  assert.doesNotMatch(source.slice(optionsStart,optionsEnd),
    /paperCologneQuota\s*:\s*true/,
    '4410 must not enable the optional simulator correction hook');
  const workflow=fs.readFileSync(path.join(ROOT,
    '.github/workflows/agent44-rank5-m4-paper-source-native.yml'),'utf8');
  assert.doesNotMatch(workflow,/AGENT48_PAPER_COLOGNE_DEV/,
    'The 4410 workflow must not enable the Cologne hook through environment');
});
