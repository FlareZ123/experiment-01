'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SCHEMA='agent25-frozen-32-owner-lowhand-lillie-opportunity-census-v1';

/**
 * Summarize read-only authenticated owner-root observations in the existing
 * 32-arm preregistered original-Store scout, without changing any actions.
 * Root read counts are correlated repeated decision reads, not distinct turns
 * or legally possible complete Lillie draw lines.
 * @param {object} scout Original frozen scout result with owner-only census.
 * @returns {object} Failure-inclusive, noncompetitive observational evidence.
 */
function ownerCensus(scout){
  assert.equal(scout.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  const {summary,developmentResult:r}=scout;
  assert.equal(summary.attempts,32);
  assert.equal(r.attempted,32);
  assert.equal(r.rows.length,32);
  assert.equal(r.competitiveQualifiedGames,0);
  const ids=new Set();
  const rows=r.rows.map(row=>{
    const id=row.trial.id;
    assert.ok(!ids.has(id),'duplicate source trial');
    ids.add(id);
    const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    if(root)assert.equal(root.lowHandLillieCensusOptIn,true,
      'missing owner-only census in executed trial');
    const c=root?.lowHandLillieRootCensus??null;
    if(c){
      assert.equal(c.ownerRoots,c.bySeat[0].ownerRoots+
        c.bySeat[1].ownerRoots);
      assert.equal(c.heldRoots,c.bySeat[0].heldRoots+
        c.bySeat[1].heldRoots);
      assert.equal(c.eligibleRoots,c.bySeat[0].eligibleRoots+
        c.bySeat[1].eligibleRoots);
      assert.ok(c.eligibleRoots<=c.heldRoots);
      assert.ok(c.heldRoots<=c.ownerRoots);
      assert.equal(Object.values(c.reasonCounts).reduce((a,b)=>a+b,0),
        c.ownerRoots);
      assert.equal(Object.values(c.heldReasonCounts).reduce((a,b)=>a+b,0),
        c.heldRoots);
      assert.ok(c.heldSamples.length<=c.sampleLimit);
    }
    return {
      id,rank:row.trial.rank,seat:row.candidateSeat,
      candidate:row.trial.candidateId,
      sourceFirst:row.sourceActuallyFirst??null,
      status:row.status??(row.finished===true?'engine-terminal':'censored'),
      fullGameQualified:false,
      sourceDeal:row.sourceDealFingerprint??null,
      firstPlayer:row.actualStarterSeat??null,
      rootLedgerSha256:row.rootActionLedgerSha256??null,
      rootActions:row.rootActionCount??null,
      ownerRootReads:c?.ownerRoots??null,
      heldRootReads:c?.heldRoots??null,
      eligibleRootReads:c?.eligibleRoots??null,
      heldReasons:c?.heldReasonCounts??null,
      bySeat:c?.bySeat??null,
      samples:c?.heldSamples??[],
      nativeError:row.error??null
    };
  });
  assert.equal(ids.size,32);
  const usable=rows.filter(row=>row.ownerRootReads!==null);
  const aggregateBy=groupBy=>{
    const keys=new Map();
    for(const row of rows){
      const name=String(groupBy(row));
      const prior=keys.get(name)??{arms:0,observedArms:0,errors:0,
        capped:0,terminals:0,ownerRootReads:0,heldRootReads:0,
        eligibleRootReads:0,heldReasons:{}};
      prior.arms++;
      prior.observedArms+=Number(row.ownerRootReads!==null);
      prior.errors+=Number(row.nativeError!==null);
      prior.capped+=Number(row.status==='censored');
      prior.terminals+=Number(row.status==='engine-terminal');
      for(const [name,field] of [['ownerRootReads','ownerRootReads'],
        ['heldRootReads','heldRootReads'],
        ['eligibleRootReads','eligibleRootReads']]){
        prior[name]+=row[field]??0;
      }
      for(const [reason,count] of Object.entries(row.heldReasons??{}))
        prior.heldReasons[reason]=(prior.heldReasons[reason]??0)+count;
      keys.set(name,prior);
    }
    return Object.fromEntries(keys);
  };
  return {
    schema:SCHEMA,
    registrationBlob:scout.registrationBlob,
    enginePin:r.enginePin,
    attempted:32,observedArms:usable.length,
    terminalArms:summary.engineTerminals,
    cappedArms:summary.censored,
    exceptionArms:summary.exceptions,
    ownerRootReads:usable.reduce((n,row)=>n+row.ownerRootReads,0),
    heldRootReads:usable.reduce((n,row)=>n+row.heldRootReads,0),
    eligibleRootReads:usable.reduce((n,row)=>n+row.eligibleRootReads,0),
    byRank:aggregateBy(row=>row.rank),
    byCandidate:aggregateBy(row=>row.candidate),
    competitiveQualifiedGames:0,
    caveat:'Existing preregistered physical deals re-executed with read-only owner-root census; root readings are correlated, source and candidate policies remain incomplete and paper time is uncalibrated',
    rows
  };
}
if(require.main===module){
  const filename=process.argv[2];
  assert.ok(filename,'Provide exact scout artifact JSON');
  process.stdout.write(JSON.stringify(ownerCensus(
    JSON.parse(fs.readFileSync(filename,'utf8'))),null,2)+'\n');
}
module.exports={SCHEMA,ownerCensus};
