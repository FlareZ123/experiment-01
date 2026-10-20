'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * The owner-visible t18 attachment-to-retreat preparation in the original
 * published rank15 source. Only reads actor-owned hand and public board,
 * never their unrevealed Prize/deck contents or opponent private zones.
 * @param {object} state Native Game State.
 * @param {object} actor Original source actor.
 * @param {0|1} seat Physical source seat.
 * @param {number} playerTurn Native GamePhase.PLAYER_TURN enum.
 * @returns {{handIndex:number,busBenchIndex:number}|null}
 */
function paidBusOwnerAttachment(state,actor,seat,playerTurn){
  if(state.turn!==18||state.activePlayer!==seat||
    state.phase!==playerTurn||
    state.prompts.some(p=>p.result===undefined)||
    actor.energyPlayedTurn===state.turn||
    actor.retreatedTurn===state.turn||
    actor.active.getPokemonCard()?.fullName!=='Bunnelby PRC')return null;
  const names=actor.bench.map(b=>b.getPokemonCard()?.fullName??null);
  const busBenchIndex=names.indexOf('Vileplume BUS');
  if(busBenchIndex<0||!names.includes('Vileplume AOR'))return null;
  if(actor.active.energies.cards.length!==1||
      actor.active.energies.cards[0]?.fullName!=='Grass Energy MEE')return null;
  const handIndex=actor.hand.cards.findIndex(c=>c.fullName==='Grass Energy MEE');
  return handIndex<0?null:{handIndex,busBenchIndex};
}

/**
 * Actual source-owned two-action sequence after native double Omega Barrage:
 * manually attach the held Grass to Active Bunnelby, then pay its printed
 * two-Colorless retreat cost to make BUS Vileplume Active. All proposals
 * are first accepted by the pinned Simulator and independently checked for
 * genuine dispatch, including effects and prompt outcomes in the root replay.
 *
 * @template T
 * @param {()=>T} execute One synchronous match.
 * @param {0|1} sourceSeat Physical source player.
 * @returns {{result:T,audit:object}}
 */
function withRank15NativePaidBusRetreat(execute,sourceSeat){
  assert.equal(typeof execute,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {SimpleTacticsAi}=require(path.join(OUT,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(OUT,'game/store/state/state'));
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUT,
    'game/store/actions/play-card-action'));
  const {RetreatAction}=require(path.join(OUT,
    'game/store/actions/game-actions'));
  const desc=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  assert.equal(typeof desc?.value,'function');
  const clientId=sourceSeat===0?101:202;
  let step='ready';
  let busIndex=-1;
  const attempts=[];
  function decide(state){
    if(this.client?.id!==clientId||state.activePlayer!==sourceSeat||
        state.turn!==18||state.phase!==GamePhase.PLAYER_TURN||
        state.prompts.some(p=>p.result===undefined))
      return desc.value.call(this,state);
    const owner=state.players[sourceSeat];
    if(step==='ready'){
      const target=paidBusOwnerAttachment(state,owner,sourceSeat,
        GamePhase.PLAYER_TURN);
      if(!target)return desc.value.call(this,state);
      const action=new PlayCardAction(owner.id,target.handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
      const valid=this.isValidAction(state,action);
      step=valid?'retreat':'attachment-rejected';
      busIndex=target.busBenchIndex;
      attempts.push({
        turn:state.turn,kind:'owner-hand-Grass-to-Active-Bunnelby',
        printedCard:owner.hand.cards[target.handIndex].fullName,
        initialEnergy:owner.active.energies.cards.map(c=>c.fullName),
        ownerEnergyPlayedTurn:owner.energyPlayedTurn,
        ownerHand:owner.hand.cards.map(c=>c.fullName),
        proposedTarget:{slot:'ACTIVE',index:0},
        simulatorAccepts:valid
      });
      return valid?action:desc.value.call(this,state);
    }
    if(step==='retreat'){
      const active=owner.active.getPokemonCard()?.fullName;
      const energy=owner.active.energies.cards.map(c=>c.fullName);
      const actualBench=owner.bench[busIndex]?.getPokemonCard()?.fullName;
      if(active!=='Bunnelby PRC'||energy.length<2||
          actualBench!=='Vileplume BUS'){
        attempts.push({turn:state.turn,kind:'post-attachment-sequence-broken',
          active,energy,actualBench});
        step='broken';
        return desc.value.call(this,state);
      }
      const action=new RetreatAction(owner.id,busIndex);
      const valid=this.isValidAction(state,action);
      attempts.push({
        turn:state.turn,kind:'paid-native-retreat-to-Vileplume-BUS',
        energy,actualBench,simulatorAccepts:valid,
        ownerRetreatedTurn:owner.retreatedTurn
      });
      step='done';
      return valid?action:desc.value.call(this,state);
    }
    return desc.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...desc,value:decide});
  try{return {result:execute(),audit:{
    schema:'rank15-owner-only-grass-attachment-paid-bus-retreat-v1',
    sourceSeat,attempts,finalStep:step,competitivePolicyQualified:false
  }};}
  finally{Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',desc);}
}

module.exports={paidBusOwnerAttachment,withRank15NativePaidBusRetreat};
