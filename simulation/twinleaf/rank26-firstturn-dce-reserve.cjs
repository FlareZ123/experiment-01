'use strict';
const path=require('node:path');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {object} state @param {object} player @param {number} seat @param {number} phase */
function firstTurnDceChoice(state,player,seat,phase){
  if(state.turn!==1||state.activePlayer!==seat||state.phase!==phase||
    player!==state.players[seat]||player.energyPlayedTurn>=state.turn)return null;
  const active=player.active.getPokemonCard()?.name==='Meloetta ex';
  const bench=player.bench.findIndex(x=>x.getPokemonCard()?.name==='Meloetta ex');
  if(!active&&bench<0)return null;
  const hand=player.hand.cards.findIndex(x=>x.name==='Double Colorless Energy');
  return hand<0?undefined:{hand,active,bench};
}

/** @template T @param {0|1} seat @param {()=>T} fn */
function withFirstTurnDceReserve(seat,fn){
  const get=x=>require(path.join(OUT,x));
  const def=get('simple-bot/simple-bot-definitions');
  const {GamePhase}=get('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=get('game/store/actions/play-card-action');
  const i=def.allSimpleTactics.findIndex(x=>x.name==='AttachEnergyTactic');
  if(i<0)throw Error('Missing pinned AttachEnergyTactic');
  const Original=def.allSimpleTactics[i];
  const id=seat===0?101:202;
  class DceOnly extends Original {
    useTactic(state,player){
      if(player.id!==id)return super.useTactic(state,player);
      const p=firstTurnDceChoice(state,player,seat,GamePhase.PLAYER_TURN);
      if(p===null)return super.useTactic(state,player);
      if(p===undefined)return undefined;
      return new PlayCardAction(id,p.hand,{player:PlayerType.BOTTOM_PLAYER,
        slot:p.active?SlotType.ACTIVE:SlotType.BENCH,index:p.active?0:p.bench});
    }
  }
  def.allSimpleTactics.splice(i,1,DceOnly);
  try{return fn();}finally{def.allSimpleTactics.splice(i,1,Original);}
}
module.exports={firstTurnDceChoice,withFirstTurnDceReserve};
