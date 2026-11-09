'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('../headless.cjs');
const {runOne}=require('../agent37-simultaneous-ko-e21-promotion-native.cjs');
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
 * @returns {(store:any,execute:()=>any)=>{result:any,audit:object}}
 */
function withMixedRecipientPrizes(recipientId,actorSeat){
  return (store,execute)=>{
    const recipient=store.state.players.find(p=>p.id===recipientId);
    assert.ok(recipient);
    assert.equal(recipient.prizes.length,6);
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
    for(const includeMetal of [false,true]){
      let ownerChoiceInvocations=0;
      const choice={...fixture,choosePrize:({player,prompt,remaining})=>{
        assert.equal(player.id,recipientId,
          'native ChoosePrizePrompt belongs to nonterminal Prize recipient');
        const count=prompt.options.count;
        assert.equal(prompt.playerId,recipientId);
        assert.equal(prompt.validate(remaining.slice(0,count),
          {players:[]}),false); // redundant metadata alone cannot validate
        ownerChoiceInvocations++;
        if(!includeMetal)return remaining.slice(0,count);
        const picked=remaining[4];
        assert.equal(picked.cards[0].fullName,'Metal Energy MEE');
        return [picked,...remaining.filter(prize=>prize!==picked)
          .slice(0,count-1)];
      }};
      const {result,audit}=runOne(
        actorSeat,
        withMixedRecipientPrizes(recipientId,actorSeat),
        6,true,true,true,choice
      );
      assert.equal(ownerChoiceInvocations,1);
      assert.equal(result.finished,true);
      assert.equal(result.winnerPlayer,actorSeat===0?'owner':'opponent');
      assert.equal(result.ownerPrizesRemaining,actorSeat===0?0:3);
      assert.equal(result.opponentPrizesRemaining,actorSeat===0?5:0);
      assert.equal(result.ownerPrizesTakenThisTurn,actorSeat===0?3:3);
      assert.equal(result.opponentPrizesTakenThisTurn,1);
      assert.deepEqual(result.seenPrompts.filter(x=>x==='ChoosePrizePrompt'),
        ['ChoosePrizePrompt']);
      assert.equal(audit.ownerPrizeSelectionPrompted,true);
      assert.equal(audit.ownerPrizeSelectionSettled,true);
      assert.equal(audit.terminalLogDeferred,true);
      assert.equal(audit.winnerPublishedAfterSelection,true);
      assert.equal(audit.bothPrizeTransfersCompleted,true);
      assert.equal(audit.secondPrizeTransferCompleted,true);
      assert.equal(audit.winnerLogHandled,true);
      assert.equal(audit.storeLogRestored,true);
      assert.equal(audit.storeReduceRestored,true);
      assert.equal(audit.otherStoresUnmodified,true);
      assert.equal(audit.selectedPrizePrintings.includes('Metal Energy MEE'),
        includeMetal);
      rows.push({
        actorSeat,recipientId,includeMetal,
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
  return {
    schema:'agent37-simultaneous-terminal-v5-native-owner-prize-choice',
    version:VERSION,pinnedTwinleaf:PINNED,
    physicalSeats:[0,1],choicesPerSeat:2,
    ownerChoiceNativePrompts:rows.length,
    differentPhysicalChoicesCauseDifferentPrizeReceipts:true,
    competitivelyQualifiedGames:0,
    rows
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
