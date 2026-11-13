'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rootDigest, verifiedOfficialAichiClock, archivedPhysicalSeats, verifiedMaterialTransition,
  certifiedMaterialChoice, evaluateBilateralCompetence,
  screenObservedReciprocalSequence, screenPublicDefenderDamageChange,
  screenUnmodifiedPrintedCosts, screenNativeMaterialReciprocalExchange,
  screenArchivedReciprocalAttempts} =
  require('../simulation/evaluation/agent45-bilateral-competence-gate.cjs');

const {aichiClockProtocolSha256,inspectOfficialAichiClock} =
  require('../simulation/evaluation/agent45-aichi-clock-receipt.cjs');

const roots = [
  {actionOrdinal:0, turnBefore:4, playerSlot:0, action:'AttackAction'},
  {actionOrdinal:1, turnBefore:5, playerSlot:1, action:'PlayCardAction'},
  {actionOrdinal:2, turnBefore:6, playerSlot:0, action:'PlayCardAction'}
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
    consequenceType:root.action==='AttackAction'?'damage-transition':
      root.action==='PlayCardAction'?'resource-transfer':'energy-custody',
    effectWitness:{
      type:root.action==='AttackAction'?'damage-transition':
        root.action==='PlayCardAction'?'resource-transfer':'energy-custody',
      sourceActionRootOrdinal:root.actionOrdinal,changedUnits:1,
      realNativeStateChange:true,paperRelevantTransition:true,
      costPaymentOnly:false,independentlyReviewed:true,
      beforeStateEvidenceRef:'before/' + suffix,
      afterStateEvidenceRef:'after/' + suffix,
      effectEvidenceRef:'archive-effect/' + suffix
    },
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
    actionCertificates:ledger.map((r,i)=>({
      ...certificate(r,i),
      linkedEarlierRootOrdinal:i>0?ledger[i-1].actionOrdinal:null,
      causalEvidenceRef:i>0?'causal-witness-' + i:null
    })),
    independentFullPaperRulesAudit:true,hiddenInformationAudit:true,
    eventStage:'open-top32',
    clockDisposition:'no-official-call',
    clockReceiptId:null,
    paperReceiptId:'paper/sample-natural-terminal',
    adjudicationProtocolSha:aichiClockProtocolSha256(),
    noCallClockPacket:{
      stage:'open-top32',
      officialEndCallObserved:false,
      elapsedSecondsAtNaturalTerminal:600,
      officialClockCoverageEvidenceRef:'clock/continuous-coverage',
      stageEvidenceRef:'event/open-top32-pairing',
      paperTerminalEvidenceRef:'paper/sample-natural-terminal',
      independentReviewEvidenceRef:'review/clock-paper',
      noCallCoverageIndependentlyReviewed:true,
      paperStateIndependentlyReviewed:true,
      paperGameWinner:0,
      paperGameTie:false
    }
  };
}

test('complete three-turn synthetic certificate can cross structural gate',()=>{
  const result=evaluateBilateralCompetence(trialFor());
  assert.equal(result.structuralGatePassed,true);
  assert.equal(result.competitiveAdmission,false);
  assert.equal(result.reciprocalEpisodeObserved,true);
  assert.deepEqual(result.episode.turns,[4,5,6]);
  assert.deepEqual(result.episode.actionTypes,
    ['AttackAction','PlayCardAction','PlayCardAction']);
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

test('native terminal does not imply independently audited event clock',()=>{
  const input=trialFor();input.noCallClockPacket.noCallCoverageIndependentlyReviewed=false;
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
    {actionOrdinal:2,turnBefore:12,playerSlot:1,action:'PlayCardAction'}
  ];
  const input=trialFor(reversed);
  input.originalSourceSeat=1;input.candidateSeat=0;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,true);
});

test('three adjacent material actions without causal witnesses do not qualify',()=>{
  const input=trialFor();
  input.actionCertificates[1].causalEvidenceRef=null;
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
  assert.equal(evaluateBilateralCompetence(input).competitiveAdmission,false);
});

test('pinned actual action vocabulary excludes invented manual-attachment classes',()=>{
  const input=trialFor();
  input.rootActionLedger[2].action='AttachEnergyAction';
  input.rootActionLedgerSha256=rootDigest(input.rootActionLedger);
  input.actionCertificates[2].action='AttachEnergyAction';
  assert.equal(evaluateBilateralCompetence(input).reciprocalEpisodeObserved,false);
});

