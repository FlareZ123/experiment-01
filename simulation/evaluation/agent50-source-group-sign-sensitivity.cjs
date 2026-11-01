'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const VERSION='agent50-source-deal-clustered-sign-v1';
/** Conditional fair-sign tail for independently registered source groups. */
function exactSignTail(positive,negative){
  assert.ok(Number.isSafeInteger(positive)&&positive>=0);
  assert.ok(Number.isSafeInteger(negative)&&negative>=0);
  const n=positive+negative;
  assert.ok(n<=32);
  let combinations=1,upper=0,lower=0;
  for(let i=0;i<=n;i++){
    if(i>=positive)upper+=combinations;
    if(i<=positive)lower+=combinations;
    combinations=combinations*(n-i)/(i+1);
  }
  const factor=2**(-n);
  return {nonzero:n,oneSidedFavorSource:upper*factor,
    twoSided:Math.min(1,2*Math.min(upper,lower)*factor)};
}
/**
 * Group by original registered source deal. The two fixed candidate 60s
 * sharing that deal are dependent, never two independent source samples.
 * @param {object} packet Complete native paired result
 * @returns {object} Source-group outcomes and cautious exact-sign diagnostic
 */
function auditSourceGroups(packet){
  assert.ok(Array.isArray(packet?.pairs)&&packet.pairs.length>0);
  const map=new Map();
  for(const pair of packet.pairs){
    const [rank,repeat,slot,candidate]=pair.id.split(':');
    assert.equal(rank,'11');
    assert.ok(['A','B'].includes(slot));
    assert.ok(['champion-reference','new-moon-lockbreaker-v1'].includes(candidate));
    assert.equal(pair.samePhysicalInput,true);
    const key=[rank,repeat,slot].join(':');
    const group=map.get(key)??{key,seed:pair.seed,
      sourceFingerprint:pair.original.sourceDealFingerprint,
      candidates:[],sourceBefore:0,sourceAfter:0,
      candidateBefore:0,candidateAfter:0,capsBefore:0,capsAfter:0};
    assert.equal(group.seed,pair.seed);
    assert.equal(group.sourceFingerprint,pair.original.sourceDealFingerprint);
    assert.ok(group.sourceFingerprint&&
      !group.candidates.includes(candidate),'Duplicate/absent source deal');
    group.candidates.push(candidate);
    for(const [label,record] of [['Before',pair.original],
      ['After',pair.knownDeadBothSeats]]){
      if(record.finished===true){
        if(record.winner===pair.sourceSeat)group['source'+label]++;
        else if(record.winner===pair.candidateSeat)group['candidate'+label]++;
        else throw Error('Unknown native winner');
      }else group['caps'+label]++;
    }
    map.set(key,group);
  }
  const groups=[...map.values()].sort((a,b)=>a.key.localeCompare(b.key));
  assert.equal(groups.length*2,packet.pairs.length);
  assert.equal(new Set(groups.map(x=>x.seed)).size,groups.length);
  for(const row of groups){
    assert.deepEqual(row.candidates.sort(),
      ['champion-reference','new-moon-lockbreaker-v1']);
    row.sourceWinDelta=row.sourceAfter-row.sourceBefore;
  }
  const positive=groups.filter(x=>x.sourceWinDelta>0).length;
  const negative=groups.filter(x=>x.sourceWinDelta<0).length;
  return {schema:VERSION,sourceSeedGroups:groups.length,
    dependentCandidatePolicyPairs:packet.pairs.length,
    nativeAttempts:packet.pairs.length*2,
    groupsFavoringSource:positive,groupsFavoringCandidate:negative,
    tiedGroups:groups.length-positive-negative,
    sourceWinCountDelta:groups.reduce((a,x)=>a+x.sourceWinDelta,0),
    signTest:exactSignTail(positive,negative),groups,
    competitiveQualifiedGames:0,
    caveat:'Descriptive source-group fair-sign null only; paired candidate arms are dependent, sample coin-stratified, one opponent rank, all native games untimed/unqualified.'};
}
if(require.main===module){
  assert.ok(process.argv[2]);
  console.log(JSON.stringify(auditSourceGroups(
    JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));
}
module.exports={VERSION,exactSignTail,auditSourceGroups};
