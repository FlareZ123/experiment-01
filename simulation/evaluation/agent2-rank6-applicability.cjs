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
  const seat=row.actualStarterSeat;
  const validStart=row.verifiedFirstTurn===true && [0,1].includes(seat) &&
    row.firstTurnPlayerId===(seat===0?101:202) &&
    row.firstTurnPlayerName===(seat===0?'research-A':'research-B') &&
    row.firstDrawLogName===row.firstTurnPlayerName;
  if(!validStart)return 'unverified';
  if(seat===1-sourceSeat)return 'candidate-first';
  if(seat!==sourceSeat)return 'unverified';
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
  // When full actual Store roots are attached, bind the claimed boundaries
  // to real ordinal, seat, turn and action identities. Matching action names
  // alone would accept an action performed by the wrong actor or on a
  // different turn. Historical packets without roots remain descriptive.
  if(Array.isArray(row.rootActionLedger)){
    const matches=boundary=>{
      const root=row.rootActionLedger[boundary.ordinal];
      return root?.actionOrdinal===boundary.ordinal &&
        root.playerSlot===boundary.seat &&
        root.turnBefore===boundary.turn &&
        root.action===boundary.action;
    };
    if(row.rootActionLedger.length!==row.rootActionCount ||
      !matches(end)||!matches(reply))return 'unverified';
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
