'use strict';

const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { initializeCards } = require('./headless.cjs');
const {runWithResearchProfile, DEFAULT_PROFILE, REGIDRAGO_PROFILE} =
  require('./policy-profiles.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Observe only the action actually selected for dispatch. A callback on
 * SimpleTacticsAi.decodeNextAction does not inspect speculative engine moves.
 *
 * @param {object} request
 * @param {string} profile
 * @returns {{game:object,resettingHoleActions:object[]}}
 */
function runTracedMatch(request, profile) {
  initializeCards();
  const {SimpleTacticsAi} = require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {SlotType} = require(path.join(output,
    'game/store/actions/play-card-action'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const resettingHoleActions = [];
  const doubleDragonTargets = [];
  const regidragoAttackDecisions = [];
  SimpleTacticsAi.prototype.decodeNextAction = function tracedDecode(state) {
    const action = original.call(this, state);
    const seat = state.players.findIndex(p => p.id === this.client.id);
    const player = state.players[seat];
    if (action?.constructor.name === 'PlayCardAction' && player &&
        player.hand.cards[action.handIndex]?.name === 'Double Dragon Energy') {
      const slot = action.target?.slot;
      const location = slot === SlotType.ACTIVE ? player.active : player.bench[action.target.index];
      doubleDragonTargets.push({turn:state.turn, seat,
        active:player.active.getPokemonCard()?.fullName,
        target:location?.getPokemonCard()?.fullName,
        targetSlot:slot,
        targetIndex:action.target?.index,
        activeEnergies:player.active.energies.cards.map(c => c.fullName)});
    }
    if (action?.constructor.name === 'AttackAction' && player &&
        ['Regidrago V', 'Regidrago VSTAR'].includes(player.active.getPokemonCard()?.name)) {
      regidragoAttackDecisions.push({turn:state.turn,seat,attack:action.name,
        active:player.active.getPokemonCard()?.fullName,
        energies:player.active.energies.cards.map(c => c.fullName)});
    }
    if (action?.constructor.name === 'UseAbilityAction' &&
        action.name === 'Resetting Hole') {
      resettingHoleActions.push({
        turn: state.turn,
        actorId: this.client.id,
        seat: state.players.findIndex(p => p.id === this.client.id)
      });
    }
    return action;
  };
  try {
    return {game:runWithResearchProfile(request, profile), resettingHoleActions,
      doubleDragonTargets, regidragoAttackDecisions};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

/**
 * One field-sourced Regidrago/Shadow Rider paired-seat pilot under identical
 * seed and ordinary bot policy, with one opt-in tactical-policy variation.
 * This is a feasibility characterization, never a matchup win-rate sample.
 */
function compareRegidragoPilot() {
  const file = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const field = resolveManifestFile(file, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  const sourceRegidrago = decks.get(10);
  const sourceShadow = decks.get(1);
  if (!sourceRegidrago?.playableUnderEngine || !sourceShadow?.playableUnderEngine) {
    throw new Error('Source rank 10 or 1 is not concretely instantiated by the pinned engine.');
  }
  const rows = [];
  for (const profile of [DEFAULT_PROFILE, REGIDRAGO_PROFILE]) {
    for (const [a, b] of [[10, 1], [1, 10]]) {
      const regidragoSeat = a === 10 ? 0 : 1;
      const request = {
        deckA: decks.get(a).cardIds,
        deckB: decks.get(b).cardIds,
        seed: 20261016,
        maxActions: 1200,
        label: 'source Aichi pilot ' + profile + ' ' + a + '-' + b
      };
      try {
        const {game, resettingHoleActions, doubleDragonTargets, regidragoAttackDecisions} =
          runTracedMatch(request, profile);
        rows.push({profile, pair:[a,b],regidragoSeat,seed:request.seed,
          finished:game.finished,endReason:game.endReason,
          actions:game.actions,turns:game.turns,firstTurnSlot:game.firstTurnSlot,
          verifiedByDrawLog:game.verifiedByDrawLog,
          winner:game.winner,
          doubleDragonPlays:game.cardsPlayedBySeat[regidragoSeat]['Double Dragon Energy'] || 0,
          apexDragonAttacks:game.attackTrace.filter(row =>
            row.seat === regidragoSeat && row.attack === 'Apex Dragon').length,
          totalRegidragoAttacks:game.attackTrace.filter(row => row.seat === regidragoSeat).length,
          resettingHoleActions: resettingHoleActions.filter(row => row.seat === regidragoSeat),
          doubleDragonTargets:doubleDragonTargets.filter(row => row.seat === regidragoSeat),
          regidragoAttackDecisions:regidragoAttackDecisions.filter(row => row.seat === regidragoSeat),
          promptValidationMode:game.promptValidationMode,
          randomnessProtocol:game.randomnessProtocol,
          experimentalTactics:game.experimentalTactics,
          deckHashes:game.deckHashes,engine:game.engine});
      } catch (e) {
        rows.push({profile,pair:[a,b],regidragoSeat,seed:request.seed,
          aborted:true,error:String(e.message)});
      }
    }
  }
  return {study:'Policy feasibility paired-seat source-deck diagnostic',
    caution:'Unvalidated generic tactics and noncompetitive opponent. No win-rate inference.',
    researchPolicyProfiles:[DEFAULT_PROFILE,REGIDRAGO_PROFILE],
    matches:rows};
}

if (require.main === module) {
  const result = compareRegidragoPilot();
  console.log(JSON.stringify(result,null,2));
  if (result.matches.every(row => row.aborted)) process.exitCode = 1;
}
module.exports = {runTracedMatch,compareRegidragoPilot};
