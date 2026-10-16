'use strict';

/**
 * Find sustained candidate Active-position traps following observed Guzma plays.
 * This consumes attributed event telemetry and makes no claims about attack
 * legality, optimal play or game outcomes.
 *
 * @param {object} record One fixed-plan Aichi diagnostic record.
 * @returns {object[]} Source-trace-associated events and public observations.
 */
function guzmaTrapEvents(record) {
  const candidateSeat = record.candidateEngineSlot === 'A' ? 0 : 1;
  const trace = record.traceSummary.chronologicalActionTrace;
  if (!Array.isArray(trace)) throw new TypeError('Chronological trace is required.');

  /** @param {object} row */
  const candidateActive = row =>
    row.publicBoardBeforePass?.[candidateSeat]?.active?.name || null;
  const candidatePass = row =>
    row.action === 'PassTurnAction' && row.playerSlot === candidateSeat;
  const candidateAttack = row =>
    row.action === 'AttackAction' && row.playerSlot === candidateSeat;
  const opening = trace.find(row =>
    row.action === 'ResolvePromptAction' &&
    row.cardSelection?.message === 'CHOOSE_STARTING_POKEMONS' &&
    row.playerSlot === candidateSeat);
  const starter = opening?.cardSelection?.selectedCards?.[0]?.replace(/\s[A-Z0-9]+$/, '') || null;

  const events = [];
  for (let i = 0; i < trace.length; i += 1) {
    const played = trace[i];
    if (played.action !== 'PlayCardAction' || played.card !== 'Guzma') continue;
    const preceding = trace.slice(0, i).filter(candidatePass);
    const previousActive = preceding.length ?
      candidateActive(preceding[preceding.length - 1]) : starter;
    const nextPassIndex = trace.findIndex((row, index) =>
      index > i && candidatePass(row));
    if (nextPassIndex < 0) continue;
    const newActive = candidateActive(trace[nextPassIndex]);
    if (!newActive || newActive === previousActive) continue;

    const turns = [];
    const uncovered = [];
    for (let j = nextPassIndex; j < trace.length; j += 1) {
      const row = trace[j];
      if (candidateAttack(row)) break;
      if (!candidatePass(row)) continue;
      if (candidateActive(row) !== newActive) break;
      turns.push(row.turnBefore);
      const resource = row.printedBasicEnergyBeforePass;
      if (resource?.activePokemon === newActive &&
          Array.isArray(resource.attacks) &&
          resource.attacks.length > 0 &&
          resource.attacks.every(attack =>
            attack.printedCostCoveredByBasic === false)) {
        uncovered.push(row.turnBefore);
      }
    }
    if (turns.length < 2) continue;
    events.push({
      playedBy: played.playerSlot === candidateSeat ? 'candidate' : 'opponent',
      guzmaOrdinal: played.actionOrdinal,
      guzmaTurn: played.turnBefore,
      previousActive, nextActive: newActive,
      sustainedCandidatePassTurns: turns,
      uncoveredPrintedBasicCostTurns: uncovered
    });
  }
  return events;
}

module.exports = { guzmaTrapEvents };
