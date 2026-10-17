'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Compare independently recorded continuity gaps with actual source-dealt
 * dispatches. This is a partial-State history-hook check, not a game qualifier.
 * @param {object} archive Archived root dispatch stream.
 * @param {object} continuity Independent root State continuity observation.
 * @returns {{kind:string,prior:number,next:number}[]}
 */
function auditRank10HookBoundaries(archive, continuity) {
  assert.equal(archive.schema, 'rank10-source-branch-live-dispatch-v1');
  assert.equal(continuity.schema, 'agent1-rank10-continuity-v1');
  assert.equal(archive.trial.seed, 4246551499);
  assert.equal(archive.trial.candidatePhysicalSeat, 1);
  assert.equal(archive.qualifiedForCompetitiveInference, false);
  assert.equal(continuity.qualifiedForCompetitiveInference, false);
  const trace = archive.control.fullLiveDispatchTrace;
  const candidates = continuity.findings.filter(x => x.mode === 'post-super-reconciled');
  assert.equal(candidates.length, 1);
  const observed = candidates[0];
  assert.equal(observed.seed, archive.trial.seed);
  assert.equal(observed.liveDispatches, trace.length);
  assert.equal(observed.stateChangesBetweenActions, 5);
  assert.equal(observed.firstChanges.length, 5);
  assert.equal(observed.policyMutations.length, 0);
  const matched = [];
  for (const gap of observed.firstChanges) {
    const prior = trace[gap.afterActionOrdinal];
    const next = trace[gap.beforeActionOrdinal];
    assert.equal(gap.beforeActionOrdinal, gap.afterActionOrdinal + 1);
    assert.equal(prior.step, gap.afterActionOrdinal);
    assert.equal(next.step, gap.beforeActionOrdinal);
    assert.equal(next.action, gap.nextAction);
    assert.equal(prior.continuityDigestAfter, gap.previousHash);
    assert.equal(next.continuityDigestBefore, gap.currentHash);
    assert.notEqual(gap.previousHash, gap.currentHash);
    assert.equal(gap.cardHistoryMismatch, null);
    const delta = gap.firstMismatch;
    let kind;
    if (next.action === 'PassTurnAction') {
      assert.equal(next.before.phase, 2);
      assert.equal(delta.path, '$.zones.previousAttack.length');
      assert.equal(delta.before, delta.after + 1);
      kind = 'pre-dispatch-pass-clear';
    } else {
      assert.equal(prior.action, 'ResolvePromptAction');
      assert.equal(next.action, 'ResolvePromptAction');
      assert.equal(prior.pendingPrompt?.kind, 'ChooseAttackPrompt');
      assert.equal(prior.attackChoice?.selection?.attackName, 'Kaiser Tackle');
      assert.equal(prior.attackChoice?.selection?.printing, 'Koraidon ex TEF');
      assert.equal(prior.attackChoice?.selection?.attackIndex, 1);
      assert.equal(next.pendingPrompt?.kind, 'WaitPrompt');
      assert.equal(delta.path, '$.zones.previousAttack[0].attack');
      assert.equal(delta.before, 'Kaiser Tackle');
      assert.equal(delta.after, 'Apex Dragon');
      kind = 'post-dispatch-copy-restore';
    }
    matched.push({kind, prior:prior.step, next:next.step});
  }
  assert.equal(matched.filter(x => x.kind === 'pre-dispatch-pass-clear').length, 3);
  assert.equal(matched.filter(x => x.kind === 'post-dispatch-copy-restore').length, 2);
  return matched;
}

if (require.main === module) {
  assert.equal(process.argv.length, 4);
  const archive = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const continuity = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  process.stdout.write(JSON.stringify({
    boundaries:auditRank10HookBoundaries(archive,continuity),
    sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false
  },null,2)+'\n');
}
module.exports = {auditRank10HookBoundaries};
