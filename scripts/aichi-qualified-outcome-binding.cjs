'use strict';

const {assessFieldEvidence}=require('./aichi-anytime-field-evidence.cjs');

/**
 * A self-reported terminal record must describe a finished game and agree
 * about which physical seat won. This is an identity/consistency check only.
 * It does not verify a Store replay or the competence of either playing policy.
 *
 * @param {object} record A purportedly qualified game result.
 */
function assertTerminalOutcomeBinding(record) {
  if(!record || record.finished!==true ||
      ![0,1,3].includes(record.winnerIndex) ||
      !['A','B'].includes(record.candidateEngineSlot)) {
    throw new Error('Missing or invalid completed engine terminal evidence');
  }
  const candidateSlot=record.candidateEngineSlot==='A' ? 0 : 1;
  const expected=record.winnerIndex===3 ? 'draw' :
    record.winnerIndex===candidateSlot ? 'win' : 'loss';
  if(record.outcome!==expected) {
    throw new Error('Reported result contradicts engine winner and candidate physical slot');
  }
}

/**
 * Opt-in fail-closed intake. Retains the underlying predeclared e-process
 * math, complete rank/actual-seat validation and frozen provenance checks.
 *
 * @param {object[][]} rounds Complete 64-cell evidence rounds.
 * @param {object} [options] Underlying e-process options.
 * @returns {object} Numerical evidence (never an authenticity certificate).
 */
function assessTerminalBoundFieldEvidence(rounds, options) {
  if(!Array.isArray(rounds))throw new Error('Evidence rounds must be an array');
  for(const round of rounds) {
    if(!Array.isArray(round))throw new Error('Each evidence round must be an array');
    for(const record of round)assertTerminalOutcomeBinding(record);
  }
  return assessFieldEvidence(rounds,options);
}

module.exports={assertTerminalOutcomeBinding,assessTerminalBoundFieldEvidence};
