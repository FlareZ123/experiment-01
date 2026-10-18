'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Choose the next physically visible Exeggcute recovery action for a
 * first-turn Risky Ruins Damage Pump line. The caller still tests the action
 * against the live Store; this policy is an experimental tactical proposal.
 *
 * @param {object} player Acting player, with only own-hand/discard and board read.
 * @param {number} opposingPrizes Count of still occupied opposing Prize slots.
 * @returns {{kind:'bench',handIndex:number,benchIndex:number}|
 *   {kind:'propagate',discardIndex:number}|null}
 */
function rank26RecoveryChoice(player,opposingPrizes) {
  if(opposingPrizes<=1 ||
      !player.stadium.cards.some(card=>card.name==='Risky Ruins') ||
      !player.hand.cards.some(card=>card.name==='Damage Pump'))return null;
  const eggs=player.bench.filter(slot=>
    slot.getPokemonCard()?.name==='Exeggcute' &&
    slot.damage>=20 && slot.damage<30).length;
  const donors=player.bench.filter(slot=>
    slot.getPokemonCard() && slot.getPokemonCard().name!=='Exeggcute');
  const maximum=Math.max(0,...donors.map(slot=>Math.floor(slot.damage/10)));
  if(maximum<1)return null;
  const hand=player.hand.cards.findIndex(card=>card.name==='Exeggcute');
  const discard=player.discard.cards.findIndex(card=>card.name==='Exeggcute');
  const total=eggs+(hand>=0?1:0)+(discard>=0?1:0);
  const empty=player.bench.findIndex(slot=>!slot.getPokemonCard());
  if(total<=eggs || empty<0)return null;
  const goal=Math.min(2,opposingPrizes-1,maximum,total);
  if(eggs>=goal)return null;
  if(hand>=0)return {kind:'bench',handIndex:hand,benchIndex:empty};
  if(discard>=0)return {kind:'propagate',discardIndex:discard};
  return null;
}

/**
 * Temporarily prioritize the printed Propagation and hand-Bench actions
 * needed to re-use Exeggcute between actual Damage Pump decisions. Fail
 * closed outside the first source-player turn and restore the bot prototype.
 *
 * @template T
 * @param {0|1} sourceSeat Rank26 physical seat.
 * @param {()=>T} execute Synchronous compiled match or Store fixture.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26PropagationLoop(sourceSeat,execute) {
  if(![0,1].includes(sourceSeat)||typeof execute!=='function')
    throw new TypeError('Require rank26 source seat and synchronous execution.');
  const engine=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const {PlayerType,SlotType,PlayCardAction}=
    engine('game/store/actions/play-card-action');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const id=sourceSeat===0?101:202;
  const actions=[];
  SimpleTacticsAi.prototype.decodeNextAction=function rank26Recovery(state) {
    const own=state.players[sourceSeat];
    if(this.client?.id!==id || !own || state.turn!==1 ||
      state.activePlayer!==sourceSeat ||
      state.phase!==GamePhase.PLAYER_TURN ||
      state.prompts.some(prompt=>prompt.result===undefined)) {
      return original.call(this,state);
    }
    const {cologneOpeningOpportunity} = require('./rank26-cologne-opener.cjs');
    if(cologneOpeningOpportunity(state,own,sourceSeat,GamePhase.PLAYER_TURN))
      return original.call(this,state);
    const remaining=state.players[1-sourceSeat].prizes
      .filter(slot=>slot.cards.length>0).length;
    const decision=rank26RecoveryChoice(own,remaining);
    if(!decision)return original.call(this,state);
    const location=decision.kind==='bench'
      ?{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:decision.benchIndex}
      :{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
        index:decision.discardIndex};
    const action=decision.kind==='bench'
      ?new PlayCardAction(id,decision.handIndex,location)
      :new UseAbilityAction(id,'Propagation',location);
    actions.push({turn:state.turn,sourceSeat,kind:decision.kind,
      remainingOpponentPrizes:remaining,
      action:action.constructor.name,
      source:'own hand or discard and public Bench/Stadium/Prize count'});
    return action;
  };
  try{
    return {result:execute(),policyAudit:{
      version:'rank26-propagation-loop-v1',
      sourceSeat,actions,
      qualifiedForCompetitiveInference:false
    }};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={rank26RecoveryChoice,withRank26PropagationLoop};
