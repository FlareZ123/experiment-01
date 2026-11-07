'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {stageRules,requiredTurnsAfterCall,adjudicateAtPrescribedEnd,
  adjudicateExtension,classifyTiebreaker,auditTimeCallPacket} =
  require('../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs');

test('Open Swiss and Top32 preliminary elimination are 25 minutes, final 35',()=>{
  assert.equal(stageRules('open-swiss').minutes,25);
  assert.equal(stageRules('open-top32').minutes,25);
  assert.equal(stageRules('open-final').minutes,35);
  assert.equal(stageRules('open-swiss').elimination,false);
  assert.equal(stageRules('open-top32').elimination,true);
  assert.throws(()=>stageRules('master-preliminary'),/Unknown/);
});

test('Time called during first starter turn: finish it then second turn',()=>{
  for(const firstPlayerSeat of [0,1]){
    const result=requiredTurnsAfterCall({stage:'open-swiss',firstPlayerSeat,
      turnOwnerWhenCalled:firstPlayerSeat});
    assert.equal(result.additionalSecondPlayerTurns,1);
    assert.equal(result.lastTurnSeat,1-firstPlayerSeat);
    assert.equal(result.applyPokemonCheckupAfterLastTurn,false);
  }
});

test('Time called during second starter turn: finish it, no extra turn',()=>{
  const result=requiredTurnsAfterCall({stage:'open-top32',
    firstPlayerSeat:1,turnOwnerWhenCalled:0});
  assert.equal(result.additionalSecondPlayerTurns,0);
  assert.equal(result.lastTurnSeat,0);
  assert.equal(result.clockLimitMinutes,25);
});

test('Native root cap before final prescribed turn does not adjudicate',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[1,5],secondPlayerTurnFinished:false});
  assert.equal(result.status,'AWAITING_PRESCRIBED_SECOND_TURN');
  assert.equal(result.conditionalWinnerSeat,null);
  assert.equal(result.competitiveAdmission,false);
});

test('Swiss timeout unresolved: BOTH lose, even with five-Prize advantage',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[1,6],secondPlayerTurnFinished:true});
  assert.equal(result.status,'SWISS_BOTH_LOSE');
  assert.equal(result.conditionalWinnerSeat,null);
});

test('Ordinary validated paper win is preserved during final permitted turn',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[0,6],secondPlayerTurnFinished:true,paperGameWinner:0});
  assert.equal(result.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(result.conditionalWinnerSeat,0);
  assert.equal(result.competitiveAdmission,false);
});

test('A paper-validated win ends game before prescribed second turn is reached',()=>{
  const r=adjudicateAtPrescribedEnd({stage:'open-top32',
    prizesRemaining:[5,6],secondPlayerTurnFinished:false,paperGameWinner:1});
  assert.equal(r.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(r.conditionalWinnerSeat,1);
  assert.equal(r.competitiveAdmission,false);
});

test('Top32 time branch: if one side has <=2 Prizes, lower side wins',()=>{
  for(const [prizes,expected] of [[[2,3],0],[[4,1],1],[[1,6],0]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'ELIMINATION_PRIZE_LEAD');
    assert.equal(r.conditionalWinnerSeat,expected);
  }
});

test('Top32 time branch: both tied at <=2 requires extension',()=>{
  for(const prizes of [[2,2],[1,1]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'EXTENSION_REQUIRED_TIED_LOW');
    assert.equal(r.extensionRule,'tied-low');
  }
});

test('Top32 time branch: both >=3 requires extension regardless initial lead',()=>{
  for(const prizes of [[3,3],[3,4],[6,5]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'EXTENSION_REQUIRED_BOTH_HIGH');
    assert.equal(r.extensionRule,'both-high');
  }
});

test('Elimination final uses same prize logic with 35-minute clock',()=>{
  const r=adjudicateAtPrescribedEnd({stage:'open-final',
    prizesRemaining:[2,4],secondPlayerTurnFinished:true});
  assert.equal(r.clockLimitMinutes,35);
  assert.equal(r.status,'ELIMINATION_PRIZE_LEAD');
  assert.equal(r.conditionalWinnerSeat,0);
});

test('Low tied extension ends at first divergent Prize count',()=>{
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[2,2]}).status,'EXTENSION_CONTINUES');
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[1,2]}).conditionalWinnerSeat,0);
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[2,1]}).conditionalWinnerSeat,1);
});

