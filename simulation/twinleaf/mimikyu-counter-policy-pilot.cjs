'use strict';

const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {initializeCards, runMatch} = require('./headless.cjs');
const {isCopycatApexTimelessSituation} = require('./mimikyu-counter-policy.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Trace only the actual decision player's visible Mimikyu response state.
 * The trace observes the action selected before dispatch; it neither directs
 * the decision policy nor reveals an unrevealed Prize or deck card.
 *
 * @param {object} request
 * @param {number} candidateSeat
 * @returns {{game:object,eligibleChoices:Array<object>,observedChoices:number}}
 */
function runSourcePolicyTrace(request, candidateSeat) {
  initializeCards();
  const {SimpleTacticsAi} =
    require(path.join(output, 'simple-bot/simple-tactics-ai'));
  const {GamePhase} =
    require(path.join(output, 'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const eligibleChoices = [];
  let observedChoices = 0;
  SimpleTacticsAi.prototype.decodeNextAction = function trace(state) {
    const seat = state.players.findIndex(p => p.id === this.client.id);
    const player = state.players[seat];
    const eligible = seat === candidateSeat && player &&
      state.phase === GamePhase.PLAYER_TURN &&
      state.activePlayer === candidateSeat &&
      isCopycatApexTimelessSituation(state, player);
    const action = original.call(this, state);
    if (eligible) {
      observedChoices += 1;
      if (eligibleChoices.length < 40) {
        eligibleChoices.push({
          turn: state.turn,
          active: player.active.getPokemonCard()?.fullName,
          lastOpponentAttack: 'Apex Dragon',
          ownDiscardHasDialgaGX: true,
          gxUnspent: true,
          chosenAction: action?.constructor?.name || null,
          chosenAttack: action?.constructor?.name === 'AttackAction' ?
            action.name : null
        });
      }
    }
    return action;
  };
  try {
    return {game: runMatch(request), eligibleChoices, observedChoices};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

/**
 * Four source 60-card diagnostic runs. Compare the unchanged upstream
 * decision policy to a single-seat response override under shared v3 seeds.
 * These are behavioral explorations, never competitive matchup estimates.
 */
function runMimikyuCounterSourcePilot() {
  const manifest = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const resolved = resolveManifestFile(manifest, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const deckByRank = new Map(resolved.decks.map(deck => [deck.rank, deck]));
  const champion = deckByRank.get(1);
  const regidrago = deckByRank.get(10);
  if (!champion?.playableUnderEngine || !regidrago?.playableUnderEngine ||
      champion.cardIds.length !== 60 || regidrago.cardIds.length !== 60) {
    throw new Error('Source rank 1 or 10 lacks a complete 60-card engine mapping');
  }

  const seeds = deriveSlotSeeds(20261016, 'pilot', 10, 0);
  const rows = [];
  for (const championSeat of [0, 1]) {
    for (const experimental of [false, true]) {
      const rankOrder = championSeat === 0 ? [1, 10] : [10, 1];
      const request = {
        deckA: deckByRank.get(rankOrder[0]).cardIds,
        deckB: deckByRank.get(rankOrder[1]).cardIds,
        seed: championSeat === 0 ? seeds.A : seeds.B,
        maxActions: 1200,
        label: 'Mimikyu public Copycat source pilot ' +
          rankOrder.join('-') + ' ' + (experimental ? 'counter-v1' : 'baseline'),
        isolatePolicyRandomness: true,
        mimikyuApexCopycatCompatibility: true,
        mimikyuDeclaredHistoryCorrection: true,
        regidragoDeclaredHistoryCorrection: true,
        passClearsLastAttackCorrection: true,
        mimikyuApexTimelessPolicy: experimental,
        ...(experimental ? {mimikyuApexTimelessPolicySeat: championSeat} : {})
      };
      const base = {ranks: rankOrder, candidateSeat: championSeat,
        policy: experimental ? 'public-copycat-response-v1' : 'base-with-semantic-corrections',
        seed: request.seed, sourceRankCandidate: 1, sourceRankOpponent: 10};
      try {
        const {game, eligibleChoices, observedChoices} =
          runSourcePolicyTrace(request, championSeat);
        rows.push({...base, status: 'engine-completed-or-bounded',
          finished: game.finished, endReason: game.endReason,
          actionCount: game.actions, turns: game.turns,
          verifiedFirstTurn: game.verifiedByDrawLog,
          engine: game.engine, deckHashes: game.deckHashes,
          randomnessProtocol: game.randomnessProtocol,
          actualCopycatAttacks: game.attackTrace.filter(a =>
            a.seat === championSeat && a.attack === 'Copycat').length,
          actualApexDragonAttacks: game.attackTrace.filter(a =>
            a.seat === 1 - championSeat && a.attack === 'Apex Dragon').length,
          candidateAttackCount: game.attackTrace.filter(a =>
            a.seat === championSeat).length,
          eligiblePublicChoiceObservations: observedChoices,
          eligibleChoiceSamples: eligibleChoices,
          policyFingerprint: game.policy
        });
      } catch (error) {
        rows.push({...base, status: 'aborted',
          error: String(error?.message || error)});
      }
    }
  }
  return {
    study: 'Fixed published rank 1 vs rank 10 public Copycat decision experiment',
    publishedDeckRanks: [1, 10],
    candidateListUnchanged: true,
    seedProtocol: 'decorrelated-slots-v3',
    sourceResolver: 'simulation/twinleaf/resolve-field.cjs',
    evidenceClass: 'bounded engine execution and selected-action diagnostic',
    qualifiedWinRateEvidence: false,
    candidateRankingPermitted: false,
    rows
  };
}

if (require.main === module) {
  const report = runMimikyuCounterSourcePilot();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  if (report.rows.every(row => row.status === 'aborted')) process.exitCode = 1;
}

module.exports = {runSourcePolicyTrace, runMimikyuCounterSourcePilot};
