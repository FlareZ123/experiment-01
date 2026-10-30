'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent25-native-plumeria-hand-cost-v1';
const PROMPT = 'ChooseCardsPrompt';

/**
 * Join independently recorded original-Store Plumeria roots, exact physical
 * two-card hand selections, chosen opposing Energy, and native final Energy
 * settlement. This is a read-only artifact audit, not a gameplay policy.
 * Native prompt sidecar describes Plumeria selection zone as 'unclassified';
 * confirmation of two owner hand discards is separately recorded in the
 * Plumeria chain audit, not a per-physical-card discard-zone object witness.
 *
 * @param {object} archive Agent38 prior32 treatment archive, unmodified.
 * @returns {object} Traceable root-prompt-effect rows and frequencies.
 */
function auditPlumeriaHandCosts(archive) {
  const rows = archive?.result?.rows;
  assert.ok(Array.isArray(rows) && rows.length === 32);
  const events = [];
  const physicalCounts = new Map();
  let sourceRank6Games = 0;
  let settledRank6Games = 0;
  for (const row of rows) {
    if (row.trial?.rank !== 6) continue;
    sourceRank6Games++;
    const audit = row.actorOnlyDecisionCoverage?.ownerPlumeriaAfterPassAudit;
    assert.ok(audit && Array.isArray(audit.log));
    const roots = audit.log.filter(e => e.kind === 'plumeria-native-root');
    const settled = audit.log.filter(e => e.kind === 'plumeria-energy-settlement');
    assert.equal(roots.length, audit.acceptedPlumeria);
    assert.equal(settled.length, audit.settledEnergyDiscards);
    assert.equal(roots.length, settled.length);
    if (roots.length > 0) settledRank6Games++;
    for (const root of roots) {
      assert.equal(root.accepted, true);
      assert.equal(root.seat, row.sourceSeat);
      const findNativePrompt = count => row.nativePromptChoices.events.filter(p =>
        p.turn === root.turn && p.actorSeat === root.seat &&
        p.kind === PROMPT && p.nativePromptMin === count &&
        p.nativePromptMax === count && p.nativePromptAllowCancel === false &&
        p.selectedCards?.length === count);
      const handPrompts = findNativePrompt(2);
      const energyPrompts = findNativePrompt(1);
      const nativeRoots = row.rootActionLedger.filter(action =>
        action.card === 'Plumeria' && action.turnBefore === root.turn &&
        action.playerSlot === root.seat);
      const settlements = settled.filter(e =>
        e.turn === root.turn && e.seat === root.seat && e.accepted === true);
      assert.equal(handPrompts.length, 1, 'Ambiguous physical discard selection');
      assert.equal(energyPrompts.length, 1, 'Ambiguous Energy target');
      assert.equal(nativeRoots.length, 1, 'Missing native accepted Plumeria root');
      assert.equal(settlements.length, 1, 'Missing native settled effect');
      const hand = handPrompts[0];
      const energy = energyPrompts[0];
      const effect = settlements[0];
      assert.ok(nativeRoots[0].actionOrdinal < hand.ordinal);
      assert.ok(hand.ordinal < energy.ordinal);
      assert.equal(effect.sourceHandDiscardCount, 2);
      assert.equal(energy.selectedCards[0], effect.printing);
      for (const printing of hand.selectedCards)
        physicalCounts.set(printing, (physicalCounts.get(printing) ?? 0) + 1);
      events.push({trialId:row.trial.id,rank:6,turn:root.turn,
        sourceSeat:root.seat,rootOrdinal:nativeRoots[0].actionOrdinal,
        handPromptOrdinal:hand.ordinal,energyPromptOrdinal:energy.ordinal,
        selectedOwnerCards:[...hand.selectedCards],
        selectedOpponentEnergy:energy.selectedCards[0],
        settledOpponentEnergy:effect.printing,
        handPromptSourceZone:hand.sourceZone,
        ownerDiscardCountConfirmed:effect.sourceHandDiscardCount,
        nativeStoreEffectSettled:true});
    }
  }
  const totalSelected = [...physicalCounts.values()]
    .reduce((sum,count) => sum+count,0);
  assert.equal(totalSelected,events.length*2);
  const hammerPrintings = ['Crushing Hammer POR','Enhanced Hammer TWM'];
  const selectedHammerCards = hammerPrintings.reduce((sum,p) =>
    sum+(physicalCounts.get(p)??0),0);
  const hammerChains = events.filter(e => e.selectedOwnerCards
    .some(card => hammerPrintings.includes(card))).length;
  return {version:VERSION,sourceRank6Games,settledRank6Games,
    settledPlumeriaChains:events.length,
    nativePromptCardSelections:totalSelected,
    selectedPrintings:Object.fromEntries([...physicalCounts].sort()),
    selectedHammerCards,chainsSelectingHammer:hammerChains,
    opponentEnergyPrintings:Object.fromEntries([...new Set(events.map(e =>
      e.selectedOpponentEnergy))].sort().map(p => [p,events.filter(e =>
      e.selectedOpponentEnergy === p).length])),
    records:events,
    caveat:'Native physical prompt selections and aggregate hand-discard count are attested; native prompt zone was unclassified, so no per-physical-card discard-zone link. Frozen paired roots are correlated, strategy and competitive outcome unqualified.'};
}

module.exports = {VERSION,auditPlumeriaHandCosts};