test('real-archive observable three-turn sequence is not a competence certificate',()=>{
  const generic=screenObservedReciprocalSequence(roots,0,1);
  assert.deepEqual(generic?.source?.ordinal,0);
  assert.deepEqual(generic?.opponent?.ordinal,1);
  assert.deepEqual(generic?.sourceReturn?.ordinal,2);
  assert.equal(generic?.paperQualified,false);
  assert.equal(generic?.causalReplyVerified,false);
  assert.equal(generic?.ownerAlternativesVerified,false);
});
test('attack-anchored observational screen can separate setup from attacks',()=>{
  const fixture=[
    {actionOrdinal:0,turnBefore:2,playerSlot:0,action:'PlayCardAction',card:'Basic'},
    {actionOrdinal:1,turnBefore:3,playerSlot:1,action:'PlayCardAction',card:'Energy'},
    {actionOrdinal:2,turnBefore:4,playerSlot:0,action:'PlayCardAction',card:'Item'}
  ];
  assert.equal(screenObservedReciprocalSequence(fixture,0,1,{sourceAttackOnly:true}),null);
  assert.equal(screenObservedReciprocalSequence(fixture,0,1)?.source.action,'PlayCardAction');
});
test('archived screening retains capped and terminal attempts without promoting wins',()=>{
  const make=(id,ledger,status)=>({
    id, status, originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:ledger,
    publicRootActionCount:ledger.length,
    publicRootLedgerSha256Computed:rootDigest(ledger),
    publicRootLedgerSha256Reported:rootDigest(ledger)
  });
  const terminal=make('mirror',roots,'native-terminal-unqualified');
  const capped=make('capped',[roots[0]],'root-cap-unqualified');
  const report=screenArchivedReciprocalAttempts({attempts:[terminal,capped]});
  assert.equal(report.attemptedContexts,2);
  assert.equal(report.anyGeneralSequenceContexts,1);
  assert.equal(report.anySourceAttackSequenceContexts,1);
  assert.equal(report.competitiveGamesQualified,0);
  assert.deepEqual(report.rows.map(row=>row.competitiveAdmission),[false,false]);
});
test('archived screen rejects tampered ledger or duplicate IDs and quarantines truncation',()=>{
  const make=()=>({
    id:'trial',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots)
  });
  const changed=make();changed.publicRootLedgerSha256Reported='tampered';
  assert.throws(()=>screenArchivedReciprocalAttempts({attempts:[changed]}));
  const truncated=make();truncated.publicRootActionsTruncated=true;
  const screened=screenArchivedReciprocalAttempts({attempts:[truncated]});
  assert.equal(screened.attemptedContexts,1);
  assert.equal(screened.quarantinedContexts,1);
  assert.equal(screened.anyGeneralSequenceContexts,0);
  assert.match(screened.rows[0].archiveIntegrity,/QUARANTINED/);
  assert.throws(()=>screenArchivedReciprocalAttempts({attempts:[make(),make()]}));
});

test('native source-attack settlement must complete before observed reply root',()=>{
  const packet={
    id:'settled-episode',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots),
    actualSourceAttackSettlement:{attacks:[{
      actionOrdinal:0,settledPromptChain:true,completionRootOrdinal:0,
      prizesBefore:[6,6],prizesAfter:[5,6]
    }]}
  };
  let result=screenArchivedReciprocalAttempts({attempts:[packet]});
  assert.equal(result.attackAnchorSettledBeforeReplyContexts,1);
  assert.equal(result.rows[0].settledSourceAttackPrizeChange,1);
  packet.actualSourceAttackSettlement.attacks[0].completionRootOrdinal=1;
  result=screenArchivedReciprocalAttempts({attempts:[packet]});
  assert.equal(result.attackAnchorSettledBeforeReplyContexts,0);
  assert.equal(result.rows[0].settledSourceAttackPrizeChange,null);
});
test('an archived AttackAction declaration alone cannot assert settled counterplay',()=>{
  const packet={
    id:'unsettled',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots),
    actualSourceAttackSettlement:{attacks:[{
      actionOrdinal:0,settledPromptChain:false,completionRootOrdinal:null
    }]}
  };
  const report=screenArchivedReciprocalAttempts({attempts:[packet]});
  assert.equal(report.anySourceAttackSequenceContexts,1);
  assert.equal(report.attackAnchorSettledBeforeReplyContexts,0);
  assert.equal(report.competitiveGamesQualified,0);
});

