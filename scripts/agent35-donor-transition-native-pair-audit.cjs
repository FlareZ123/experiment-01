'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Postgame same-physical-deal only comparison of two complete actor policy
 * histories. These are historical development experiments, never qualified
 * competitive outcomes or independent field trials.
 * @param {object} before Early Benched-Mewtwo donor opt-in, transition off.
 * @param {object} after Identical environment plus transition opt-in.
 * @returns {object} Failure-inclusive four-arm evidence.
 */
function compare(before,after){
  assert.equal(before.attempted,4);
  assert.equal(after.attempted,4);
  assert.equal(before.competitiveQualifiedGames,0);
  assert.equal(after.competitiveQualifiedGames,0);
  assert.equal(before.ownerCompressorBenchedOptIn,true);
  assert.equal(after.ownerCompressorBenchedOptIn,true);
  const rows=before.rows.map((a,i)=>{
    const b=after.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.trial.seed,b.trial.seed);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const rootAudit=row=>row.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.root??null;
    const sourceChoice=row=>({
      actions:row.actionCount,
      finished:row.finished,
      winner:row.winner,
      endReason:row.endReason??null,
      root:row.rootActionLedgerSha256,
      actualCompressor:row.candidateBattleCompressorRoots??[],
      candidateAttacks:row.candidateAttackDeclarationEvidence??[],
      nativeRootWitnesses:rootAudit(row)?.nativePhysicalConfirmed??null,
      nativeRejectedActorRoots:rootAudit(row)?.rejectedActorRoots??null,
      rootIntentCounts:rootAudit(row)?.typedIntentCounts??null,
      actualCandidateRetreatRoots:(row.rootActionLedger??[])
        .filter(x=>x.playerSlot===row.candidateSeat&&
          x.action==='RetreatAction')
        .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
          action:x.action})),
      actualCandidatePerfectionAbilityRoots:(row.rootActionLedger??[])
        .filter(x=>x.playerSlot===row.candidateSeat&&
          x.action==='UseAbilityAction'&&x.ability==='Perfection')
        .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
          ability:x.ability})),
      nativeAttackSettlements:(row.candidateAttackSettlement?.attacks??[])
        .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
          attackName:x.attackName,triggerAction:x.triggerAction,
          settledPromptChain:x.settledPromptChain,
          settlementCrossesClockReset:x.settlementCrossesClockReset,
          prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter,
          nextSourceSameEpochProven:x.nextSourceSameEpochProven,
          nextSourceRoot:x.nextSourceRoot,
          nextSourceTurnActions:x.nextSourceTurnActions})),
      finalPrizes:row.finalPrizes,
      competitiveQualified:false
    });
    return {trial:a.trial.id,
      sourceDeal:a.sourceDealFingerprint,
      actualStarterSeat:a.actualStarterSeat,
      control:sourceChoice(a),treatment:sourceChoice(b),
      actionLedgerIdentical:a.rootActionLedgerSha256===b.rootActionLedgerSha256};
  });
  const main=rows.find(r=>
    r.trial==='11:2:B:new-moon-lockbreaker-v1');
  assert.ok(main);
  return {schema:'agent35-native-donor-funding-and-pivot-development-pair-v1',
    baseline:'original early Benched-Mewtwo donor opt-in',
    treatment:'same opt-in plus public donated-attack funding and paid-retreat planner',
    historical:true,sourceDealValidated:true,
    paperExpandedRuleFidelityQualified:false,
    qualifiedCompetitiveGames:0,rows};
}

if(require.main===module){
  const [baselineFile,treatmentFile]=process.argv.slice(2);
  assert.ok(baselineFile&&treatmentFile);
  const result=compare(
    JSON.parse(fs.readFileSync(baselineFile,'utf8')),
    JSON.parse(fs.readFileSync(treatmentFile,'utf8'))
  );
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  for(const r of result.rows){
    process.stderr.write('AGENT35_DONOR_FUNDING_PAIR '+
      JSON.stringify({trial:r.trial,
        identical:r.actionLedgerIdentical,
        off:{actions:r.control.actions,terminal:r.control.finished,
          intents:r.control.rootIntentCounts,
          attacks:r.control.candidateAttacks.map(x=>x.attackName)},
        on:{actions:r.treatment.actions,terminal:r.treatment.finished,
          intents:r.treatment.rootIntentCounts,
          attacks:r.treatment.candidateAttacks.map(x=>x.attackName),
          retreats:r.treatment.actualCandidateRetreatRoots,
          perfections:r.treatment.actualCandidatePerfectionAbilityRoots,
          settlements:r.treatment.nativeAttackSettlements,
          finalPrizes:r.treatment.finalPrizes},
        qualifiedCompetitiveGames:0})+'\n');
  }
}
module.exports={compare};
