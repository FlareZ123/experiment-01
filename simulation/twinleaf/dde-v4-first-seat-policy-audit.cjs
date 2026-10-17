'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');

/**
 * Summarize the player's public board and perspective hand at a chosen pass.
 * This evidence is collected after the bot chose the action.
 * @param {object} row A headless decision trace row.
 * @param {number} seat Physical candidate slot.
 * @returns {object}
 */
function describePass(row, seat) {
  const board = row.publicBoardBeforePass?.[seat] ?? {};
  return {
    step: row.actionOrdinal,
    turn: row.turnBefore,
    hand: row.decisionHandBefore?.ownHandPrintings ?? [],
    active: board.active ?? null,
    bench: board.bench ?? [],
    stadium: board.stadium ?? [],
    probedPrintedAttacks: row.attackPassProbe?.tested ?? [],
    probeError: row.attackPassProbe?.auditError ?? null
  };
}

/**
 * Run the exact v4 rank-10-first deal twice. The second execution adds only
 * post-choice cloned-attack probes, then checks that the actual source-game
 * observable trajectory is preserved.
 *
 * @returns {object} Source-identified negative attack-exposure audit.
 */
function auditDdeFirstSeat() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true}
  );
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const champion = byRank.get(1), regidrago = byRank.get(10);
  assert.ok(champion?.playableUnderEngine && regidrago?.playableUnderEngine);
  const request = {
    deckA: champion.cardIds,
    deckB: regidrago.cardIds,
    seed: 4246551499,
    label: 'rank10-DDE-v4-first-source-action-capability',
    maxActions: 350,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  const control = runMatch(request);
  const probed = runMatch({...request, captureAttackPassProbes: true});
  const candidateSlot = 1;
  const all = probed.decisionTrace ?? [];
  const dda = all.filter(row => row.playerSlot === candidateSlot &&
    row.action === 'PlayCardAction' && row.card === 'Double Dragon Energy');
  const evolves = all.filter(row => row.playerSlot === candidateSlot &&
    row.action === 'PlayCardAction' && /Regidrago VSTAR/.test(row.card ?? ''));
  const passes = all.filter(row => row.playerSlot === candidateSlot &&
    row.action === 'PassTurnAction');
  const firstDdeTurn = dda[0]?.turnBefore ?? Number.POSITIVE_INFINITY;
  const afterDde = passes.filter(row => row.turnBefore >= firstDdeTurn);
  const relevant = all.filter(row => {
    if (row.playerSlot !== candidateSlot && row.action !== 'AttackAction') return false;
    return dda.some(x => row.turnBefore >= x.turnBefore &&
      row.turnBefore <= x.turnBefore + 3);
  }).slice(0, 32).map(row => ({
    step: row.actionOrdinal, turn: row.turnBefore,
    seat: row.playerSlot, action: row.action,
    card: row.card ?? null, attack: row.attack ?? null,
    attacker: row.attacker ?? null
  }));
  const probeRows = passes.filter(row => row.attackPassProbe);
  const controlDigest = observableDigest(control);
  const probedDigest = observableDigest(probed);
  return {
    kind: 'source-rank10-first-v4-dde-versus-apex-policy-capability',
    provenance: {
      sourceRanksBySlot: [1, 10],
      frozenSeed: request.seed,
      maxActions: request.maxActions,
      policy: 'DoubleDragonAttachTactic-v4',
      pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
    },
    control: {
      verifiedByDrawLog: control.verifiedByDrawLog,
      firstTurnSlot: control.firstTurnSlot,
      finished: control.finished,
      actions: control.actions,
      winner: control.winner,
      prizesRemaining: control.prizesRemaining,
      doubleDragonPlayed: control.cardsPlayedBySeat[candidateSlot]['Double Dragon Energy'] || 0,
      apexAttacks: control.attackTrace.filter(row =>
        row.seat === candidateSlot && row.attack === 'Apex Dragon').length,
      candidateAttacks: control.attackTrace.filter(row =>
        row.seat === candidateSlot).map(row => ({
          turn: row.turn, active: row.activePokemon, attack: row.attack,
          prizesAfter: row.prizeCountAfter
        }))
    },
    observationalProbe: {
      sameObservableTrajectory: controlDigest === probedDigest,
      controlDigest,
      probedDigest,
      totalCandidatePasses: passes.length,
      candidatePassesAfterFirstDde: afterDde.length,
      probedPassCount: probeRows.length,
      probedPasses: probeRows.map(row => describePass(row, candidateSlot)),
      firstSixPassBoards: passes.slice(0, 6).map(row => describePass(row, candidateSlot)),
      firstEightAfterDdePassBoards: afterDde.slice(0, 8).map(row => describePass(row, candidateSlot)),
      doubleDragonActions: dda.map(row => ({
        step: row.actionOrdinal, turn: row.turnBefore,
        handBefore: row.decisionHandBefore?.ownHandPrintings ?? []
      })),
      regidragoVstarPlays: evolves.map(row => ({
        step: row.actionOrdinal, turn: row.turnBefore, card: row.card
      })),
      nearAttachmentActionTimeline: relevant
    },
    limits: 'Post-choice, bounded pinned-Store clone announcements only; accepted announcement is not a guaranteed resolved legal attack or optimal play. No source-mechanics, hidden-information, paper rules or competitor-policy qualification.'
  };
}

if (require.main === module) {
  const report = auditDdeFirstSeat();
  process.stdout.write('SOURCE_DDE_V4_FIRST_SEAT_AUDIT ' + JSON.stringify(report) + '\n');
}
module.exports = {describePass, auditDdeFirstSeat};
