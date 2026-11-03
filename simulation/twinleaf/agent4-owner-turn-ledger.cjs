'use strict';

const assert=require('node:assert/strict');

const VERSION='agent4-authenticated-owner-turn-observer-v2-opening-order';

/**
 * Construct a per-game ledger from actual live, owner-authenticated turn
 * decisions. The first witnessed turn for a seat establishes only a lower
 * bound; a second distinct turn proves this owner has finished at least one
 * earlier turn. No global-turn parity, player alternation, deck, Prize,
 * opponent-hand or concealed state assumptions enter the proof.
 *
 * The caller must invoke observe only at a genuine Store-backed owner root.
 * Starting partway through a game is conservative: never infer a missing
 * earlier owner turn.
 *
 * @returns {{observe:(view:object)=>object,snapshot:()=>object}}
 */
function createOwnerTurnLedger(){
  const lastSeen=[null,null],distinctObserved=[0,0];
  let firstSeatSeenAtGlobalTurnOne=null;
  return {
    observe(view){
      assert.equal(view?.decisionKind,'owner-root');
      const seat=view.actorSeat,turn=view.globalTurn;
      assert.ok(seat===0||seat===1);
      assert.ok(Number.isSafeInteger(turn)&&turn>=1);
      if(turn===1){
        assert.ok(firstSeatSeenAtGlobalTurnOne===null||
          firstSeatSeenAtGlobalTurnOne===seat,
          'Contradictory real first-player seat observations');
        firstSeatSeenAtGlobalTurnOne=seat;
      }
      const previous=lastSeen[seat];
      assert.ok(previous===null||turn>=previous,
        'Owner live-turn clock moved backward');
      if(previous!==turn){
        distinctObserved[seat]++;
        lastSeen[seat]=turn;
      }
      return Object.freeze({
        version:VERSION,actorSeat:seat,globalTurn:turn,
        distinctObservedOwnerTurns:distinctObserved[seat],
        openingFirstSeat:firstSeatSeenAtGlobalTurnOne,
        openingSeatProof:firstSeatSeenAtGlobalTurnOne===null?
          'unobserved':'observed-real-owner-root-global-turn-one',
        provenPastFirstOwnerTurn:distinctObserved[seat]>=2,
        fullyObservedSinceSetup:false,
        provenance:'genuine-live-owner-root-clock-only'
      });
    },
    snapshot(){
      return {
        version:VERSION,lastObservedTurns:[...lastSeen],
        openingFirstSeat:firstSeatSeenAtGlobalTurnOne,
        distinctObservedTurns:[...distinctObserved],
        opponentConcealedInformationUsed:false,
        knownPaperLegalActions:false
      };
    }
  };
}

module.exports={VERSION,createOwnerTurnLedger};
