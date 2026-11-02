'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {verifyNativeHistoricalControls}=
  require('./agent50-native-control-gate.cjs');

/**
 * When both original-game fair and Supporter research hooks are requested,
 * require the native source and reconstruction to select precisely the same
 * first finite-scored decision with the same complete native RNG tape.
 * This is developmental decision fidelity only, never game qualification.
 *
 * @param {object} packet Four original frozen historical trial rows.
 * @returns {{authenticatedTrials:4,scoredParityQualified:4,competitiveGames:0}}
 */
function verifyNativeScoredFairParity(packet){
  verifyNativeHistoricalControls(packet);
  const failures=[];
  for(const row of packet.rows){
    const d=row.diagnostic??{};
    const tape=d.nativeSameWorldTape??{};
    const finite=d.nativeTapeFiniteScores;
    if(!Number.isSafeInteger(finite)||finite<1 ||
      tape.sameWorldDecisionParityQualified!==true ||
      tape.physicalCloneMatched!==true ||
      tape.sourceRootUnchanged!==true ||
      tape.selectedActionMatched!==true ||
      tape.replayError!==null ||
      !Number.isSafeInteger(tape.tapeDraws)||tape.tapeDraws<0 ||
      tape.consumed!==tape.tapeDraws ||
      row.sameWorldParityQualified!==true ||
      row.competitiveGameQualified!==false){
      failures.push({
        trialId:row.trialId,
        finite:finite??null,strictParity:tape.sameWorldDecisionParityQualified??null,
        rngDraws:tape.tapeDraws??null,consumed:tape.consumed??null,
        error:tape.replayError??null
      });
    }
  }
  assert.deepEqual(failures,[],
    'First finite-scored native replay did not reproduce all frozen source decisions');
  return {
    authenticatedTrials:4,scoredParityQualified:4,competitiveGames:0,
    scope:'four historical first-finite decisions, not full matches'
  };
}

if(require.main===module){
  assert.ok(process.argv[2],'Supply original native packet JSON');
  const packet=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  console.log('AGENT23_NATIVE_SCORED_FAIR_PARITY',JSON.stringify(
    verifyNativeScoredFairParity(packet)));
}
module.exports={verifyNativeScoredFairParity};
