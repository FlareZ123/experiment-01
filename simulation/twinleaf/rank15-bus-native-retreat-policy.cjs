'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {ownerTurnResourceUsage}=require('./owner-turn-resource-semantics.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Find a genuine source BUS Vileplume Bench target using the actor's public
 * board and own turn markers. No deck, Prize or opposing hidden information.
 * @param {object} state Native game State.
 * @param {object} actor Actual source player.
 * @param {0|1} seat Physical source seat.
 * @param {number} playerTurn Native GamePhase.PLAYER_TURN.
 * @returns {number} Bench index, or -1 when the gate does not hold.
 */
function busRetreatBenchIndex(state,actor,seat,playerTurn){
  if(state.phase!==playerTurn||state.activePlayer!==seat||
      state.turn<18||state.turn>26||
      state.prompts.some(p=>p.result===undefined)||
      actor.retreatedTurn===state.turn)return -1;
  if(actor.active.getPokemonCard()?.fullName!=='Bunnelby PRC')return -1;
  const names=actor.bench.map(b=>b.getPokemonCard()?.fullName||null);
  if(!names.includes('Vileplume AOR'))return -1;
  return names.indexOf('Vileplume BUS');
}

/**
 * Propose exactly one real owner-visible native RetreatAction following the
 * two actual Evolution attacks. Never treat a speculative validation as a
 * successful native Store action or a competitive-policy result.
 * @template T
 * @param {()=>T} execute Synchronous complete source-dealt game.
 * @param {0|1} seat Actual source seat.
 * @returns {{result:T,audit:object}}
 */
function withRank15NativeBusRetreat(execute,seat){
  assert.equal(typeof execute,'function');
  assert.ok(seat===0||seat===1);
  const {SimpleTacticsAi}=require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
  const {RetreatAction}=require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  const clientId=seat===0?101:202;
  const attempts=[];
  let offered=false;
  function chooseRetreat(state){
    if(offered||this.client?.id!==clientId)
      return original.value.call(this,state);
    const actor=state.players[seat];
    const index=busRetreatBenchIndex(state,actor,seat,GamePhase.PLAYER_TURN);
    if(index<0)return original.value.call(this,state);
    const before={turn:state.turn,retreatedTurn:actor.retreatedTurn,
      active:actor.active.getPokemonCard()?.fullName,
      activeEnergy:actor.active.energies.cards.map(c=>c.fullName),
      activeSpecialConditions:actor.active.specialConditions.slice(),
      sourceOwnerHand:actor.hand.cards.map(c=>c.fullName),
      ...ownerTurnResourceUsage(state,actor),
      stadium:actor.stadium.cards.map(c=>c.fullName),
      bench:actor.bench.map(b=>b.getPokemonCard()?.fullName||null)};
    const action=new RetreatAction(actor.id,index);
    const valid=this.isValidAction(state,action);
    const after={turn:state.turn,retreatedTurn:actor.retreatedTurn,
      active:actor.active.getPokemonCard()?.fullName,
      activeEnergy:actor.active.energies.cards.map(c=>c.fullName),
      activeSpecialConditions:actor.active.specialConditions.slice(),
      sourceOwnerHand:actor.hand.cards.map(c=>c.fullName),
      ...ownerTurnResourceUsage(state,actor),
      stadium:actor.stadium.cards.map(c=>c.fullName),
      bench:actor.bench.map(b=>b.getPokemonCard()?.fullName||null)};
    assert.deepEqual(after,before,'Native validation changed public/owned live state');
    offered=true;
    attempts.push({turn:state.turn,ownerSeat:seat,
      chosenBenchIndex:index,nativeValidationAccepted:valid,
      before,proposal:'RetreatAction to Vileplume BUS',
      evidence:'Only real postdispatch board establishes promotion'});
    return valid?action:original.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...original,value:chooseRetreat});
  try{return {result:execute(),audit:{
    schema:'rank15-owner-visible-native-bus-retreat-proposal-v1',
    attempts,qualifiedCompetitivePolicy:false
  }};}
  finally{Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);}
}

module.exports={busRetreatBenchIndex,withRank15NativeBusRetreat};
