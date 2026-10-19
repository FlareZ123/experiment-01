'use strict';

const assert=require('node:assert/strict');

/**
 * Observe the pinned Store's setup prompt sequence without inspecting card
 * identities or changing any action. Source/candidate mulligan compensation
 * is a genuine game effect and belongs in unconditional comparison records.
 *
 * Dependency injection keeps this a pure module for deterministic regressions.
 *
 * @param {{GamePhase:object,ShuffleDeckPrompt:Function,SelectPrompt:Function,
 *   GameMessage:object}} deps Pinned engine constructors/constants.
 * @returns {object} Record action boundaries until the first turn begins.
 */
function createSetupCompensationObserver(deps) {
  const {GamePhase,ShuffleDeckPrompt,SelectPrompt,GameMessage}=deps;
  const shuffles=[0,0],promptCount=[0,0],promptOffers=[0,0];
  const bonusSelected=[0,0],bonusDrawn=[0,0];
  let inFlight=null,completed=null,observedActions=0;

  /** @param {object} state */
  function finish(state) {
    if(completed!==null)return;
    assert.ok(observedActions>0,'No setup actions observed');
    const mulligans=shuffles.map(value=>value-1);
    assert.ok(mulligans.every(value=>value>=0),
      'Initial setup shuffle missing for at least one player');
    const offered=[
      Math.max(0,mulligans[1]-mulligans[0]),
      Math.max(0,mulligans[0]-mulligans[1])
    ];
    assert.ok(promptCount[0]+promptCount[1]<=1,
      'Unexpected multiple mulligan compensation prompts');
    for(let seat=0;seat<2;seat++) {
      assert.equal(promptOffers[seat],offered[seat],
        'Compensation offer contradicts witnessed mulligans');
      assert.ok(bonusSelected[seat]<=offered[seat],
        'Compensation selection exceeded offer');
      assert.equal(bonusSelected[seat],bonusDrawn[seat],
        'Compensation hand growth did not match selected draw');
    }
    completed=Object.freeze({
      schema:'real-store-initial-setup-compensation-v1',
      mulligans:Object.freeze([...mulligans]),
      bonusOffered:Object.freeze([...offered]),
      bonusPromptCount:Object.freeze([...promptCount]),
      bonusSelected:Object.freeze([...bonusSelected]),
      bonusDrawn:Object.freeze([...bonusDrawn]),
      firstTurnSeat:state.activePlayer,
      setupActionsObserved:observedActions,
      excludesPrivateCardIdentities:true,
      initialSourceDealMatchingRequired:false,
      createsCompetitiveWinRateEvidence:false
    });
  }

  /**
   * Call after the selected action passes prompt validation and before
   * dispatch, including both players' shuffle/selection setup prompts.
   * @param {object} state Pinned live Store state.
   * @param {object|null} pending Current unresolved prompt.
   * @param {object} action Selected root/prompt action.
   */
  function before(state,pending,action) {
    if(completed!==null)return;
    assert.equal(inFlight,null,'Previous setup action was not observed after dispatch');
    assert.equal(state.players.length,2);
    if(state.phase===GamePhase.PLAYER_TURN) {
      finish(state);
      return;
    }
    if(state.phase!==GamePhase.SETUP&&state.phase!==GamePhase.DRAW)return;
    assert.ok(pending,'Setup observer needs the pending genuine prompt');
    let bonus=null;
    if(pending instanceof ShuffleDeckPrompt) {
      const seat=state.players.findIndex(player=>
        player.id===pending.getPerspectivePlayerId());
      assert.ok(seat===0||seat===1,'Unknown shuffle owner');
      shuffles[seat]++;
    }
    if(pending instanceof SelectPrompt &&
        pending.message===GameMessage.WANT_TO_DRAW_CARDS) {
      const seat=state.players.findIndex(player=>player.id===pending.playerId);
      assert.ok(seat===0||seat===1,'Unknown compensation recipient');
      assert.ok(Array.isArray(pending.values),'Missing draw option labels');
      const options=pending.values.map(value=>{
        const match=/^Draw (\d+) card\(s\)$/.exec(value);
        assert.ok(match,'Unexpected setup bonus option');
        return Number(match[1]);
      });
      const chosen=options[action.result];
      assert.ok(Number.isSafeInteger(chosen),'Invalid selected bonus option');
      promptCount[seat]++;
      promptOffers[seat]+=Math.max(...options);
      bonusSelected[seat]+=chosen;
      bonus={
        seat,chosen,handBefore:state.players[seat].hand.cards.length,
        turnBefore:state.turn
      };
    }
    inFlight={bonus};
    observedActions++;
  }

  /**
   * Call directly after a successful real Store dispatch; collect only
   * public setup counts and the receiving player's hand-size change.
   * @param {object} state Post-action Store state.
   */
  function after(state) {
    if(completed!==null)return;
    if(inFlight===null)return;
    const {bonus}=inFlight;
    inFlight=null;
    if(!bonus)return;
    const change=state.players[bonus.seat].hand.cards.length-bonus.handBefore;
    const ordinaryFirstDraw=Number(
      state.turn>bonus.turnBefore&&
      state.activePlayer===bonus.seat&&
      state.rules?.firstTurnDrawCard===true);
    const drawn=change-ordinaryFirstDraw;
    assert.equal(drawn,bonus.chosen,
      'Real Store compensation draw does not equal selected number');
    bonusDrawn[bonus.seat]+=drawn;
  }

  /** @returns {object|null} Finished immutable prompt-accounting summary. */
  function result(){return completed;}

  return Object.freeze({before,after,result});
}

module.exports={createSetupCompensationObserver};
