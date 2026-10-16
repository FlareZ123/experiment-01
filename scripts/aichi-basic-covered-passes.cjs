'use strict';

const fs = require('node:fs');

/**
 * Summarize restricted Basic-Energy coverage for printed costs before passes.
 * Coverage does not imply a legal or strategically useful attack.
 *
 * @param {object} diagnostic Source-locked Aichi campaign JSON.
 * @returns {object} Per-trial seat-aware counts and action ordinals.
 */
function summarizeBasicCoveredPasses(diagnostic) {
  const records = diagnostic.records.map(record => {
    const trace = record.traceSummary?.chronologicalActionTrace;
    const candidateSeat = record.candidateEngineSlot === 'A' ? 0 : 1;
    if (record.status !== 'completed-engine-game' || !Array.isArray(trace)) {
      return {trialId: record.trialId, candidateId: record.candidateId,
        opponentRank: record.opponentRank, status: 'no-qualified-trace'};
    }
    const passEvents = trace.filter(entry => entry.action === 'PassTurnAction');
    const summarizeSeat = seat => {
      const passes = passEvents.filter(entry => entry.playerSlot === seat);
      const unaudited = passes.filter(entry =>
        !Object.hasOwn(entry, 'printedBasicEnergyBeforePass'));
      const basicsCovered = passes.filter(entry =>
        entry.printedBasicEnergyBeforePass?.attacks?.some(attack =>
          attack.printedCostCoveredByBasic === true));
      return {
        passes: passes.length,
        unauditedPasses: unaudited.length,
        printedBasicCostCoveredPasses: basicsCovered.length,
        evidence: basicsCovered.map(entry => ({
          actionOrdinal: entry.actionOrdinal,
          turnBefore: entry.turnBefore,
          activePokemon: entry.printedBasicEnergyBeforePass.activePokemon,
          names: entry.printedBasicEnergyBeforePass.attacks
            .filter(attack => attack.printedCostCoveredByBasic === true)
            .map(attack => attack.name)
        }))
      };
    };
    const candidate = summarizeSeat(candidateSeat);
    const opponent = summarizeSeat(1-candidateSeat);
    return {
      trialId: record.trialId,
      candidateId: record.candidateId,
      opponentRank: record.opponentRank,
      status: candidate.unauditedPasses + opponent.unauditedPasses > 0 ?
        'partial-cost-trace' : 'public-cost-only-triage',
      candidate,
      opponent
    };
  });
  return {
    evidenceType: 'not-a-legal-attack-or-win-rate-diagnostic',
    records
  };
}

if (require.main === module) {
  const diagnostic = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  process.stdout.write(JSON.stringify(summarizeBasicCoveredPasses(diagnostic), null, 2) + '\n');
}
module.exports = {summarizeBasicCoveredPasses};
