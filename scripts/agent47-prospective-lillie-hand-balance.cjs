'use strict';

/**
 * Read-only audit of the archived prospective rank6 Lillie experiment.
 * Uses actual physical native Store before/after counts, never upgrades a
 * native terminal into a paper-qualified or competitively qualified game.
 * @param {object} report Original Agent7 prospective paired native JSON.
 * @returns {object}
 */
function auditNativeLillieHandExchange(report) {
  if (report.schema !== 'agent7-candidate-only-owner-visible-lillie-pass-rescue-v1' ||
      !Array.isArray(report.pairs)) {
    throw new Error('Expected original Agent7 prospective native paired archive');
  }
  const events = [];
  for (const pair of report.pairs) {
    const intervention = pair.nativePolicyIntervention;
    const rootEvents = intervention.events;
    const settles = intervention.candidateLillieNativeDraws.events;
    if (rootEvents.length !== settles.length ||
        intervention.accepted !== rootEvents.length ||
        pair.exactFullInitialPhysicalDealMatched !== true) {
      throw new Error('Native accepted roots, settled effects, or physical pairing differ');
    }
    for (let i = 0; i < rootEvents.length; i += 1) {
      const root = rootEvents[i];
      const settled = settles[i];
      const before = settled.before;
      const after = settled.lastObserved;
      const printedDraw = before.prizes === 6 ? 8 : 6;
      if (root.nativeRootAccepted !== true ||
          settled.printedDrawPostcondition !== true ||
          root.turn !== before.turn ||
          root.turn !== after.turn ||
          before.supporterQuota !== 0 ||
          after.supporterQuota !== 1 ||
          before.cardInHand !== true ||
          after.cardInHand !== false ||
          after.hand !== printedDraw ||
          after.deck !== before.deck + before.hand - 1 - printedDraw) {
        throw new Error('Native Lillie ownership, printed draw, or card conservation mismatch for ' +
          pair.trialId + ' turn ' + root.turn);
      }
      events.push({
        trialId: pair.trialId,
        candidateId: pair.candidateId,
        candidateSeat: pair.candidateSlot,
        turn: root.turn,
        handBefore: before.hand,
        handAfter: after.hand,
        deckBefore: before.deck,
        deckAfter: after.deck,
        prizesBefore: before.prizes,
        printedDrawCount: printedDraw,
        handDelta: after.hand - before.hand,
        selectedPolicyAction: root.sourceChosenAction,
        nativeSettled: true,
        competitiveGameQualified: false
      });
    }
  }
  if (events.length !== report.totalNativeAcceptedLillieRoots ||
      report.totalNativeRejectedLillieRoots !== 0) {
    throw new Error('Native prospective Lillie exposure denominator changed');
  }
  return {
    schema: 'agent47-prospective-lillie-owner-hand-balance-v1',
    pairedNativeGames: report.pairs.length * 2,
    nativeInterventions: events.length,
    expandingHand: events.filter(e => e.handDelta > 0).length,
    contractingHand: events.filter(e => e.handDelta < 0).length,
    unchangedHand: events.filter(e => e.handDelta === 0).length,
    totalSignedHandDeltaAcrossEvents: events.reduce((s, e) => s + e.handDelta, 0),
    events,
    paperQualifiedGames: 0,
    competitiveQualifiedGames: 0,
    caveat: 'Native immediate hand counts are observed mechanical receipts, not marginal win strength; events in the same physical game are dependent and reshuffled cards may be redrawn.'
  };
}

/**
 * Read the actual candidate Supporter, Pass and attack roots of each treatment.
 * @param {object} report
 */
function auditSameTurnLillieFollowThrough(report){
  const roots=[];
  for(const pair of report.pairs){
    for(const lillie of pair.treatment.candidateLillieRoots){
      const pass=pair.treatment.candidateTurnPasses.find(r=>
        r.turn===lillie.turn && r.ordinal>lillie.ordinal);
      const attacks=pair.treatment.candidateAttacks.filter(r=>
        r.turn===lillie.turn && r.ordinal>lillie.ordinal);
      roots.push({trialId:pair.trialId,turn:lillie.turn,
        lillieOrdinal:lillie.ordinal,passOrdinal:pass?.ordinal??null,
        sameTurnAttackCount:attacks.length});
    }
  }
  return {totalRoots:roots.length,
    sameTurnPasses:roots.filter(r=>r.passOrdinal!==null).length,
    sameTurnAttacks:roots.reduce((n,r)=>n+r.sameTurnAttackCount,0),
    roots,competitiveQualifiedGames:0};
}

module.exports = {auditNativeLillieHandExchange,auditSameTurnLillieFollowThrough};
