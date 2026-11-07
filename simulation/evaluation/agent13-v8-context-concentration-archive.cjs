'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {inspect} = require('./agent36-v8-original-field-archive-audit.cjs');
const {summarizeContextCoverage} = require('./agent13-v8-context-concentration.cjs');
const {screenArchivedReciprocalAttempts} =
  require('./agent45-bilateral-competence-gate.cjs');

const ARCHIVE = 'issue25-steward-v8.json';
const SHA256 = 'd30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0';

/**
 * Count whole-prefix opponent attack declarations on already source-hash
 * verified original native root ledgers. An AttackAction root says nothing
 * by itself about prompt settlement, damage, paper legality or quality.
 * Error contexts with no authenticated candidate seat stay unknown.
 *
 * @param {{attempts:object[]}} archive Original raw v8 source artifact.
 * @param {{rows:object[],allNativeRootLedgersDigestVerified:boolean}} census
 * @returns {object}
 */
function candidateAttackPrefixCoverage(archive,census) {
  assert.equal(census?.allNativeRootLedgersDigestVerified,true);
  assert.ok(Array.isArray(archive?.attempts));
  assert.ok(Array.isArray(census.rows));
  const ids=new Set();
  const realById=new Map();
  for(const attempt of archive.attempts) {
    assert.ok(typeof attempt.id==='string'&&!realById.has(attempt.id));
    realById.set(attempt.id,attempt);
  }
  assert.equal(realById.size,census.rows.length);
  const rows=census.rows.map(row=>{
    assert.ok(!ids.has(row.id));
    ids.add(row.id);
    assert.equal(row.publicRootHashPass,true);
    assert.equal(row.actualSourceSeatAuthenticated,true);
    const source=realById.get(row.id);
    assert.ok(source,'Verified native attempt must have exact original ID');
    const roots=source.publicRootActions;
    assert.ok(Array.isArray(roots));
    assert.equal(roots.length,row.acceptedRoots);
    assert.equal(source.publicRootActionsTruncated,false);
    if(!row.candidateSeatAuthenticated ||
      !Array.isArray(row.actualAttackSettlements)) {
      return {id:row.id,status:'unknown-candidate-attack-prefix',
        originalSourceSeat:row.sourceSeat,candidateSeatAuthenticated:false,
        candidateAttackActionRoots:null,attackNameCounts:null,
        firstSettledSourceOrdinal:null,
        candidateAttackActionRootsAfterSourceSettlement:null};
    }
    assert.equal(source.candidateSeat,1-row.sourceSeat);
    const attacks=roots.filter(root=>
      root.playerSlot===source.candidateSeat&&root.action==='AttackAction');
    const names=new Map();
    for(const attack of attacks) {
      const name=typeof attack.attack==='string'&&attack.attack.length>0?
        attack.attack:'unknown-attack-name';
      names.set(name,(names.get(name)??0)+1);
    }
    const settled=row.actualAttackSettlements.filter(x=>
      x.publicSettlement===true);
    const firstSettled=settled.length?
      Math.min(...settled.map(x=>x.ordinal)):null;
    const after=firstSettled===null?null:
      attacks.filter(x=>x.actionOrdinal>firstSettled).length;
    return {id:row.id,status:'observed-verified-public-root-prefix',
      originalSourceSeat:row.sourceSeat,candidateSeatAuthenticated:true,
      candidateAttackActionRoots:attacks.length,
      attackNameCounts:Object.fromEntries([...names].sort((a,b)=>
        a[0].localeCompare(b[0]))),
      firstSettledSourceOrdinal:firstSettled,
      candidateAttackActionRootsAfterSourceSettlement:after};
  });
  const known=rows.filter(x=>x.status==='observed-verified-public-root-prefix');
  const nameCounts=new Map();
  for(const row of known)
    for(const [name,count] of Object.entries(row.attackNameCounts))
      nameCounts.set(name,(nameCounts.get(name)??0)+count);
  return {
    schema:'agent13-v8-native-opponent-attack-prefix-v1',
    originalNativeAttempts:rows.length,
    knownCandidateContexts:known.length,
    unknownCandidateContexts:rows.length-known.length,
    candidateAttackActionRootTotal:known.reduce((n,x)=>
      n+x.candidateAttackActionRoots,0),
    candidateAttackActionRootAfterFirstSettledSourceTotal:known.reduce(
      (n,x)=>n+(x.candidateAttackActionRootsAfterSourceSettlement??0),0),
    observedCandidateAttackNames:Object.fromEntries(
      [...nameCounts].sort((a,b)=>a[0].localeCompare(b[0]))),
    rows,verifiedOpponentAttackSettlements:null,
    competitivelyQualifiedGames:0
  };
}

