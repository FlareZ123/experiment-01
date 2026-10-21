'use strict';

const assert=require('node:assert/strict');

const VERSION='agent17-native-source-own-postpass-mobility-v1';
const MOBILITY_NAMES=['Float Stone','Guzma','Escape Rope'];

/**
 * Count a native source player's own mobility cards held after selecting Pass.
 * This telemetry cannot influence the earlier policy decision.
 * These cards are possible opportunities, not automatically legal plays.
 * @param {object[]} decisionTrace Original selective native Store trace.
 * @param {object[]} rootTrace Original complete native Store root trace.
 * @param {0|1} sourceSeat Actual source player slot.
 * @returns {object} Post-decision observations, no hidden opponent cards.
 */
function sourceOwnerPostPassMobility(decisionTrace,rootTrace,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(decisionTrace));
  assert.ok(Array.isArray(rootTrace));
  const passes=decisionTrace.filter(row=>
    row.playerSlot===sourceSeat&&row.action==='PassTurnAction');
  const observations=passes.map(row=>{
    const root=rootTrace[row.actionOrdinal];
    assert.ok(root,'Pass missing native root witness');
    assert.equal(root.actionOrdinal,row.actionOrdinal);
    assert.equal(root.action,'PassTurnAction');
    assert.equal(root.playerSlot,sourceSeat);
    assert.equal(root.turnBefore,row.turnBefore);
    assert.equal(row.decisionHandBefore?.perspectiveSeat,sourceSeat,
      'Owner post-Pass hand witness absent or wrong perspective');
    const hand=row.decisionHandBefore.ownHandPrintings;
    assert.ok(Array.isArray(hand));
    assert.ok(Array.isArray(row.publicBoardBeforePass));
    assert.equal(row.publicBoardBeforePass.length,2);
    const own=row.publicBoardBeforePass[sourceSeat];
    assert.ok(own && Array.isArray(own.bench));
    const active=own.active;
    const held=Object.fromEntries(MOBILITY_NAMES.map(name=>[
      name,hand.filter(p=>typeof p==='string' &&
        p.startsWith(name+' ')).length]));
    const hasHeldMobility=Object.values(held).some(x=>x>0);
    const strandedGarbodor=active?.name==='Garbodor'&&
      (active.toolCards??[]).length===0&&own.bench.length>0;
    return {
      ordinal:row.actionOrdinal,globalTurn:row.turnBefore,
      activeName:active?.name??null,
      activeEnergyCards:active?.energyCards??[],
      activeToolCards:active?.toolCards??[],
      benchNames:own.bench.map(p=>p.name),
      mobilityHeld:held,hasHeldMobility,
      strandedGarbodor,
      strandedWithHeldMobility:strandedGarbodor&&hasHeldMobility,
      sourcePerspectiveOnly:true
    };
  });
  return {
    version:VERSION,sourceSeat,
    totalSourcePasses:observations.length,
    strippedGarbodorPasses:observations.filter(x=>x.strandedGarbodor).length,
    strippedGarbodorHeldMobility:observations.filter(x=>x.strandedWithHeldMobility).length,
    passesHoldingMobility:observations.filter(x=>x.hasHeldMobility).length,
    observations,
    qualifyForGameStrength:false,
    limitation:'Postdecision ownership proves held printing only, not playable mobility or game win.'
  };
}

module.exports={VERSION,sourceOwnerPostPassMobility};
