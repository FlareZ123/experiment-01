'use strict';

const assert=require('node:assert/strict');

const VERSION='agent24-owner-held-supporter-turn-census-v1';

/**
 * Summarize the acting player's hand before accepted native roots. This is
 * post-game evidence, never passed into a player policy. It deliberately
 * counts held Supporters separately from legal, proposed, or effective plays.
 *
 * @param {object[]} decisionTrace Store-accepted post-choice action trace.
 * @param {0|1} seat Physical owner seat.
 * @param {Set<string>} supporterPrintings Exact pinned card fullName values.
 * @returns {object} Complete-turn counts and bounded owner-only examples.
 */
function ownerHeldSupporterTurnCensus(decisionTrace,seat,supporterPrintings) {
  assert.ok(Array.isArray(decisionTrace));
  assert.ok(seat===0||seat===1);
  assert.ok(supporterPrintings instanceof Set);
  const rows=decisionTrace.filter(row=>row.playerSlot===seat &&
    row?.decisionHandBefore?.perspectiveSeat===seat &&
    Array.isArray(row.decisionHandBefore.ownHandPrintings) &&
    Number.isSafeInteger(row.actionOrdinal) &&
    Number.isSafeInteger(row.turnBefore) &&
    row.action!=='ResolvePromptAction').sort((a,b)=>
      a.actionOrdinal-b.actionOrdinal);
  const turns=[];
  for(const row of rows){
    let current=turns[turns.length-1];
    if(!current||current.turn!==row.turnBefore) {
      current={turn:row.turnBefore,first:null,lastPass:null,rootCount:0,
        playCardNames:[]};
      turns.push(current);
    }
    const hand=row.decisionHandBefore.ownHandPrintings;
    const snapshot={ordinal:row.actionOrdinal,action:row.action,
      handSize:hand.length,
      heldSupporters:hand.filter(name=>supporterPrintings.has(name))};
    if(current.first===null)current.first=snapshot;
    if(row.action==='PassTurnAction')current.lastPass=snapshot;
    if(row.action==='PlayCardAction')
      current.playCardNames.push(row.card??null);
    current.rootCount++;
  }
  return {schema:VERSION,seat,observedTurns:turns.length,
    firstRootsWithHeldSupporters:turns.filter(t=>
      t.first.heldSupporters.length>0).length,
    nativePassesWithHeldSupporters:turns.filter(t=>
      t.lastPass?.heldSupporters.length>0).length,
    nativePassesObserved:turns.filter(t=>t.lastPass).length,
    turns:turns.slice(0,128),
    truncatedTurns:Math.max(0,turns.length-128),
    classification:'Exact engine-typed Supporter printings held in owner hand; actual root choices are Store accepted',
    missingEvidence:'Ordinary Supporter quota, printed canPlay legality, bot proposal, Store settlement and tactical value are unmeasured',
    competitiveQualified:false};
}

module.exports={VERSION,ownerHeldSupporterTurnCensus};
