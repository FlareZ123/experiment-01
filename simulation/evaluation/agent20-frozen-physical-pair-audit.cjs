'use strict';
const assert=require('node:assert/strict');
const DIGEST=/^[a-f0-9]{64}$/;
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];

/**
 * Reconcile a registered two-candidate four-arm native result by exact
 * source physical setup, without equating shared PRNG seeds with shared deals.
 * @param {object} profile Immutable four-arm registration.
 * @param {object} nativeResult Actual original Store result.
 * @returns {object} Two cohorts and fail-closed paired-treatment disposition.
 */
function auditFrozenSourcePhysicalPairs(profile,nativeResult){
  assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
  assert.ok(Array.isArray(profile.registeredTrials));
  assert.ok(Array.isArray(nativeResult.rows));
  assert.equal(profile.registeredTrials.length,4);
  const registered=new Map(), groups=new Map();
  for(const trial of profile.registeredTrials){
    assert.ok(!registered.has(trial.id),'Duplicate registered trial');
    assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
      trial.candidateId].join(':'));
    assert.ok(CANDIDATES.includes(trial.candidateId));
    registered.set(trial.id,trial);
    const groupId=[trial.rank,trial.repeat,trial.candidateSlot,trial.seed].join(':');
    if(!groups.has(groupId))groups.set(groupId,[]);
    groups.get(groupId).push(trial);
  }
  assert.equal(groups.size,2);
  const observed=new Map();
  let unregisteredRows=0;
  for(const row of nativeResult.rows){
    const expected=registered.get(row?.trial?.id);
    if(!expected){unregisteredRows++;continue;}
    assert.ok(!observed.has(expected.id),'Duplicate native trial');
    assert.deepEqual([row.trial.rank,row.trial.repeat,row.trial.candidateSlot,
      row.trial.candidateId,row.trial.seed],
      [expected.rank,expected.repeat,expected.candidateSlot,
        expected.candidateId,expected.seed],'Changed registered physical trial');
    observed.set(expected.id,row);
  }
  const cohorts=[];
  for(const [groupId,members] of groups){
    assert.equal(members.length,2);
    assert.deepEqual(members.map(t=>t.candidateId).sort(),CANDIDATES.slice().sort());
    const pair=CANDIDATES.map(name=>members.find(t=>t.candidateId===name));
    const rows=pair.map(t=>observed.get(t.id));
    const candidateSeat=pair[0].candidateSlot==='A'?0:1;
    const digests=rows.map(row=>row?.sourceDealFingerprint??null);
    const attested=rows.every((row,i)=>row&&
      row.sourceSeat===1-candidateSeat&&row.candidateSeat===candidateSeat&&
      row.verifiedFirstTurn===true&&DIGEST.test(digests[i]));
    const status=!attested?'UNVERIFIED':digests[0]===digests[1]?
      'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT';
    cohorts.push({groupId,rank:pair[0].rank,seed:pair[0].seed,
      candidatePhysicalSeat:pair[0].candidateSlot,
      sourcePhysicalSeat:pair[0].candidateSlot==='A'?'B':'A',
      trialIds:pair.map(t=>t.id),status,
      sourceFingerprintByCandidate:Object.fromEntries(
        CANDIDATES.map((name,i)=>[name,digests[i]])),
      pairedDeltaAllowed:status==='EXACT_SOURCE_DEAL_MATCH'});
  }
  const missingRows=registered.size-observed.size;
  return {schema:'agent20-frozen-source-physical-pair-v1',
    matchedSourcePhysicalDeals:cohorts.length===2&&missingRows===0&&
      unregisteredRows===0&&cohorts.every(g=>g.pairedDeltaAllowed),
    cohorts,missingRows,unregisteredRows,competitiveGameQualified:false,
    note:'Only exact source physical deal equality. All full paper legality, policy competence and clock gates remain independent.'};
}

/**
 * Produce a strictly postgame gate without changing the original native row,
 * selected player policy, registered seeds or frozen profile.
 * @param {object} output The original frozen release JSON.
 * @param {object} profile Independently committed profile.
 * @returns {object} Enriched disposition with distinct source pairing stage.
 */
function appendSourcePhysicalPairDisposition(output,profile){
  assert.ok(output && typeof output==='object');
  assert.ok(output.releaseDisposition?.stages &&
    typeof output.releaseDisposition.stages==='object');
  const audit=Array.isArray(output.rawNativeResult?.rows)?
    auditFrozenSourcePhysicalPairs(profile,output.rawNativeResult):{
      schema:'agent20-frozen-source-physical-pair-v1',
      matchedSourcePhysicalDeals:false,
      cohorts:[],missingRows:profile.registeredTrials.length,
      unregisteredRows:0,competitiveGameQualified:false,
      note:'No native rows; preflight or execution failed before source pairing'
    };
  const stages={...output.releaseDisposition.stages,
    MATCHED_SOURCE_PHYSICAL_DEALS:audit.matchedSourcePhysicalDeals};
  return {...output,sourcePhysicalPairAudit:audit,
    releaseDisposition:{...output.releaseDisposition,stages,
      firstBlocker:stages.BOTH_SEATS_EXECUTED===true &&
        !audit.matchedSourcePhysicalDeals?
        'SOURCE_PHYSICAL_PAIR_UNVERIFIED_OR_DIFFERENT':
        output.releaseDisposition.firstBlocker},
    competitiveGameQualified:false};
}

if(require.main===module){
  const fs=require('node:fs');
  const path=require('node:path');
  const directory=__dirname;
  const filename=path.resolve(directory,'../../agent20-frozen-rank6-canary-v1-output.json');
  const profileFile=path.join(directory,'agent20-frozen-rank6-canary-v1.json');
  const profile=JSON.parse(fs.readFileSync(profileFile,'utf8'));
  const output=JSON.parse(fs.readFileSync(filename,'utf8'));
  const checked=appendSourcePhysicalPairDisposition(output,profile);
  require('./agent20-frozen-rank6-canary-v1.cjs')
    .writeAtomicLocked(filename,JSON.stringify(checked,null,2)+'\n');
  process.stdout.write(JSON.stringify({
    sourcePhysicalPairAudit:checked.sourcePhysicalPairAudit,
    releaseStages:checked.releaseDisposition.stages,
    firstBlocker:checked.releaseDisposition.firstBlocker
  })+'\n');
}

module.exports={auditFrozenSourcePhysicalPairs,appendSourcePhysicalPairDisposition};
