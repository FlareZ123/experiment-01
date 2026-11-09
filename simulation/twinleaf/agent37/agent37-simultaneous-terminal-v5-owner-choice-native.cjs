'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('../headless.cjs');
const {runOne}=require('../agent37-simultaneous-ko-e21-promotion-native.cjs');
const {GamePhase,GameWinner}=
  require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {GameLog}=
  require('../../../vendor/twinleaf/ptcg-server/output/game/game-message');
const {
  withInstanceScopedSimultaneousTerminalResolutionV5,
  VERSION,PINNED
}=require('./agent37-simultaneous-terminal-v5-owner-choice-adapter.cjs');

/**
 * Replace exactly one physical unclaimed Prize with a different printed card.
 * Preserve object custody by returning the displaced Psychic to its owner's
 * deck, then let the v5 adapter open a native ChoosePrizePrompt.
 *
 * @param {number} recipientId
 * @param {0|1} actorSeat
 * @param {boolean} mixedPool Whether the physical recipient Prize pool has an alternate printing.
 * @returns {(store:any,execute:()=>any)=>{result:any,audit:object}}
 */
function withMixedRecipientPrizes(recipientId,actorSeat,mixedPool){
  return (store,execute)=>{
    const recipient=store.state.players.find(p=>p.id===recipientId);
    assert.ok(recipient);
    assert.equal(recipient.prizes.length,6);
    if(!mixedPool)
      return withInstanceScopedSimultaneousTerminalResolutionV5(store,execute);
    const card=initializeCards().getCardByName('Metal Energy MEE');
    assert.ok(card);
    card.id=990000+actorSeat;
    const displaced=recipient.prizes[4].cards[0];
    recipient.prizes[4].cards[0]=card;
    recipient.deck.cards.push(displaced);
    return withInstanceScopedSimultaneousTerminalResolutionV5(store,execute);
  };
}

