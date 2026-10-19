'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Audit all archived arms, keeping attempted source opportunities separate
 * from completed source policy sequences and competitive game evidence.
 * @param {object} cohort Frozen Agent41 partition-0 archive
 * @returns {object}
 */
function disposition(cohort) {
  assert.equal(cohort.schema,
    'agent41-crossrank-bilateral-exploratory-observations-v1');
  assert.equal(cohort.partition, 0);
  assert.equal(cohort.partitionScheduled, 24);
  assert.equal(cohort.partitionRecorded, 24);
  assert.ok(Array.isArray(cohort.rows));
  assert.equal(cohort.rows.length, 24);
  const ids = cohort.rows.map(row => row.id);
  assert.equal(new Set(ids).size, 24, 'Duplicate physical trial arm');
  assert.deepEqual(cohort.statusCounts,
    {'engine-terminal':13,'action-cap-or-incomplete':10,'engine-error':1});

  const opportunities = cohort.rows.filter(row =>
    row.rank === 6 ?
      Boolean(row.sourcePolicyAudit?.turn2?.started ||
        row.sourcePolicyAudit?.turn3?.started) :
      row.rank === 11 &&
        row.sourcePolicyAudit?.opportunityTurn != null);
  assert.equal(opportunities.filter(row => row.rank === 6).length, 3);
  assert.equal(opportunities.filter(row => row.rank === 11).length, 1);

  const triggered = opportunities.map(row => ({
    id:row.id, rank:row.rank, repeat:row.repeat, seed:row.seed,
    candidateSlot:row.candidateSlot,candidateId:row.candidateId,
    sourceActuallyFirst:row.sourceActuallyFirst,
    sourcePolicyAudit:row.sourcePolicyAudit,
    candidatePolicyAudit:row.candidatePolicyAudit,
    sourceTriggerTurn:row.sourceTriggerTurn,
    candidateFirstTwelveResponses:row.responseDecisions,
    totalSourceAttackDeclarations:row.sourceAttackDeclarations,
    totalCandidateAttackDeclarations:row.candidateAttackDeclarations,
    copiedAttackNames:row.candidateChosenCopiedAttackNames,
    status:row.status, actions:row.actions,turns:row.turns,
    prizesRemaining:row.prizesRemaining,
    engineEndReason:row.engineEndReason,
    terminalTransition:row.terminalTransition,
    competitiveQualified:false
  }));

  const notTerminal = cohort.rows.filter(row =>
    row.status !== 'engine-terminal').map(row => ({
    id:row.id,rank:row.rank,repeat:row.repeat,seed:row.seed,
    candidateId:row.candidateId,candidateSlot:row.candidateSlot,
    category:row.status==='engine-error'?'store-dispatch-error':
      row.actions >= cohort.maxRootActions?'root-action-cap':
      'incomplete-below-root-action-cap',
    actions:row.actions??null,turns:row.turns??null,
    sourcePolicyStarted:row.rank===6?
      Boolean(row.sourcePolicyAudit?.turn2?.started||
        row.sourcePolicyAudit?.turn3?.started):
      row.sourcePolicyAudit?.opportunityTurn!=null,
    sourceAttackDeclarations:row.sourceAttackDeclarations??null,
    candidateAttackDeclarations:row.candidateAttackDeclarations??null,
    error:row.error??null
  }));

  const mismatchedPairs=(cohort.pairs||[])
    .filter(pair => !pair.sameActualFirstAndSourceOwnHand)
    .map(pair => ({
      id:pair.id,armIds:pair.armIds,
      members:cohort.rows.filter(row=>pair.armIds.includes(row.id))
        .map(row=>({
          id:row.id,sourceActuallyFirst:row.sourceActuallyFirst,
          sourceHandHash:row.sourceFirstRecordedOwnHandSha256??null,
          sourceFirstObservedTurn:row.sourceFirstRecordedHandTurn??null
        }))
    }));
  return {
    archive:cohort.schema,partition:0,
    registered:cohort.partitionScheduled,
    recorded:cohort.partitionRecorded,
    independentSeedSeatStreams:cohort.independentSeedSeatStreams,
    sourceOpportunities:opportunities.length,
    triggerCompletionCaveat:'A completed policy sequence and aggregate attack declarations cannot by themselves prove the exact printed effect or competent reply.',
    triggered,notTerminal,mismatchedPairs,
    nextDataRequired:'Full action/effect and candidate/opponent response trace for each triggered root; owner-visible decision plus engine state for rejected PlayCardAction; all capped actions remain censored.',
    competitiveQualifiedGames:0
  };
}

if (require.main === module) {
  const file=process.argv[2]||'agent41-crossrank-observed.json';
  const result=disposition(JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={disposition};
