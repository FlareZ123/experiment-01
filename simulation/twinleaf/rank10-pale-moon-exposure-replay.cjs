'use strict';
const assert=require('node:assert/strict');
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');
const {observePaleMoonReplay}=require('./pale-moon-replay-observer.cjs');
const {replayArchivedRank10}=require('./rank10-replay-from-archive.cjs');
const {requireCompleteRank10Replay}=require('./rank10-replay-acceptance.cjs');

/** @param {object} archive */
function auditRank10PaleMoonExposure(archive) {
  const {result,arms}=observePaleMoonReplay(Store,
    ()=>replayArchivedRank10(archive));
  const verified=requireCompleteRank10Replay(result);
  assert.equal(arms.length,2);
  for(let i=0;i<2;i++)assert.equal(arms[i].dispatches,verified[i].dispatches);
  return {schema:'rank10-pale-moon-source-exposure-v1',
    trial:archive.trial,sourceInputDigests:archive.canonicalInputDigests,
    findings:verified.map((x,i)=>({arm:x.arm,...arms[i]})),
    sourceReplayMechanicsVerified:false,competitiveInferenceQualified:false};
}
module.exports={auditRank10PaleMoonExposure};
