'use strict';

const assert=require('node:assert/strict');

const VERSION='agent8-source-postpass-teamflare-visible-target-v1';
const PRINTING='Team Flare Grunt XY';
const SUPPORTERS=new Set([
  'Plumeria','Guzma','Guzma & Hala','Team Flare Grunt','Lusamine',
  'Cynthia & Caitlin','Team Skull Grunt','Faba','Eri','Sidney',
  'Gladion',"Lillie's Determination","Team Rocket's Handiwork"
]);

/**
 * Passive, strictly postdecision scan of a source player's genuine native
 * Pass decisions. No decision is changed or private opponent/Prize zone read.
 * Treat native mechanics and owner Supporter quota as UNVERIFIED here.
 * @param {object[]} trace Actual native decision trace.
 * @param {object[]} nativeRoots Original accepted Store root ledger.
 * @param {0|1} sourceSeat Source's physical player slot.
 * @returns {object} Bounded evidence of physical held/target co-occurrence.
 */
function sourcePostPassTeamFlare(trace,nativeRoots,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(trace)&&Array.isArray(nativeRoots));
  const passes=trace.filter(row=>row.playerSlot===sourceSeat&&
    row.action==='PassTurnAction');
  const summary={
    version:VERSION,sourceSeat,sourcePasses:passes.length,
    observedPasses:0,incompletePasses:0,heldPasses:0,
    publicOpponentEnergyPasses:0,
    heldAndTargetPasses:0,
    heldAndTargetAfterFirstTurn:0,
    heldTargetNoEarlierObservedSupporter:0,
    samples:[],sampleLimit:40,
    nativeLegality:'unverified',competitiveGameQualified:false,
    note:'Read-only owner-hand plus opposing public Active Energy at accepted Pass; prior recorded Supporter plays are partial quota evidence'
  };
  for(const row of passes){
    const native=nativeRoots[row.actionOrdinal];
    assert.equal(native?.actionOrdinal,row.actionOrdinal,
      'Pass native ordinal must have original Store root');
    assert.equal(native.action,'PassTurnAction');
    assert.equal(native.playerSlot,sourceSeat);
    assert.equal(native.turnBefore,row.turnBefore);
    const owner=row.decisionHandBefore;
    const boards=row.publicBoardBeforePass;
    const opponent=Array.isArray(boards)&&boards.length===2?
      boards[1-sourceSeat]:null;
    const energies=opponent?.active?.energyCards;
    if(owner?.perspectiveSeat!==sourceSeat||
       !Array.isArray(owner.ownHandPrintings)||
       !Array.isArray(energies)){
      summary.incompletePasses++;
      continue;
    }
    summary.observedPasses++;
    const held=owner.ownHandPrintings.filter(card=>card===PRINTING).length;
    const targetEnergyCount=energies.length;
    if(held>0)summary.heldPasses++;
    if(targetEnergyCount>0)summary.publicOpponentEnergyPasses++;
    if(!(held>0&&targetEnergyCount>0))continue;
    summary.heldAndTargetPasses++;
    const afterFirstTurn=row.turnBefore!==1;
    if(afterFirstTurn)summary.heldAndTargetAfterFirstTurn++;
    // This is a visible ledger prerequisite, not proof that the native
    // owner Supporter quota is currently open.
    const earlierSupporters=nativeRoots.filter(root=>
      root.playerSlot===sourceSeat&&root.actionOrdinal<row.actionOrdinal&&
      root.turnBefore===row.turnBefore&&
      root.action==='PlayCardAction'&&SUPPORTERS.has(root.card));
    const noEarlierSupporter=earlierSupporters.length===0;
    if(afterFirstTurn&&noEarlierSupporter)
      summary.heldTargetNoEarlierObservedSupporter++;
    if(summary.samples.length<summary.sampleLimit)summary.samples.push({
      ordinal:row.actionOrdinal,globalTurn:row.turnBefore,
      heldCount:held,opposingActiveEnergyCards:targetEnergyCount,
      afterFirstTurn,noEarlierObservedSupporter:noEarlierSupporter
    });
  }
  return summary;
}

module.exports={VERSION,PRINTING,sourcePostPassTeamFlare};
