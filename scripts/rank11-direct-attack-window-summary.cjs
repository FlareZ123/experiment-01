'use strict';
const assert=require('node:assert/strict');
const {WITNESSES,VARIANTS}=
  require('../simulation/twinleaf/rank11-direct-candidate-attack-window.cjs');
/**
 * @param {object} report Full fixed source-dealt mechanical comparison.
 * @returns {object} Audited, compact response-channel summary.
 */
function summarize(report) {
  assert.equal(report.schema,'rank11-direct-held-shake-candidate-attack-window-source-v2');
  assert.equal(report.qualifiedCompetitiveGames,0);
  const expected=new Set(WITNESSES.flatMap(w=>VARIANTS.map(v=>w.id+':'+v.id)));
  const seen=new Set();
  for(const arm of report.attempts) {
    const id=arm.sourceSeedIdentity+':'+arm.candidate;
    assert.ok(expected.has(id)&&!seen.has(id),'Wrong fixed arm');
    seen.add(id);
    assert.equal(arm.qualifiedForCompetitiveInference,false);
    assert.ok(['engine-observed','engine-exception'].includes(arm.status));
    if(arm.status==='engine-observed') {
      assert.equal(arm.startVerified,true);
      assert.equal(arm.engine,arm.expectedEngine);
      assert.deepEqual(arm.engineDeckHashes,
        [arm.sourceEngineDeckDigest,arm.candidateEngineDeckDigest]);
    }
  }
  assert.equal(seen.size,expected.size);
  return {
    schema:'rank11-direct-candidate-response-summary-v2',
    totalArms:seen.size,
    observed:report.attempts.filter(a=>a.status==='engine-observed').length,
    errors:report.attempts.filter(a=>a.status==='engine-exception').length,
    witnessLocks:report.attempts.filter(a=>a.sourcePolicyCompleted===true).length,
    afterWitnessAttackArms:report.attempts.filter(a=>
      a.sourcePolicyCompleted===true &&
      a.candidatePostWitnessDeclarationCount>0).length,
    arms:report.attempts.map(a=>({
      seed:a.sourceSeedIdentity,candidate:a.candidate,status:a.status,
      actualSourceFirst:a.actualSourceFirst??null,
      lockComplete:a.sourcePolicyCompleted===true,
      candidateDeclarations:a.candidateAttackDeclarationCount??null,
      afterWitness:a.candidatePostWitnessDeclarationCount??null,
      attacks:(a.candidatePostWitnessDeclarations||[]).map(e=>e.attackName),
      blowerRemovals:a.candidateBlowerAudit?.confirmedToolRemovals??null,
      error:a.status==='engine-exception'?String(a.error||'').slice(0,200):null
    })),
    competitiveGamesQualified:0
  };
}
if(require.main===module) {
  const report=require('../rank11-direct-candidate-attack-window.json');
  process.stdout.write(JSON.stringify(summarize(report),null,2)+'\n');
}
module.exports={summarize};
