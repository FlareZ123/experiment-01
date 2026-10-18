'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Read one immutable compiled three-arm source report and print an honest
 * Bench-capacity / root-decision outcome, including a negative alternative.
 * @param {object} report Complete actual Store diagnostic.
 */
function audit(report) {
  assert.equal(report.schema,'rank11-newmoon-farewell-vip-reservation-v2');
  assert.equal(report.retrospectiveSourceSeed,2809154458);
  assert.equal(report.sourceRank,11);
  assert.equal(report.candidateSeat,1);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.equal(report.failures,0,'A source arm threw; inspect raw artifact');
  assert.equal(report.initialOwnerInformationIdentical,true);
  return {
    sourceSeed:report.retrospectiveSourceSeed,
    engine:report.pinnedEngine,
    sourceHash:report.source60Digest,
    candidateHash:report.candidate60Digest,
    arms:['baseline','farewellFirst','farewellReserved'].map(name=>{
      const arm=report[name];
      assert.equal(arm.status,'engine-observed');
      assert.equal(arm.firstTurnSlot,1);
      const pass=arm.firstCandidateTurn.find(e=>
        e.action==='PassTurnAction'&&e.turnBefore===1);
      assert.ok(pass,'Missing actual candidate first-turn Pass');
      const bench=pass.publicBoardBeforePass[1]?.bench ?? [];
      const after=arm.vipAudit.events.find(e=>
        e.kind==='bench-after-selection');
      assert.ok(after,'Missing actual VIP owner search and Bench outcome');
      return {
        name,
        firstPassFreeBenchSlots:5-bench.length,
        firstPassBenchPokemon:bench.map(card=>card.name),
        immediatelyPostVipFreeBenchSlots:after.bench.filter(c=>c===null).length,
        farewellDeclarations:arm.executedFarewell.length,
        reserveVetoEvents:arm.reservationAudit?.events ?? [],
        legalRank11EquippedGarbodor:
          arm.rank11PolicyAudit?.nextTurnLockWitness?.equippedGarbodor===true,
        firstTurnActions:arm.firstCandidateTurn.map(e=>({
          action:e.action,card:e.card||e.ability||null
        })),
        candidateAttackDeclarations:arm.candidateAttackDeclarations.length,
        finished:arm.finished,
        endReason:arm.endReason
      };
    }),
    certifiedCompetitiveGames:0
  };
}

if(require.main===module) {
  const data=JSON.parse(fs.readFileSync(
    'rank11-newmoon-farewell-vip-reservation.json','utf8'));
  process.stdout.write(JSON.stringify(audit(data),null,2)+'\n');
}

module.exports={audit};