test('Both-high extension requires lead AND <=2 remaining Prizes',()=>{
  for(const prizes of [[3,4],[3,3],[2,2],[5,5]])
    assert.equal(adjudicateExtension({extensionRule:'both-high',
      prizesRemaining:prizes}).status,'EXTENSION_CONTINUES');
  const a=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[2,3]});
  assert.equal(a.status,'EXTENSION_WIN');
  assert.equal(a.conditionalWinnerSeat,0);
  const b=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[3,1]});
  assert.equal(b.conditionalWinnerSeat,1);
});

test('Normal paper victory during an extension terminates it regardless Prizes',()=>{
  const x=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[3,6],paperGameWinner:0});
  assert.equal(x.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(x.conditionalWinnerSeat,0);
});

test('Tied knockout game tiebreaker starts with six and first Prize lead wins',()=>{
  assert.equal(classifyTiebreaker([6,6]).conditionalWinnerSeat,null);
  assert.equal(classifyTiebreaker([5,6]).conditionalWinnerSeat,0);
  assert.equal(classifyTiebreaker([6,5]).conditionalWinnerSeat,1);
  assert.equal(classifyTiebreaker([5,5]).status,'TIEBREAKER_CONTINUES');
});
test('A paper-validated normal win overrides tiebreaker Prize-count comparison',()=>{
  const result=classifyTiebreaker([0,0],{paperGameWinner:1});
  assert.equal(result.status,'TIEBREAKER_NORMAL_PAPER_GAME_WIN');
  assert.equal(result.conditionalWinnerSeat,1);
});

test('A tied tiebreaker game requires a fresh six-Prize tiebreaker',()=>{
  const result=classifyTiebreaker([0,0],{paperGameTie:true});
  assert.equal(result.status,'TIEBREAKER_RESTART_REQUIRED_SIX_PRIZE');
  assert.equal(result.startingPrizeCount,6);
  assert.equal(result.conditionalWinnerSeat,null);
  assert.equal(classifyTiebreaker([5,6],{paperGameTie:true}).status,
    'TIEBREAKER_RESTART_REQUIRED_SIX_PRIZE');
});

test('Both-zero tiebreaker state without paper outcome is unresolved',()=>{
  const result=classifyTiebreaker([0,0]);
  assert.equal(result.status,'TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED');
  assert.equal(result.conditionalWinnerSeat,null);
  assert.equal(result.missing[0],'independent-normal-win-or-simultaneous-tie-ruling');
});

test('Reject contradictory paper outcomes for a knockout tiebreaker',()=>{
  assert.throws(()=>classifyTiebreaker([0,0],{paperGameWinner:0,paperGameTie:true}),/simultaneous/);
  assert.throws(()=>classifyTiebreaker([0,0],{paperGameWinner:2}),/winner seat/);
  assert.throws(()=>classifyTiebreaker([0,0],{paperGameTie:'true'}),/boolean/);
});

test('Every first-player and current-turn seat pair maps to the correct final turn',()=>{
  for(const firstPlayerSeat of [0,1])for(const turnOwnerWhenCalled of [0,1]){
    const r=requiredTurnsAfterCall({stage:'open-top32',firstPlayerSeat,turnOwnerWhenCalled});
    assert.equal(r.additionalSecondPlayerTurns,turnOwnerWhenCalled===firstPlayerSeat?1:0);
    assert.equal(r.lastTurnSeat,1-firstPlayerSeat);
    assert.equal(r.applyPokemonCheckupAfterLastTurn,false);
  }
});

