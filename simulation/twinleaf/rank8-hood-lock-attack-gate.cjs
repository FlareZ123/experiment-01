'use strict';

const assert = require('node:assert/strict');

/**
 * Evaluate a source-locked rank-8 Hood audit without changing actions or
 * exposing hidden opponent cards. The audit is produced by Agent 15's
 * hood-rank8-source-board-audit.cjs live Store observer.
 * @param {object} audit
 * @returns {object}
 */
function assessRank8HoodSource(audit) {
  assert.equal(audit.seed, 1260748957);
  assert.equal(audit.physicalCandidateSeat, 'B');
  assert.equal(audit.actualCandidateTurn, 'second');
  assert.equal(audit.exactFullActionStreamNoninterference, true);
  const events = audit.chronologicalBoardEvents;
  assert.ok(Array.isArray(events));

  /** @param {object} side @returns {boolean} */
  const equippedGarbodor = side => (side?.bench || []).some(p =>
    p.name === 'Garbodor' && p.tools.length > 0) ||
    (side?.active?.name === 'Garbodor' && side.active.tools.length > 0);
  const equippedTurns = new Set();
  const doors = [];
  const terminal = [];

  for (const event of events) {
    const sourceSide = event.actingSeat === 0 ?
      event.visibleBefore.actor : event.visibleBefore.other;
    if (equippedGarbodor(sourceSide)) equippedTurns.add(event.turn);
    if (event.action === 'UseAbilityAction' &&
        event.declaredName === 'Underworld Door' && event.actingSeat === 1) {
      doors.push({
        turn: event.turn,
        hoodedActive: event.visibleBefore.actor.active?.tools
          ?.includes('Stealthy Hood') === true,
        equippedOpponentGarbodor: equippedGarbodor(event.visibleBefore.other)
      });
    }
    if (event.action === 'AttackAction' &&
        event.declaredName === 'Terminal Period' && event.actingSeat === 0) {
      const energy = event.attackBefore?.energy || [];
      const darkness = energy.filter(name => name === 'Darkness Energy').length;
      terminal.push({
        turn: event.turn,
        attackingPokemon: event.attackBefore?.name,
        defendingPokemon: event.targetBefore?.name,
        defenderDamage: event.targetBefore?.damage,
        terminalKnockoutCondition: event.targetBefore?.damage === 60,
        terminalPeriodEnergySatisfied: darkness >= 1 && energy.length >= 2,
        clawOfDarknessEnergySatisfied: darkness >= 2 && energy.length >= 3,
        darkPatchSourceEnergyAvailable: event.opponentDarknessDiscardBefore > 0,
        attachedEnergy: energy
      });
    }
  }
  return {
    schema: 'rank8-hood-source-lock-attack-gate-v1',
    seed: audit.seed,
    actualCandidateTurn: audit.actualCandidateTurn,
    rootActionStreamSha256: audit.actionStreamSha256,
    observedUnderworldDoorCount: doors.length,
    protectedUnderworldDoorAgainstEquippedGarbodor:
      doors.filter(x => x.hoodedActive && x.equippedOpponentGarbodor).length,
    equippedGarbodorObservedTurns: [...equippedTurns].sort((a, b) => a - b),
    underworldDoor: doors,
    terminalPeriod: terminal,
    terminalPeriodKnockoutConditionsMet:
      terminal.filter(x => x.terminalKnockoutCondition).length,
    terminalTurnsWithClawEnergy:
      terminal.filter(x => x.clawOfDarknessEnergySatisfied).length,
    terminalTurnsWithDiscardDarknessForPatch:
      terminal.filter(x => x.darkPatchSourceEnergyAvailable).length,
    qualifiedForCompetitiveInference: false,
    caveat: 'Basic Darkness and Lightning Energy source printings only. ' +
      'Dark Patch unavailability at inspected turns does not prove opponent policy competence.'
  };
}

if (require.main === module) {
  const fs = require('node:fs');
  const audit = process.argv[2] ?
    JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) :
    require('./hood-rank8-source-board-audit.cjs').main();
  process.stdout.write(JSON.stringify(assessRank8HoodSource(audit), null, 2) + '\n');
}

module.exports = {assessRank8HoodSource};
