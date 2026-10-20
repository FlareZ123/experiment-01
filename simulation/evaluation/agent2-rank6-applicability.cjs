'use strict';

const APPLICABILITY_CELLS=[
  'blocked-eligible-target',
  'no-eligible-target',
  'eligible-no-block-observed',
  'candidate-first',
  'unverified'
];

/**
 * Descriptive in-play rank-6 Initialization applicability. The native observer
 * excludes Future Pokémon and non-Rule-Box Powers before testing printed
 * Powers; a zero eligible count does not demonstrate that the source's lock
 * failed. Older packets and ungrounded producer assertions remain unverified.
 * This result is never an independent source-effect or game-win certificate.
 *
 * @param {object|undefined} row Registered physical game observation.
 * @param {0|1} sourceSeat Physical source seat.
 * @returns {string}
 */
function rank6CandidateApplicability(row,sourceSeat){
  if(!row || row.rank!==6 || ![0,1].includes(sourceSeat))return 'unverified';
  if(row.actualStarterSeat===1-sourceSeat && row.verifiedFirstTurn===true){
    return 'candidate-first';
  }
  if(row.actualStarterSeat!==sourceSeat || row.verifiedFirstTurn!==true){
    return 'unverified';
  }
  const e=row.rank6PassivePressure;
  const end=e?.sourceTurnOneEndRoot;
  const reply=e?.candidateTurnTwoFirstRoot;
  if(e?.schema!==
      'agent41-rank6-passive-initialization-root-classification-v1'||
    e.sourceSeat!==sourceSeat || e.candidateSeat!==1-sourceSeat ||
    e.sourceActuallyFirst!==true ||
    e.sourceActiveContinuity!==true ||
    e.candidateTurnTwoSnapshotPresent!==true ||
    !Number.isSafeInteger(row.rootActionCount) ||
    !Number.isSafeInteger(end?.ordinal) ||
    !Number.isSafeInteger(reply?.ordinal) ||
    end.ordinal<0 || end.ordinal>=reply.ordinal ||
    reply.ordinal>=row.rootActionCount ||
    end.turn!==1 || end.seat!==sourceSeat ||
    end.action!=='PassTurnAction' ||
    reply.turn!==2 || reply.seat!==1-sourceSeat ||
    !Number.isSafeInteger(e.examinedPrintedPowerCount) ||
    e.examinedPrintedPowerCount<0){
    return 'unverified';
  }
  // When the unabridged root ledger is present, reject a contradictory
  // boundary instead of relying on the classification packet alone.
  if(Array.isArray(row.rootActionLedger) &&
    (row.rootActionLedger[end.ordinal]?.action!==end.action ||
      row.rootActionLedger[reply.ordinal]?.action!==reply.action)){
    return 'unverified';
  }
  if(e.nativeCapabilitySuppressed===true &&
    e.examinedPrintedPowerCount>0 &&
    typeof e.suppressedPowerPrinting==='string' &&
    e.suppressedPowerPrinting.length>0 &&
    typeof e.suppressedPowerName==='string' &&
    e.suppressedPowerName.length>0){
    return 'blocked-eligible-target';
  }
  if(e.nativeCapabilitySuppressed===false &&
    e.examinedPrintedPowerCount===0 &&
    e.status==='no-eligible-visible-power'){
    return 'no-eligible-target';
  }
  if(e.nativeCapabilitySuppressed===false &&
    e.examinedPrintedPowerCount>0 &&
    e.status==='native-printed-power-block-unverified'){
    return 'eligible-no-block-observed';
  }
  return 'unverified';
}

module.exports={APPLICABILITY_CELLS,rank6CandidateApplicability};