test('a zero-heal Tapu Cure-GX AttackAction never passes as material',()=>{
  const before=trialFor();
  const cure=before.actionCertificates[0];
  cure.consequenceType='damage-transition';
  cure.effectWitness.type='damage-transition';
  cure.effectWitness.changedUnits=0;
  assert.equal(verifiedMaterialTransition(cure),false);
  assert.equal(certifiedMaterialChoice(cure,roots[0]),false);
  const result=evaluateBilateralCompetence(before);
  assert.equal(result.structuralGatePassed,false);
  assert.equal(result.reciprocalEpisodeObserved,false);
  assert.equal(result.competitiveAdmission,false);
});
test('an energy or GX resource paid only as a no-op cost is not an effect witness',()=>{
  const before=trialFor();
  before.actionCertificates[0].effectWitness.costPaymentOnly=true;
  assert.equal(verifiedMaterialTransition(before.actionCertificates[0]),false);
  assert.equal(evaluateBilateralCompetence(before).reciprocalEpisodeObserved,false);
  before.actionCertificates[0].effectWitness.costPaymentOnly=false;
  before.actionCertificates[0].consequenceType='settled-attack';
  before.actionCertificates[0].effectWitness.type='settled-attack';
  assert.equal(verifiedMaterialTransition(before.actionCertificates[0]),false);
});
test('unanchored or identical native before-and-after receipts fail material audit',()=>{
  const before=trialFor();
  const c=before.actionCertificates[0];
  c.effectWitness.sourceActionRootOrdinal=5;
  assert.equal(verifiedMaterialTransition(c),false);
  c.effectWitness.sourceActionRootOrdinal=c.rootOrdinal;
  c.effectWitness.afterStateEvidenceRef=c.effectWitness.beforeStateEvidenceRef;
  assert.equal(verifiedMaterialTransition(c),false);
});
test('positive damage, healing, or information changes require verified units and receipts',()=>{
  const before=trialFor();
  const cert=before.actionCertificates[0];
  assert.equal(verifiedMaterialTransition(cert),true);
  cert.consequenceType='information-transition';
  cert.effectWitness.type='information-transition';
  cert.effectWitness.changedUnits=3;
  assert.equal(verifiedMaterialTransition(cert),true);
  cert.effectWitness.paperRelevantTransition=false;
  assert.equal(verifiedMaterialTransition(cert),false);
});

test('all actual attempted error and cap rows retain denominators even without a ledger',()=>{
  const verified={
    id:'cap',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots)
  };
  const abort={
    id:'engine-error',status:'engine-error',
    originalSourceSeat:1,candidateSeat:0,
    publicRootActionsTruncated:true,publicRootActions:null,
    publicRootActionCount:null
  };
  const result=screenArchivedReciprocalAttempts({attempts:[verified,abort]});
  assert.equal(result.attemptedContexts,2);
  assert.equal(result.verifiedRootLedgerContexts,1);
  assert.equal(result.quarantinedContexts,1);
  assert.equal(result.anyGeneralSequenceContexts,1);
  assert.equal(result.rows[1].disposition,'engine-error');
  assert.equal(result.rows[1].generalSequence,null);
  assert.equal(result.rows[1].competitiveAdmission,false);
});

test('actual native public defender damage delta is measurable but not physical identity proof',()=>{
  const attack={
    settledPromptChain:true,
    publicBoardBefore:[{active:{printing:'Attacker',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:0}}],
    publicBoardAfter:[{active:{printing:'Attacker',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:20}}]
  };
  const w=screenPublicDefenderDamageChange(attack,1);
  assert.equal(w.addedDamage,20);
  assert.equal(w.damageCounterDelta,2);
  assert.equal(w.exactPhysicalCardIdentityProven,false);
  assert.equal(w.printedPaperLegalityVerified,false);
  attack.publicBoardAfter[1].active.printing='Different Active';
  assert.equal(screenPublicDefenderDamageChange(attack,1),null);
  attack.publicBoardAfter[1].active.printing='Dialga-GX UPR';
  attack.publicBoardAfter[1].active.damage=0;
  assert.equal(screenPublicDefenderDamageChange(attack,1),null);
});
test('archived real settled source attack can emit a public delta while remaining unqualified',()=>{
  const attack={
    actionOrdinal:0,settledPromptChain:true,completionRootOrdinal:0,
    prizesBefore:[6,6],prizesAfter:[6,6],
    publicBoardBefore:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Duskull VIV',damage:0}}],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Duskull VIV',damage:10}}]
  };
  const attempt={
    id:'real-like-archive',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots),
    actualSourceAttackSettlement:{attacks:[attack]}
  };
  const report=screenArchivedReciprocalAttempts({attempts:[attempt]});
  assert.equal(report.publicPositiveDamageBeforeReplyContexts,1);
  assert.equal(report.rows[0].observedPublicDefenderDamage.damageCounterDelta,1);
  assert.equal(report.rows[0].competitiveAdmission,false);
  assert.equal(report.competitiveGamesQualified,0);
});

