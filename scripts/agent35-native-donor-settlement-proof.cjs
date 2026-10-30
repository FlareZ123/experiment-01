'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const VERSION = 'agent35-native-donor-settlement-proof-v1';
const TARGET = '11:2:B:new-moon-lockbreaker-v1';

/**
 * Audit a physical post-decision Perfection pivot using original Store roots.
 * An accepted intent without a settled native attack and a subsequent real
 * source action is insufficient. Historical selected-deal evidence only.
 * @param {object} before Full frozen control cohort.
 * @param {object} after Full frozen treatment cohort.
 * @returns {object} Fail-closed factual receipt.
 */
function proveNativePivot(before, after) {
  assert.equal(before.attempted, 4);
  assert.equal(after.attempted, 4);
  assert.equal(before.competitiveQualifiedGames, 0);
  assert.equal(after.competitiveQualifiedGames, 0);
  assert.equal(before.ownerCompressorBenchedOptIn, true);
  assert.equal(after.ownerCompressorBenchedOptIn, true);
  assert.deepEqual(before.rows.map(r => r.trial.id),
    after.rows.map(r => r.trial.id));

  const rows = before.rows.map((b, i) => {
    const a = after.rows[i];
    assert.equal(b.trial.seed, a.trial.seed);
    assert.equal(b.sourceDealFingerprint, a.sourceDealFingerprint);
    assert.equal(b.actualStarterSeat, a.actualStarterSeat);
    assert.equal(b.candidateSeat, a.candidateSeat);
    assert.equal(b.qualifiesForCompetitiveInference, false);
    assert.equal(a.qualifiesForCompetitiveInference, false);
    const identical = b.rootActionLedgerSha256 === a.rootActionLedgerSha256;
    if (a.trial.id !== TARGET) {
      assert.equal(identical, true,
        'Unexpected treatment effect in non-target arm');
      return {trial: a.trial.id, actionLedgerIdentical: true,
        finished: a.finished, actions: a.actionCount};
    }
    assert.equal(identical, false, 'Treatment never changed target game');
    assert.equal(a.finished, false);
    assert.equal(b.finished, false);
    assert.equal(a.actionCount, 260);
    assert.equal(b.actionCount, 260);

    const seat = a.candidateSeat;
    const ledger = a.rootActionLedger;
    const audit = a.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    assert.ok(Array.isArray(ledger) && audit);
    const acceptances = audit.nativeRootAcceptances;
    assert.ok(Array.isArray(acceptances));
    const accepted = kind => acceptances.filter(e =>
      e.seat === seat && e.kind === kind && e.accepted === true);
    const retreats = accepted('paid-retreat');
    const perfections = accepted('perfection');
    assert.equal(retreats.length, 1);
    assert.equal(perfections.length, 1);
    assert.equal(retreats[0].nativePhysicalEffect, 'confirmed-public-effect');
    assert.equal(retreats[0].before.activePrintings[seat], 'Duskull VIV');
    assert.equal(retreats[0].after.activePrintings[seat], 'Mewtwo & Mew-GX UNM');
    assert.equal(perfections[0].nativePhysicalEffect, 'attack-needs-declaration');
    assert.equal(perfections[0].intent.donorPrinting, 'Gengar & Mimikyu-GX TEU');
    assert.equal(perfections[0].intent.attackName, 'Horror House-GX');

    const candidateRoots = (kind, attack) => ledger.filter(e =>
      e.playerSlot === seat && e.action === kind &&
      (attack === undefined || e.ability === attack));
    const actualRetreats = candidateRoots('RetreatAction');
    const actualPerfections = candidateRoots('UseAbilityAction', 'Perfection');
    assert.equal(actualRetreats.length, 1);
    assert.equal(actualPerfections.length, 1);
    const retreat = actualRetreats[0];
    const perfection = actualPerfections[0];
    assert.ok(retreat.actionOrdinal < perfection.actionOrdinal);
    assert.equal(retreat.turnBefore, perfection.turnBefore);
    assert.equal(retreat.turnAfter, perfection.turnAfter);

    const choices = ledger.filter(e => e.playerSlot === seat &&
      e.action === 'ResolvePromptAction' &&
      e.pendingPrompt === 'ChooseAttackPrompt' &&
      e.initiatingRootActionOrdinal === perfection.actionOrdinal &&
      e.attackChoice?.printing === 'Gengar & Mimikyu-GX TEU' &&
      e.attackChoice?.attackName === 'Horror House-GX');
    assert.equal(choices.length, 1);
    const choice = choices[0];
    assert.ok(perfection.actionOrdinal < choice.actionOrdinal);
    assert.equal(choice.turnBefore, retreat.turnBefore);

    const settlement = a.candidateAttackSettlement;
    assert.equal(settlement.settled, 1);
    const attacks = settlement.attacks.filter(e =>
      e.actionOrdinal === choice.actionOrdinal &&
      e.attackName === 'Horror House-GX');
    assert.equal(attacks.length, 1);
    const attack = attacks[0];
    assert.equal(attack.delegatedCopy, true);
    assert.equal(attack.settledPromptChain, true);
    assert.equal(attack.settlementCrossesClockReset, false);
    assert.equal(attack.nextSourceSameEpochProven, true);
    assert.ok(choice.actionOrdinal < attack.completionRootOrdinal);
    assert.equal(attack.nextSourceRoot.action, 'AttackAction');
    assert.equal(attack.nextSourceRoot.attack, 'Terminal Period');
    assert.ok(attack.completionRootOrdinal < attack.nextSourceRoot.ordinal);
    assert.ok(ledger.some(e => e.actionOrdinal === attack.nextSourceRoot.ordinal &&
      e.playerSlot !== seat && e.action === 'AttackAction' &&
      e.attack === attack.nextSourceRoot.attack));
    assert.deepEqual(attack.prizesBefore, [6, 6]);
    assert.deepEqual(attack.prizesAfter, [6, 6]);
    // Source selected only Terminal Period at same T52 in OFF and ON.
    // No marginal denial benefit follows from identical source decisions.
    const sourceActions = row => row.rootActionLedger
      .filter(e => e.playerSlot !== seat &&
        e.turnBefore === attack.nextSourceRoot.turn &&
        e.action !== 'ResolvePromptAction')
      .map(e => e.action + ':' + (e.attack ?? e.card ?? ''));
    const sourceTreatment = sourceActions(a);
    const sourceControl = sourceActions(b);
    assert.deepEqual(sourceTreatment, ['AttackAction:Terminal Period']);
    assert.deepEqual(sourceControl, sourceTreatment);

    const offCopies = b.rootActionLedger.filter(e =>
      e.playerSlot === seat && e.action === 'UseAbilityAction' &&
      e.ability === 'Perfection');
    assert.equal(offCopies.length, 0,
      'Positive copied ability should be new relative to this control');
    return {
      trial: a.trial.id,
      actionLedgerIdentical: false,
      sourceDealFingerprint: a.sourceDealFingerprint,
      candidateFirst: a.sourceActuallyFirst === false,
      selectedRetreatOrdinal: retreat.actionOrdinal,
      acceptedRetreat: true,
      visiblePivot: [retreats[0].before.activePrintings[seat],
        retreats[0].after.activePrintings[seat]],
      selectedPerfectionOrdinal: perfection.actionOrdinal,
      donor: perfections[0].intent.donorPrinting,
      copiedAttack: attack.attackName,
      attackPromptOrdinal: choice.actionOrdinal,
      settledAtOrdinal: attack.completionRootOrdinal,
      sourceReplyRootOrdinal: attack.nextSourceRoot.ordinal,
      sourceReplyAttack: attack.nextSourceRoot.attack,
      sourceTurnNonpromptActionsSameAsControl: true,
      prizesBefore: attack.prizesBefore,
      prizesAfter: attack.prizesAfter,
      finished: a.finished,
      actions: a.actionCount
    };
  });
  assert.equal(rows.filter(x => x.actionLedgerIdentical).length, 3);
  return {schema: VERSION, historicalSelectedDeal: true,
    qualifiedCompetitiveGames: 0, rows};
}

if (require.main === module) {
  const [offPath, onPath] = process.argv.slice(2);
  assert.ok(offPath && onPath, 'Supply control then treatment JSON paths');
  const off = JSON.parse(fs.readFileSync(offPath, 'utf8'));
  const on = JSON.parse(fs.readFileSync(onPath, 'utf8'));
  process.stdout.write(JSON.stringify(proveNativePivot(off, on), null, 2) + '\n');
}
module.exports = {VERSION, TARGET, proveNativePivot};
