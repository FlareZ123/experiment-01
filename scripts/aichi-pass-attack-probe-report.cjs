'use strict';

const fs = require('node:fs');

/**
 * Count engine-accepted attack announcements observed after an AI chooses
 * PassTurnAction. An attack can be accepted but strategically inferior.
 * These are decisions within games, never independent matchup samples.
 *
 * @param {object} archive Completed or partial source-ranked diagnostic archive.
 * @returns {object} Read-only trace-derived evidence by candidate and opponent.
 */
function summarizePassAttackProbes(archive) {
  if (!archive || !Array.isArray(archive.records) ||
      archive.strengthClaimPermitted !== false) {
    throw new Error('Require a source-ranked, explicitly noncompetitive diagnostic archive.');
  }

  /** @param {object} record @param {number} seat @returns {object} */
  function forSeat(record, seat) {
    const trace = record.traceSummary?.chronologicalActionTrace;
    if (!Array.isArray(trace)) {
      return {traceStatus:'missing-meaningful-action-trace',passesObserved:null,
        probedPasses:null,acceptedAlternativePasses:null};
    }

    const passes = trace.filter(action =>
      action.action === 'PassTurnAction' && action.playerSlot === seat);
    const probed = passes.filter(action => action.attackPassProbe);
    const alternatives = probed.flatMap(action => {
      const probe = action.attackPassProbe;
      const accepted = Array.isArray(probe.tested) ?
        probe.tested.filter(row => row.engineAcceptedAnnouncement === true) : [];
      return accepted.length === 0 ? [] : [{
        actionOrdinal:action.actionOrdinal, turnBefore:action.turnBefore,
        activePokemon:probe.activePokemon ?? null,
        acceptedAttacks:accepted.map(row => ({name:row.name,source:row.source}))
      }];
    });

    return {
      traceStatus:'action-trace-only',
      passesObserved:passes.length,
      probedPasses:probed.length,
      unprobedPasses:passes.length-probed.length,
      acceptedAlternativePasses:alternatives.length,
      rejectedOrNoCandidatePasses:probed.filter(action =>
        Array.isArray(action.attackPassProbe?.tested) &&
        action.attackPassProbe.tested.every(row =>
          row.engineAcceptedAnnouncement !== true)).length,
      probeErrors:probed.filter(action =>
        typeof action.attackPassProbe?.auditError === 'string').length,
      alternatives
    };
  }

  const records = archive.records.map(record => {
    if (!['A','B'].includes(record.candidateEngineSlot)) {
      throw new Error('Unknown candidate physical slot: '+String(record.candidateEngineSlot));
    }
    const candidateSeat = record.candidateEngineSlot === 'A' ? 0 : 1;
    return {
      trialId:record.trialId,
      rank:record.opponentRank,
      candidateId:record.candidateId,
      sourceGameStatus:record.status,
      candidateSeat,
      candidate:forSeat(record,candidateSeat),
      opponent:forSeat(record,1-candidateSeat)
    };
  });

  return {
    evidenceType:'post-pass-attack-announcement-triage-v1',
    scope:'Pinned-engine cloned announcement acceptance at an already selected pass; decisions are correlated and may be strategically correct. This is not a match win, paper rule certification, or deck quality estimate.',
    planDigest:archive.planDigest,
    collectionRequested:archive.policyFlags?.captureAttackPassProbes === true,
    rankingPermitted:false,
    winRateEvidence:false,
    records
  };
}

if (require.main === module) {
  if (!process.argv[2]) throw new Error('Provide a diagnostic archive JSON path.');
  const archive = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(summarizePassAttackProbes(archive),null,2)+'\n');
}

module.exports = {summarizePassAttackProbes};
