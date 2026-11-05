'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {createHash} = require('node:crypto');
const {EXPECTED, inspect} =
  require('../simulation/evaluation/agent46-issue25-steward-archive-audit.cjs');

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

/** @returns {object} Synthetic eight-arm archive, not an observed native run. */
function fixture() {
  const attempts = EXPECTED.map(id => {
    const seat = id.includes(':A:') ? 1 : 0;
    const roots = [
      {actionOrdinal:0, action:'ResolvePromptAction', playerSlot:1-seat,
        turnBefore:0, pendingPrompt:'WaitPrompt'},
      {actionOrdinal:1, action:'PassTurnAction', playerSlot:seat,
        turnBefore:1},
      {actionOrdinal:2, action:'PlayCardAction', playerSlot:seat,
        turnBefore:1}
    ];
    const digest = sha(Buffer.from(JSON.stringify(roots)));
    return {id, actualRawTrialId:id, originalSourceSeat:seat,
      publicRootActions:roots, publicRootActionsTruncated:false,
      publicRootActionCount:3, publicRootLedgerSha256Computed:digest,
      publicRootLedgerSha256Reported:digest, status:'returned-unqualified'};
  });
  return {
    schema:'agent1-issue25-joined-v4-public-execution-receipt-v1',
    actuallyExecutingManifest:{
      policyEntryPoint:
        'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
      nativeRootActionLimit:48, releaseQualified:false,
      competitiveGamesQualified:0
    },
    registration:{expectedIds:[...EXPECTED],returnedIds:[...EXPECTED],
      exactJoinedByTrialId:true},
    attempts,qualifiedCompetitiveGames:0,
    developmentGate:{competitiveGameQualified:false}
  };
}

/** @param {object} obj @param {'v4'|'v5'} [v] @returns {object} */
function run(obj,v='v4') {
  const bytes=Buffer.from(JSON.stringify(obj)+'\n');
  return inspect(bytes,sha(bytes)+'  issue25-steward-'+v+'.json\n',v);
}

test('intact eight-arm archive preserves source Pass denominator, no games',()=>{
  const result=run(fixture());
  assert.equal(result.integrity,'PASS-bounded-file-and-root-custody');
  assert.equal(result.returnedAttempts,8);
  assert.equal(result.sourcePassRoots,8);
  assert.equal(result.sourceNonPromptNonPassRoots,8);
  assert.equal(result.sourceAttackRoots,0);
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.ownerVisiblePassOpportunityProven,false);
});

test('same numeric seed does not impose cross-contender deal pairing',()=>{
  const result=run(fixture());
  assert.equal(result.failures.length,0);
});

test('v5 requires its actually selected policy entry point',()=>{
  const f=fixture();
  const wrong=run(f,'v5');
  assert.ok(wrong.failures.includes('wrong-selected-policy-entry-point'));
  f.actuallyExecutingManifest.policyEntryPoint =
    'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs';
  assert.equal(run(f,'v5').failures.length,0);
});

test('tampered detached checksum fails before parsing',()=>{
  const b=Buffer.from(JSON.stringify(fixture()));
  assert.equal(inspect(b,'bad  issue25-steward-v4.json\n','v4').integrity,
    'FAIL-checksum');
});

test('duplicate returned ID and a missing original source are rejected',()=>{
  const f=fixture();
  f.registration.returnedIds[0]=f.registration.returnedIds[1];
  f.attempts[0].id=f.attempts[1].id;
  const a=run(f);
  assert.ok(a.failures.includes('missing-or-duplicate-returned-ids'));
  assert.ok(a.failures.includes('missing-or-duplicate-actual-attempts'));
});

test('silently substituted raw identity fails',()=>{
  const f=fixture();
  f.attempts[0].actualRawTrialId='11:102:A:champion-reference';
  assert.ok(run(f).failures.some(x=>x.includes('raw-trial-id-mismatch')));
});

test('removal, truncation and root count inflation do not pass custody',()=>{
  const f=fixture();
  f.attempts[0].publicRootActionsTruncated=true;
  f.attempts[1].publicRootActionCount=48;
  const a=run(f);
  assert.ok(a.failures.some(x=>x.includes('missing-or-truncated')));
  assert.ok(a.failures.some(x=>x.includes('root-count-mismatch')));
});

test('same checksum regenerated over a changed root cannot fool ledger checks',()=>{
  const f=fixture();
  f.attempts[0].publicRootActions[1].action='AttackAction';
  const a=run(f);
  assert.ok(a.failures.some(x=>x.includes('archived-computed-ledger-hash')));
  assert.ok(a.failures.some(x=>x.includes('engine-reported-ledger-hash')));
});

test('source seat inversion and noncontiguous actions are rejected',()=>{
  const f=fixture();
  f.attempts[0].originalSourceSeat=0;
  f.attempts[1].publicRootActions[2].actionOrdinal=7;
  const a=run(f);
  assert.ok(a.failures.some(x=>x.includes('source-seat-mismatch')));
  assert.ok(a.failures.some(x=>x.includes('invalid-root-order-or-seat')));
});

test('missing engine digest remains an explicit uncertainty',()=>{
  const f=fixture();
  f.attempts[0].publicRootLedgerSha256Reported=null;
  const a=run(f);
  assert.equal(a.integrity,'PASS-bounded-file-and-root-custody');
  assert.equal(a.engineDigestUnverified,1);
  assert.equal(a.warnings.length,1);
});
