'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {object} player @param {object} target @param {object} slots @returns {string|null} */
function targetPokemonName(player,target,slots){
  if(target?.slot===slots.ACTIVE)return player.active.getPokemonCard()?.name??null;
  if(target?.slot===slots.BENCH)
    return player.bench[target.index]?.getPokemonCard()?.name??null;
  return null;
}

/**
 * Classify a source player's proposed first-turn Tool attachment using only
 * their hand and in-play targets. Never inspect hidden deck/Prize positions.
 * @param {object} state Actual source Store state.
 * @param {object} player Source player object from that state.
 * @param {0|1} seat Physical source seat.
 * @param {object|undefined} action Selected engine action.
 * @param {{ACTIVE:any,BENCH:any}} slots Actual pinned engine SlotType.
 * @param {number} phase Pinned GamePhase.PLAYER_TURN.
 * @returns {{card:string,recipient:string|null,reason:string}|null}
 */
function blockedRank26Tool(state,player,seat,action,slots,phase){
  if(state.turn!==1||state.activePlayer!==seat||state.phase!==phase||
    state.players[seat]!==player||
    state.prompts.some(prompt=>prompt.result===undefined)||
    action?.type!=='PLAY_CARD_ACTION')return null;
  const card=player.hand.cards[action.handIndex];
  if(!card)return null;
  const recipient=targetPokemonName(player,action.target,slots);
  if(card.name==='Technical Machine: Crisis Punch'&&recipient!=='Meloetta ex'){
    return {card:card.fullName??card.name,recipient,
      reason:'Crisis Punch Tool should be saved for Meloetta ex'};
  }
  if(card.name==='Float Stone'&&recipient==='Meloetta ex'){
    return {card:card.fullName??card.name,recipient,
      reason:'Float Stone occupies Meloetta ex Crisis Punch Tool slot'};
  }
  return null;
}

/**
 * Versioned rank26 source-only opt-in Tool proposal veto.
 * The underlying AttachToolTactic still evaluates legal options. The veto
 * lets other tactics decide when it selects a strategically conflicting Tool.
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26CrisisToolGuard(seat,execute){
  if(![0,1].includes(seat)||typeof execute!=='function')
    throw new TypeError('Physical rank26 source seat and synchronous runner required.');
  const load=rel=>require(path.join(OUTPUT,rel));
  const definitions=load('simple-bot/simple-bot-definitions');
  const tactics=definitions.allSimpleTactics;
  const index=tactics.findIndex(Tactic=>Tactic.name==='AttachToolTactic');
  if(index<0)throw new Error('Pinned AttachToolTactic extension missing');
  const Original=tactics[index];
  const {SlotType}=load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const playerId=seat===0?101:202;
  const blocked=[];
  class Rank26CrisisToolGuard extends Original {
    /** @param {object} state @param {object} player */
    useTactic(state,player){
      const proposed=super.useTactic(state,player);
      if(player.id!==playerId)return proposed;
      const unsafe=blockedRank26Tool(state,player,seat,proposed,
        SlotType,GamePhase.PLAYER_TURN);
      if(!unsafe)return proposed;
      blocked.push({turn:state.turn,sourceSeat:seat,
        action:'suppressed-Tool-proposal',...unsafe});
      return;
    }
  }
  tactics.splice(index,1,Rank26CrisisToolGuard);
  try {
    return {result:execute(),policyAudit:{
      version:'rank26-firstturn-crisis-tool-preservation-v1',
      sourceSeat:seat,blocked,
      competitiveGameQualified:false
    }};
  } finally {
    const now=tactics.indexOf(Rank26CrisisToolGuard);
    if(now<0)throw new Error('Rank26 Tool guard disappeared during source test');
    tactics.splice(now,1,Original);
  }
}
module.exports={targetPokemonName,blockedRank26Tool,withRank26CrisisToolGuard};
