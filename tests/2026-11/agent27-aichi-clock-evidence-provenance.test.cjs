'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {auditTimeCallPacket,adjudicateExtension,auditExtensionLedger} = require('../../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs');

/** @param {[number,number]} prizes @returns {object} */
function makeTimeCallPacket(prizes) {
  return {stage:'open-top32',firstPlayerSeat:0,turnOwnerWhenCalled:0,
    officialEndCallObserved:true,officialClockEvidenceRef:'official-clock-record',
    stageEvidenceRef:'official-round-pairing',
    firstPlayerEvidenceRef:'original-starter-record',
    turnOwnerWhenCalledEvidenceRef:'call-turn-owner-record',
    turnSequenceEvidenceRef:'ordered-turn-sequence',
    independentPaperStateEvidenceRef:'independent-paper-state',
    paperStateIndependentlyReviewed:true,prizesRemaining:prizes,
    finalPermittedTurnFinished:true,observedFinalTurnSeat:1,
    observedExtraSecondTurns:1,trailingPokemonCheckupWasExcluded:true};
}

/**
 * @param {number} sequence
 * @param {[number,number]} beforePrizes
 * @param {[number,number]} afterPrizes
 * @param {object} [outcome]
 * @returns {object}
 */
function extensionTransition(sequence,beforePrizes,afterPrizes,outcome={}) {
  return {sequence,beforePrizes,afterPrizes,
    transitionEvidenceRef:`ordered-ledger-transition-${sequence}`,...outcome};
}


test('Audit refuses an ungrounded end-call turn owner even when a paper win is supplied',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,officialEndCallObserved:true,
    officialClockEvidenceRef:'official-judge-reference',
    firstPlayerEvidenceRef:'initial-game-proof',
    independentPaperStateEvidenceRef:'reviewed-game-over-effect',
    paperStateIndependentlyReviewed:true,prizesRemaining:[3,3],
    paperGameWinner:1,finalPermittedTurnFinished:false});
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('end-call-turn-owner-source-missing'));
  assert.equal(r.conditionalWinnerSeat,null);
});

test('Audit refuses missing final-turn sequence provenance despite complete turn claims',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,officialEndCallObserved:true,
    officialClockEvidenceRef:'official-judge-reference',
    firstPlayerEvidenceRef:'initial-game-proof',
    turnOwnerWhenCalledEvidenceRef:'actual-call-turn-owner-ledger',
    independentPaperStateEvidenceRef:'complete-paper-game-state',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,3],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:1,
    observedExtraSecondTurns:1,trailingPokemonCheckupWasExcluded:true});
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('final-turn-sequence-source-missing'));
  assert.equal(r.conditionalWinnerSeat,null);
});

test('Audit rejects whitespace-only evidence references',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,officialEndCallObserved:true,
    officialClockEvidenceRef:'   ',stageEvidenceRef:' ',firstPlayerEvidenceRef:' ',
    turnOwnerWhenCalledEvidenceRef:'  ',turnSequenceEvidenceRef:'   ',
    independentPaperStateEvidenceRef:' ',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,3],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:1,
    observedExtraSecondTurns:1,trailingPokemonCheckupWasExcluded:true});
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('official-clock-source-not-cited'));
  assert.ok(r.missing.includes('official-stage-source-not-cited'));
  assert.ok(r.missing.includes('original-first-player-source-missing'));
  assert.ok(r.missing.includes('end-call-turn-owner-source-missing'));
  assert.ok(r.missing.includes('final-turn-sequence-source-missing'));
  assert.ok(r.missing.includes('independent-paper-state-source-missing'));
  assert.ok(r.missing.includes('official-stage-source-not-cited'));
});


test('Extension ledger awards the first tied-low Prize transition',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[2,2],[2,1])]});
  assert.equal(result.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(result.terminalStatus,'EXTENSION_WIN');
  assert.equal(result.conditionalWinnerSeat,1);
  assert.equal(result.terminalSequence,1);
  assert.equal(result.requiresSixPrizeTiebreaker,false);
  assert.equal(result.competitiveAdmission,false);
});

test('Extension ledger applies the both-high condition across a continuous sequence',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[
      extensionTransition(1,[3,3],[2,2]),
      extensionTransition(2,[2,2],[1,2])
    ]});
  assert.equal(result.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(result.extensionRule,'both-high');
  assert.equal(result.terminalStatus,'EXTENSION_WIN');
  assert.equal(result.conditionalWinnerSeat,0);
  assert.equal(result.terminalSequence,2);
});

test('Extension ledger preserves independently proved paper wins and six-Prize tiebreakers',()=>{
  const win=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[3,3],[3,3],{paperGameWinner:1})]});
  assert.equal(win.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(win.terminalStatus,'NORMAL_PAPER_GAME_WIN');
  assert.equal(win.conditionalWinnerSeat,1);
  const tie=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[3,3],[3,3],{paperGameTie:true})]});
  assert.equal(tie.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(tie.terminalStatus,'TIEBREAKER_REQUIRED_SIX_PRIZE');
  assert.equal(tie.requiresSixPrizeTiebreaker,true);
  assert.equal(tie.conditionalWinnerSeat,null);
});

test('Extension ledger remains incomplete when the supplied history has no terminal state',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'partial-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[2,2],[2,2])]});
  assert.equal(result.status,'EXTENSION_LEDGER_INCOMPLETE');
  assert.equal(result.conditionalWinnerSeat,null);
  assert.equal(result.extensionLedgerShapeComplete,true);
});

