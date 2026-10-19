'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const STAGE_LINE=new Set(['Oddish UNB','Gloom UNB','Vileplume AOR','Vileplume BUS']);

/**
 * Count the two independently evolving source-Vileplume chains that already
 * occupy positions, with no peek at the owner's deck or face-down Prizes.
 * A full Bench with one Stage-chain slot cannot presently Bench a second
 * Oddish. It may later free a slot through another legal effect.
 *
 * @param {object} owner Pinned owner Player.
 * @returns {{lineSlots:number,needed:number,free:number,hasBunnelby:boolean}}
 */
function rank15BenchNeeds(owner){
  const cards=[owner.active,...owner.bench]
    .map(slot=>slot.getPokemonCard()?.fullName).filter(Boolean);
  const lineSlots=cards.filter(fullName=>STAGE_LINE.has(fullName)).length;
  return {
    lineSlots,needed:Math.max(0,2-lineSlots),
    free:owner.bench.filter(slot=>!slot.getPokemonCard()).length,
    hasBunnelby:cards.includes('Bunnelby PRC')
  };
}

/**
 * Defer non-Oddish Basic Benching only when it would occupy a vacancy
 * intended for a second Vileplume evolutionary line. This is an intentionally
 * conservative source-policy experiment; it can fail by reserving space for
 * an Oddish that was Prized or by postponing useful support Basics.
 *
 * @param {object} action Proposed physical root PlayCardAction.
 * @param {object} owner Current owner's visible board and hand.
 * @param {number} turn Actual global turn.
 * @param {number} phase Current GamePhase.
 * @param {number} playerTurnPhase Pinned PLAYER_TURN enum.
 * @returns {null|{proposed:string,needed:number,free:number,lineSlots:number}}
 */
function rank15ReservedBasicPlay(action,owner,turn,phase,playerTurnPhase){
  if(phase!==playerTurnPhase || turn>10 ||
      action?.constructor?.name!=='PlayCardAction') return null;
  const need=rank15BenchNeeds(owner);
  if(!need.hasBunnelby || need.needed===0 || need.free>need.needed)return null;
  const card=owner.hand.cards[action.handIndex];
  // In the pinned Store, a Basic Pokémon has Stage metadata but no
  // evolvesFrom. Evolution Pokémon and unrelated Trainer plays are exempt.
  if(!card || card.stage===undefined || card.evolvesFrom ||
      card.fullName==='Oddish UNB') return null;
  return {proposed:card.fullName,needed:need.needed,
    free:need.free,lineSlots:need.lineSlots};
}

/**
 * Experimental source-60 opponent decision profile. It blocks only its own
 * standard bot's optional non-Oddish Basic action when a Vileplume Bench
 * reservation is active, then offers normal later tactics. It never edits
 * the Twinleaf vendor submodule.
 *
 * The event list includes potential speculative scoring calls and is not
 * independently proven to contain only real Store roots. Validate resulting
 * true game decisions from runMatch.rootActionLedger, not this event list.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned headless match.
 * @param {0|1} sourceSeat Actual rank-15 opponent physical seat.
 * @returns {{result:T,audit:object}}
 */
function withRank15VileplumeBenchReservation(execute,sourceSeat){
  assert.equal(typeof execute,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {SimpleTacticsAi}=require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
  const {PassTurnAction}=require(path.join(OUTPUT,'game/store/actions/game-actions'));
  const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=sourceSeat===0?101:202;
  const events=[];

  const replacement=function rank15ReserveAction(state){
    if(this.client?.id!==sourceId ||
       state.activePlayer!==sourceSeat ||
       state.phase!==GamePhase.PLAYER_TURN ||
       state.prompts.some(p=>p.result===undefined)) {
      return original.call(this,state);
    }
    const owner=state.players[sourceSeat];
    const selected=original.call(this,state);
    const deferral=rank15ReservedBasicPlay(
      selected,owner,state.turn,state.phase,GamePhase.PLAYER_TURN);
    if(!deferral)return selected;
    const tactics=this.tactics;
    assert.ok(Array.isArray(tactics),'Expected pinned simple bot tactic array');
    const index=tactics.findIndex(t=>t.constructor.name==='PlayBasicTactic');
    assert.ok(index>=0,'Pinned PlayBasicTactic missing');
    let alternative=new PassTurnAction(owner.id);
    for(let i=index+1;i<tactics.length;i++) {
      const next=tactics[i].useTactic(state,owner);
      if(next!==undefined && this.isValidAction(state,next)) {
        alternative=next;
        break;
      }
    }
    if(events.length<128)events.push({
      turn:state.turn,deferral,
      instead:alternative.constructor.name
    });
    return alternative;
  };
  SimpleTacticsAi.prototype.decodeNextAction=replacement;
  try {
    return {
      result:execute(),
      audit:{
        schema:'rank15-visible-two-vileplume-line-bench-reservation-v0',
        sourceSeat,events,
        scope:'Experimental source policy, event telemetry may contain simulation calls',
        competitiveOpponentQualified:false
      }
    };
  }finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,replacement);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={STAGE_LINE,rank15BenchNeeds,rank15ReservedBasicPlay,
  withRank15VileplumeBenchReservation};
