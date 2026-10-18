'use strict';
const assert = require('node:assert/strict');

/**
 * Summarize acting-player hand and public board when a rank11-facing candidate
 * originally moved first. Observation occurs after each decision is selected;
 * it does not feed hidden information into the decision policy.
 * @param {object} report Source-dealt, fixed 16-arm attack-window report.
 * @returns {object} Compact perspective-safe response diagnosis.
 */
function summarize(report) {
  assert.equal(report.schema,'rank11-direct-held-shake-candidate-attack-window-source-v2');
  assert.equal(report.qualifiedCompetitiveGames,0);
  const rows=report.attempts.filter(a=>a.status==='engine-observed' &&
    a.actualSourceFirst===false);
  assert.equal(rows.length,8,'Both candidate-first seeds and four arms required');
  return {
    schema:'rank11-candidate-first-pass-diagnosis-v1',
    candidateFirstArms:rows.length,
    entries:rows.map(arm=>({
      seed:arm.sourceSeedIdentity,
      candidate:arm.candidate,
      lockComplete:arm.sourcePolicyCompleted,
      declarations:arm.candidateAttackDeclarationCount,
      openingActions:(arm.candidateOpeningDecisions||[]).map(row=>({
        turn:row.turnBefore,
        action:row.action,
        card:row.card||null,
        ability:row.ability||null
      })),
      passCount:(arm.candidatePassDecisions||[]).length,
      firstPasses:(arm.candidatePassDecisions||[]).slice(0,3).map(row=>({
        turn:row.turnBefore,
        ownHand:row.ownHandPrintings,
        active:row.ownPublicBoard?.active||null,
        bench:row.ownPublicBoard?.bench||[],
        opposingActive:row.opposingPublicBoard?.active?.name||null
      }))
    })),
    note:'Source-dealt retrospective choice traces. A legal available attack, copied attack effects and policy quality are not established by this summary.'
  };
}
if(require.main===module) {
  const source=require('../rank11-direct-candidate-attack-window.json');
  process.stdout.write(JSON.stringify(summarize(source),null,2)+'\n');
}
module.exports={summarize};