/**
 * Reinspect the unchanged original 8-arm archived Store run, preserving
 * real per-root SHA, source-seat identity, and incomplete error histories.
 * @param {string} directory Directory containing the authentic CI artifact.
 * @returns {object}
 */
function verifyOriginalArchive(directory) {
  assert.ok(typeof directory === 'string' && directory.length > 0);
  const raw = fs.readFileSync(path.join(directory, ARCHIVE));
  const sidecar = fs.readFileSync(
    path.join(directory, 'issue25-steward-v8.sha256'), 'utf8');
  const canonical = inspect(raw, sidecar, SHA256);
  const original=JSON.parse(raw);
  const result = summarizeContextCoverage(canonical);
  const opponentPrefix=candidateAttackPrefixCoverage(original,canonical);
  assert.equal(opponentPrefix.knownCandidateContexts,3);
  assert.equal(opponentPrefix.unknownCandidateContexts,5);
  assert.equal(opponentPrefix.candidateAttackActionRootTotal,17);
  assert.equal(
    opponentPrefix.candidateAttackActionRootAfterFirstSettledSourceTotal,4);
  assert.deepEqual(opponentPrefix.observedCandidateAttackNames,
    {'Future Sight':9,'Get Lost':8});
  const nativeScreen=screenArchivedReciprocalAttempts(original);
  assert.equal(nativeScreen.attemptedContexts,8);
  assert.equal(nativeScreen.verifiedRootLedgerContexts,8);
  assert.equal(nativeScreen.quarantinedContexts,0);
  assert.equal(nativeScreen.competitiveGamesQualified,0);
  const errors=nativeScreen.rows.filter(x=>x.disposition==='engine-error');
  assert.equal(errors.length,5);
  assert.ok(errors.every(x=>
    x.seatProvenance==='native-abort-provenance' &&
    x.sourceSeat===1-x.opponentSeat &&
    x.competitiveAdmission===false));
  assert.equal(result.originalNativeAttempts, 8);
  assert.equal(result.sourceAttackTraceKnownContexts, 3);
  assert.equal(result.sourceAttackTraceUnknownContexts, 5);
  assert.equal(result.observedSettledAttackContexts, 3);
  assert.equal(result.totalKnownSourceDeclarations, 20);
  assert.equal(result.totalKnownSourceSettlements, 19);
  assert.equal(result.totalKnownSameEpochOpponentRoots, 19);
  assert.deepEqual(result.immediateOpponentActionCounts,
    {AttackAction:4,PassTurnAction:8,PlayCardAction:7});
  assert.equal(result.totalObservedSourcePrizeTakingAttacks, 2);
  assert.equal(result.totalObservedSourcePrizesTaken, 3);
  assert.deepEqual(result.attackConcentration.map(x=>x.settledAttacks),
    [13,4,2]);
  assert.equal(result.pairedSourceDeals.filter(x=>
    x.physicalSameSourceDeal===false).length,1);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.equal(result.estimatedWinRate,null);
  return {
    schema:'agent13-original-v8-archive-provenance-and-context-census-v1',
    originalArchiveSha256:SHA256,
    originalRunId:canonical.runId,
    pinnedTwinleaf:canonical.pinnedTwinleaf,
    recoveredVerifiedNativeErrorSeatCount:errors.length,
    opponentAttackPrefix:opponentPrefix,
    ...result
  };
}

if (require.main === module) {
  const directory=process.argv[2];
  assert.ok(directory,'Specify the archive directory');
  process.stdout.write('AGENT13_ORIGINAL_V8_CONTEXT_CENSUS '+
    JSON.stringify(verifyOriginalArchive(directory))+'\n');
}

module.exports={ARCHIVE,SHA256,candidateAttackPrefixCoverage,
  verifyOriginalArchive};