function materialReplyFixture(replyCard,kind){
  const cards=[
    {actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction',attack:'Motivate'},
    {actionOrdinal:1,turnBefore:5,playerSlot:1,action:'PlayCardAction',card:replyCard},
    {actionOrdinal:2,turnBefore:6,playerSlot:0,action:'AttackAction',attack:'Motivate'}
  ];
  const before={active:{printing:'Dialga-GX UPR',damage:20,
    energyCards:['Psychic Energy']},bench:[]};
  const after={active:{printing:'Dialga-GX UPR',damage:20,
    energyCards:kind==='energy'?['Psychic Energy','Psychic Energy']:['Psychic Energy']},
    bench:kind==='bench'?[{printing:'Trevenant & Dusknoir-GX SMP'}]:[]};
  const first={actionOrdinal:0,settledPromptChain:true,completionRootOrdinal:0,
    publicBoardBefore:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:0}}],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},before]};
  const second={actionOrdinal:2,settledPromptChain:true,completionRootOrdinal:2,
    publicBoardBefore:[{active:{printing:'Source',damage:0}},after],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:40}}]};
  return {originalSourceSeat:0,candidateSeat:1,publicRootActions:cards,
    actualSourceAttackSettlement:{attacks:[first,second]}};
}
test('sole real card play joins native active Energy custody and two settled attacks',()=>{
  const row=materialReplyFixture('Psychic Energy','energy');
  const r=screenNativeMaterialReciprocalExchange(row);
  assert.equal(r?.opponentReplyKind,'attached-active-energy');
  assert.equal(r?.observedCard,'Psychic Energy');
  assert.equal(r?.opponentActiveEnergiesBefore,1);
  assert.equal(r?.opponentActiveEnergiesAfter,2);
  assert.equal(r?.initialSourceDamage,20);
  assert.equal(r?.returnSourceDamage,20);
  assert.equal(r?.paperQualified,false);
});
test('sole real card play joins native Bench transition and two settled attacks',()=>{
  const row=materialReplyFixture('Trevenant & Dusknoir-GX','bench');
  const r=screenNativeMaterialReciprocalExchange(row);
  assert.equal(r?.opponentReplyKind,'benched-pokemon');
  assert.equal(r?.opponentBenchCountBefore,0);
  assert.equal(r?.opponentBenchCountAfter,1);
  assert.equal(r?.physicalCardIdentityCertified,false);
});
test('wrong reply or extra independent card play breaks sole-action attribution',()=>{
  const row=materialReplyFixture('Energy Recycler','energy');
  assert.equal(screenNativeMaterialReciprocalExchange(row),null);
  row.publicRootActions[1].card='Psychic Energy';
  row.publicRootActions.splice(2,0,
    {actionOrdinal:99,turnBefore:5,playerSlot:1,action:'PlayCardAction',
      card:'Item'});
  assert.equal(screenNativeMaterialReciprocalExchange(row),null);
});
test('unsettled return and absent positive source effect are not exchanges',()=>{
  const row=materialReplyFixture('Psychic Energy','energy');
  row.actualSourceAttackSettlement.attacks[1].settledPromptChain=false;
  assert.equal(screenNativeMaterialReciprocalExchange(row),null);
  row.actualSourceAttackSettlement.attacks[1].settledPromptChain=true;
  row.actualSourceAttackSettlement.attacks[1].publicBoardAfter[1].active.damage=20;
  assert.equal(screenNativeMaterialReciprocalExchange(row),null);
});

