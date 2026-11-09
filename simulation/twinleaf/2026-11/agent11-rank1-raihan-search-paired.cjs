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
      ...(index===1?{raihanPickPrinting:'Psychic Energy MEE'}:{}),
      afterOpponentPass:executeReturnedNightWatch
    }));
  return {
    version:'agent11-physical-raihan-search-paired-v1',
    sameInitialPhysicalSource:true,
    publicOwnerDecisionOnly:true,
    sourceStateTurn:context.store.state.turn,
    originalFirstCard:control.raihanOwnDeckSelected??null,
    reservePsychicChoice:treatment.raihanOwnDeckSelected??null,
    control,treatment,qualifiedPaperGames:0
  };
}
module.exports={comparePhysicalRaihanSearchChoices};
