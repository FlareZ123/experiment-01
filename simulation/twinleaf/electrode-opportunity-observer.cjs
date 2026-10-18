'use strict';

// Both published Aichi Raichu/Electrode 60s use these three Special Energy prints.
// Counting cards is a necessary-resource signal, not the Lightning-unit total.
const SOURCE_SPECIAL_ENERGY = new Set([
  'Reversal Energy PAL', 'Counter Energy CIN', 'Unit Energy LPM UPR'
]);

/**
 * Observe public board/discard and Prize facts at actual non-prompt bot decisions.
 * These conditions are necessary but NOT sufficient for legal Extra Energy Bomb:
 * effects/locks, attack feasibility, Ability-use history and KO resolution are
 * deliberately not decided here.
 *
 * The returned object never changes the Store, invokes a bot, or draws randomness.
 * @returns {{observe:(state:object)=>void,snapshot:()=>object}}
 */
function createElectrodeOpportunityObserver() {
  const bySeat = Array.from({length: 2}, () => ({
    decisions: 0, activeRaichu: 0, benchedElectrode: 0,
    both: 0, bothWithDiscardSpecial: 0, withSafePrizeWindow: 0,
    withPostBombReversalWindow: 0
  }));
  const samples = [];
  const seen = new Set();

  return {
    /** @param {object} state Live Store state, used read-only. */
    observe(state) {
      const seat = state.activePlayer;
      if (seat !== 0 && seat !== 1) return;
      const player = state.players[seat];
      const opponent = state.players[1 - seat];
      if (!player || !opponent) return;

      const activeRaichu =
        player.active.getPokemonCard()?.fullName === 'Alolan Raichu UNM';
      const benchedElectrode = player.bench.some(bench =>
        bench.getPokemonCard()?.fullName === 'Electrode-GX CES');
      const discardSpecialCount = player.discard.cards.filter(card =>
        SOURCE_SPECIAL_ENERGY.has(card.fullName)).length;
      const ownPrizes = player.getPrizeLeft();
      const opponentPrizes = opponent.getPrizeLeft();
      const both = activeRaichu && benchedElectrode;
      const withDiscard = both && discardSpecialCount > 0;
      const prizeWindow = withDiscard && opponentPrizes > 2;
      const reversalWindow = prizeWindow && ownPrizes > opponentPrizes - 2;
      const bucket = bySeat[seat];
      bucket.decisions += 1;
      bucket.activeRaichu += Number(activeRaichu);
      bucket.benchedElectrode += Number(benchedElectrode);
      bucket.both += Number(both);
      bucket.bothWithDiscardSpecial += Number(withDiscard);
      bucket.withSafePrizeWindow += Number(prizeWindow);
      bucket.withPostBombReversalWindow += Number(reversalWindow);

      if (!activeRaichu && !benchedElectrode) return;
      const signature = JSON.stringify([seat, state.turn, activeRaichu,
        benchedElectrode, discardSpecialCount, ownPrizes, opponentPrizes]);
      if (seen.has(signature)) return;
      seen.add(signature);
      samples.push({
        seat, turn: state.turn, activeRaichu, benchedElectrode,
        discardSpecialCount, ownPrizes, opponentPrizes,
        both, withDiscard, prizeWindow, reversalWindow
      });
    },
    snapshot() {
      return {
        evidenceType: 'live-aichi-electrode-public-necessary-conditions-v1',
        sourceEnergyPrints: [...SOURCE_SPECIAL_ENERGY],
        countsBySeat: bySeat.map(bucket => ({...bucket})),
        distinctInterestingStates: samples,
        caveat: 'Only public necessary conditions at live non-prompt decision points; not a proof of legal/optimal Ability activation.'
      };
    }
  };
}

module.exports = { createElectrodeOpportunityObserver };