test('two Psychic basics cannot pay any Dialga-GX UPR printed Metal attack',()=>{
  const card={energyCards:['Psychic Energy','Psychic Energy'],printedAttacks:[
    {name:'Overclock',cost:[8]},
    {name:'Shred',cost:[8,9,9]},
    {name:'Timeless-GX',cost:[8,8,8,9,9]}]};
  const r=screenUnmodifiedPrintedCosts(card);
  assert.equal(r.attachedBasicEnergyCount,2);
  assert.equal(r.unmodifiedPrintedAttacks.length,3);
  assert.equal(r.anyUnmodifiedPrintedAttackPayable,false);
  assert.equal(r.externalCostModifiersAudited,false);
  card.energyCards[1]='Metal Energy';
  assert.equal(screenUnmodifiedPrintedCosts(card).anyUnmodifiedPrintedAttackPayable,true);
});
test('Psychic and Colorless costs require actual matching type and card count',()=>{
  const trev={energyCards:[],printedAttacks:[
    {name:'Night Watch',cost:[5,5,5]},
    {name:'Pale Moon-GX',cost:[5,9]}
  ]};
  assert.equal(screenUnmodifiedPrintedCosts(trev).anyUnmodifiedPrintedAttackPayable,false);
  trev.energyCards=['Psychic Energy','Darkness Energy'];
  const r=screenUnmodifiedPrintedCosts(trev);
  assert.equal(r.unmodifiedPrintedAttacks[0].unmodifiedBasicEnergyPayable,false);
  assert.equal(r.unmodifiedPrintedAttacks[1].unmodifiedBasicEnergyPayable,true);
});
test('unknown Special Energy returns unknown rather than invented typed payment',()=>{
  const card={energyCards:['Double Dragon Energy'],printedAttacks:[
    {name:'Costly',cost:[5,9]}
  ]};
  assert.equal(screenUnmodifiedPrintedCosts(card),null);
});
test('the observed Dark basic funds unmodified Colorless attacks',()=>{
  const source={energyCards:['Darkness Energy'],printedAttacks:[
    {name:'Motivate',cost:[9]}
  ]};
  assert.equal(screenUnmodifiedPrintedCosts(source).
    anyUnmodifiedPrintedAttackPayable,true);
});

test('authenticated v8 abort prefix recovers source physical seat from native provenance',()=>{
  const attempt={
    id:'6:210:B:new-moon-lockbreaker-v1',
    status:'engine-error',originalSourceSeat:null,candidateSeat:null,
    sourceDealFingerprint:'a'.repeat(64),
    nativeAbortProvenance:{sourceSeat:0,
      sourceDealStatus:'VERIFIED',fullPhysicalDealStatus:'VERIFIED'},
    publicRootActionsTruncated:false,
    publicRootActions:roots,publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots)
  };
  const r=screenArchivedReciprocalAttempts({attempts:[attempt]});
  assert.equal(r.attemptedContexts,1);
  assert.equal(r.verifiedRootLedgerContexts,1);
  assert.equal(r.quarantinedContexts,0);
  assert.equal(r.rows[0].sourceSeat,0);
  assert.equal(r.rows[0].opponentSeat,1);
  assert.equal(r.rows[0].seatProvenance,'native-abort-provenance');
  assert.deepEqual(r.rows[0].generalSequence?.source.ordinal,0);
  assert.equal(r.rows[0].competitiveAdmission,false);
  assert.equal(r.competitiveGamesQualified,0);
});

test('no native physical-seat provenance preserves error as an unqualified quarantine',()=>{
  const attempt={
    id:'unverified-abort',status:'engine-error',
    originalSourceSeat:null,candidateSeat:null,
    publicRootActionsTruncated:false,publicRootActions:roots,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:rootDigest(roots),
    publicRootLedgerSha256Reported:rootDigest(roots)
  };
  const r=screenArchivedReciprocalAttempts({attempts:[attempt]});
  assert.equal(r.attemptedContexts,1);
  assert.equal(r.quarantinedContexts,1);
  assert.equal(r.verifiedRootLedgerContexts,0);
  assert.equal(r.rows[0].rootActionLedgerSha256,rootDigest(roots));
  assert.equal(r.rows[0].sourceAttackSequence,null);
  assert.match(r.rows[0].archiveIntegrity,/QUARANTINED/);
});

