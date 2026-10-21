'use strict';

const fs=require('node:fs');
const assert=require('node:assert/strict');

/** @param {string} path @returns {object} */
const load=path=>JSON.parse(fs.readFileSync(path,'utf8'));
/** @param {object} row @returns {object|null} */
const turn22=row=>row.actorOnlyDecisionCoverage
  ?.detailedComponentAudits?.root?.nativeRootAcceptances
  ?.find(x=>x.globalTurn===22 && x.seat===row.candidateSeat &&
    x.kind==='attach-basic-energy')??null;
/** @param {object} row @returns {object[]} */
const continuedSource=row=>row.rootActionLedger?.filter(x=>x.playerSlot===
  row.sourceSeat&&x.turnBefore>=23&&x.turnBefore<=27&&
  ['PlayCardAction','AttackAction','PassTurnAction'].includes(x.action))
  .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
    action:x.action,attack:x.attack??null,card:x.card??null}))??[];
/** @param {object} row @returns {object} */
const summary=row=>({
  trial:row.trial.id,
  fingerprint:row.sourceDealFingerprint,
  actorAuditPresent:Boolean(row.actorOnlyDecisionCoverage),
  rootDigest:row.rootActionLedgerSha256??null,
  rootCount:row.rootActionCount??null,
  attackDeclarations:row.attackDeclarations??null,
  finalPrizes:row.finalPrizes??null,
  engineFinished:row.finished??null,
  winner:row.winner??null,
  status:row.status??'completed',
  sourceTurns23Through27:continuedSource(row)
});

/**
 * Strict same-checkout experiment. Protect against silently comparing
 * different source deals, opponent lists, physical starts, or policy flags.
 * A changed attachment proves a decision change, never a winning line.
 */
function compare(control,treatment){
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  assert.equal(control.sourceFirstRetrospective,true);
  assert.equal(treatment.sourceFirstRetrospective,true);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(treatment.competitiveQualifiedGames,0);
  const pairs=[];
  for(let i=0;i<4;i++){
    const a=control.rows[i],b=treatment.rows[i];
    assert.deepEqual(a.trial,b.trial);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint,
      'Source physical deal mismatch');
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.sourceActuallyFirst,true);
    assert.equal(b.sourceActuallyFirst,true);
    pairs.push({control:summary(a),treatment:summary(b)});
  }
  const idx=control.rows.findIndex(r=>r.trial.rank===11&&
    r.trial.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(idx>=0,'Missing actual rank11 New Moon source-first test');
  const a=control.rows[idx],b=treatment.rows[idx];
  const old=turn22(a),next=turn22(b);
  assert.ok(old&&next,'Both actual Store actor attachments must settle');
  assert.equal(old.intent.slot,'active');
  assert.equal(old.intent.attackName,'Psyray');
  assert.equal(old.intent.gapAfter,2);
  assert.equal(next.intent.slot,'bench',
    'The specific T22 live decision did not change');
  assert.equal(next.intent.attackName,'Poltergeist');
  assert.equal(next.intent.gapAfter,1);
  assert.equal(next.intent.shorterDamagingPath,true);
  for(const x of [old,next]){
    assert.equal(x.accepted,true);
    assert.equal(x.nativePhysicalEffect,'confirmed-public-effect');
  }
  return {
    schema:'agent8-sourcefirst-near-term-damage-recipient-native-pair-v1',
    controlledFactor:'Only owner-visible near-term damaged-attack staging flag',
    selectedTurn:22,
    originalAttachment:old.intent,
    alternativeAttachment:next.intent,
    sourceResponse23Through27:{
      control:continuedSource(a),treatment:continuedSource(b)
    },
    pairs,
    competitiveQualified:false,
    caveat:'Retrospective source-first selected physical deal; native policy and clock incomplete. A different attachment cannot prove attack legality or stronger match performance.'
  };
}
if(require.main===module){
  const [control,treatment]=process.argv.slice(2);
  assert.ok(control&&treatment,
    'Pass control and treatment source-first JSON paths');
  process.stdout.write(JSON.stringify(compare(load(control),load(treatment)),null,2)+'\n');
}
module.exports={compare,turn22,continuedSource};
