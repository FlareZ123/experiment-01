'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Reduce historical original-Store outcomes to factual event turn markers.
 * A hypothetical referee call is never treated as a measured paper-time call.
 *
 * @param {object} row
 * @param {number} index
 * @returns {object}
 */
function summarize(row,index){
  assert.equal(row.status,'native-original-K0-and-recipient-owner-K1-confirmed');
  const audit=row.hypotheticalAichiPrizeCutoffs;
  assert.equal(audit.paperClockCertified,false);
  assert.equal(audit.actualPaperTimeCallObserved,false);
  assert.equal(row.nativePublicTurnClosures.paperClockCertified,false);
  const snapshots=audit.snapshots;
  assert.ok(Array.isArray(snapshots));
  const byWinner=seat=>snapshots.filter(x=>x.conditionalWinner===seat)
    .map(x=>({turn:x.turnClosed,prizes:x.publicPrizes}));
  const extension=snapshots.filter(x=>x.conditionalStatus==='bracket-extension-required')
    .map(x=>({turn:x.turnClosed,prizes:x.publicPrizes}));
  const reverse=snapshots.filter(x=>x.conditionalWinner!==null &&
    x.conditionalWinner!==row.engineWinner)
    .map(x=>({turn:x.turnClosed,prizes:x.publicPrizes}));
  return {
    arm:index,
    preferRadiant:row.preferRadiantAfterBlowerSearch,
    activateRadiant:row.activateRadiantClimacticGate,
    vMaxCount:row.recipientRadiantVmaxSelectedCount,
    nativeEngine:{winner:row.engineWinner,actions:row.actionCount,
      lastGlobalTurn:row.lastEngineTurn,prizes:row.prizesRemaining},
    evenTurnSnapshotCount:snapshots.length,
    conditionalSeat0Win:byWinner(0),
    conditionalSeat1Win:byWinner(1),
    conditionalExtension:extension,
    hypotheticalOppositeOfEngineWinner:reverse,
    paperClockCertified:false,
    status:'HYPOTHETICAL_ONLY_WITH_UNKNOWN_REAL_TIME_CALL'
  };
}

/** @param {object} data @returns {object} */
function summarizeRun(data){
  assert.equal(data.attempted,4);
  assert.equal(data.nativeVerified,4);
  assert.equal(data.competitiveQualifiedGames,0);
  assert.deepEqual(data.rows.map(x=>[x.engineWinner,x.actionCount,x.lastEngineTurn]),
    [[1,199,28],[0,215,30],[1,283,46],[1,195,30]]);
  return {schema:'agent1-hypothetical-native-prize-closure-summary-v1',
    selectedOriginalPhysicalDealCount:1,
    competitivelyQualifiedGames:0,
    realTimeCallObserved:false,
    rows:data.rows.map(summarize)};
}

if(require.main===module){
  const data=JSON.parse(fs.readFileSync('agent1-postblower-radiant-native.json','utf8'));
  process.stdout.write('AGENT1_PRIZE_CLOCK_SUMMARY '+JSON.stringify(summarizeRun(data))+'\n');
}

module.exports={summarize,summarizeRun};
