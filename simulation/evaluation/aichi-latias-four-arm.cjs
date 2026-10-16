'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const ENTRYPOINT = path.join(__dirname, 'aichi-campaign-execute.cjs');
const TARGET = path.join(process.cwd(), 'aichi-latias-factorial-full.json');
const MODES = [
  {id:'aliased-control',safeClone:false,latias:false},
  {id:'aliased-latias',safeClone:false,latias:true},
  {id:'experimental-clone-control',safeClone:true,latias:false},
  {id:'experimental-clone-latias',safeClone:true,latias:true}
];

/** @param {object} mode @returns {object} Complete immutable six-record diagnostic. */
function runMode(mode) {
  const env = {
    ...process.env,
    AICHI_DIAGNOSTIC_RANKS:'10',
    AICHI_DIAGNOSTIC_SEED_PROTOCOL:'decorrelated-slots-v3',
    AICHI_POLICY_PROFILE:'fixed-core-v1',
    AICHI_LATIAS_ATTACK_READY:mode.latias?'1':'0',
    AICHI_PROTOTYPE_SAFE_SIM:mode.safeClone?'1':'0',
    AICHI_ATTACK_PASS_PROBE:'1',
    AICHI_SHADOW_ENERGY:'0',
    AICHI_SHADOW_ENERGY_GLOBAL:'0',
    AICHI_OPENING_PIVOT:'0',
    AICHI_ATTACK_BEFORE_RETREAT:'0',
    AICHI_ATTACK_CANDIDATE_ONLY:'0'
  };
  const json=execFileSync(process.execPath,[ENTRYPOINT],{
    env,encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024
  });
  return JSON.parse(json);
}

/** @param {object} event @returns {object|null} */
function conciseEvent(event) {
  if (!event) return null;
  const keys=['actionOrdinal','turnBefore','turnAfter','playerSlot','action',
    'card','attack','attacker','ability','cardSelection','optionSelection'];
  return Object.fromEntries(keys.filter(key=>Object.hasOwn(event,key))
    .map(key=>[key,event[key]]));
}

/**
 * @param {object} a First game record.
 * @param {object} b Second game record.
 * @returns {object} First divergent meaningful-action trace entry if any.
 */
function firstDifference(a,b) {
  const x=a.traceSummary?.chronologicalActionTrace;
  const y=b.traceSummary?.chronologicalActionTrace;
  if (!Array.isArray(x)||!Array.isArray(y)) return {status:'unavailable'};
  const shared=Math.min(x.length,y.length);
  for(let i=0;i<shared;i++) {
    if(JSON.stringify(x[i])!==JSON.stringify(y[i])) {
      return {
        status:'diverged',index:i,first:conciseEvent(x[i]),
        second:conciseEvent(y[i]),lengths:[x.length,y.length],
        fullTraceFingerprints:[
          a.traceSummary.chronologicalActionTraceSha256,
          b.traceSummary.chronologicalActionTraceSha256
        ]
      };
    }
  }
  return {status:x.length===y.length?'identical-captured-actions':'different-length',
    index:shared,lengths:[x.length,y.length]};
}

/** @param {object} record */
function recordSummary(record) {
  return {
    trialId:record.trialId,
    status:record.status,
    seed:record.seed,
    candidateDigest:record.candidateDigest,
    opponentDigest:record.opponentDigest,
    actualTurn:record.actualTurn,
    candidateAttacks:record.candidateAttacks,
    opponentAttacks:record.opponentAttacks,
    gameWinner:record.winner??null,
    prizesByPhysicalSeat:record.traceSummary?.prizesRemaining??null,
    finalState:record.traceSummary?.finalState??null,
    blockerFlags:record.qualityFlags??[],
    traceLength:record.traceSummary?.capturedMeaningfulActions??null,
    traceSha256:record.traceSummary?.chronologicalActionTraceSha256??null
  };
}

/**
 * A manual four-arm fixed-seed diagnostic (24 engine games), *not* a match
 * strength estimator. Each arm is computed with one pinned revision and
 * identical candidate/opponent identities. Full traces archived separately.
 */
function runFactorial() {
  const outputs=MODES.map(mode=>({mode, report:runMode(mode)}));
  const base=outputs[0].report;
  assert.equal(base.seedProtocol,'decorrelated-slots-v3');
  assert.deepEqual(base.selectedPilotRanks,[10]);
  assert.equal(base.records.length,6);
  for(const {report} of outputs) {
    assert.equal(report.planDigest,base.planDigest);
    assert.equal(report.expectedEngineRevision,base.expectedEngineRevision);
    assert.equal(report.researchRevision,base.researchRevision);
    assert.equal(report.seedBase,base.seedBase);
    assert.deepEqual(report.candidateRows,base.candidateRows);
    assert.equal(report.records.length,base.records.length);
    for(let i=0;i<base.records.length;i++) {
      const a=base.records[i],b=report.records[i];
      for(const field of ['trialId','seed','candidateDigest','opponentDigest',
        'candidateEngineSlot','actualTurn'])
        assert.equal(b[field],a[field],field+': '+a.trialId);
      assert.ok(b.traceSummary?.chronologicalActionTrace,
        'Detailed action summary missing for '+b.trialId);
    }
  }

  const comparisons=[
    ['aliased-control','aliased-latias'],
    ['experimental-clone-control','experimental-clone-latias'],
    ['aliased-control','experimental-clone-control'],
    ['aliased-latias','experimental-clone-latias']
  ].map(([first,second])=>{
    const a=outputs.find(x=>x.mode.id===first).report;
    const b=outputs.find(x=>x.mode.id===second).report;
    return {
      first,second,rows:a.records.map((left,i)=>({
        trialId:left.trialId,
        first:recordSummary(left),
        second:recordSummary(b.records[i]),
        firstDifference:firstDifference(left,b.records[i])
      }))
    };
  });

  // Atomic output with one-job exclusive writer. Only this job touches path.
  const lockPath=TARGET+'.lock';
  const lock=fs.openSync(lockPath,'wx');
  const temporary=TARGET+'.tmp-'+process.pid;
  try {
    fs.writeFileSync(temporary,JSON.stringify(outputs,null,2)+'\n');
    fs.renameSync(temporary,TARGET);
  } finally {
    fs.closeSync(lock);
    fs.unlinkSync(lockPath);
  }

  return {
    evidence:'manual-four-arm-fixed-seed-source-rank10-diagnostic-v1',
    researchRevision:base.researchRevision,
    engineRevision:base.expectedEngineRevision,
    seedProtocol:base.seedProtocol,
    planDigest:base.planDigest,
    seedBase:base.seedBase,
    fullReportsArtifact: path.basename(TARGET),
    armSummaries: outputs.map(({mode,report})=>({
      mode, totalScheduled:report.totalScheduled,
      statusCounts:report.counts,
      trials:report.records.map(recordSummary)
    })),
    comparisons,
    qualification:'All outcomes unqualified; captured traces are action summaries, not full replay. Experimental cloning still requires proof. No win-rate estimate.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(runFactorial(),null,2)+'\n');
}
module.exports={runFactorial,firstDifference,recordSummary};
