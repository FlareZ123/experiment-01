'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {auditTimeCallPacket} = require('../../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs');

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
    officialClockEvidenceRef:'   ',firstPlayerEvidenceRef:' ',
    turnOwnerWhenCalledEvidenceRef:'  ',turnSequenceEvidenceRef:'   ',
    independentPaperStateEvidenceRef:' ',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,3],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:1,
    observedExtraSecondTurns:1,trailingPokemonCheckupWasExcluded:true});
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('official-clock-source-not-cited'));
  assert.ok(r.missing.includes('original-first-player-source-missing'));
  assert.ok(r.missing.includes('end-call-turn-owner-source-missing'));
  assert.ok(r.missing.includes('final-turn-sequence-source-missing'));
  assert.ok(r.missing.includes('independent-paper-state-source-missing'));
});
