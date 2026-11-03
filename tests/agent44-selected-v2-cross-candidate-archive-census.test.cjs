'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditSelectedV2SourcePairCensus} =
  require('../simulation/evaluation/agent44-selected-v2-cross-candidate-archive-census.cjs');

const MODES=['joint-v1-control','selected-v2-symmetric-vip'];

/** @returns {object} */
function syntheticArchive() {
  const modes=MODES.map(id=>{
    const rows=[];
    for(let i=0;i<13;i+=1) {
      const rank=i<5?5:i<9?11:6;
      const slot=i%2===0?'A':'B';
      const seed=5000+i,repeat=i;
      const base=((i%8)+1).toString(16).repeat(64);
      for(const candidateId of ['champion-reference',
        'new-moon-lockbreaker-v1']) {
        const reference=candidateId==='champion-reference';
        const missing=i===12&&reference;
        const different=i===11&&!reference;
        rows.push({
          trial:{rank,repeat,candidateSlot:slot,seed,candidateId,
            id:[rank,repeat,slot,candidateId].join(':')},
          sourceDealFingerprint:missing?null:different?'f'.repeat(64):base,
          verifiedFirstTurn:!missing,
          actualStarterSeat:missing?null:1,
          initialSetupCompensation:missing?null:{
            schema:'real-store-initial-setup-compensation-v1',
            mulligans:i===11&&reference?[1,0]:[0,0],
            bonusDrawn:i===11&&reference?[0,1]:[0,0]
          }
        });
      }
    }
    return {id,native:{rows}};
  });
  return {
    schema:'agent23-selected-symmetric-joint-v2-native-source-audit-v1',
    attemptCount:52,candidateContexts:26,groups:13,
    competitivelyQualifiedGames:0,
    pinnedVendorGitRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    modes
  };
}

test('all 52 synthetic rows remain accounted with three provenance states',()=>{
  const census=auditSelectedV2SourcePairCensus(syntheticArchive());
  assert.equal(census.attempted,52);
  assert.equal(census.comparisons,26);
  assert.equal(census.sameSourceClassificationsAcrossModes,true);
  for(const mode of census.modes) {
    assert.deepEqual(mode.counts,{
      MATCHED_INITIAL_SOURCE_AND_STARTER:11,
      UNPAIRED_SOURCE_DEAL:1,
      UNPAIRED_ACTUAL_STARTER:0,
      UNKNOWN:1
    });
    assert.equal(mode.pairs.length,13);
  }
  assert.equal(census.nativeGameReplayed,false);
  assert.equal(census.competitivelyQualifiedGames,0);
});

test('a treatment-only source fingerprint deviation is exposed',()=>{
  const archive=syntheticArchive();
  archive.modes[1].native.rows[0].sourceDealFingerprint='a'.repeat(64);
  const census=auditSelectedV2SourcePairCensus(archive);
  assert.equal(census.sameSourceClassificationsAcrossModes,false);
  assert.equal(census.modes[0].counts.UNPAIRED_SOURCE_DEAL,1);
  assert.equal(census.modes[1].counts.UNPAIRED_SOURCE_DEAL,2);
});

test('missing source witness never becomes verified different',()=>{
  const archive=syntheticArchive();
  const census=auditSelectedV2SourcePairCensus(archive);
  assert.equal(census.modes[0].pairs.filter(x=>
    x.crossCandidateOpeningStatus==='UNKNOWN').length,1);
});

test('frozen registration and vendor mutation fail closed',()=>{
  const archive=syntheticArchive();
  archive.modes[0].native.rows[0].trial.seed=9999;
  assert.throws(()=>auditSelectedV2SourcePairCensus(archive));
  const second=syntheticArchive();
  second.pinnedVendorGitRevision='0'.repeat(40);
  assert.throws(()=>auditSelectedV2SourcePairCensus(second));
});

test('duplicate attempts and missing rows fail closed',()=>{
  const archive=syntheticArchive();
  archive.modes[0].native.rows[1].trial.id=
    archive.modes[0].native.rows[0].trial.id;
  assert.throws(()=>auditSelectedV2SourcePairCensus(archive));
  const second=syntheticArchive();
  second.modes[1].native.rows.pop();
  assert.throws(()=>auditSelectedV2SourcePairCensus(second));
});
