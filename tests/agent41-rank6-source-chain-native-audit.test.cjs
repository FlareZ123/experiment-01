'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {auditRank6SourceNativeChain,summarizeRank6SourceNativeChains,
  SOURCE_PRINTED60_SHA256}=require(
  '../simulation/evaluation/agent41-rank6-source-chain-native-audit.cjs');
const fixture=require('../results/aichi-2026/agent41-rank6-source-native-slice-v1.json');

/** @param {number} index @returns {object} */
const clone=index=>structuredClone(fixture.rows[index]);

test('actual pinned four-arm rank6 source native slice preserves provenance',()=>{
  assert.equal(fixture.provenance.ciRun,41465829225);
  assert.equal(fixture.provenance.artifactId,13151571539);
  assert.equal(fixture.provenance.zipSha256,
    '19bb6b149afabc9b27c13707a2fa39421038fdcbdfe6da159659b692c19df3a2');
  assert.equal(fixture.provenance.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(fixture.rows.length,4);
  assert.ok(fixture.rows.every(r=>r.sourceDeckFingerprint===
    SOURCE_PRINTED60_SHA256));
  const summary=summarizeRank6SourceNativeChains(fixture.rows);
  assert.deepEqual(summary.counts,{
    NATIVE_SETTLED_WITH_REPLY_PAPER_UNQUALIFIED:2,
    GH_ROOT_NOT_SELECTED:2
  });
  assert.equal(summary.nativeSettledWithImmediateReply,2);
  assert.equal(summary.competitiveQualifiedGames,0);
  assert.equal(summary.paperPaymentVerified,0);
});

test('native source lines remain unqualified despite accepted prompts, Prize and reply',()=>{
  for(let i=0;i<2;i++){
    const result=auditRank6SourceNativeChain(clone(i));
    assert.equal(result.status,'NATIVE_SETTLED_WITH_REPLY_PAPER_UNQUALIFIED');
    assert.equal(result.nativeChainSettled,true);
    assert.equal(result.sourcePrizeDelta,1);
    assert.equal(result.opponentReplyAction,'PassTurnAction');
    assert.equal(result.paymentChoice.distinctPrintingNames,true);
    assert.equal(result.paymentChoice.discardZoneTransitionProven,false);
    assert.equal(result.physicalDiscardCustodyVerified,false);
    assert.equal(result.paperGameQualified,false);
    assert.equal(result.competitiveGameQualified,false);
  }
});

test('other actual physical seats are explicitly retained as no-GH-line arms',()=>{
  assert.equal(auditRank6SourceNativeChain(clone(2)).status,
    'GH_ROOT_NOT_SELECTED');
  assert.equal(auditRank6SourceNativeChain(clone(3)).status,
    'GH_ROOT_NOT_SELECTED');
});

test('original printing, registration and verified starter are mandatory',()=>{
  const row=clone(0);
  row.sourceDeckFingerprint='bad';
  assert.equal(auditRank6SourceNativeChain(row).status,'INVALID_REGISTRATION');
  row.sourceDeckFingerprint=SOURCE_PRINTED60_SHA256;
  row.trial.rank=5;
  assert.equal(auditRank6SourceNativeChain(row).status,'INVALID_REGISTRATION');
  row.trial.rank=6;
  row.candidateSeat=1;
  assert.equal(auditRank6SourceNativeChain(row).status,'INVALID_REGISTRATION');
  row.candidateSeat=0;
  row.verifiedFirstTurn=false;
  assert.equal(auditRank6SourceNativeChain(row).status,'INVALID_REGISTRATION');
});

test('Store-provenance and root ordinal conflicts cannot certify line',()=>{
  const row=clone(0);
  row.rootActionLedgerProtocol='diagnostic-only';
  assert.equal(auditRank6SourceNativeChain(row).status,'STORE_ROOTS_UNVERIFIED');
  row.rootActionLedgerProtocol='actual-store-root-action-ledger-v1';
  row.rootActionLedger[0].actionOrdinal=row.rootActionLedger[1].actionOrdinal;
  assert.equal(auditRank6SourceNativeChain(row).status,'STORE_ROOTS_UNVERIFIED');
});

test('accepted native GH root must be provenance-matched to the source seat',()=>{
  const row=clone(0);
  const event=row.nativeAcceptedTargetSidecar.events.find(event=>
    event.rootActionOrdinal===21 && event.declared?.ownerHandPrinting===
    'Guzma & Hala CEC');
  assert.ok(event);
  event.playerSlot=0;
  assert.equal(auditRank6SourceNativeChain(row).status,
    'GH_PHYSICAL_ROOT_UNVERIFIED');
});

test('mandatory two-card native payment choice and owner zone are checked',()=>{
  const row=clone(0);
  const paid=row.nativePromptChoices.events.find(event=>
    event.ordinal===23 && event.sourceZone==='hand');
  assert.ok(paid);
  paid.selectedCards.pop();
  assert.equal(auditRank6SourceNativeChain(row).status,
    'GH_NATIVE_PROMPT_CHOICES_UNVERIFIED');
  paid.selectedCards.push('Team Flare Grunt XY');
  paid.sourcePlayerSlot=0;
  assert.equal(auditRank6SourceNativeChain(row).status,
    'GH_NATIVE_PROMPT_CHOICES_UNVERIFIED');
});

test('same-printing costs are insufficient to prove two distinct physical cards',()=>{
  const row=clone(0);
  const paid=row.nativePromptChoices.events.find(event=>event.ordinal===23);
  paid.selectedCards=['Crushing Hammer POR','Crushing Hammer POR'];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'GH_PAYMENT_PHYSICAL_IDENTITY_UNVERIFIED');
});

