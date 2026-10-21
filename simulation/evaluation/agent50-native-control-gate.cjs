'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Reject superficially green native observation jobs whose original pinned
 * Store games or instrumented controls never executed successfully.
 * Historical same-world replay parity vetoes remain legitimate research
 * negatives when both genuine Store games actually completed.
 *
 * @param {object} packet Four-arm native historical development output.
 * @returns {{authenticatedTrials:number,competitiveGames:number}}
 */
function verifyNativeHistoricalControls(packet){
  assert.ok(packet&&typeof packet==='object');
  assert.equal(packet.attempts,4,'Expected four frozen historical attempts');
  assert.ok(Array.isArray(packet.rows)&&packet.rows.length===4,
    'Native audit must preserve all four historical rows');
  assert.equal(packet.independentlyQualifiedCompetitiveGames,0,
    'Historical development controls cannot certify match wins');
  const failures=packet.rows.filter(row=>
    row.samePlayback!==true ||
    row.actualExecutionAuthenticated!==true ||
    row.noninterferenceVerified!==true ||
    row.classification==='control-engine-error' ||
    row.classification==='probe-engine-or-audit-error'
  );
  assert.equal(failures.length,0,
    'Native original-Store control/probe failed: '+
    failures.map(row=>row.trialId+':'+row.classification).join(', '));
  return {authenticatedTrials:packet.rows.length,competitiveGames:0};
}

if(require.main===module){
  assert.ok(process.argv[2],'Supply a native historical packet JSON path');
  const packet=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  console.log('AUTHENTIC_NATIVE_CONTROLS',JSON.stringify(
    verifyNativeHistoricalControls(packet)));
}
module.exports={verifyNativeHistoricalControls};
