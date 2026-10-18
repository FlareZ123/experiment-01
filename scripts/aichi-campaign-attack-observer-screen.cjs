'use strict';

const fs = require('node:fs');

const LOG_PROTOCOL = 'real-store-attack-log-declarations-v1';

/**
 * Independently reconcile campaign root AttackActions against real pinned
 * Store attack-log declarations. Neither channel certifies completed effects.
 *
 * @param {object} archive An Aichi fixed-plan diagnostic archive.
 * @returns {object} Read-only evidence report with no win-rate claim.
 */
function auditCampaignAttackDeclarations(archive) {
  if (archive?.purpose !== 'engine-and-policy-diagnostic-only' ||
      !Array.isArray(archive.records)) {
    throw new TypeError('Expected a fixed-campaign diagnostic archive');
  }

  const rows = archive.records.map(record => {
    const slot = record.candidateEngineSlot === 'A' ? 0 :
      record.candidateEngineSlot === 'B' ? 1 : null;
    const trace = record.traceSummary?.attackDeclarationTrace;
    const recognized = record.attackObservationStatus === LOG_PROTOCOL &&
      record.traceSummary?.attackDeclarationTraceProtocol === LOG_PROTOCOL &&
      Array.isArray(trace) && slot !== null;
    const valid = recognized && trace.every(event =>
      event.kind === 'engine-attack-declaration' &&
      [0, 1].includes(event.playerSlot) &&
      Number.isInteger(event.actionOrdinal) &&
      event.actionOrdinal >= 0 &&
      event.actionOrdinal < record.actions &&
      typeof event.attackName === 'string' &&
      event.attackName.length > 0);
    const candidateDeclarations = valid ?
      trace.filter(event => event.playerSlot === slot) : null;
    const opponentDeclarations = valid ?
      trace.filter(event => event.playerSlot !== slot) : null;
    const countConsistent = valid &&
      record.candidateAttackDeclarations === candidateDeclarations.length &&
      record.opponentAttackDeclarations === opponentDeclarations.length;
    const raw = [record.candidateAttacks, record.opponentAttacks];
    const declared = countConsistent ?
      [candidateDeclarations.length, opponentDeclarations.length] : [null, null];
    const discrepancy = countConsistent ? raw.map((value, i) =>
      !Number.isInteger(value) ? 'missing-raw-count' :
      value < declared[i] ? 'root-action-undercount' :
      value > declared[i] ? 'raw-action-without-logged-declaration' :
        'same-count') : ['unverified', 'unverified'];

    return {
      trialId: record.trialId,
      candidateId: record.candidateId,
      opponentRank: record.opponentRank,
      candidateEngineSlot: record.candidateEngineSlot,
      evidenceStatus: countConsistent ? LOG_PROTOCOL :
        'attack-observation-incomplete',
      candidate: {
        rawRootAttackActions: raw[0] ?? null,
        loggedAttackDeclarations: declared[0],
        comparison: discrepancy[0],
        delegatedDeclarationNames: countConsistent ?
          candidateDeclarations.filter(event =>
            event.triggerAction !== 'AttackAction').map(event => event.attackName) : null
      },
      opponent: {
        rawRootAttackActions: raw[1] ?? null,
        loggedAttackDeclarations: declared[1],
        comparison: discrepancy[1],
        delegatedDeclarationNames: countConsistent ?
          opponentDeclarations.filter(event =>
            event.triggerAction !== 'AttackAction').map(event => event.attackName) : null
      }
    };
  });

  return {
    schema: 'aichi-store-log-attack-reconciliation-v1',
    planDigest: archive.planDigest ?? null,
    totalRecords: rows.length,
    independentlyQualifiedGames: 0,
    observationIncomplete: rows.filter(row =>
      row.evidenceStatus === 'attack-observation-incomplete').length,
    candidateRootUndercounts: rows.filter(row =>
      row.candidate.comparison === 'root-action-undercount').length,
    opponentRootUndercounts: rows.filter(row =>
      row.opponent.comparison === 'root-action-undercount').length,
    rows,
    caveat: 'Store logs capture declarations. Attack completion, policy quality, and paper time rules remain independent gates.'
  };
}

if (require.main === module) {
  if (process.argv.length !== 3) {
    throw new Error('Provide one Aichi fixed-campaign diagnostic JSON file');
  }
  process.stdout.write(JSON.stringify(auditCampaignAttackDeclarations(
    JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))), null, 2) + '\n');
}

module.exports = {auditCampaignAttackDeclarations, LOG_PROTOCOL};
