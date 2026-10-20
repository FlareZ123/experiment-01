'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Summarize source-only Raichu/Electrode convergence without treating repeated
 * decisions as independent observations. All counts refer to actual live
 * non-prompt owner decisions in distinct fixed source games.
 *
 * @param {object} campaign Exact Aichi campaign diagnostic JSON.
 * @returns {object} Development-only table and per-game evidence.
 */
function rank4PositionSummary(campaign){
  assert.equal(campaign?.schemaVersion,1);
  assert.equal(campaign?.seedProtocol,'decorrelated-slots-v3');
  const trials=campaign.records.filter(row=>row.opponentRank===4);
  assert.equal(trials.length,8,'Expected four candidates and two seats');
  assert.equal(new Set(trials.map(row=>row.trialId)).size,8);
  const metrics=[
    'decisions','benchedRaichu','benchedElectrode','bothBenched',
    'bothBenchedWithThreeDiscardSpecial','bothBenchedWithHeldEscapeRope',
    'heldEscapeRopePrizeWindow','bothBasicPredecessorsVisible',
    'heldRaichuEvolution','heldElectrodeEvolution'
  ];
  const sums=Object.fromEntries(metrics.map(key=>[key,0]));
  const evidence=trials.map(row=>{
    assert.equal(row.status,'completed-engine-game');
    const sourceSeat=row.candidateEngineSlot==='A'?1:0;
    const audit=row.traceSummary?.electrodeOpportunitySummary;
    assert.equal(audit?.evidenceType,
      'live-aichi-electrode-public-necessary-conditions-v1');
    const frontier=audit.positionFrontier;
    assert.equal(frontier?.schema,
      'aichi-raichu-electrode-owner-position-frontier-v1');
    assert.equal(frontier.nativeRetreatOrEscapeRopeLegalityVerified,false);
    assert.equal(frontier.opponentPrivateZonesInspected,false);
    const old=audit.countsBySeat[sourceSeat];
    const counts=frontier.countsBySeat[sourceSeat];
    assert.equal(counts.decisions,old.decisions);
    assert.ok(old.both<=old.activeRaichu&&old.both<=old.benchedElectrode);
    for(const name of metrics){
      assert.ok(Number.isSafeInteger(counts[name])&&
        counts[name]>=0&&counts[name]<=counts.decisions,name);
      sums[name]+=counts[name];
    }
    assert.ok(counts.bothBenchedWithThreeDiscardSpecial<=counts.bothBenched);
    assert.ok(counts.bothBenchedWithHeldEscapeRope<=counts.bothBenched);
    assert.ok(counts.heldEscapeRopePrizeWindow<=
      counts.bothBenchedWithThreeDiscardSpecial);
    assert.ok(counts.heldEscapeRopePrizeWindow<=
      counts.bothBenchedWithHeldEscapeRope);
    return {trialId:row.trialId,candidateId:row.candidateId,
      candidateEngineSlot:row.candidateEngineSlot,
      realCandidateStart:row.candidateActualTurn,
      sourceSeat,sourceOldBoth:old.both,
      candidateAttacks:row.candidateAttacks,
      sourceAttacks:row.opponentAttacks,
      decisions:counts};
  });
  return {
    schema:'agent45-aichi-rank4-owner-position-summary-v1',
    trials:evidence.length,seedProtocol:campaign.seedProtocol,
    planDigest:campaign.planDigest,
    sourceDecisionCount:sums.decisions,
    totals:sums,
    gamesWithBothBenched:evidence.filter(row=>row.decisions.bothBenched>0).length,
    gamesWithHeldRopeWindow:evidence.filter(row=>
      row.decisions.heldEscapeRopePrizeWindow>0).length,
    perTrial:evidence,
    diagnosticsOnly:true,qualifiedGames:0,
    caveat:'Correlated decision counts; no legal pivot, Ability use, attack, opponent competence or competitive win inference.'
  };
}

if(require.main===module){
  const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(rank4PositionSummary(input),null,2)+'\n');
}
module.exports={rank4PositionSummary};
