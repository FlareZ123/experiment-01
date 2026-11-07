'use strict';

const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {initializeCards, runMatch} = require('./headless.cjs');
const {copycatApexResponseKind} = require('./mimikyu-counter-policy.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Trace only the actual decision player's visible Mimikyu response state.
 * The trace observes the action selected before dispatch; it neither directs
 * the decision policy nor reveals an unrevealed Prize or deck card.
 *
 * @param {object} request
 * @param {number} candidateSeat
 * @returns {{game:object,eligibleChoices:Array<object>,observedChoices:number,payloadChoiceObservations:Array<object>}}
 */
function runSourcePolicyTrace(request, candidateSeat) {
  initializeCards();
  const {SimpleTacticsAi} =
    require(path.join(output, 'simple-bot/simple-tactics-ai'));
  const {GamePhase} =
    require(path.join(output, 'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const eligibleChoices = [];
  const payloadChoiceObservations = [];
  let observedChoices = 0;
  SimpleTacticsAi.prototype.decodeNextAction = function trace(state) {
    const seat = state.players.findIndex(p => p.id === this.client.id);
    const player = state.players[seat];
    const responseKind = seat === candidateSeat && player &&
      state.phase === GamePhase.PLAYER_TURN &&
      state.activePlayer === candidateSeat ?
        copycatApexResponseKind(state, player) : null;
    const prompt = state.prompts?.find(p => p.result === undefined &&
      p.playerId === player?.id && p.constructor.name === 'ChooseAttackPrompt');
    const payloadResponseKind = seat === candidateSeat && player &&
      state.phase === GamePhase.ATTACK && prompt ?
        copycatApexResponseKind(state, player) : null;
    const action = original.call(this, state);
    if (payloadResponseKind &&
        action?.constructor?.name === 'ResolvePromptAction') {
      const chosen = action.result;
      const source = prompt.cards.find(card =>
        card.attacks.includes(chosen));
      if (payloadChoiceObservations.length < 40) payloadChoiceObservations.push({
        turn: state.turn,
        responseKind: payloadResponseKind,
        sourceCard: source?.fullName ?? null,
        chosenAttack: chosen?.name ?? null,
        promptValid: prompt.validate(chosen)
      });
    }
    if (responseKind) {
      observedChoices += 1;
      if (eligibleChoices.length < 40) {
        eligibleChoices.push({
          turn: state.turn,
          responseKind,
          active: player.active.getPokemonCard()?.fullName,
          lastOpponentAttack: 'Apex Dragon',
          ownDiscardHasDialgaGX: player.discard.cards.some(card =>
            card.fullName === 'Dialga-GX UPR'),
          ownDiscardHasRadiantEternatus: player.discard.cards.some(card =>
            card.fullName === 'Radiant Eternatus CRZ'),
          gxUsed: player.usedGX === true,
          chosenAction: action?.constructor?.name || null,
          chosenAttack: action?.constructor?.name === 'AttackAction' ?
            action.name : null
        });
      }
    }
    return action;
  };
  try {
    return {game: runMatch(request), eligibleChoices, observedChoices, payloadChoiceObservations};
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

  const exposureSeed = 20261016;
  const rows = [];
  for (const championSeat of [0, 1]) {
    for (const experimental of [false, true]) {
      const rankOrder = championSeat === 0 ? [1, 10] : [10, 1];
      const request = {
        deckA: deckByRank.get(rankOrder[0]).cardIds,
        deckB: deckByRank.get(rankOrder[1]).cardIds,
        seed: exposureSeed,
        maxActions: 1200,
        label: 'Mimikyu public Copycat source pilot ' +
          rankOrder.join('-') + ' ' + (experimental ? 'counter-v2' : 'baseline'),
        isolatePolicyRandomness: true,
        captureInitialSourceDealFingerprintSeat: championSeat,
        supporterDecisionCorrection: true,
        doubleDragonRecovery: true,
        mimikyuApexCopycatCompatibility: true,
        mimikyuDeclaredHistoryCorrection: true,
        regidragoDeclaredHistoryCorrection: true,
        passClearsLastAttackCorrection: true,
        mimikyuApexTimelessPolicy: experimental,
        ...(experimental ? {mimikyuApexTimelessPolicySeat: championSeat} : {})
      };
      const base = {ranks: rankOrder, candidateSeat: championSeat,
        opponentSeat: 1 - championSeat,
        policy: experimental ? 'public-copycat-response-v2' : 'base-with-semantic-corrections',
        seed: request.seed, sourceRankCandidate: 1, sourceRankOpponent: 10};
      try {
        const {game, eligibleChoices, observedChoices, payloadChoiceObservations} =
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
          opponentApexAttackTrace: game.attackTrace.filter(a =>
            a.seat === 1 - championSeat && a.attack === 'Apex Dragon'),
          candidateCopycatAttackTrace: game.attackTrace.filter(a =>
            a.seat === championSeat && a.attack === 'Copycat'),
          candidateAttackCount: game.attackTrace.filter(a =>
            a.seat === championSeat).length,
          eligiblePublicChoiceObservations: observedChoices,
          eligibleChoiceSamples: eligibleChoices,
          payloadChoiceObservations,
          payloadChoiceCount: payloadChoiceObservations.length,
          initialSourceDealFingerprint: game.initialSourceDealFingerprint,
          policyFingerprint: game.policy
        });
      } catch (error) {
        rows.push({...base, status: 'aborted',
          error: String(error?.message || error)});
      }
    }
  }
  const openingMatchAudit = [0, 1].map(candidateSeat => {
    const pair = rows.filter(row => row.status === 'engine-completed-or-bounded' &&
      row.candidateSeat === candidateSeat);
    const baseline = pair.find(row => row.policy === 'base-with-semantic-corrections');
    const treatment = pair.find(row => row.policy === 'public-copycat-response-v2');
    return {
      candidateSeat,
      baselineFingerprint: baseline?.initialSourceDealFingerprint ?? null,
      treatmentFingerprint: treatment?.initialSourceDealFingerprint ?? null,
      sameInitialSourceDeal: !!baseline?.initialSourceDealFingerprint &&
        !!treatment?.initialSourceDealFingerprint &&
        JSON.stringify(baseline.initialSourceDealFingerprint) ===
        JSON.stringify(treatment.initialSourceDealFingerprint)
    };
  });
  return {
    study: 'Fixed published rank 1 vs rank 10 public Copycat decision experiment',
    publishedDeckRanks: [1, 10],
    candidateListUnchanged: true,
    seedProtocol: 'fixed-seed-20261016-prior-apex-exposure-both-seat-orientations-v1',
    opponentPolicyProfile: 'DoubleDragonRecovery-v1 + SupporterDecisionCorrection-v1',
    priorExposureReference: 'results/twinleaf/regidrago-policy-factorial.json; seed 20261016, both Regidrago physical seats, 3 and 4 Apex declarations under the same two opponent-policy corrections',
    sourceResolver: 'simulation/twinleaf/resolve-field.cjs',
    evidenceClass: 'bounded engine execution and selected-action diagnostic',
    qualifiedWinRateEvidence: false,
    candidateRankingPermitted: false,
    openingMatchAudit,
    rows
  };
}

if (require.main === module) {
  const report = runMimikyuCounterSourcePilot();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  if (report.rows.every(row => row.status === 'aborted')) process.exitCode = 1;
}

module.exports = {runSourcePolicyTrace, runMimikyuCounterSourcePilot};
