'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Detect exactly one first-turn, source-player, genuinely benched, unattached
 * Unown AOR whose printed Farewell Letter can replace the current root action.
 * The return value is a Bench index; it neither guesses a draw nor looks at
 * hidden Prize/deck contents.
 *
 * @param {object} state
 * @param {object} own
 * @param {0|1} seat
 * @param {number} playerTurnPhase
 * @param {number} alreadyUsed
 * @returns {number}
 */
function rank26FarewellBenchIndex(state,own,seat,playerTurnPhase,alreadyUsed) {
  if (!own || alreadyUsed>=1 || state.turn!==1 ||
      state.activePlayer!==seat || state.phase!==playerTurnPhase ||
      state.players[seat]!==own ||
      own.active.getPokemonCard()?.name!=='Meloetta ex' ||
      own.deck.cards.length<1 ||
      state.prompts.some(prompt=>prompt.result===undefined)) return -1;
  // First resolve the known ability lock if held Cologne is present.
  const opponent=state.players[1-seat];
  if (opponent.active.getPokemonCard()?.name==='Iron Thorns ex' &&
      own.hand.cards.some(card=>card.name==='Canceling Cologne')) return -1;
  return own.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName==='Unown AOR' &&
    slot.tools.length===0 && slot.energies.cards.length===0);
}

/** @param {object} own @param {object} other @returns {object} */
function publicAndOwnSnapshot(own,other) {
  return {
    ownHand:own.hand.cards.map(card=>card.fullName),
    ownDeckCount:own.deck.cards.length,
    ownBenchedUnown:own.bench.filter(slot=>
      slot.getPokemonCard()?.fullName==='Unown AOR').length,
    ownDiscardUnown:own.discard.cards.filter(card=>
      card.fullName==='Unown AOR').length,
    ownPrizes:own.getPrizeLeft(),
    opponentPrizes:other.getPrizeLeft()
  };
}

/**
 * Opt-in one selected first-turn Farewell Letter to draw a physical card from
 * the real Store. The same source bot handles all subsequent search and draw.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26FarewellDraw(seat,execute) {
  if (![0,1].includes(seat)||typeof execute!=='function')
    throw new TypeError('Require physical rank26 seat and synchronous execution.');
  const engine=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const botId=seat===0?101:202;
  const selections=[];
  let after=null;
  SimpleTacticsAi.prototype.decodeNextAction=function rank26Farewell(state) {
    const own=state.players[seat],other=state.players[1-seat];
    if (this.client?.id!==botId || !own ||
        state.phase!==GamePhase.PLAYER_TURN ||
        state.activePlayer!==seat ||
        state.prompts.some(prompt=>prompt.result===undefined))
      return previous.call(this,state);
    if (selections.length===1 && after===null) {
      after=publicAndOwnSnapshot(own,other);
    }
    const index=rank26FarewellBenchIndex(state,own,seat,
      GamePhase.PLAYER_TURN,selections.length);
    if (index>=0) {
      const action=new UseAbilityAction(botId,'Farewell Letter',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
      });
      if (this.isValidAction(state,action)) {
        selections.push({
          turn:state.turn,seat,ability:'Farewell Letter',printing:'Unown AOR',
          action:'UseAbilityAction',benchIndex:index,
          before:publicAndOwnSnapshot(own,other),
          source:'owner-visible hand/Bench and public opponent active'
        });
        return action;
      }
    }
    return previous.call(this,state);
  };
  try {
    return {result:execute(),policyAudit:{
      version:'rank26-one-farewell-firstturn-v1',
      seat,selections,after,
      competitiveGameQualified:false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={rank26FarewellBenchIndex,publicAndOwnSnapshot,withRank26FarewellDraw};