test('normal and native-abort physical-seat contradiction rejects',()=>{
  assert.deepEqual(archivedPhysicalSeats({
    originalSourceSeat:1,candidateSeat:0,
    sourceDealFingerprint:'b'.repeat(64),
    nativeAbortProvenance:{sourceSeat:1,sourceDealStatus:'VERIFIED'}
  }),{sourceSeat:1,opponentSeat:0,
    seatProvenance:'ordinary-native-seat+candidate-seat-complement+native-abort-provenance'});
  assert.throws(()=>archivedPhysicalSeats({
    originalSourceSeat:0,candidateSeat:1,
    sourceDealFingerprint:'b'.repeat(64),
    nativeAbortProvenance:{sourceSeat:1,sourceDealStatus:'VERIFIED'}
  }),/Contradictory real native/);
  assert.throws(()=>archivedPhysicalSeats({
    originalSourceSeat:2,candidateSeat:null
  }),/physical seat/);
});

test('registration-derived abort seat cannot authenticate an unobserved source deal',()=>{
  for(const sourceDealStatus of ['NOT_CAPTURED','NO_VERIFIED_RECEIPT',
    'SOURCE_SEAT_MISMATCH',undefined]) {
    const attempt={
      id:'rank11-native-error',status:'engine-error',
      originalSourceSeat:null,candidateSeat:null,
      sourceDealFingerprint:'a'.repeat(64),
      nativeAbortProvenance:{sourceSeat:0,sourceDealStatus},
      publicRootActionsTruncated:false,publicRootActions:roots,
      publicRootActionCount:roots.length,
      publicRootLedgerSha256Computed:rootDigest(roots),
      publicRootLedgerSha256Reported:rootDigest(roots)
    };
    const seats=archivedPhysicalSeats(attempt);
    assert.equal(seats.sourceSeat,null);
    assert.equal(seats.seatProvenance,'missing-physical-seat-proof');
    const screen=screenArchivedReciprocalAttempts({attempts:[attempt]});
    assert.equal(screen.verifiedRootLedgerContexts,0);
    assert.equal(screen.quarantinedContexts,1);
    assert.equal(screen.rows[0].competitiveAdmission,false);
  }
  const missingDigest=archivedPhysicalSeats({
    originalSourceSeat:null,candidateSeat:null,
    nativeAbortProvenance:{sourceSeat:0,sourceDealStatus:'VERIFIED'}
  });
  assert.equal(missingDigest.sourceSeat,null);
});


/** Build an independently asserted official end-call paper packet. */
function officialCallTrial(stage='open-top32',prizes=[2,3]){
  const trial=trialFor();
  trial.eventStage=stage;
  trial.clockDisposition='official-call';
  trial.clockReceiptId='clock/official-time-call';
  trial.noCallClockPacket=null;
  trial.nativeFinished=false;
  trial.nativeWinner=null;
  trial.nativeEndReason=null;
  trial.timeCallPacket={
    stage,firstPlayerSeat:1,turnOwnerWhenCalled:1,
    officialEndCallObserved:true,
    elapsedSecondsAtOfficialCall:stage==='open-final'?2100:1500,
    officialClockEvidenceRef:trial.clockReceiptId,
    stageEvidenceRef:'event/stage-pairing',
    firstPlayerEvidenceRef:'paper/starting-seat',
    turnOwnerWhenCalledEvidenceRef:'paper/end-call-seat',
    turnSequenceEvidenceRef:'paper/last-two-turns',
    independentPaperStateEvidenceRef:trial.paperReceiptId,
    paperStateIndependentlyReviewed:true,
    prizesRemaining:prizes,
    paperGameWinner:null,paperGameTie:false,
    finalPermittedTurnFinished:true,
    observedFinalTurnSeat:0,
    observedExtraSecondTurns:1,
    trailingPokemonCheckupWasExcluded:true
  };
  return trial;
}

test('Aichi official no-call packet works for Swiss, Top32 and final stages',()=>{
  for(const stage of ['open-swiss','open-top32','open-final']){
    const trial=trialFor();
    trial.eventStage=stage;
    trial.noCallClockPacket.stage=stage;
    const result=evaluateBilateralCompetence(trial);
    assert.equal(verifiedOfficialAichiClock(trial),true,stage);
    assert.equal(result.officialClockAudit,true,stage);
    assert.equal(result.officialClockLimitMinutes,
      stage==='open-final'?35:25);
    assert.equal(result.structuralGatePassed,true,stage);
    assert.equal(result.competitiveAdmission,false);
  }
});