test('Extension ledger requires its source and independent-review claim',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'   ',extensionLedgerIndependentlyReviewed:false,
    transitions:[extensionTransition(1,[2,2],[2,1])]});
  assert.equal(result.status,'INSUFFICIENT_EXTENSION_LEDGER_EVIDENCE');
  assert.ok(result.missing.includes('extension-ledger-source-not-cited'));
  assert.ok(result.missing.includes('extension-ledger-independent-review-pending'));
});

test('Extension ledger rejects sequence gaps, broken prize chains and missing transition references',()=>{
  const gap=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'ledger',extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(2,[2,2],[2,1])]});
  assert.equal(gap.status,'INVALID_EXTENSION_LEDGER_SHAPE');
  const broken=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'ledger',extensionLedgerIndependentlyReviewed:true,
    transitions:[
      extensionTransition(1,[2,2],[2,2]),
      extensionTransition(2,[2,1],[2,0],{paperGameWinner:1})
    ]});
  assert.equal(broken.status,'INVALID_EXTENSION_LEDGER_SHAPE');
  const noRef=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'ledger',extensionLedgerIndependentlyReviewed:true,
    transitions:[{sequence:1,beforePrizes:[2,2],afterPrizes:[2,1]}]});
  assert.equal(noRef.status,'INSUFFICIENT_EXTENSION_LEDGER_EVIDENCE');
  assert.ok(noRef.missing.includes('extension-transition-source-not-cited'));
});

test('Extension ledger refuses zero-Prize transitions without a paper outcome',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[3,3],[0,3])]});
  assert.equal(result.status,'EXTENSION_LEDGER_ZERO_PRIZE_WITHOUT_PAPER_OUTCOME');
  assert.equal(result.conditionalWinnerSeat,null);
});

test('Extension ledger rejects transitions after the first terminal state',()=>{
  const result=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,2]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[
      extensionTransition(1,[2,2],[2,1]),
      extensionTransition(2,[2,1],[1,1])
    ]});
  assert.equal(result.status,'EXTENSION_LEDGER_POST_TERMINAL_TRANSITION');
  assert.equal(result.terminalSequence,1);
  assert.equal(result.extraTransitions,1);
});

test('Extension ledger is not required outside an eligible knockout extension',()=>{
  const notRequired=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([2,3]),
    extensionLedgerEvidenceRef:'',extensionLedgerIndependentlyReviewed:false,transitions:[]});
  assert.equal(notRequired.status,'EXTENSION_LEDGER_NOT_REQUIRED');
  const packet=makeTimeCallPacket([2,2]);
  delete packet.turnSequenceEvidenceRef;
  const insufficient=auditExtensionLedger({timeCallPacket:packet,
    extensionLedgerEvidenceRef:'ledger',extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[2,2],[2,1])]});
  assert.equal(insufficient.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
});


test('Audit requires a source for the actual tournament stage',()=>{
  const packet=makeTimeCallPacket([2,3]);
  delete packet.stageEvidenceRef;
  const result=auditTimeCallPacket(packet);
  assert.equal(result.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(result.missing.includes('official-stage-source-not-cited'));
  assert.equal(result.conditionalWinnerSeat,null);
});


test('Extension ledger uses observed Prize states for multi-Prize and overkill deltas',()=>{
  const exact=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[3,3],[0,2],{paperGameWinner:0})]});
  assert.equal(exact.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(exact.terminalStatus,'NORMAL_PAPER_GAME_WIN');
  assert.equal(exact.conditionalWinnerSeat,0);
  const overkill=auditExtensionLedger({timeCallPacket:makeTimeCallPacket([3,3]),
    extensionLedgerEvidenceRef:'complete-extension-ledger',
    extensionLedgerIndependentlyReviewed:true,
    transitions:[extensionTransition(1,[3,3],[1,2])]});
  assert.equal(overkill.status,'EXTENSION_LEDGER_TERMINAL');
  assert.equal(overkill.terminalStatus,'EXTENSION_WIN');
  assert.equal(overkill.conditionalWinnerSeat,0);
});


test('Extension ledger wrapper agrees with per-state classifier over all Prize pairs for both entry rules',()=>{
  for(const [start,extensionRule] of [[[2,2],'tied-low'],[[3,3],'both-high']]){
    for(let a=0;a<=6;a++)for(let b=0;b<=6;b++){
      const after=[a,b];
      const outcome=a===0&&b===0?{paperGameTie:true}:
        a===0?{paperGameWinner:0}:b===0?{paperGameWinner:1}:{};
      const state=adjudicateExtension({extensionRule,prizesRemaining:after,...outcome});
      const ledger=auditExtensionLedger({timeCallPacket:makeTimeCallPacket(start),
        extensionLedgerEvidenceRef:'complete-extension-ledger',
        extensionLedgerIndependentlyReviewed:true,
        transitions:[extensionTransition(1,start,after,outcome)]});
      if(state.status==='EXTENSION_CONTINUES'){
        assert.equal(ledger.status,'EXTENSION_LEDGER_INCOMPLETE',`rule=${extensionRule} prizes=[${a},${b}]`);
        assert.equal(ledger.conditionalWinnerSeat,null);
      }else{
        assert.equal(ledger.status,'EXTENSION_LEDGER_TERMINAL',`rule=${extensionRule} prizes=[${a},${b}]`);
        assert.equal(ledger.terminalStatus,state.status);
        assert.equal(ledger.conditionalWinnerSeat,state.conditionalWinnerSeat);
      }
    }
  }
});
