'use strict';

const VERSION='agent44-native-epoch-boundary-audit-v1';

/**
 * Read only public Store-clock metadata. This is an error diagnostic, not a
 * substitute for the original bilateral packet's monotone-epoch verifier.
 * A native reset marker can authenticate the engine transition, but cannot
 * establish the new physical-deal identity, paper tiebreak rules or wins.
 *
 * @param {object} game Genuine runMatch output
 * @returns {object} Public, bounded, mutation-free diagnostics
 */
function auditNativeEpochBoundaries(game){
  const roots=game.rootActionLedger;
  const marks=game.suddenDeathClockResets;
  const shapeOk=Array.isArray(roots)&&Array.isArray(marks);
  if(!shapeOk)return {
    version:VERSION,sourceProtocol:game.suddenDeathClockResetProtocol??null,
    shapeOk:false,clockReversals:[],orphanMarkers:[],
    nativeMarkersAuthentic:false,qualifiedForCompetitiveInference:false
  };
  const evidence=[];
  const resetRootOrdinals=new Set();
  for(let i=0;i<roots.length;i++){
    const r=roots[i];
    if(!Number.isSafeInteger(r?.turnBefore)||
       !Number.isSafeInteger(r?.turnAfter)||
       r.turnAfter>=r.turnBefore)continue;
    resetRootOrdinals.add(i);
    const matching=marks.filter(m=>m.actionOrdinal===i);
    const marker=matching.length===1?matching[0]:null;
    const exact=Boolean(marker &&
      r.actionOrdinal===i &&
      marker.actingSeat===r.playerSlot &&
      marker.action===r.action &&
      marker.pendingPrompt===(r.pendingPrompt??null) &&
      marker.fromTurn===r.turnBefore &&
      marker.toTurn===r.turnAfter &&
      marker.afterSuddenDeath===true &&
      marker.enteredSetup===true);
    evidence.push({
      ordinal:i,playerSlot:r.playerSlot,action:r.action,
      pendingPrompt:r.pendingPrompt??null,
      turnBefore:r.turnBefore,turnAfter:r.turnAfter,
      initiatingRootActionOrdinal:r.initiatingRootActionOrdinal??null,
      nativeMarkerCount:matching.length,
      nativeMarkerExact:exact,
      marker:marker?{
        fromTurn:marker.fromTurn,toTurn:marker.toTurn,
        fromPhase:marker.fromPhase??null,toPhase:marker.toPhase??null,
        beforeSuddenDeath:marker.beforeSuddenDeath??null,
        afterSuddenDeath:marker.afterSuddenDeath,
        enteredSetup:marker.enteredSetup,
        ...(marker.preDispatchWinPredicates ?
          {preDispatchWinPredicates:marker.preDispatchWinPredicates} : {})
      }:null
    });
  }
  const orphanMarkers=marks.filter(m=>
    !resetRootOrdinals.has(m.actionOrdinal)).map(m=>({
      actionOrdinal:m.actionOrdinal,actingSeat:m.actingSeat,
      action:m.action,fromTurn:m.fromTurn,toTurn:m.toTurn
    }));
  const sourceProtocol=game.suddenDeathClockResetProtocol??null;
  return {
    version:VERSION,sourceProtocol,shapeOk:true,rootCount:roots.length,
    rootProtocol:game.rootActionLedgerProtocol??null,
    sourceDealEpochs:game.sourceDealEpochs??null,
    clockReversals:evidence,orphanMarkers,
    nativeMarkersAuthentic:
      sourceProtocol==='actual-native-sudden-death-clock-transition-v1' &&
      evidence.every(x=>x.nativeMarkerExact)&&orphanMarkers.length===0,
    // Native matching is just the first of multiple game-epoch gates.
    nativeNewDealFingerprintAuthenticated:false,
    paperTiebreakAndClockAuthenticated:false,
    crossEpochBilateralPacketAllowed:false,
    qualifiedForCompetitiveInference:false
  };
}

module.exports={VERSION,auditNativeEpochBoundaries};