test('30-minute no-call natural terminal is before final limit but after Top32 limit',()=>{
  const trial=trialFor();
  trial.eventStage='open-final';
  trial.noCallClockPacket.stage='open-final';
  trial.noCallClockPacket.elapsedSecondsAtNaturalTerminal=1800;
  assert.equal(verifiedOfficialAichiClock(trial),true);
  trial.eventStage='open-top32';
  trial.noCallClockPacket.stage='open-top32';
  assert.equal(verifiedOfficialAichiClock(trial),false);
  assert.equal(evaluateBilateralCompetence(trial).structuralGatePassed,false);
});

test('official Top32 knockout prize lead can finish an unexpired native game',()=>{
  const trial=officialCallTrial();
  const result=evaluateBilateralCompetence(trial);
  assert.equal(result.nativeTerminal,false);
  assert.equal(result.gameOutcomeResolved,true);
  assert.equal(result.officialClockAudit,true);
  assert.equal(result.officialClockStatus,'ELIMINATION_PRIZE_LEAD');
  assert.equal(result.conditionallyAdjudicatedPaperWinnerSeat,0);
  assert.equal(result.structuralGatePassed,true);
  assert.equal(result.competitiveAdmission,false);
});

test('Swiss official time call retains both-loss rather than inventing winner',()=>{
  const trial=officialCallTrial('open-swiss',[2,3]);
  const result=evaluateBilateralCompetence(trial);
  assert.equal(result.officialClockAudit,true);
  assert.equal(result.conditionalPaperOutcome,'both-loss');
  assert.equal(result.conditionallyAdjudicatedPaperWinnerSeat,null);
  assert.equal(result.gameOutcomeResolved,true);
  assert.equal(result.structuralGatePassed,true);
});

test('knockout both-high Prize branch requires complete extension ledger',()=>{
  const trial=officialCallTrial('open-top32',[3,4]);
  assert.equal(verifiedOfficialAichiClock(trial),false);
  trial.extensionLedgerPacket={
    extensionLedgerEvidenceRef:'paper/complete-extension',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[{
      sequence:1,beforePrizes:[3,4],afterPrizes:[2,4],
      transitionEvidenceRef:'paper/extension-move1'
    }]
  };
  const result=evaluateBilateralCompetence(trial);
  assert.equal(result.officialClockAudit,true);
  assert.equal(result.officialClockStatus,'EXTENSION_WIN');
  assert.equal(result.conditionallyAdjudicatedPaperWinnerSeat,0);
  assert.equal(result.structuralGatePassed,true);
  trial.extensionLedgerPacket.transitions[0].sequence=2;
  assert.equal(verifiedOfficialAichiClock(trial),false);
});

test('official Aichi call must meet the stage-specific elapsed clock limit',()=>{
  const early=officialCallTrial('open-final');
  early.timeCallPacket.elapsedSecondsAtOfficialCall=2099;
  assert.equal(verifiedOfficialAichiClock(early),false);
  assert.equal(evaluateBilateralCompetence(early).officialClockAudit,false);
  const atLimit=officialCallTrial('open-final');
  atLimit.timeCallPacket.elapsedSecondsAtOfficialCall=2100;
  assert.equal(verifiedOfficialAichiClock(atLimit),true);
  assert.equal(evaluateBilateralCompetence(atLimit).officialClockAudit,true);
  const swissEarly=officialCallTrial('open-swiss');
  swissEarly.timeCallPacket.elapsedSecondsAtOfficialCall=1499;
  assert.equal(verifiedOfficialAichiClock(swissEarly),false);
});

test('resolved official calls reject extraneous extension ledgers',()=>{
  const swiss=officialCallTrial('open-swiss',[3,3]);
  swiss.extensionLedgerPacket={transitions:[]};
  const swissAudit=inspectOfficialAichiClock(swiss);
  assert.equal(swissAudit.schema,'agent45-aichi-clock-receipt-adapter-v3');
  assert.equal(swissAudit.shapeComplete,false);
  assert.equal(swissAudit.status,'UNEXPECTED_EXTENSION_LEDGER_FOR_RESOLVED_CALL');
  assert.equal(verifiedOfficialAichiClock(swiss),false);
  assert.equal(evaluateBilateralCompetence(swiss).officialClockAudit,false);

  const knockout=officialCallTrial('open-top32',[2,3]);
  knockout.extensionLedgerPacket={transitions:[]};
  const knockoutAudit=inspectOfficialAichiClock(knockout);
  assert.equal(knockoutAudit.shapeComplete,false);
  assert.equal(knockoutAudit.status,'UNEXPECTED_EXTENSION_LEDGER_FOR_RESOLVED_CALL');
  assert.equal(verifiedOfficialAichiClock(knockout),false);
});

