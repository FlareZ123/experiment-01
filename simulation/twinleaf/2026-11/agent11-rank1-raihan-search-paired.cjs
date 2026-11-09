'use strict';

const path = require('node:path');
const { deepStrictEqual } = require('node:assert/strict');
const { continueOriginalRank1RaihanPaleMoon } =
  require('./agent34-rank1-original-raihan-palemoon-continuation.cjs');
const { executeReturnedNightWatch } =
  require('./agent11-rank1-returned-night-watch.cjs');
const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(OUTPUT,modulePath));

/**
 * Pair two genuinely sourced Raihan choices against the same historical
 * state and same opponent conditional Retreat+Pass line. Every store is a
 * separate clone, preserving the original accepted root and equal physical
 * source hands and prizes. Opponent concealed cards are not used to choose.
 *
 * @param {{store:object,ownerId:number,opponentId:number,actorObservation:object}} context
 * @returns {object}
 */
function comparePhysicalRaihanSearchChoices(context){
  const { Store }=load('game/store/store');
  const { deepClone }=load('utils/utils');
  const state=deepClone(context.store.state);
  const copies=['original-first-card','reserve-third-psychic'].map(()=> {
    const game=new Store({onStateChange(){}});
    game.state=deepClone(state);
    return game;
  });
  const before=copies.map(game=>({
    owner:game.state.players.find(x=>x.id===context.ownerId)
      .hand.cards.map(c=>c.fullName),
    active:game.state.players.find(x=>x.id===context.ownerId)
      .active.getPokemonCard()?.fullName,
    prizes:game.state.players.find(x=>x.id===context.ownerId)
      .prizes.reduce((n,slot)=>n+slot.cards.length,0)
  }));
  deepStrictEqual(before[0],before[1],
    'both Raihan arms require identical actual source physical openings');
  const [control,treatment]=copies.map((game,index)=>
    continueOriginalRank1RaihanPaleMoon({
      ...context,
      store:game,
      ...(context.raihanShuffleSeed===undefined?{}:
        {raihanShuffleSeed:context.raihanShuffleSeed}),
      ...(index===1?{raihanPickPrinting:'Psychic Energy MEE'}:{}),
      afterOpponentPass:executeReturnedNightWatch
    }));
  return {
    version:'agent11-physical-raihan-search-paired-v1',
    sameInitialPhysicalSource:true,
    publicOwnerDecisionOnly:true,
    sourceStateTurn:context.store.state.turn,
    raihanShuffleSeed:context.raihanShuffleSeed??null,
    originalFirstCard:control.raihanOwnDeckSelected??null,
    reservePsychicChoice:treatment.raihanOwnDeckSelected??null,
    control,treatment,qualifiedPaperGames:0
  };
}
/**
 * Predeclared, fixed set of independent legal deck-shuffle permutations on the
 * exact same original rank1 physical deal. No match random stream or opponent
 * information enters either Raihan search decision.
 */
const SHUFFLE_SEEDS=Object.freeze(Array.from({length:16},(_,i)=>
  'agent11-raihan-t18-registered-shuffle-v1-'+String(i).padStart(2,'0')));

/** @param {Parameters<typeof comparePhysicalRaihanSearchChoices>[0]} context */
function compareRaihanRegisteredShufflePanel(context){
  const rows=SHUFFLE_SEEDS.map(seed=>{
    const pair=comparePhysicalRaihanSearchChoices({
      ...context,raihanShuffleSeed:seed
    });
    const control=pair.control.results.find(x=>x.corrected);
    const treatment=pair.treatment.results.find(x=>x.corrected);
    const a=control?.opponentRetreat?.sourceNextTurn;
    const b=treatment?.opponentRetreat?.sourceNextTurn;
    return {
      seed, sameInitialPhysicalSource:pair.sameInitialPhysicalSource,
      sourceInitialDeckSize:pair.control.raihanDeckPhysicalSize,
      sourceInitialDeckPsychicCount:pair.control.raihanDeckPsychicCount,
      controlRaihan:pair.originalFirstCard,
      treatmentRaihan:pair.reservePsychicChoice,
      controlHeldPsychicAfterRaihanFunding:
        pair.control.sourceHeldPsychicAfterFunding,
      treatmentHeldPsychicAfterRaihanFunding:
        pair.treatment.sourceHeldPsychicAfterFunding,
      correctedOpposingEnergyDiscarded:control?.discardedPhysicalOpposingEnergy,
      treatmentCorrectedOpposingEnergyDiscarded:
        treatment?.discardedPhysicalOpposingEnergy,
      controlRetreat:control?.opponentRetreat?.status,
      treatmentRetreat:treatment?.opponentRetreat?.status,
      controlHeldPsyAtSourceTurn20:a?.hasHeldThirdPsychic??null,
      treatmentHeldPsyAtSourceTurn20:b?.hasHeldThirdPsychic??null,
      controlNightWatch:a?.status??null,
      treatmentNightWatch:b?.status??null,
      controlSourcePrizes:a?.sourceRemainingPrizesAfter??null,
      treatmentSourcePrizes:b?.sourceRemainingPrizesAfter??null,
      controlErrors:a?.errors?.length??null,
      treatmentErrors:b?.errors?.length??null
    };
  });
  return {
    version:'agent11-registered-physical-raihan-shuffle-16pair-v1',
    sameOriginalSourceState:true,registeredSeeds:SHUFFLE_SEEDS,
    inspectedOpponentConcealedForDecision:false,competitiveGames:0,
    rows,summary:{
      paired:rows.length,
      validSourcePhysical:rows.filter(x=>x.sameInitialPhysicalSource).length,
      controlNightWatchPrize:rows.filter(x=>x.controlSourcePrizes===5).length,
      treatmentNightWatchPrize:rows.filter(x=>x.treatmentSourcePrizes===5).length,
      controlWithoutPsy:rows.filter(x=>
        x.controlHeldPsyAtSourceTurn20===false).length,
      treatmentWithoutPsy:rows.filter(x=>
        x.treatmentHeldPsyAtSourceTurn20===false).length,
      treatmentOnlyKOs:rows.filter(x=>
        x.treatmentSourcePrizes===5 && x.controlSourcePrizes!==5).length
    }
  };
}

module.exports={
  comparePhysicalRaihanSearchChoices,
  compareRaihanRegisteredShufflePanel,
  SHUFFLE_SEEDS
};
