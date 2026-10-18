'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** Read a frozen source-dealt artifact. No simulator compilation or new deals. */
function analyze(record) {
  assert.equal(record.schema,'registered-nightwatch-source-16seed-paired-v1');
  assert.equal(record.preregistration,
    'results/twinleaf/night-watch-prospective-batch-registration.md');
  assert.equal(record.qualifiedForCompetitiveInference,false);
  const rows=record.pairedRows;
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(row=>row.seed)).size,16);
  const differences=[];
  let lockOpportunitiesOriginal=0;
  let lockOpportunitiesUniform=0;
  let finishedPairs=0;
  for(const row of rows) {
    assert.equal(row.status,'complete');
    const a=row.original;
    const b=row.uniform;
    assert.ok(a && b);
    assert.equal(a.seed,row.seed);
    assert.equal(b.seed,row.seed);
    assert.equal(a.sourceDigest,b.sourceDigest);
    assert.equal(a.trueFirstSlot,b.trueFirstSlot);
    assert.equal(a.declaredNightWatch,0);
    assert.equal(b.declaredNightWatch,0);
    assert.deepEqual(a.actualRootNightWatchChoices,[]);
    assert.deepEqual(b.actualRootNightWatchChoices,[]);
    assert.equal(b.hook.invalid,0);
    if(a.sourceOpportunityTurn!==null)lockOpportunitiesOriginal++;
    if(b.sourceOpportunityTurn!==null)lockOpportunitiesUniform++;
    if(a.finished && b.finished)finishedPairs++;
    const change={seed:row.seed,firstSlot:a.trueFirstSlot,
      original:{finished:a.finished,winner:a.winner,actions:a.actions,
        sourceLockCompleted:a.sourceLockCompleted},
      uniform:{finished:b.finished,winner:b.winner,actions:b.actions,
        sourceLockCompleted:b.sourceLockCompleted}};
    if(a.finished!==b.finished || a.winner!==b.winner ||
       a.actions!==b.actions ||
       a.sourceLockCompleted!==b.sourceLockCompleted)differences.push(change);
  }
  return {
    schema:'nightwatch-source-batch-read-only-evidence-v1',
    originalRun:39140517254,
    allRegisteredRows:rows.length,failedRows:record.failedRowCount,
    realFirstSeatCounts:record.actualFirstSlotCounts,
    attacksOriginal:record.originalAttackExposures,
    attacksUniform:record.uniformAttackExposures,
    sourcePolicyOpportunityOriginal:lockOpportunitiesOriginal,
    sourcePolicyOpportunityUniform:lockOpportunitiesUniform,
    bothFinished:finishedPairs,
    differencesOnCompletionWinnerActionsOrLock:differences,
    differencesCount:differences.length,
    replayedGames:0,
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module) {
  const file=process.argv[2] || path.resolve(process.cwd(),
    'rank11-night-watch-prospective-batch.json');
  process.stdout.write(JSON.stringify(analyze(JSON.parse(fs.readFileSync(file,'utf8'))),
    null,2)+'\n');
}

module.exports={analyze};
