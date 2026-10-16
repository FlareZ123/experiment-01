'use strict';

const fs = require('node:fs');

/**
 * Examine the first recorded Iron Thorns turn in source-locked rank-6 trials.
 * This is a policy-resource diagnostic from partial action traces, not a game
 * replay, proof that an attack was legal, or a measure of competitive strength.
 *
 * @param {object} campaign Fixed-plan engine diagnostic artifact.
 * @returns {object} Small auditable opening resource digest.
 */
function auditRank6Openings(campaign) {
  if (!campaign || !Array.isArray(campaign.records)) {
    throw new Error('Expected a source-locked campaign records array.');
  }
  const rows = campaign.records.filter(row => row.opponentRank === 6);
  return {
    purpose: 'partial-first-turn-policy-resource-diagnostic',
    planDigest: campaign.planDigest ?? null,
    sampleSize: rows.length,
    competitiveWinRateEvidence: false,
    records: rows.map(row => {
      const ironThornsSlot = row.candidateEngineSlot === 'A' ? 1 : 0;
      const trace = row.traceSummary?.chronologicalActionTrace;
      const base = {
        trialId: row.trialId,
        candidateId: row.candidateId,
        candidateActualTurn: row.candidateActualTurn,
        ironThornsSlot,
        engineStatus: row.status
      };
      if (!Array.isArray(trace)) {
        return {...base, auditStatus: 'trace-unavailable'};
      }
      const actor = trace.filter(entry => entry.playerSlot === ironThornsSlot);
      const end = actor.find(entry =>
        entry.action === 'PassTurnAction' || entry.action === 'AttackAction');
      if (!end) {
        return {...base, auditStatus: 'first-turn-ending-action-not-observed',
          actorEntries: actor.length};
      }
      const opening = actor.filter(entry => entry.turnBefore === end.turnBefore &&
        entry.actionOrdinal <= end.actionOrdinal);
      const observedHands = opening
        .filter(entry => Array.isArray(entry.decisionHandBefore?.ownHandPrintings));
      const firstHand = observedHands[0]?.decisionHandBefore.ownHandPrintings ?? null;
      const endingHand = end.decisionHandBefore?.ownHandPrintings ?? null;
      const firstAttack = actor.find(entry => entry.action === 'AttackAction');
      const selectionEvents = opening.filter(entry => entry.cardSelection)
        .map(entry => ({
          message: entry.cardSelection.message ?? null,
          sourceZone: entry.cardSelection.sourceZone,
          selectedCards: entry.cardSelection.selectedCards
        }));
      return {
        ...base, auditStatus: firstHand ? 'partial-opening-observed' :
          'hand-context-not-observed',
        firstObservedTurn: end.turnBefore,
        firstTurnEndAction: end.action,
        firstTurnActionCount: opening.length,
        firstObservedHandPrintings: firstHand,
        handBeforeTurnEndPrintings: endingHand,
        playedCards: opening.filter(entry => entry.card).map(entry => entry.card),
        selectedCards: selectionEvents,
        publicBoardBeforePass: end.publicBoardBeforePass ?? null,
        firstRecordedAttackTurn: firstAttack?.turnBefore ?? null,
        note: 'Hands are read-only post-policy-choice, pre-dispatch observations. The ' +
          'chronological trace omits some actions and is not a deterministic replay.'
      };
    })
  };
}

function main() {
  const filename = process.argv[2];
  if (!filename) throw new Error('Expected diagnostic JSON file path.');
  const result = auditRank6Openings(JSON.parse(fs.readFileSync(filename, 'utf8')));
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = {auditRank6Openings, main};
