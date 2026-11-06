'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rootDigest, certifiedMaterialChoice, evaluateBilateralCompetence} =
  require('../simulation/evaluation/agent45-bilateral-competence-gate.cjs');

const roots = [
  {actionOrdinal:0, turnBefore:4, playerSlot:0, action:'AttackAction'},
  {actionOrdinal:1, turnBefore:5, playerSlot:1, action:'PlayCardAction'},
  {actionOrdinal:2, turnBefore:6, playerSlot:0, action:'AttachEnergyAction'}
];

function certificate(root, suffix) {
  return {
    rootOrdinal:root.actionOrdinal, actorSeat:root.playerSlot,
    action:root.action, selectedOptionId:'choice-' + suffix,
    realStoreAccepted:true, paperLegalityReviewed:true,
    paidResourcesVerified:true, targetsAndTransitionsVerified:true,
    ownerInformationOnly:true, independentReviewer:'independent-reviewer',
    paperEvidenceRef:'rules/' + suffix,
    physicalReceiptRef:'archive/' + suffix,
    consequenceType:root.action==='AttackAction'?'settled-attack':
      root.action==='PlayCardAction'?'resource-transfer':'energy-custody',
    ownerOpportunityAudit:{actualRootOwnerView:true,
      exhaustivePaperAffordableScan:true,independentReview:true,
      evidenceRef:'owner-audit/' + suffix,
      options:[
        {id:'choice-' + suffix,action:root.action,ownerVisible:true,
          paperAffordable:true,evidenceRef:'proof/' + suffix},
        {id:'pass-' + suffix,action:'PassTurnAction',ownerVisible:true,
          paperAffordable:true,evidenceRef:'proof/pass-' + suffix}
      ]}
  };
}
function trialFor(ledger=roots) {
  ledger=ledger.map(root=>({...root}));
  return {
    trialId:'1:212:B:champion-reference',registrationRef:'registrations/example',
    originalSourceSeat:0,candidateSeat:1,
    actualFirstPlayerSeat:1,
    sourcePhysicalDealSha256:'physical-source',
    fullPhysicalDealSha256:'physical-both',
    vendorCommitSha:'vendor-pin',researchRevisionSha:'research-pin',
    hookRevisionSha:'hook-pin',
    originalPrinted60Sha256:'original-60',candidatePrinted60Sha256:'candidate-60',
    policySha256BySeat:['common-policy','common-policy'],
    nativeFinished:true,nativeWinner:0,nativeEndReason:'engine-game-end',
    finalPrizes:[0,2],engineError:false,rootCapReached:false,
    rootActionLedger:ledger,rootActionLedgerSha256:rootDigest(ledger),
    actionCertificates:ledger.map((r,i)=>certificate(r,i)),
    independentFullPaperRulesAudit:true,hiddenInformationAudit:true,
    official25MinuteClockAudit:true
  };
}

test('complete three-turn synthetic certificate can cross structural gate',()=>{
  const result=evaluateBilateralCompetence(trialFor());
  assert.equal(result.competitiveAdmission,true);
  assert.equal(result.reciprocalEpisodeObserved,true);
  assert.deepEqual(result.episode.turns,[4,5,6]);
  assert.deepEqual(result.episode.actionTypes,
    ['AttackAction','PlayCardAction','AttachEnergyAction']);
});

test('actual two-seat native mirror with passive source cannot pass',()=>{
  const ledger=[
    {actionOrdinal:0,turnBefore:2,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:1,turnBefore:3,playerSlot:1,action:'AttackAction'},
    {actionOrdinal:2,turnBefore:4,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:3,turnBefore:5,playerSlot:1,action:'AttackAction'}
  ];
  const actual=trialFor(ledger);
  actual.actionCertificates=[];
  const result=evaluateBilateralCompetence(actual);
  assert.equal(result.reciprocalEpisodeObserved,false);
  assert.equal(result.competitiveAdmission,false);
  assert.ok(result.failures.includes('no-certified-source-reply-source-episode'));
});

