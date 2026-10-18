'use strict';
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {object} state @param {object} own @param {0|1} sourceSeat @param {number} phase @returns {boolean} */
function mailOpportunity(state, own, sourceSeat, phase) {
  if (state.turn !== 1 || state.activePlayer !== sourceSeat || state.phase !== phase ||
      state.players[sourceSeat] !== own ||
      state.prompts.some(p => p.result === undefined)) return false;
  const hand = own.hand.cards;
  return own.active.getPokemonCard()?.name === 'Meloetta ex' &&
    state.players[1-sourceSeat].active.getPokemonCard()?.name === 'Iron Thorns ex' &&
    !own.stadium.cards.some(c => c.name === 'Risky Ruins') &&
    !hand.some(c => ['Risky Ruins','Canceling Cologne'].includes(c.name)) &&
    hand.some(c => c.name === "Trainers' Mail");
}

/** @template T @param {0|1} sourceSeat @param {()=>T} execute @returns {{result:T,policyAudit:object}} */
function withMailScout(sourceSeat,execute) {
  if (![0,1].includes(sourceSeat) || typeof execute !== 'function')
    throw new TypeError('Require rank26 source seat and synchronous experiment.');
  const engine = rel => require(path.join(OUTPUT,rel));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} = engine('game/store/actions/play-card-action');
  const {GamePhase} = engine('game/store/state/state');
  const before = SimpleTacticsAi.prototype.decodeNextAction;
  const playerId = sourceSeat===0?101:202;
  const selections=[];
  SimpleTacticsAi.prototype.decodeNextAction=function sourceMail(state) {
    const own=state.players[sourceSeat];
    if (this.client?.id !== playerId || !own ||
        !mailOpportunity(state,own,sourceSeat,GamePhase.PLAYER_TURN))
      return before.call(this,state);
    const index=own.hand.cards.findIndex(c=>c.name==="Trainers' Mail");
    selections.push({turn:state.turn,sourceSeat,card:own.hand.cards[index].fullName,
      action:'PlayCardAction',evidence:'own hand and public board'});
    return new PlayCardAction(playerId,index,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  };
  try {
    return {result:execute(),policyAudit:{version:'rank26-mail-scout-v1',sourceSeat,
      selections,competitiveGameQualified:false}};
  } finally { SimpleTacticsAi.prototype.decodeNextAction=before; }
}
module.exports={mailOpportunity,withMailScout};
