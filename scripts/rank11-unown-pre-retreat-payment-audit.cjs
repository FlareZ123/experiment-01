'use strict';

const assert=require('node:assert/strict');

/**
 * Inspect the real pre-retreat boundary in one archived candidate-first deal.
 * This is a resource-payment check for an alternative printed attack, not
 * a cloned Store acceptance test, strategic policy or gameplay win estimate.
 *
 * @param {object} report Archived full 16-arm rank11 direct source report.
 * @returns {object} Source-root resource-payment witness.
 */
function auditPreRetreatUnownAttackPayment(report) {
  assert.equal(report.schema,
    'rank11-direct-held-shake-candidate-attack-window-source-v2');
  assert.equal(report.sourceRank,11);
  assert.equal(report.sourceSeat,0);
  assert.equal(report.candidateSeat,1);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(Array.isArray(report.attempts));

  const variants=new Set([
    'new-moon-generic',
    'new-moon-horror-compressor',
    'new-moon-blower-horror-compressor'
  ]);
  const arms=report.attempts.filter(a=>
    a.sourceSeedIdentity==='second-b' && variants.has(a.candidate));
  assert.equal(arms.length,3,'Three fixed New Moon arms required');
  const seen=new Set();
  const witnesses=[];
  for(const arm of arms) {
    assert.ok(!seen.has(arm.candidate),'Duplicate candidate policy arm');
    seen.add(arm.candidate);
    assert.equal(arm.seed,2809154458);
    assert.equal(arm.status,'engine-observed');
    assert.equal(arm.startVerified,true);
    assert.equal(arm.actualSourceFirst,false);
    assert.equal(arm.sourcePolicyCompleted,true);
    assert.equal(arm.candidateAttackDeclarationCount,0);
    const actions=arm.candidateEarlyDecisions;
    assert.ok(Array.isArray(actions));
    const firstTurn=actions.filter(x=>x.turnBefore===3 && x.playerSlot===1);
    assert.deepEqual(firstTurn.map(x=>x.action),
      ['PlayCardAction','RetreatAction','PassTurnAction']);
    const [attach,retreat,pass]=firstTurn;
    assert.equal(attach.card,'Psychic Energy');
    assert.equal(attach.actionOrdinal,25);
    assert.equal(retreat.actionOrdinal,26);
    assert.equal(pass.actionOrdinal,27);
    assert.equal(retreat.retreatTransition?.fromActive?.name,'Unown');
    assert.deepEqual(retreat.retreatTransition.fromActive.energyCards,
      ['Psychic Energy']);
    assert.deepEqual(retreat.retreatTransition.fromActive.printedAttacks,
      [{name:'Hidden Power',cost:[9]}]);
    assert.equal(retreat.retreatTransition.actualActiveAfter?.name,
      'Galarian Articuno V');
    assert.deepEqual(retreat.retreatTransition.actualActiveAfter.energyCards,
      ['Psychic Energy']);
    assert.equal(retreat.retreatTransition.benchAfter?.[0]?.name,'Unown');
    assert.deepEqual(retreat.retreatTransition.benchAfter[0].energyCards,[]);
    assert.equal(pass.publicBoardBeforePass?.[1]?.active?.name,
      'Galarian Articuno V');
    assert.equal(pass.publicBoardBeforePass[1].active.energyCards?.length,1);
    assert.equal(pass.publicBoardBeforePass[1].active.printedAttacks?.[0]?.name,
      'Psyray');
    assert.equal(pass.publicBoardBeforePass[1].active.printedAttacks[0].cost?.length,3);
    witnesses.push({
      candidatePolicy:arm.candidate,
      seed:arm.seed,
      globalTurn:3,
      physicalCandidateSeat:1,
      attachmentOrdinal:25,
      retreatOrdinal:26,
      passOrdinal:27,
      sourceActiveBeforeRetreat:'Unown',
      attachedEnergyBeforeRetreat:['Psychic Energy'],
      attackName:'Hidden Power',
      costSymbols:['Colorless'],
      paperCardAttackDamage:10,
      printedAttackEnergyPaymentSatisfied:true,
      chosenRootAction:'RetreatAction',
      promoted:'Galarian Articuno V',
      promotedAttackEnergyPaymentSatisfied:false,
      printedAttackLegalityBeyondEnergy:'unreviewed',
      tacticalOptimality:'unreviewed'
    });
  }
  return {
    schema:'rank11-candidate-first-unown-retreat-payment-v1',
    sourceArtifact:'CI 39118444773 / artifact 12132319883',
    retrospectiveSourceDeals:1,
    policyArmRepetitions:3,
    witnesses,
    attackPaymentWitnesses:3,
    independentCompetitiveGamesQualified:0,
    caution:'Resource-payment witness only. No cloned AttackAction, status/effect eligibility review, paper clock or completed attack has been proven. Earlier lack of a payable attack at Pass follows the chosen Retreat and is not a whole-turn impossibility claim.'
  };
}

module.exports={auditPreRetreatUnownAttackPayment};
