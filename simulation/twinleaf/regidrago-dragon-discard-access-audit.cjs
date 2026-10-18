'use strict';
/** Source-published rank-10 Dragon attack payload printings. */
const DRAGONS=new Set(['Dragapult ex TWM','Hisuian Goodra VSTAR LOR',
  'Dialga-GX UPR','Kyurem SFA']);
const DISCARD_ITEMS=new Set(['Quick Ball FST','Mysterious Treasure FLI']);
const DISCARD_SUPPORTERS=new Set(["Professor's Research JTG",'Carmine TWM']);
const COMPRESSOR='Battle Compressor PHF';

/**
 * Summarize owner-visible source-hand pairing at logged decision boundaries.
 * @param {object[]} trace Read-only headless decision trace.
 * @param {0|1} sourceSeat The physical seat of rank-10 Regidrago.
 * @returns {object}
 */
function audit(trace,sourceSeat) {
  const windows=[];
  const seen=new Set();
  for (const event of trace) {
    const hand=event.decisionHandBefore?.ownHandPrintings;
    if(event.playerSlot!==sourceSeat ||
       event.decisionHandBefore?.perspectiveSeat!==sourceSeat ||
       !Array.isArray(hand))continue;
    const payload=hand.filter(name=>DRAGONS.has(name));
    const items=hand.filter(name=>DISCARD_ITEMS.has(name));
    const supporters=hand.filter(name=>DISCARD_SUPPORTERS.has(name));
    const compressor=hand.includes(COMPRESSOR);
    if(!payload.length && !compressor)continue;
    const key=JSON.stringify([event.turnBefore,payload,items,supporters,compressor]);
    if(seen.has(key))continue;
    seen.add(key);
    windows.push({turn:event.turnBefore,ordinal:event.actionOrdinal,
      payload,items,supporters,compressor,
      immediateAction:event.action,immediateCard:event.card??null});
  }
  return {windows,coPresentItemTurns:[...new Set(
    windows.filter(w=>w.payload.length&&w.items.length).map(w=>w.turn))],
  coPresentSupporterTurns:[...new Set(
    windows.filter(w=>w.payload.length&&w.supporters.length).map(w=>w.turn))]};
}
module.exports={audit,DRAGONS,DISCARD_ITEMS,DISCARD_SUPPORTERS,COMPRESSOR};
