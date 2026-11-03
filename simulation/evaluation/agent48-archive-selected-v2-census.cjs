'use strict';

const assert=require('node:assert/strict');
const {inspectAbortSource,auditAbortedOriginalSourcePair}=
  require('./agent48-aborted-source-pair-posthoc.cjs');

const DIGEST=/^[a-f0-9]{64}$/;
const ORIGINAL_ABORTED_TRIAL='6:300:A:champion-reference';

/**
 * Compare two different fixed candidates' original source first-turn physical
 * deals inside one mode. Equal seed is only a registration fact.
 *
 * @param {object[]} rows All original-source native rows for one policy mode.
 * @param {{recoverNativeAborts?:boolean}} [options] Optional extra,
 *   explicitly retrospective native abort evidence; never game success.
 * @returns {object} Postgame first-turn source-deal evidence.
 */
function censusCrossCandidateSourceDeals(rows,options={}){
  assert.ok(Array.isArray(rows));
  const groups=new Map();
  for(const row of rows){
    const t=row?.trial;
    assert.ok(t&&[5,6,11].includes(t.rank));
    assert.ok(typeof t.id==='string'&&t.id.length>0);
    assert.ok(['A','B'].includes(t.candidateSlot));
    assert.ok(Number.isSafeInteger(t.seed));
    assert.ok(['champion-reference','new-moon-lockbreaker-v1']
      .includes(t.candidateId));
    assert.equal(t.id,
      [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    const id=[t.rank,t.repeat,t.candidateSlot].join(':');
    const prior=groups.get(id)??{rank:t.rank,repeat:t.repeat,
      candidateSlot:t.candidateSlot,seed:t.seed,rows:[]};
    assert.equal(prior.seed,t.seed,'Seed changed inside candidate contrast');
    assert.ok(!prior.rows.some(x=>x.trial.candidateId===t.candidateId),
      'Duplicate candidate inside one source group');
    prior.rows.push(row);
    groups.set(id,prior);
  }
  const records=[];
  for(const [groupId,group] of groups){
    assert.equal(group.rows.length,2,
      'Original source group missing its second fixed candidate: '+groupId);
    const byId=Object.fromEntries(group.rows.map(x=>[x.trial.candidateId,x]));
    const champion=byId['champion-reference'];
    const challenger=byId['new-moon-lockbreaker-v1'];
    assert.ok(champion&&challenger);
    /** @param {object} row */
    const evidence=row=>{
      const sourceSeat=row.trial.candidateSlot==='A'?1:0;
      const direct=typeof row.sourceDealFingerprint==='string'&&
        DIGEST.test(row.sourceDealFingerprint)?
        row.sourceDealFingerprint:null;
      const directStarter=row.verifiedFirstTurn===true&&
        [0,1].includes(row.actualStarterSeat)?row.actualStarterSeat:null;
      if(!options.recoverNativeAborts||
         (direct!==null&&directStarter!==null)){
        return {digest:direct,starter:directStarter,recoveredFromAbort:false};
      }
      const abort=inspectAbortSource(row,sourceSeat);
      return {
        digest:direct??abort.digest,
        starter:directStarter??abort.starter,
        recoveredFromAbort:direct===null&&abort.digest!==null
      };
    };
    const a=evidence(champion),b=evidence(challenger);
    const digestKnown=a.digest!==null&&b.digest!==null;
    const starterKnown=a.starter!==null&&b.starter!==null;
    records.push({
      groupId,rank:group.rank,
      digestKnown,
      originalSourcePhysicalMatch:digestKnown&&a.digest===b.digest,
      recoveredAbortSideDigest:a.recoveredFromAbort||
        b.recoveredFromAbort,
      starterKnown,firstTurnSeatMatch:starterKnown&&
        a.starter===b.starter,
      sameSeed:champion.trial.seed===challenger.trial.seed,
      competitiveGameQualified:false
    });
  }
  return {
    schema:'agent48-cross-candidate-original-source-deals-v1',
    groups:records.length,
    sourceDigestCompared:records.filter(x=>x.digestKnown).length,
    sourceDigestMatched:records.filter(x=>x.originalSourcePhysicalMatch).length,
    sourceDigestMismatched:records.filter(x=>
      x.digestKnown&&!x.originalSourcePhysicalMatch).length,
    sourceDigestUnknown:records.filter(x=>!x.digestKnown).length,
    groupsWithRecoveredAbortSideDigest:records.filter(x=>
      x.recoveredAbortSideDigest).length,
    starterCompared:records.filter(x=>x.starterKnown).length,
    starterMatched:records.filter(x=>x.firstTurnSeatMatch).length,
    pairedCandidatePhysicalContrastSupported:records.every(x=>
      x.originalSourcePhysicalMatch&&x.firstTurnSeatMatch),
    records,competitiveGameQualified:false
  };
}

/**
 * Read-only audit of the already completed, preregistered 52-arm archive.
 * Never modifies the source archive, its 25/26 frozen acceptance or its
 * reported statuses. No bot/game engine is loaded.
 *
 * @param {object} archive Full original Agent23 archived native JSON.
 * @returns {object} Strict native historical posthoc census.
 */
function auditSelectedV2Archive(archive){
  assert.equal(archive?.schema,
    'agent23-selected-symmetric-joint-v2-native-source-audit-v1');
  assert.equal(archive.pinnedVendorGitRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(archive.attemptCount,52);
  assert.equal(archive.candidateContexts,26);
  assert.equal(archive.groups,13);
  assert.equal(archive.matchedSourcePhysicalDeals,25,
    'The frozen historical 25/26 gate has changed');
  assert.equal(archive.allControlsMatched,false);
  assert.equal(archive.competitivelyQualifiedGames,0);
  assert.equal(archive.modes?.length,2);
  assert.equal(archive.modes[0].id,'joint-v1-control');
  assert.equal(archive.modes[1].id,'selected-v2-symmetric-vip');
  const native=archive.modes.map(m=>{
    assert.equal(m.native?.rows?.length,26);
    return m.native.rows;
  });
  const rowFor=(rows,id)=>{
    const found=rows.filter(x=>x.trial?.id===id);
    assert.equal(found.length,1,
      'Expected precisely one matching frozen archived native trial');
    return found[0];
  };
  const recovered=auditAbortedOriginalSourcePair(
    rowFor(native[0],ORIGINAL_ABORTED_TRIAL),
    rowFor(native[1],ORIGINAL_ABORTED_TRIAL));
  return {
    schema:'agent48-selected-joint-v2-original-archive-posthoc-v1',
    originalReleaseHadFailedAcceptanceGate:true,
    frozenSourcePairsAccepted:archive.matchedSourcePhysicalDeals,
    attemptedNativeGames:archive.attemptCount,
    censoredRank6Posthoc:recovered,
    crossCandidateOriginalSourceDeals:{
      baseline:censusCrossCandidateSourceDeals(native[0]),
      selected:censusCrossCandidateSourceDeals(native[1])
    },
    crossCandidateOriginalSourceDealsIncludingVerifiedAborts:{
      baseline:censusCrossCandidateSourceDeals(native[0],
        {recoverNativeAborts:true}),
      selected:censusCrossCandidateSourceDeals(native[1],
        {recoverNativeAborts:true})
    },
    originalReleaseAcceptanceUnchanged:true,
    competitiveGameQualified:false
  };
}

module.exports={
  censusCrossCandidateSourceDeals,auditSelectedV2Archive,
  ORIGINAL_ABORTED_TRIAL
};