test('All 49 legal Prize pairs remain conditional across knockout and extension branches',()=>{
  for(let a=0;a<=6;a++)for(let b=0;b<=6;b++){
    const knockout=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:[a,b],secondPlayerTurnFinished:true});
    assert.equal(knockout.competitiveAdmission,false);
    if(a===0||b===0)assert.equal(knockout.status,'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE');
    else if(Math.min(a,b)<=2)
      assert.equal(knockout.status,a===b?'EXTENSION_REQUIRED_TIED_LOW':'ELIMINATION_PRIZE_LEAD');
    else assert.equal(knockout.status,'EXTENSION_REQUIRED_BOTH_HIGH');

    const tiedLow=adjudicateExtension({extensionRule:'tied-low',prizesRemaining:[a,b]});
    assert.equal(tiedLow.competitiveAdmission,false);
    if(a===0||b===0)assert.equal(tiedLow.status,'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE');
    else assert.equal(tiedLow.status,a===b?'EXTENSION_CONTINUES':'EXTENSION_WIN');

    const bothHigh=adjudicateExtension({extensionRule:'both-high',prizesRemaining:[a,b]});
    assert.equal(bothHigh.competitiveAdmission,false);
    if(a===0||b===0)assert.equal(bothHigh.status,'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE');
    else assert.equal(bothHigh.status,Math.min(a,b)<=2&&a!==b?'EXTENSION_WIN':'EXTENSION_CONTINUES');
  }
});
test('Swiss time-call audit classifies an end-call paper tie as both loss',()=>{
  const r=auditTimeCallPacket({stage:'open-swiss',firstPlayerSeat:0,
    turnOwnerWhenCalled:1,officialEndCallObserved:true,
    officialClockEvidenceRef:'clock-claim',firstPlayerEvidenceRef:'starter-claim',
    turnOwnerWhenCalledEvidenceRef:'call-turn-owner-claim',
    independentPaperStateEvidenceRef:'tie-claim',paperStateIndependentlyReviewed:true,
    prizesRemaining:[0,0],paperGameTie:true});
  assert.equal(r.status,'SWISS_BOTH_LOSE');
  assert.equal(r.tieResolvedByClockRules,true);
  assert.equal(r.evidenceFieldsRemainExternallyAsserted,true);
  assert.equal(r.competitiveAdmission,false);
});
test('Reject missing or invalid physical Prize state and unknown result',()=>{
  assert.throws(()=>classifyTiebreaker([1,-1]),/Expected/);
  assert.throws(()=>classifyTiebreaker([7,1]),/Expected/);
  assert.throws(()=>classifyTiebreaker([2]),/Both physical/);
  assert.throws(()=>adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[2,2],secondPlayerTurnFinished:true,
    paperGameWinner:2}));
  assert.throws(()=>requiredTurnsAfterCall({stage:'open-top32',
    firstPlayerSeat:3,turnOwnerWhenCalled:0}));
});


test('Audit refuses missing official call and all ungrounded receipt strings',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,prizesRemaining:[1,4]});
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('official-end-call-not-observed'));
  assert.ok(r.missing.includes('independent-paper-state-source-missing'));
  assert.equal(r.conditionalWinnerSeat,null);
});

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

test('Audit rejects a wrong final-seat witness and extra turn count',()=>{
  const r=auditTimeCallPacket({
    stage:'open-top32',firstPlayerSeat:0,turnOwnerWhenCalled:0,
    officialEndCallObserved:true,officialClockEvidenceRef:'judge-record',
    firstPlayerEvidenceRef:'actual-initial-seat',
    turnOwnerWhenCalledEvidenceRef:'actual-call-turn-owner',
    independentPaperStateEvidenceRef:'paper-ledger',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,3],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:0,
    observedExtraSecondTurns:0,trailingPokemonCheckupWasExcluded:false
  });
  assert.equal(r.status,'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE');
  assert.ok(r.missing.includes('final-turn-custody-not-second-starting-player'));
  assert.ok(r.missing.includes('additional-second-player-turn-count-mismatch'));
  assert.ok(r.missing.includes('trailing-pokemon-checkup-must-be-excluded'));
});

test('Audited Swiss post-call packet classifies as both-loss conditionally',()=>{
  const r=auditTimeCallPacket({stage:'open-swiss',firstPlayerSeat:1,
    turnOwnerWhenCalled:0,officialEndCallObserved:true,
    officialClockEvidenceRef:'official-judge-reference',
    firstPlayerEvidenceRef:'initial-game-proof',
    turnOwnerWhenCalledEvidenceRef:'actual-call-turn-owner-ledger',
    independentPaperStateEvidenceRef:'complete-paper-game-state',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,6],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:0,
    observedExtraSecondTurns:0,trailingPokemonCheckupWasExcluded:true});
  assert.equal(r.status,'SWISS_BOTH_LOSE');
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.officialEndCallEvidenceShapeComplete,true);
  assert.equal(r.evidenceFieldsRemainExternallyAsserted,true);
  assert.equal(r.externalIndependentReviewRequired,true);
});

test('Audited Top32 post-call packet yields conditional Prize winner',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,officialEndCallObserved:true,
    officialClockEvidenceRef:'official-judge-reference',
    firstPlayerEvidenceRef:'initial-game-proof',
    turnOwnerWhenCalledEvidenceRef:'actual-call-turn-owner-ledger',
    independentPaperStateEvidenceRef:'complete-paper-game-state',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,3],
    finalPermittedTurnFinished:true,observedFinalTurnSeat:1,
    observedExtraSecondTurns:1,trailingPokemonCheckupWasExcluded:true});
  assert.equal(r.status,'ELIMINATION_PRIZE_LEAD');
  assert.equal(r.conditionalWinnerSeat,0);
  assert.equal(r.competitiveAdmission,false);
});

