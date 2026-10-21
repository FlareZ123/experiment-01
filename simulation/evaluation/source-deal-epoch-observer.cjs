'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {fingerprintInitialSourceDeal}=
  require('./source-physical-deal-fingerprint.cjs');

const VERSION='source-physical-deal-epoch-observer-v1';

/**
 * Observe a genuinely stable first player turn once per native game episode.
 * Fingerprint both players' physically ordered private zones, returning
 * digests only. Called after original setup or a native sudden-death reset.
 * The result is offline evidence, never an input to a decision policy.
 *
 * @param {0|1} sourceSeat Original physical source player.
 * @returns {{observe:(state:object,ordinal:number,resetCount:number)=>void,
 *   result:(resetCount:number)=>object}}
 */
function createSourceDealEpochObserver(sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const deals=[];
  return Object.freeze({
    /** @param {object} state Native Store state before the root action.
     * @param {number} ordinal Next actual Store root ordinal.
     * @param {number} resetCount Number of native logged clock-reversal markers. */
    observe(state,ordinal,resetCount){
      assert.ok(Number.isSafeInteger(ordinal)&&ordinal>=0);
      assert.ok(Number.isSafeInteger(resetCount)&&resetCount>=0);
      if(resetCount<deals.length-1)
        throw new Error('Native reset count moved backwards');
      if(deals[resetCount])return;
      if(state.turn!==1||state.phase!==2||
        state.prompts.some(prompt=>prompt.result===undefined))return;
      assert.equal(deals.length,resetCount,
        'Replay setup has no recorded initial physical-deal prefix');
      assert.equal(state.players.length,2);
      assert.ok(state.activePlayer===0||state.activePlayer===1);
      const source=fingerprintInitialSourceDeal(state,sourceSeat,0);
      const opposite=fingerprintInitialSourceDeal(state,1-sourceSeat,0);
      const full=createHash('sha256').update(JSON.stringify([
        [source.seat,source.digestSha256],
        [opposite.seat,opposite.digestSha256]
      ].sort((a,b)=>a[0]-b[0]))).digest('hex');
      deals.push(Object.freeze({
        episodeIndex:resetCount,
        initialRootActionOrdinal:ordinal,
        firstActualPlayerSeat:state.activePlayer,
        originalSourceSeat:sourceSeat,
        sourceDealDigestSha256:source.digestSha256,
        fullPhysicalDealDigestSha256:full,
        initialPrizeCounts:state.players.map(player=>
          player.prizes.filter(prize=>prize.cards.length>0).length),
        nativeSuddenDeathAtOpening:state.isSuddenDeath===true
      }));
    },
    /** @param {number} resetCount Number of observed native restarts. */
    result(resetCount){
      assert.ok(Number.isSafeInteger(resetCount)&&resetCount>=0);
      return {
        schema:VERSION,
        recordedNativeRestarts:resetCount,
        recordedOpeningDeals:deals.length,
        allEpisodeOpeningsCaptured:deals.length===resetCount+1,
        deals:deals.map(deal=>({...deal})),
        provesPaperTiebreakEquivalence:false,
        competitiveQualified:false
      };
    }
  });
}
module.exports={VERSION,createSourceDealEpochObserver};
