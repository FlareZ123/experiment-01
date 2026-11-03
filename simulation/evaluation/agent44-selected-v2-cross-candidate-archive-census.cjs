'use strict';

const assert = require('node:assert/strict');
const {auditCrossCandidateSourcePair} =
  require('./agent44-cross-candidate-source-pair-status.cjs');

const SCHEMA = 'agent44-selected-v2-cross-candidate-archive-census-v1';
const ORIGINAL_SCHEMA =
  'agent23-selected-symmetric-joint-v2-native-source-audit-v1';
const CANDIDATES =
  ['champion-reference','new-moon-lockbreaker-v1'];
const MODES = ['joint-v1-control','selected-v2-symmetric-vip'];

/**
 * A read-only, explicitly posthoc audit of the immutable 52-attempt native
 * archive. The input JSON must be sourced and SHA-256 checked separately.
 * Missing source fingerprints remain UNKNOWN, even if an independent
 * abort-side observer could later establish narrower parity evidence.
 * @param {object} archive
 * @returns {object}
 */
function auditSelectedV2SourcePairCensus(archive) {
  assert.equal(archive?.schema,ORIGINAL_SCHEMA);
  assert.equal(archive.attemptCount,52);
  assert.equal(archive.candidateContexts,26);
  assert.equal(archive.groups,13);
  assert.equal(archive.competitivelyQualifiedGames,0);
  assert.equal(archive.pinnedVendorGitRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.ok(Array.isArray(archive.modes));
  assert.equal(archive.modes.length,2);
  assert.deepEqual(new Set(archive.modes.map(x=>x.id)),new Set(MODES));
  const allModes=[];
  for(const mode of archive.modes) {
    const rows=mode.native?.rows;
    assert.ok(Array.isArray(rows));
    assert.equal(rows.length,26,'Every mode must retain 26 attempts');
    const map=new Map();
    const seenTrials=new Set();
    for(const row of rows) {
      const t=row.trial;
      assert.ok(t&&Number.isSafeInteger(t.rank)&&t.rank>0);
      assert.ok(Number.isSafeInteger(t.repeat)&&t.repeat>=0);
      assert.ok(['A','B'].includes(t.candidateSlot));
      assert.ok(Number.isSafeInteger(t.seed)&&t.seed>=0);
      assert.ok(CANDIDATES.includes(t.candidateId));
      assert.equal(t.id,
        [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
      assert.ok(!seenTrials.has(t.id),'Duplicate trial '+t.id);
      seenTrials.add(t.id);
      const id=[t.rank,t.repeat,t.candidateSlot].join(':');
      if(!map.has(id))map.set(id,[]);
      map.get(id).push(row);
    }
    assert.equal(map.size,13,'Exactly 13 original-source contexts');
    const pairs=[];
    const counts={
      MATCHED_INITIAL_SOURCE_AND_STARTER:0,
      UNPAIRED_SOURCE_DEAL:0,
      UNPAIRED_ACTUAL_STARTER:0,
      UNKNOWN:0
    };
    for(const [id,group] of map) {
      assert.equal(group.length,2,'One attempt per candidate: '+id);
      assert.deepEqual(
        new Set(group.map(row=>row.trial.candidateId)),
        new Set(CANDIDATES));
      const reference=group.find(x=>x.trial.candidateId===CANDIDATES[0]);
      const newMoon=group.find(x=>x.trial.candidateId===CANDIDATES[1]);
      const parity=auditCrossCandidateSourcePair(reference,newMoon);
      assert.ok(Object.hasOwn(counts,parity.crossCandidateOpeningStatus));
      counts[parity.crossCandidateOpeningStatus] += 1;
      pairs.push({
        id,rank:reference.trial.rank,sourceSeat:parity.sourceSeat,
        seed:reference.trial.seed,
        sourceDealStatus:parity.sourceDealStatus,
        actualStarterStatus:parity.actualStarterStatus,
        crossCandidateOpeningStatus:parity.crossCandidateOpeningStatus,
        mulliganCountsStatus:parity.mulliganCountsStatus,
        bonusDrawnCountsStatus:parity.bonusDrawnCountsStatus,
        sourceCompensationDrawCounts:parity.sourceCompensationDrawCounts
      });
    }
    pairs.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
    allModes.push({mode:mode.id,attempts:rows.length,groups:map.size,
      counts,pairs});
  }
  const baseline=allModes.find(x=>x.mode===MODES[0]);
  const selected=allModes.find(x=>x.mode===MODES[1]);
  const parityFields=[
    'id','seed','sourceSeat','sourceDealStatus','actualStarterStatus',
    'crossCandidateOpeningStatus','mulliganCountsStatus',
    'bonusDrawnCountsStatus','sourceCompensationDrawCounts'
  ];
  const equalAcrossModes=baseline.pairs.every((row,i)=>
    parityFields.every(field=>JSON.stringify(row[field])===
      JSON.stringify(selected.pairs[i]?.[field])));
  return {
    schema:SCHEMA,scope:'historical-native-postgame-observation-only',
    attempted:52,comparisons:26,
    sourceOpeningsIndependentGames:0,
    sameSourceClassificationsAcrossModes:equalAcrossModes,
    nativeGameReplayed:false,competitivelyQualifiedGames:0,
    modes:allModes
  };
}

module.exports = {auditSelectedV2SourcePairCensus};
