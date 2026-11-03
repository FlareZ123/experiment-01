'use strict';

const assert=require('node:assert/strict');

const SOURCE_DRAGONS=new Set([
  'Regidrago V SIT','Regidrago VSTAR SIT','Salamence ex JTG',
  'Dragapult ex TWM','Noivern ex PAL','Dialga-GX UPR','Kyurem SFA'
]);

const SEARCH_DISCARD_TRAINERS=Object.freeze({
  battleCompressor:'Battle Compressor PHF',
  mysteriousTreasure:'Mysterious Treasure FLI',
  quickBall:'Quick Ball FST',
  professorsResearch:"Professor's Research JTG"
});

/**
 * Snapshot only an authenticated player's private hand plus public board
 * and discard. Neither deck identity nor face-down Prize cards are consumed.
 * This is an owner-visible *opportunity*, not a promised paper-payable line.
 *
 * @param {object} actor Detached actorObservation.
 * @returns {object}
 */
function observeRank13PayloadOwnerOpportunity(actor){
  assert.ok(Array.isArray(actor?.ownHand));
  const own=actor.ownPublic;
  const occupied=[own.active,...own.bench].filter(Boolean);
  const hand=actor.ownHand;
  const counts=Object.fromEntries(Object.entries(SEARCH_DISCARD_TRAINERS)
    .map(([key,printing])=>[key,hand.filter(p=>p===printing).length]));
  const publiclyDiscarded=own.discard.filter(p=>SOURCE_DRAGONS.has(p));
  const heldDragons=hand.filter(p=>SOURCE_DRAGONS.has(p));
  const regidragoOnBoard=occupied.some(p=>p.printing==='Regidrago V SIT'||
    p.printing==='Regidrago VSTAR SIT');
  const regidragoVstarActive=own.active?.printing==='Regidrago VSTAR SIT';
  const isOwnerRoot=actor.decisionKind==='owner-root';
  return {
    turn:actor.globalTurn,decisionKind:actor.decisionKind,
    regidragoOnBoard,regidragoVstarActive,
    activePrinting:own.active?.printing??null,
    activeAttachedEnergyPrintings:[...(own.active?.energies??[])],
    regidragoPublicSlots:[own.active,...own.bench]
      .map((pokemon,i)=>({pokemon,i}))
      .filter(x=>x.pokemon?.printing==='Regidrago V SIT'||
        x.pokemon?.printing==='Regidrago VSTAR SIT')
      .map(x=>({position:x.i===0?'active':'bench',
        benchIndex:x.i===0?null:x.i-1,
        printing:x.pokemon.printing,
        energyPrintings:[...(x.pokemon.energies??[])]})),
    eligiblePublicDragonDiscard:[...publiclyDiscarded],
    heldDragonPrintings:[...heldDragons],
    handCounts:counts,
    itemPlayLocked:actor.ownTurnResources.itemPlayLocked===true,
    supporterPlayLocked:actor.ownTurnResources.supporterPlayLocked===true,
    // This flags a *potential* action; other printed/payment/prize
    // constraints must still be inspected before a real native selection.
    heldCompressorWhilePayloadMissing:
      isOwnerRoot&&regidragoOnBoard&&
      publiclyDiscarded.length===0&&counts.battleCompressor>0&&
      actor.ownTurnResources.itemPlayLocked!==true,
    sourceOwnerOnly:true
  };
}

module.exports={SOURCE_DRAGONS,SEARCH_DISCARD_TRAINERS,
  observeRank13PayloadOwnerOpportunity};
