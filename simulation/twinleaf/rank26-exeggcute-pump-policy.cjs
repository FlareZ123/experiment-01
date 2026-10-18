'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Select a legal double-Exeggcute Damage Pump using one physical damaged
 * source, as required by the printed Lost Origin Item. The observable board
 * is public, and no deck or Prize identities are consulted.
 *
 * @param {object} player
 * @param {number} bottom Bottom-player location tag in Twinleaf.
 * @param {number} bench Bench location tag.
 * @param {number} remainingOpponentPrizes Number of unclaimed opposing Prizes.
 * @returns {object[]|null} One or two moves, never a game-losing sixth self-KO.
 */
function exeggcutePumpMoves(player, bottom, bench, remainingOpponentPrizes) {
  const slots=player.bench;
  const eggs=slots.map((slot,index)=>({slot,index}))
    .filter(row=>row.slot.getPokemonCard()?.name==='Exeggcute' &&
      row.slot.damage >=20 && row.slot.damage<30);
  if(eggs.length===0 || remainingOpponentPrizes<=1)return null;
  const donors=slots.map((slot,index)=>({slot,index}))
    .filter(row=>row.slot.getPokemonCard()?.name &&
      row.slot.getPokemonCard()?.name!=='Exeggcute' &&
      row.slot.damage>=10);
  const two=eggs.length>=2 && remainingOpponentPrizes>=3
    ? donors.find(row=>row.slot.damage>=20) : null;
  const donor=two ?? donors[0];
  if(!donor)return null;
  const count=two?2:1;
  const from={player:bottom,slot:bench,index:donor.index};
  return eggs.slice(0,count).map(row=>({
    from, to:{player:bottom,slot:bench,index:row.index}
  }));
}

/** @param {object} state @param {object} player @param {number} seat @param {number} phase @returns {boolean} */
function eligiblePumpTurn(state,player,seat,phase) {
  return state.turn===1&&state.activePlayer===seat&&
    state.phase===phase&&
    state.players[seat]?.id===player.id;
}

/**
 * Autonomously handle a ready paper-legal self-KO Pump and its MoveDamage
 * prompt at the rank-26 source seat. Restore prototype after the synchronous
 * simulation. The prior research bot handles all other actions unchanged.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26ExeggcutePump(sourceSeat,execute) {
  if(![0,1].includes(sourceSeat)||typeof execute!=='function')
    throw new TypeError('Source seat and synchronous match required.');
  const engine=rel=>require(path.join(OUTPUT,rel));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const id=sourceSeat===0?101:202;
  const events=[];
  SimpleTacticsAi.prototype.decodeNextAction=function rank26Pump(state){
    const own=state.players[sourceSeat];
    if(this.client?.id!==id||!own||
       !eligiblePumpTurn(state,own,sourceSeat,GamePhase.PLAYER_TURN)){
      return original.call(this,state);
    }
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending){
      const {cologneOpeningOpportunity} = require('./rank26-cologne-opener.cjs');
      if(cologneOpeningOpportunity(state,own,sourceSeat,GamePhase.PLAYER_TURN)){
        return original.call(this,state);
      }
    }
    const remainingOpponentPrizes=state.players[1-sourceSeat].prizes
      .filter(slot=>slot.cards.length>0).length;
    const moves=exeggcutePumpMoves(
      own,PlayerType.BOTTOM_PLAYER,SlotType.BENCH,remainingOpponentPrizes);
    if(!moves)return original.call(this,state);
    if(pending){
      if(pending.constructor.name!=='MoveDamagePrompt'||
         pending.playerId!==id||!pending.validate(moves,state)){
        return original.call(this,state);
      }
      events.push({turn:state.turn,action:'ResolvePromptAction',
        kind:'single-source-exeggcute-KO',counterTransfers:moves.length});
      return new ResolvePromptAction(pending.id,moves);
    }
    const index=own.hand.cards.findIndex(card=>card.name==='Damage Pump');
    if(index===-1)return original.call(this,state);
    events.push({turn:state.turn,action:'PlayCardAction',
      card:own.hand.cards[index].fullName,
      kind:'ready-exeggcute-KO',counterTransfers:moves.length});
    return new PlayCardAction(id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
  };
  try{
    return {result:execute(),policyAudit:{
      version:'rank26-single-source-pump-v1',
      sourceSeat,actions:events,
      qualifiedForCompetitiveInference:false
    }};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={
  exeggcutePumpMoves,eligiblePumpTurn,withRank26ExeggcutePump
};