test('counts and zero-option Pass do not masquerade as reply',()=>{
  const input=trialFor();
  input.rootActionLedger[1]={...roots[1],action:'PassTurnAction'};
  input.rootActionLedgerSha256=rootDigest(input.rootActionLedger);
  const result=evaluateBilateralCompetence(input);
  assert.equal(result.reciprocalEpisodeObserved,false);
});

test('source requires a later consequential return decision',()=>{
  const input=trialFor(roots.slice(0,2));
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('no paper receipt or independent reviewer disqualifies one action',()=>{
  const input=trialFor();
  input.actionCertificates[1].paperEvidenceRef='';
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
  assert.equal(certifiedMaterialChoice(input.actionCertificates[1],roots[1]),false);
});

test('a claimed alternative must actually be owner-visible and payable',()=>{
  const input=trialFor();
  input.actionCertificates[1].ownerOpportunityAudit.options[0].ownerVisible=false;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('competing option IDs cannot duplicate chosen action',()=>{
  const input=trialFor();
  input.actionCertificates[1].ownerOpportunityAudit.options[1].id='choice-1';
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('same policy is required on both physical seats',()=>{
  const input=trialFor();input.policySha256BySeat[1]='opponent-weaker';
  const result=evaluateBilateralCompetence(input);
  assert.equal(result.reciprocalEpisodeObserved,true);
  assert.equal(result.competitiveAdmission,false);
  assert.ok(result.failures.includes('policy-asymmetry-or-unverified'));
});

test('native terminal does not imply paper or 25-minute certification',()=>{
  const input=trialFor();input.official25MinuteClockAudit=false;
  input.independentFullPaperRulesAudit=false;
  const result=evaluateBilateralCompetence(input);
  assert.equal(result.nativeTerminal,true);
  assert.equal(result.reciprocalEpisodeObserved,true);
  assert.equal(result.competitiveAdmission,false);
  assert.ok(result.failures.includes('official-match-clock-audit-pending'));
});

test('same-seed labels cannot replace actual physical deal fingerprints',()=>{
  const input=trialFor();input.fullPhysicalDealSha256='';
  assert.ok(evaluateBilateralCompetence(input).failures.includes('provenance-incomplete'));
});

test('root ledger SHA mutation cannot be smuggled under frozen signature',()=>{
  const input=trialFor();input.rootActionLedger[1].action='RetreatAction';
  assert.throws(()=>evaluateBilateralCompetence(input),/SHA256 mismatch/);
});

test('noncontiguous or time-regressing roots reject',()=>{
  const a=trialFor();a.rootActionLedger[1].actionOrdinal=7;
  a.rootActionLedgerSha256=rootDigest(a.rootActionLedger);
  assert.throws(()=>evaluateBilateralCompetence(a),/contiguous/);
  const b=trialFor();b.rootActionLedger[1].turnBefore=3;
  b.rootActionLedgerSha256=rootDigest(b.rootActionLedger);
  assert.throws(()=>evaluateBilateralCompetence(b),/time-regressing/);
});

test('certificate identities bind the real root owner and chosen action',()=>{
  const input=trialFor();input.actionCertificates[2].actorSeat=1;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('reported Store-accepted action cannot bypass an explicit paper veto',()=>{
  const input=trialFor();input.actionCertificates[1].paperLegalityReviewed=false;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('duplicate certificate claims for one root reject',()=>{
  const input=trialFor();input.actionCertificates.push(input.actionCertificates[0]);
  assert.throws(()=>evaluateBilateralCompetence(input),/Duplicate certificates/);
});

test('a delayed unrelated reply cannot be joined into a reciprocal episode',()=>{
  const input=trialFor();
  input.rootActionLedger[1].turnBefore=7;
  input.rootActionLedger[2].turnBefore=8;
  input.rootActionLedgerSha256=rootDigest(input.rootActionLedger);
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('the same test accepts original source at physical seat one',()=>{
  const reversed=[
    {actionOrdinal:0,turnBefore:10,playerSlot:1,action:'AttackAction'},
    {actionOrdinal:1,turnBefore:11,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:2,turnBefore:12,playerSlot:1,action:'AttachEnergyAction'}
  ];
  const input=trialFor(reversed);
  input.originalSourceSeat=1;input.candidateSeat=0;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,true);
});
