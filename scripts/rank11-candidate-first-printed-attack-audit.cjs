'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');

/**
 * Source IDs and policy arms are fixed by the archived compiled diagnostic.
 * The selected source deals were retrospective. They are not win-rate samples.
 */
const EXPECTED = Object.freeze({
  'second-a': 1769876458,
  'second-b': 2809154458
});
const VARIANTS = Object.freeze([
  'new-moon-generic',
  'new-moon-horror-compressor',
  'new-moon-blower-horror-compressor'
]);
const SINGLE_UNIT_ENERGIES = new Set([
  'Psychic Energy', 'Telepathic Psychic Energy'
]);
const PRINTED_ATTACKS = Object.freeze({
  'Mewtwo & Mew-GX': {name:'Miraculous Duo-GX', cost:3},
  'Galarian Articuno V': {name:'Psyray', cost:3}
});

/**
 * Audit only already recorded authentic-pass boards. No detached Store
 * simulations, speculative decisions or opponent-hidden cards are used.
 * Each result is a necessary printed-attack Energy condition, not a complete
 * legal-action or paper-rules certificate.
 *
 * @param {object} report Full rank11-direct-candidate-attack-window JSON.
 * @returns {object} Versioned fail-closed observed-pass audit.
 */
function auditCandidateFirstPrintedAttacks(report) {
  assert.equal(report.schema,
    'rank11-direct-held-shake-candidate-attack-window-source-v2');
  assert.equal(report.sourceRank,11);
  assert.equal(report.sourceSeat,0);
  assert.equal(report.candidateSeat,1);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(Array.isArray(report.attempts));

  const selected = report.attempts.filter(row =>
    Object.hasOwn(EXPECTED,row.sourceSeedIdentity) &&
    VARIANTS.includes(row.candidate));
  assert.equal(selected.length,6,'Exactly six preidentified New Moon arms required');
  const observations=[];
  const seen=new Set();
  for(const arm of selected) {
    const id=arm.sourceSeedIdentity+':'+arm.candidate;
    assert.ok(!seen.has(id),'Duplicate source/variant arm');
    seen.add(id);
    assert.equal(arm.seed,EXPECTED[arm.sourceSeedIdentity]);
    assert.equal(arm.status,'engine-observed');
    assert.equal(arm.startVerified,true);
    assert.equal(arm.actualSourceFirst,false);
    assert.equal(arm.sourcePolicyCompleted,true);
    assert.equal(arm.nextTurnLockWitness?.equippedGarbodor,true);
    assert.equal(arm.candidateAttackDeclarationCount,0);
    assert.ok(Array.isArray(arm.candidateEarlyDecisions));

    const passes=arm.candidateEarlyDecisions.filter(row =>
      row.playerSlot===1 && row.action==='PassTurnAction');
    assert.deepEqual(passes.map(row=>row.turnBefore),[3,5],
      'The archived first two recorded post-lock Pass turns changed');

    for(const pass of passes) {
      const boards=pass.publicBoardBeforePass;
      assert.equal(boards?.length,2);
      const garbodor=boards[0].bench.find(p=>p.name==='Garbodor');
      assert.ok(garbodor && Array.isArray(garbodor.toolCards) &&
        garbodor.toolCards.includes('Muscle Band'),
        'BKP Garbotoxin requires the live attached Tool witness');
      const active=boards[1].active;
      const requirement=PRINTED_ATTACKS[active?.name];
      assert.ok(requirement,'Unexpected Active printing identity');
      assert.deepEqual(active.printedAttacks.map(a=>a.name),[requirement.name]);
      assert.equal(active.printedAttacks[0].cost.length,requirement.cost);
      assert.ok(Array.isArray(active.energyCards));
      for(const energy of active.energyCards) {
        assert.ok(SINGLE_UNIT_ENERGIES.has(energy),
          'Unknown Energy-card multiplicity: '+energy);
      }
      assert.ok(active.energyCards.length<requirement.cost,
        'Insufficient-Energy conclusion no longer applies');
      const ownHand=pass.decisionHandBefore?.ownHandPrintings;
      assert.ok(Array.isArray(ownHand),'Own-hand snapshot required');
      observations.push({
        sourceSeedIdentity:arm.sourceSeedIdentity,
        seed:arm.seed,candidate:arm.candidate,
        globalTurn:pass.turnBefore,rootOrdinal:pass.actionOrdinal,
        activePokemon:active.name,
        energyCards:[...active.energyCards],
        singleUnitEnergyProvided:active.energyCards.length,
        printedAttack:requirement.name,
        printedAttackEnergyCost:requirement.cost,
        opposingGarbodorEquippedTool:'Muscle Band',
        ownHandPrintings:[...ownHand],
        fieldBlowerHeld:ownHand.some(name=>name.startsWith('Field Blower')),
        insufficientPrintedAttackEnergy:true,
        copyingAbilityLocked:active.name==='Mewtwo & Mew-GX',
        inference:"The Active's one printed attack lacks sufficient Energy. BKP 57 Garbotoxin remains Tool-enabled; on Mewtwo & Mew-GX this suppresses Perfection."
      });
    }
  }
  assert.equal(seen.size,6);
  assert.equal(observations.length,12);
  return {
    schema:'rank11-candidate-first-early-pass-printed-energy-v1',
    sourceArtifact:'CI 39118444773 / artifact 12132319883',
    retrospectiveSourceDeals:2,
    repeatedPolicyArms:6,
    earlyPassSnapshots:observations.length,
    allInsufficientForPrintedAttack:true,
    allHeldFieldBlower:observations.every(row=>row.fieldBlowerHeld),
    observations,
    qualifiedCompetitiveGames:0,
    boundary:'This checks only the first two recorded post-lock Pass states per arm. It neither enumerates all possible actions nor establishes optimal sequencing, copied-attack effects, later turns, replay fidelity, or game win rate.'
  };
}

if(require.main===module) {
  const file=process.argv[2];
  assert.ok(file,'Path to preserved compiled full report JSON required');
  process.stdout.write(JSON.stringify(auditCandidateFirstPrintedAttacks(
    JSON.parse(readFileSync(file,'utf8'))),null,2)+'\n');
}
module.exports={auditCandidateFirstPrintedAttacks};
