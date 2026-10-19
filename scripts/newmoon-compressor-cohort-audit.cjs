'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {TOTAL_REPEATS,PARTITION_COUNT,scheduledRepeats}=
  require('../simulation/twinleaf/newmoon-payload-partition-plan.cjs');

const IDENTITY_FIELDS=Object.freeze([
  'schema','printedSourceRank','candidateSeat','sourceSeat',
  'seedBase','repeats','candidatePrintHash','engineRevision',
  'seedProtocol','policyComparison'
]);

/** @param {object} arm Per-arm source output, successful or failed. */
function armSummary(arm){
  if(!arm?.ok){
    return {ok:false,error:arm?.error??'missing-arm',
      completed:false,actions:null,compressorPlays:0,
      copiedAttackCount:0,unattributedGxSelections:0};
  }
  const o=arm.observations;
  assert.ok(o&&Array.isArray(o.nativeOrCopiedAttacks));
  assert.ok(Array.isArray(o.compressorPlays));
  assert.ok(Array.isArray(o.payloadDiscards));
  return {
    ok:true,completed:o.finished===true,
    actualStartingSeat:o.actualStartingSeat,
    actions:o.rootActions,turns:o.turns,
    engineWinner:o.finished?o.engineWinner:null,
    remainingPrizes:o.prizesRemaining,
    compressorPlays:o.compressorPlays.length,
    copyAttackNames:o.nativeOrCopiedAttacks.map(x=>x.name),
    copiedAttackCount:o.nativeOrCopiedAttacks.length,
    // The historical recorder does not establish which card produced
    // ResolvePromptAction; these generic GX selections are not discards.
    unattributedGxSelections:o.payloadDiscards.length,
    sourcePolicy:o.policy
  };
}

/**
 * Audit all and only the preregistered 12 rank-11 comparisons.
 * Source-derived GX selection counts remain deliberately unattributed.
 * @param {object[]} packets All four unmodified archived partition JSON objects.
 * @returns {object}
 */
function auditCohort(packets){
  assert.equal(packets.length,PARTITION_COUNT);
  const sorted=packets.slice().sort((a,b)=>a.partitionIndex-b.partitionIndex);
  for(let i=0;i<PARTITION_COUNT;i++){
    const packet=sorted[i];
    assert.equal(packet.partitionIndex,i);
    assert.equal(packet.partitionCount,PARTITION_COUNT);
    assert.equal(packet.fullCohortPresent,false);
    assert.deepEqual(packet.scheduledRepeats,scheduledRepeats(i));
    assert.equal(packet.retainedAttemptCount,packet.rows.length);
    assert.equal(packet.repeats,TOTAL_REPEATS);
    assert.equal(packet.rows.length,scheduledRepeats(i).length);
    assert.equal(packet.printedSourceRank,11);
    assert.equal(packet.candidateSeat,1);
    assert.equal(packet.sourceSeat,0);
    for(const field of IDENTITY_FIELDS)
      assert.deepEqual(packet[field],sorted[0][field],
        'Different source/protocol identity: '+field);
    assert.deepEqual(packet.rows.map(row=>row.repeat),scheduledRepeats(i));
  }
  const rows=sorted.flatMap(packet=>packet.rows).map(row=>{
    assert.ok(Number.isInteger(row.seed));
    assert.equal(row.qualifiedForCompetitiveInference,false);
    const control=armSummary(row.control);
    const payload=armSummary(row.payload);
    if(control.ok&&payload.ok)
      assert.equal(control.actualStartingSeat,payload.actualStartingSeat);
    return {repeat:row.repeat,seed:row.seed,control,payload};
  });
  assert.deepEqual(rows.map(row=>row.repeat),scheduledRepeats());
  const arms=rows.flatMap(row=>[row.control,row.payload]);
  const successes=arms.filter(arm=>arm.ok);
  const paired=rows.filter(row=>row.control.ok&&row.payload.ok);
  const started=paired.reduce((counts,row)=>{
    const seat=row.control.actualStartingSeat;
    assert.ok(seat===0||seat===1);
    counts[seat]++;
    return counts;
  },[0,0]);
  return {
    schema:'newmoon-rank11-compressor-complete-cohort-audit-v1',
    sourceRegistration:'prespecified rank11 repeats 0..11, seedBase 20261018',
    exactCoverageVerified:true,
    identity:Object.fromEntries(IDENTITY_FIELDS.map(field=>
      [field,sorted[0][field]])),
    scheduledRepeats:rows.map(row=>row.repeat),
    pairedOriginalDeals:rows.length,
    successfulArms:successes.length,
    failedArms:arms.length-successes.length,
    successfulPairs:paired.length,
    pairedActualStartingSeats:started,
    engineTerminals:successes.filter(arm=>arm.completed).length,
    actionCapped:successes.filter(arm=>!arm.completed).length,
    controlCompressorActions:rows.reduce((n,row)=>
      n+row.control.compressorPlays,0),
    payloadCompressorActions:rows.reduce((n,row)=>
      n+row.payload.compressorPlays,0),
    unattributedGxSelections:successes.reduce((n,arm)=>
      n+arm.unattributedGxSelections,0),
    qualifiedCompetitiveGames:0,
    rows,
    limitations:'All GX-containing ChooseCardsPrompt selections were generically logged; those counts do not prove a Battle Compressor discard. Engine winners, uncalibrated bots, proxy printing and untimed action-capped games do not qualify competitive strength.'
  };
}

if(require.main===module){
  const paths=process.argv.slice(2);
  assert.equal(paths.length,PARTITION_COUNT,
    'Provide precisely the four archived JSON paths');
  const packets=paths.map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(auditCohort(packets),null,2)+'\n');
}

module.exports={IDENTITY_FIELDS,armSummary,auditCohort};