test('Proved paper winner ends overtime without waiting for other turn',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:1,
    turnOwnerWhenCalled:1,officialEndCallObserved:true,
    officialClockEvidenceRef:'official-judge-reference',
    firstPlayerEvidenceRef:'initial-game-proof',
    turnOwnerWhenCalledEvidenceRef:'actual-call-turn-owner-ledger',
    independentPaperStateEvidenceRef:'reviewed-game-over-effect',
    paperStateIndependentlyReviewed:true,prizesRemaining:[3,3],
    paperGameWinner:1,finalPermittedTurnFinished:false});
  assert.equal(r.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(r.conditionalWinnerSeat,1);
  assert.equal(r.competitiveAdmission,false);
});


test('A verified simultaneous knockout tie requires a fresh six-Prize tiebreaker',()=>{
  for(const stage of ['open-top32','open-final']){
    const r=adjudicateAtPrescribedEnd({stage,prizesRemaining:[1,3],
      secondPlayerTurnFinished:false,paperGameTie:true});
    assert.equal(r.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
    assert.equal(r.conditionalWinnerSeat,null);
    assert.equal(r.tieResolvedByClockRules,false);
    assert.equal(r.competitiveAdmission,false);
  }
});

test('Swiss simultaneous paper tie during the end-call sequence is both loss',()=>{
  const r=adjudicateAtPrescribedEnd({stage:'open-swiss',prizesRemaining:[0,0],
    secondPlayerTurnFinished:false,paperGameTie:true});
  assert.equal(r.status,'SWISS_BOTH_LOSE');
  assert.equal(r.conditionalWinnerSeat,null);
  assert.equal(r.tieResolvedByClockRules,true);
  assert.equal(r.competitiveAdmission,false);
});

test('Tied knockout overtime is a six-Prize new-game case',()=>{
  const r=adjudicateExtension({extensionRule:'both-high',prizesRemaining:[0,0],
    paperGameTie:true});
  assert.equal(r.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
  assert.equal(r.conditionalWinnerSeat,null);
});

test('Official end-call audit retains proved prior paper tie without invented winner',()=>{
  const r=auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:1,
    turnOwnerWhenCalled:1,officialEndCallObserved:true,
    officialClockEvidenceRef:'verified-official-judge-call',
    firstPlayerEvidenceRef:'independent-opening-seat-ledger',
    turnOwnerWhenCalledEvidenceRef:'independent-call-turn-owner-ledger',
    independentPaperStateEvidenceRef:'complete-simultaneous-KO-ledger',
    paperStateIndependentlyReviewed:true,prizesRemaining:[2,2],
    paperGameTie:true,finalPermittedTurnFinished:false});
  assert.equal(r.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.officialEndCallEvidenceShapeComplete,true);
  assert.equal(r.evidenceFieldsRemainExternallyAsserted,true);
  assert.equal(r.externalIndependentReviewRequired,true);
});

test('Reject simultaneously declaring a unique paper winner and paper tie',()=>{
  assert.throws(()=>adjudicateAtPrescribedEnd({stage:'open-top32',
    prizesRemaining:[2,2],secondPlayerTurnFinished:true,
    paperGameWinner:0,paperGameTie:true}),/simultaneous/);
  assert.throws(()=>adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[2,2],paperGameWinner:1,paperGameTie:true}),/simultaneous/);
  assert.throws(()=>auditTimeCallPacket({stage:'open-top32',firstPlayerSeat:0,
    turnOwnerWhenCalled:0,prizesRemaining:[2,2],
    paperGameWinner:0,paperGameTie:true}),/simultaneous/);
});

test('Zero physical Prizes without ordinary victory or tie vetoes a timed award',()=>{
  for(const stage of ['open-swiss','open-top32','open-final']){
    const r=adjudicateAtPrescribedEnd({stage,prizesRemaining:[0,5],
      secondPlayerTurnFinished:true});
    assert.equal(r.status,'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE');
    assert.equal(r.conditionalWinnerSeat,null);
    assert.equal(r.competitiveAdmission,false);
  }
});

test('Zero physical Prizes without ordinary outcome vetoes extension victory',()=>{
  const r=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[0,2]});
  assert.equal(r.status,'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE');
  assert.equal(r.conditionalWinnerSeat,null);
});

test('Proved simultaneous zero-Prize natural tie overrides conflicting Prize lead',()=>{
  const r=adjudicateAtPrescribedEnd({stage:'open-top32',prizesRemaining:[0,0],
    secondPlayerTurnFinished:false,paperGameTie:true});
  assert.equal(r.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
});