test('search choice must actually contain both named resource printings',()=>{
  const row=clone(0);
  const search=row.nativePromptChoices.events.find(event=>event.ordinal===24);
  search.selectedCards=['Double Colorless Energy SUM'];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'GH_NATIVE_PROMPT_CHOICES_UNVERIFIED');
});

test('missing native DCE play blocks the entire resource-to-attack chain',()=>{
  const row=clone(0);
  row.rootActionLedger.find(root=>root.actionOrdinal===29).card='Capture Energy';
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_RESOURCE_TO_ATTACK_LINE_INCOMPLETE');
});

test('same attack declaration without settled Prize effect is insufficient',()=>{
  const row=clone(0);
  const attack=row.sourceAttackSettlement.attacks.find(event=>
    event.actionOrdinal===30);
  attack.prizesAfter=[6,6];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_NATIVE_ATTACK_PRIZE_UNVERIFIED');
  attack.prizesAfter=[6,5];
  attack.settlementCrossesClockReset=true;
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_NATIVE_ATTACK_PRIZE_UNVERIFIED');
});

test('actual source Active receives the DCE and Thunder Mountain is present',()=>{
  const row=clone(0);
  const board=row.sourceLinePacket.sourceImmediatePublicAttackTransition.before[1];
  board.active.energyCards=['Speed Lightning Energy'];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_ATTACK_ACTIVE_ENERGY_RECIPIENT_UNVERIFIED');
  board.active.energyCards.push('Double Colorless Energy');
  board.stadium=[];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_ATTACK_ACTIVE_ENERGY_RECIPIENT_UNVERIFIED');
});

test('disagreement between public settled Prize count and attack ledger is vetoed',()=>{
  const row=clone(0);
  row.sourceLinePacket.sourceImmediatePublicAttackTransition.settled.prizesRemaining=[6,6];
  assert.equal(auditRank6SourceNativeChain(row).status,
    'SOURCE_NATIVE_ATTACK_PRIZE_UNVERIFIED');
});

test('opponent reply must come from real next-turn native root after completion',()=>{
  const row=clone(0);
  row.sourceLinePacket.firstCandidateNextTurnRoot.turn=6;
  assert.equal(auditRank6SourceNativeChain(row).status,
    'IMMEDIATE_OPPONENT_ROOT_UNVERIFIED');
  row.sourceLinePacket.firstCandidateNextTurnRoot.turn=4;
  row.sourceLinePacket.firstCandidateNextTurnRoot.ordinal=31;
  assert.equal(auditRank6SourceNativeChain(row).status,
    'IMMEDIATE_OPPONENT_ROOT_UNVERIFIED');
});

test('an actual source reply Pass proves chronology only',()=>{
  const line=auditRank6SourceNativeChain(clone(0));
  assert.equal(line.opponentReplyAction,'PassTurnAction');
  assert.equal(line.paperGameQualified,false);
});
