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
  // Independent owner-information frontier. Preserve the existing public-only
  // v1 counters so frozen observer/noninterference results remain comparable.
  const positionBySeat = Array.from({length:2},()=>({
    decisions:0,benchedRaichu:0,benchedElectrode:0,
    bothBenched:0,bothBenchedWithThreeDiscardSpecial:0,
    bothBenchedWithHeldEscapeRope:0,
    heldEscapeRopePrizeWindow:0,
    bothBasicPredecessorsVisible:0,
    heldRaichuEvolution:0,heldElectrodeEvolution:0
  }));
  const positionSamples=[];
  const positionSeen=new Set();

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

      const benchNames=player.bench.map(slot=>
        slot.getPokemonCard()?.fullName??null);
      const activeName=player.active.getPokemonCard()?.fullName??null;
      const handNames=(player.hand?.cards??[]).map(card=>card.fullName);
      const benchedRaichu=benchNames.includes('Alolan Raichu UNM');
      const benchStageOnePair=benchedRaichu&&benchedElectrode;
      const heldEscapeRope=handNames.includes('Escape Rope BST');
      const readyDiscard=discardSpecialCount>=3;
      const prizeTradeWindow=opponentPrizes>2&&ownPrizes>opponentPrizes-2;
      const pivotResourceWindow=benchStageOnePair&&readyDiscard&&
        heldEscapeRope&&prizeTradeWindow;
      const basicRaichu=benchNames.some(name=>
        name==='Pikachu LOR'||name==='Ditto ♢ LOT')||
        activeName==='Pikachu LOR'||activeName==='Ditto ♢ LOT';
      const basicElectrode=benchNames.includes('Voltorb ROS')||
        activeName==='Voltorb ROS';
      const position=positionBySeat[seat];
      position.decisions++;
      position.benchedRaichu+=Number(benchedRaichu);
      position.benchedElectrode+=Number(benchedElectrode);
      position.bothBenched+=Number(benchStageOnePair);
      position.bothBenchedWithThreeDiscardSpecial+=
        Number(benchStageOnePair&&readyDiscard);
      position.bothBenchedWithHeldEscapeRope+=
        Number(benchStageOnePair&&heldEscapeRope);
      position.heldEscapeRopePrizeWindow+=Number(pivotResourceWindow);
      position.bothBasicPredecessorsVisible+=Number(basicRaichu&&basicElectrode);
      position.heldRaichuEvolution+=Number(handNames.includes('Alolan Raichu UNM'));
      position.heldElectrodeEvolution+=Number(handNames.includes('Electrode-GX CES'));
      if (benchedRaichu||benchedElectrode||basicRaichu||basicElectrode) {
        const signature=JSON.stringify([seat,state.turn,activeName,
          benchedRaichu,benchedElectrode,basicRaichu,basicElectrode,
          readyDiscard,heldEscapeRope,prizeTradeWindow]);
        if (!positionSeen.has(signature)) {
          positionSeen.add(signature);
          positionSamples.push({
            seat,turn:state.turn,activePrinting:activeName,
            benchedRaichu,benchedElectrode,
            bothBenched:benchStageOnePair,
            bothBasicPredecessorsVisible:basicRaichu&&basicElectrode,
            discardSpecialCount,heldEscapeRope,
            prizeTradeWindow,pivotResourceWindow,
            ownPrizes,opponentPrizes
          });
        }
      }

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
        positionFrontier:{
          schema:'aichi-raichu-electrode-owner-position-frontier-v1',
          countsBySeat:positionBySeat.map(row=>({...row})),
          distinctOwnedPositionStates:positionSamples.map(row=>({...row})),
          ownerHandPrintingsInspectedOnlyForActingPlayer:true,
          opponentPrivateZonesInspected:false,
          nativeRetreatOrEscapeRopeLegalityVerified:false,
          selfKnockoutOrAttackConversionVerified:false,
          note:'Bench coexistence, owned Escape Rope and discard/Prize windows are resource signals. They do not establish Item legality, a chosen pivot, an available Ability, or a subsequent attack.'
        },
        caveat: 'Only public necessary conditions at live non-prompt decision points; not a proof of legal/optimal Ability activation.'
      };
    }
  };
}

module.exports = { createElectrodeOpportunityObserver };
