'use strict';

const assert=require('node:assert/strict');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {terminalSignatures}=require('./terminal-signatures.cjs');
const {publicDecisionDifference}=require('./public-decision-prefix.cjs');

/** Replay the exact physical-A rank-8 source/Lockbreaker pair without injecting cards. */
function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const opponent=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(x=>x.rank===8);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const seed=1655907393;
  const archive={
    source:{winner:0,turns:60,prizes:[6,6]},
    lockbreak:{winner:1,turns:40,prizes:[6,0]}
  };
  const traces=[];
  const rows=['source','lockbreak'].map(variant=>{
    const game=runMatch({
      deckA:slots[variant],deckB:opponent.cards,seed,maxActions:350,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true,isolatePolicyRandomness:true,
      pendingEndTurnSwitchCleanupCorrection:true,
      captureDecisionTrace:true,captureCopycatTurnStartSeat:0
    });
    assert.equal(game.firstTurnSlot,0);
    assert.equal(game.verifiedByDrawLog,true);
    traces.push(game.decisionTrace);
    const expected=archive[variant];
    const played=Object.fromEntries(['Field Blower','Canceling Cologne']
      .map(name=>[name,Object.entries(game.cardsPlayedBySeat[0])
        .filter(([c])=>c.startsWith(name))
        .reduce((n,[,count])=>n+count,0)]));
    return {
      variant,seed,firstTurnSlot:game.firstTurnSlot,deckHashes:game.deckHashes,
      policy:game.rules.policy,finished:game.finished,
      winner:game.winner,turns:game.turns,actions:game.actions,
      prizesRemaining:game.prizesRemaining,endReason:game.endReason,
      archiveAgreement:game.finished && game.winner===expected.winner &&
        game.turns===expected.turns &&
        JSON.stringify(game.prizesRemaining)===JSON.stringify(expected.prizes),
      originalArchivedSummary:expected,endingDispatch:game.terminalTransition,
      publicTerminalSignatures:terminalSignatures(game.terminalTransition),
      finalState:game.finalState,
      nativeAttacks:game.attackTrace.filter(a=>a.seat===0).length,
      perfectionActions:game.abilityTrace.filter(a=>
        a.seat===0&&a.name==='Perfection').length,
      passes:game.decisionTrace.filter(a=>
        a.playerSlot===0&&a.action==='PassTurnAction').length,
      lastOpponentAttacks:game.attackTrace.filter(a=>a.seat===1).slice(-4).map(a=>({turn:a.turn,attack:a.attack,activePokemon:a.activePokemon,prizeCountBefore:a.prizeCountBefore,prizeCountAfter:a.prizeCountAfter})),
      lateBoard:(game.copycatTurnStartEvidence||[]).slice(-6).map(x=>({turn:x.turn,own:x.board[0]?.active,opponent:x.board[1]?.active})),
      played
    };
  });
  assert.equal(rows[0].deckHashes[1],rows[1].deckHashes[1]);
  const firstDifference=publicDecisionDifference(traces[0],traces[1]);
  const handAtFirstDifference=traces.map(trace=>{
    const hand=trace[firstDifference.firstDifferentIndex]
      ?.decisionHandBefore?.ownHandPrintings??[];
    const count=name=>hand.filter(card=>card.startsWith(name)).length;
    return {
      handSize:hand.length,
      mysteriousTreasure:count('Mysterious Treasure'),
      fieldBlower:count('Field Blower'),
      cancelingCologne:count('Canceling Cologne'),
      trainersMail:count('Trainers\' Mail'),
      rescueCarrier:count('Rescue Carrier')
    };
  });
  return {
    schema:'newmoon-rank8-terminal-public-audit-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'original manual diagnostic CI 39022298459',
    opponentRank:8,candidateSeat:0,
    qualifiedForCompetitiveInference:false,
    caveat:'The engine winner and public terminal indicators cannot independently establish one exclusive paper-rule loss cause or validate decision quality.',
    firstPublicActionDifference:firstDifference,
    firstMismatchOwnerHandCategoryCounts:handAtFirstDifference,
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