/** @returns {object} Two-seat owner-choice native Store comparison. */
function run(){
  const rows=[];
  for(const actorSeat of [0,1]){
    // The engine processes the state.players[0] final-Prize winner first;
    // the recipient whose Prize group is nonterminal must choose.
    const recipientId=actorSeat===0?202:101;
    const fixture={
      enemyActiveName:'Shadow Rider Calyrex VMAX CRE',
      enemyEvolutionBaseName:'Shadow Rider Calyrex V CRE',
      enemyActiveDamage:260,
      ownerPrizes:actorSeat===0?1:6,
      enemyPrizes:actorSeat===0?6:1
    };
    for(const mixedPool of [false,true]){
      for(const includeMetal of mixedPool?[false,true]:[false]){
      let ownerChoiceInvocations=0;
      const choice={...fixture,choosePrize:({player,prompt,remaining,state})=>{
        assert.equal(player.id,recipientId,
          'native ChoosePrizePrompt belongs to nonterminal Prize recipient');
        const count=prompt.options.count;
        assert.equal(prompt.playerId,recipientId);
        assert.equal(state.phase,GamePhase.ATTACK,
          'owner sees their Prize prompt before any terminal state');
        assert.equal(state.winner,GameWinner.NONE);
        assert.equal(state.logs.filter(log=>
          log.message===GameLog.LOG_GAME_FINISHED_WINNER||
          log.message===GameLog.LOG_GAME_FINISHED_DRAW
        ).length,0,'native winner log must remain deferred');
        ownerChoiceInvocations++;
        if(!includeMetal)return remaining.slice(0,count);
        const picked=remaining[4];
        return [picked,...remaining.filter(prize=>prize!==picked)
          .slice(0,count-1)];
      }};
      const {result,audit}=runOne(
        actorSeat,
        withMixedRecipientPrizes(recipientId,actorSeat,mixedPool),
        6,true,true,true,choice
      );
      assert.equal(ownerChoiceInvocations,1);
      assert.equal(result.finished,true);
      assert.equal(result.terminalGameLogCount,1,
        'exactly one native terminal winner/draw log is published');
      assert.equal(result.winnerPlayer,actorSeat===0?'owner':'opponent');
      assert.equal(result.ownerPrizesRemaining,actorSeat===0?0:3);
      assert.equal(result.opponentPrizesRemaining,actorSeat===0?5:0);
      assert.equal(result.ownerPrizesTakenThisTurn,actorSeat===0?1:3);
      assert.equal(result.opponentPrizesTakenThisTurn,1);
      assert.deepEqual(result.seenPrompts.filter(x=>x==='ChoosePrizePrompt'),
        ['ChoosePrizePrompt']);
      assert.equal(audit.ownerPrizeSelectionPrompted,true);
      assert.equal(audit.ownerPrizeSelectionSettled,true);
      assert.equal(audit.terminalLogDeferred,true);
      assert.equal(audit.winnerPublishedAfterSelection,true);
      assert.equal(audit.bothPrizeTransfersCompleted,true);
      assert.equal(audit.secondPrizeTransferCompleted,true);
      assert.equal(audit.selectedPhysicalPrizesTransferred,true);
      assert.equal(audit.winnerLogHandled,true);
      assert.equal(audit.storeLogRestored,true);
      assert.equal(audit.storeReduceRestored,true);
      assert.equal(audit.otherStoresUnmodified,true);
      assert.equal(audit.selectedPrizePrintings.includes('Metal Energy MEE'),
        includeMetal);
      rows.push({
        actorSeat,recipientId,mixedPool,includeMetal,
        nativePrizeChoices:ownerChoiceInvocations,
        selectedPrizePrintings:audit.selectedPrizePrintings,
        ownerPrizesTaken:result.ownerPrizesTakenThisTurn,
        opponentPrizesTaken:result.opponentPrizesTakenThisTurn,
        gameWinner:result.winnerPlayer,
        terminalLogDeferred:audit.terminalLogDeferred,
        nativeOwnerPromptSettled:audit.ownerPrizeSelectionSettled
      });
      }
    }
    // The terminal Prize recipient also has no replacement Active, while the
    // other recipient can promote. Rulebook §E requires a tie despite one
    // player exhausting their Prizes first; preserve the real owner choice.
    const tieFixture={
      ...fixture,
      choosePrize:({player,prompt,remaining,state})=>{
        assert.equal(player.id,recipientId);
        assert.equal(state.phase,GamePhase.ATTACK);
        assert.equal(state.winner,GameWinner.NONE);
        return remaining.slice(0,prompt.options.count);
      }
    };
    const tie=runOne(
      actorSeat,withMixedRecipientPrizes(recipientId,actorSeat,true),
      6,true,
      actorSeat===0,
      actorSeat===1,
      tieFixture
    );
    assert.equal(tie.result.finished,true);
    assert.equal(tie.result.winner,GameWinner.DRAW,
      'one player exhausts Prizes but cannot promote; opponent can');
    assert.equal(tie.result.terminalGameLogCount,1);
    assert.equal(tie.audit.ownerPrizeSelectionSettled,true);
    assert.equal(tie.audit.winnerOverridden,true);
    assert.equal(tie.audit.nativeWinnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
    assert.equal(tie.audit.winnerLogMessage,GameLog.LOG_GAME_FINISHED_DRAW);
    assert.equal(tie.audit.winnerPublishedAfterSelection,true);
    assert.equal(tie.audit.selectedPhysicalPrizesTransferred,true);
    assert.equal(tie.audit.bothPrizeTransfersCompleted,true);
    assert.equal(tie.audit.storeLogRestored,true);
    assert.equal(tie.audit.storeReduceRestored,true);
    rows.push({
      actorSeat,recipientId,mixedPool:true,includeMetal:false,
      scenario:'single-remaining-active-promotion-tie',
      selectedPrizePrintings:tie.audit.selectedPrizePrintings,
      gameWinner:'DRAW',
      nativeWinnerCorrected:true,
      terminalLogDeferred:tie.audit.terminalLogDeferred,
      nativeOwnerPromptSettled:tie.audit.ownerPrizeSelectionSettled
    });

    // If the FIRST player in state.players is nonterminal, upstream builds
    // their ChoosePrizePrompt but drops it when the SECOND player's Prize
    // group exhausts their last Prize. V5 must rescue that owner's decision.
    const secondFinalRecipient=actorSeat===0?101:202;
    const reversedFixture={
      ...fixture,
      ownerPrizes:actorSeat===0?6:1,
      enemyPrizes:actorSeat===0?1:6,
      choosePrize:({player,prompt,remaining,state})=>{
        assert.equal(player.id,secondFinalRecipient);
        assert.equal(prompt.playerId,secondFinalRecipient);
        assert.equal(state.phase,GamePhase.ATTACK);
        assert.equal(state.winner,GameWinner.NONE);
        assert.equal(state.logs.filter(log=>
          log.message===GameLog.LOG_GAME_FINISHED_WINNER||
          log.message===GameLog.LOG_GAME_FINISHED_DRAW
        ).length,0);
        const picked=remaining[4];
        return [picked,...remaining.filter(prize=>prize!==picked)
          .slice(0,prompt.options.count-1)];
      }
    };
    const secondFinal=runOne(
      actorSeat,
      withMixedRecipientPrizes(secondFinalRecipient,actorSeat,true),
      6,true,true,true,reversedFixture
    );
    assert.equal(secondFinal.result.finished,true);
    assert.equal(secondFinal.result.winnerPlayer,
      actorSeat===0?'opponent':'owner');
    assert.equal(secondFinal.result.terminalGameLogCount,1);
    assert.equal(secondFinal.result.ownerPrizesTakenThisTurn,actorSeat===0?3:1);
    assert.equal(secondFinal.result.opponentPrizesTakenThisTurn,1);
    assert.equal(secondFinal.result.ownerPrizesRemaining,actorSeat===0?3:0);
    assert.equal(secondFinal.result.opponentPrizesRemaining,actorSeat===0?0:5);
    assert.deepEqual(secondFinal.result.seenPrompts.filter(x=>
      x==='ChoosePrizePrompt'),['ChoosePrizePrompt']);
    assert.equal(secondFinal.audit.ownerPrizeSelectionPrompted,true);
    assert.equal(secondFinal.audit.ownerPrizeSelectionSettled,true);
    assert.equal(secondFinal.audit.selectedPhysicalPrizesTransferred,true);
    assert.equal(secondFinal.audit.bothPrizeTransfersCompleted,true);
    assert.equal(secondFinal.audit.selectedPrizePrintings.includes('Metal Energy MEE'),true);
    assert.equal(secondFinal.audit.terminalLogDeferred,true);
    assert.equal(secondFinal.audit.winnerPublishedAfterSelection,true);
    assert.equal(secondFinal.audit.storeLogRestored,true);
    assert.equal(secondFinal.audit.storeReduceRestored,true);
    rows.push({
      actorSeat,recipientId:secondFinalRecipient,mixedPool:true,
      scenario:'native-first-group-nonterminal-second-group-final',
      selectedPrizePrintings:secondFinal.audit.selectedPrizePrintings,
      gameWinner:secondFinal.result.winnerPlayer,
      terminalLogDeferred:secondFinal.audit.terminalLogDeferred,
      nativeOwnerPromptSettled:secondFinal.audit.ownerPrizeSelectionSettled
    });
  }
  return {
    schema:'agent37-simultaneous-terminal-v5-native-owner-prize-choice',
    version:VERSION,pinnedTwinleaf:PINNED,
    physicalSeats:[0,1],choicesPerSeat:5,
    independentlyCorrectedSinglePrizePromotionTies:2,
    nativeDiscardedFirstGroupPromptRescued:2,
    ownerChoiceNativePrompts:rows.length,
    differentPhysicalChoicesCauseDifferentPrizeReceipts:true,
    homogeneousAndHeterogeneousPoolPromptPresenceIdentical:true,
    competitivelyQualifiedGames:0,
    rows
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
