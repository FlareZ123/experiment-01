'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Reconstruct a strictly observational turn-28 decision window from a
 * complete, source-recorded rank-10 archive. The printed HP/attack damage are
 * independent card-text facts, not inferred from missing Store internals.
 *
 * @param {object} archived Full source-branch-live-dispatch archive.
 * @returns {object} Reproducible conditional knockout opportunity.
 */
function auditRank10ShredWindow(archived) {
  assert.equal(archived.trial.seed, 4246551499);
  assert.equal(archived.trial.candidatePhysicalSeat, 1);
  const game = archived.alternate.result;
  const snapshots = game.copycatTurnStartEvidence;
  const s = snapshots.find(row => row.turn === 28);
  assert.ok(s, 'Authentic extra turn was not captured');
  assert.equal(s.candidateSeat, 1);
  assert.deepEqual(s.previousOpponentAttack, {
    source:'Regidrago VSTAR SIT', name:'Apex Dragon', gx:false
  });
  assert.equal(s.candidateUsedGX, true);
  assert.equal(s.ownDialga.discard, 1);
  assert.equal(s.mimikyu.length, 1);
  assert.equal(s.mimikyu[0].location, 'active');
  assert.equal(s.mimikyu[0].energyPrintings.length, 2);
  assert.ok(s.mimikyu[0].energyPrintings.every(name =>
    name.startsWith('Psychic Energy')));
  const defender = s.board[0].active;
  const attacker = s.board[1].active;
  assert.equal(defender.name, 'Regidrago VSTAR');
  assert.equal(attacker.name, 'Mimikyu');
  assert.deepEqual(attacker.printedAttacks.find(a=>a.name === 'Copycat').cost,
    [5,9], 'Printed Mimikyu Copycat requires Psychic plus Colorless');
  const trace = archived.alternate.fullLiveDispatchTrace;
  const timeless = trace.find(e=>e.before.turn===27 &&
    e.attackChoice?.selection?.attackName==='Timeless-GX');
  assert.ok(timeless);
  assert.equal(timeless.attackChoice.selection.printing, 'Dialga-GX UPR');
  const retreat = trace.find(e => e.before.turn===28 && e.action==='RetreatAction');
  const pass = trace.find(e => e.before.turn===28 && e.action==='PassTurnAction');
  assert.ok(retreat && pass && retreat.step < pass.step);
  const response = trace.find(e => e.before.turn === 29 &&
    e.attackChoice?.selection?.attackName==='Kaiser Tackle');
  assert.ok(response);
  assert.equal(response.attackChoice.selection.printing, 'Koraidon ex TEF');
  const printedHP = 280;
  const printedShredDamage = 80;
  return {
    trialId:archived.trial.id,
    seed:archived.trial.seed,
    authenticExtraTurn:28,
    candidateSeat:1,
    mimikyuPsychicEnergy:s.mimikyu[0].energyPrintings.length,
    previousOpponentAttack:s.previousOpponentAttack,
    ownDialgaDiscard:s.ownDialga.discard,
    gxAlreadySpent:s.candidateUsedGX,
    defenderDamage:defender.damage,
    defenderPrintedHP:printedHP,
    printedShredDamage,
    conditionalTwoPrizeKnockout:defender.damage+printedShredDamage>=printedHP,
    prizeCountsAtTurnStart:s.prizeCounts,
    originalTimelessChoiceStep:timeless.step,
    missedRetreatStep:retreat.step,
    missedPassStep:pass.step,
    nextOpponentKaiserTackleChoiceStep:response.step,
    evidenceClass:'source-archived opportunity only; no alternative action, legality or game-win certification'
  };
}

if (require.main === module) {
  const archive = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  process.stdout.write(JSON.stringify(auditRank10ShredWindow(archive),null,2)+'\n');
}
module.exports={auditRank10ShredWindow};