test('official Aichi call rejects stage mismatch and wrong clock or paper source',()=>{
  const trial=officialCallTrial();
  trial.timeCallPacket.stage='open-final';
  assert.equal(verifiedOfficialAichiClock(trial),false);
  trial.timeCallPacket.stage='open-top32';
  trial.timeCallPacket.officialClockEvidenceRef='wrong';
  assert.equal(verifiedOfficialAichiClock(trial),false);
  trial.timeCallPacket.officialClockEvidenceRef=trial.clockReceiptId;
  trial.timeCallPacket.independentPaperStateEvidenceRef='wrong';
  assert.equal(verifiedOfficialAichiClock(trial),false);
});

test('missing original no-call coverage cannot be relabeled as no official call',()=>{
  const trial=trialFor();
  trial.noCallClockPacket.officialClockCoverageEvidenceRef='';
  assert.equal(verifiedOfficialAichiClock(trial),false);
  trial.noCallClockPacket.officialClockCoverageEvidenceRef='clock/continuous-coverage';
  trial.noCallClockPacket.officialEndCallObserved=true;
  assert.equal(verifiedOfficialAichiClock(trial),false);
  trial.noCallClockPacket.officialEndCallObserved=false;
  trial.clockReceiptId='clock/missing-call-conflict';
  assert.equal(verifiedOfficialAichiClock(trial),false);
});

test('native winner and claimed no-call paper outcome must agree',()=>{
  const trial=trialFor();
  trial.noCallClockPacket.paperGameWinner=1;
  assert.equal(verifiedOfficialAichiClock(trial),true);
  assert.equal(evaluateBilateralCompetence(trial).officialClockAudit,false);
  assert.equal(evaluateBilateralCompetence(trial).structuralGatePassed,false);
});

test('native engine errors and action caps never become official time calls',()=>{
  for(const key of ['engineError','rootCapReached']){
    const trial=officialCallTrial();
    trial[key]=true;
    const result=evaluateBilateralCompetence(trial);
    assert.equal(result.officialClockAudit,false,key);
    assert.equal(result.structuralGatePassed,false,key);
  }
});

test('a natural native terminal after official call requires a compatible paper winner',()=>{
  const trial=officialCallTrial();
  trial.nativeFinished=true;
  trial.nativeWinner=0;
  trial.nativeEndReason='engine-game-end';
  trial.timeCallPacket.paperGameWinner=0;
  assert.equal(evaluateBilateralCompetence(trial).officialClockAudit,true);
  trial.timeCallPacket.paperGameWinner=1;
  assert.equal(evaluateBilateralCompetence(trial).officialClockAudit,false);
});

test('legacy clock boolean and wrong scorer revision cannot satisfy receipt gate',()=>{
  const trial=trialFor();
  delete trial.noCallClockPacket;
  trial.official25MinuteClockAudit=true;
  assert.equal(verifiedOfficialAichiClock(trial),false);
  const second=trialFor();
  second.adjudicationProtocolSha='unrelated-old-scoring-revision';
  assert.equal(verifiedOfficialAichiClock(second),false);
  second.adjudicationProtocolSha=aichiClockProtocolSha256();
  assert.equal(inspectOfficialAichiClock(second).shapeComplete,true);
});

test('missing independent paper, clock, or reviewer claim fails closed',()=>{
  const fields=['officialClockCoverageEvidenceRef','stageEvidenceRef',
    'paperTerminalEvidenceRef','independentReviewEvidenceRef',
    'noCallCoverageIndependentlyReviewed','paperStateIndependentlyReviewed'];
  for(const field of fields){
    const trial=trialFor();
    trial.noCallClockPacket[field]=
      field.endsWith('IndependentlyReviewed')?false:'';
    assert.equal(verifiedOfficialAichiClock(trial),false,field);
  }
  const trial=trialFor();
  trial.eventStage='unknown';
  assert.equal(verifiedOfficialAichiClock(trial),false);
});

test('disputed or uncategorized clock states remain non-admitting',()=>{
  for(const disposition of ['disputed','unverified','capped','engine-only',null]){
    const trial=trialFor();
    trial.clockDisposition=disposition;
    assert.equal(verifiedOfficialAichiClock(trial),false,String(disposition));
    assert.equal(evaluateBilateralCompetence(trial).structuralGatePassed,false);
  }
});
