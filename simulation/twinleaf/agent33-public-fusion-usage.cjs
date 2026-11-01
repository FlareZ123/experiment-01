'use strict';
const assert=require('node:assert/strict');

const VERSION='agent33-public-fusion-strike-system-usage-v1';
const PRINTING='Genesect V FST';
const MARKER='FUSION_STRIKE_SYSTEM_MARKER';

/**
 * Observe publicly announced per-copy Fusion Strike System usage from the
 * pinned native owner's marker ledger. Physical source cards are examined
 * only while face-up in the active/bench slots. Hidden cards and opponent
 * private State are excluded entirely. This is an evidence sidecar, never a
 * native action selector and never an independently certified player policy.
 *
 * @param {object} state Genuine native Store State at an owner root.
 * @param {0|1} seat Active player's actual physical seat.
 * @returns {object} Detached, plain, owner-public facts.
 */
function publicFusionUsageAtRoot(state,seat){
  assert.ok(seat===0||seat===1);
  assert.equal(state?.activePlayer,seat,'Only an own-turn root may observe usage');
  assert.ok(Array.isArray(state?.players)&&state.players.length===2);
  assert.ok(Number.isSafeInteger(state.turn)&&state.turn>=0);
  const owner=state.players[seat];
  assert.equal(typeof owner?.marker?.hasMarker,'function');
  const slots=[owner.active,...owner.bench];
  const faceUp=[];
  for(let i=0;i<slots.length;i++){
    const pokemon=slots[i]?.getPokemonCard?.();
    if(pokemon?.fullName!==PRINTING)continue;
    faceUp.push({
      location:i===0?'active':'bench',
      benchIndex:i===0?null:i-1,
      printing:PRINTING,
      usedThisTurn:owner.marker.hasMarker(MARKER,pokemon)
    });
  }
  const usedCount=faceUp.filter(x=>x.usedThisTurn).length;
  return {
    schema:VERSION,actorSeat:seat,globalTurn:state.turn,
    faceUpGenesectCount:faceUp.length,
    usedCount,unspentCount:faceUp.length-usedCount,
    faceUp,
    observable:'announced public Ability use only',
    ownerHiddenCardsInspected:false,opponentHiddenCardsInspected:false,
    competitiveQualified:false
  };
}

module.exports={VERSION,PRINTING,MARKER,publicFusionUsageAtRoot};
