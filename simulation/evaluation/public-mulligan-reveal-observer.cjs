'use strict';

const assert = require('node:assert/strict');

/**
 * Capture only the actual opponent-facing native ShowMulliganPrompt's
 * already revealed cards. The source setup reducer makes two prompts for
 * every failing owner, one self-view and one opponent-view. Record only the
 * opponent-view to avoid duplication and never inspect the current hand,
 * deck, Prizes, or other opponent-private state.
 *
 * This evidence observer does not feed a card selection or actor policy.
 *
 * @param {{GamePhase:object,GameMessage:object,ShowMulliganPrompt:Function}} deps
 * @returns {{observe:(state:object,pending:object|null)=>void,result:()=>object|null}}
 */
function createPublicMulliganRevealObserver(deps) {
  const {GamePhase,GameMessage,ShowMulliganPrompt} = deps;
  const revealedByOwner = [null,null];
  let complete = null;

  /** @param {object} state @param {object|null} pending */
  function observe(state,pending) {
    if(complete!==null)return;
    assert.ok(Array.isArray(state.players) && state.players.length===2);
    if(state.phase===GamePhase.PLAYER_TURN) {
      const handsByOwner = revealedByOwner.map(hands=>
        Object.freeze((hands??[]).map(cards=>Object.freeze([...cards]))));
      complete=Object.freeze({
        schema:'native-public-opponent-mulligan-reveal-v1',
        handsByOwner:Object.freeze(handsByOwner),
        revealedHandCounts:Object.freeze(handsByOwner.map(hands=>hands.length)),
        provenance:'opponent-facing ShowMulliganPrompt only',
        excludesPrivateCurrentHandDeckPrize:true,
        effectOnActorPolicy:false,
        createsCompetitiveWinRateEvidence:false
      });
      return;
    }
    if(!(pending instanceof ShowMulliganPrompt) ||
       pending.message!==GameMessage.SETUP_OPPONENT_NO_BASIC)return;
    assert.equal(state.phase,GamePhase.SETUP,
      'Opponent mulligan identity prompt occurred outside setup');
    const viewerSeat=state.players.findIndex(player=>player.id===pending.playerId);
    assert.ok(viewerSeat===0||viewerSeat===1,
      'Opponent mulligan prompt viewer is not a physical player');
    const ownerSeat=1-viewerSeat;
    assert.equal(revealedByOwner[ownerSeat],null,
      'Duplicate opponent-facing reveal for one owner');
    assert.ok(Array.isArray(pending.hands)&&pending.hands.length>=1);
    revealedByOwner[ownerSeat]=pending.hands.map(hand=>{
      assert.ok(Array.isArray(hand)&&hand.length===7,
        'Expected seven physically revealed cards per invalid opening');
      return hand.map(card=>{
        assert.ok(typeof card.fullName==='string'&&card.fullName.length>0,
          'Missing publicly revealed printed card identity');
        return card.fullName;
      });
    });
  }

  /** @returns {object|null} Frozen first-turn public mulligan history. */
  function result(){return complete;}

  return Object.freeze({observe,result});
}

module.exports={createPublicMulliganRevealObserver};
