'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {withNativeSupporterTurnAudit} = require('./native-supporter-turn-audit.cjs');
const {withPaperSupporterQuotaGuard} = require('./paper-supporter-quota-guard.cjs');

const VERSION = 'agent41-bilateral-native-paper-supporter-discipline-v1';

/**
 * Reversible, both-actor paper Supporter quota policy and genuine Store audit.
 * The native bot confuses supporterTurn (a count) with state.turn (a timestamp).
 * Suppress proposals after quota is spent, and independently veto any root
 * PlayCardAction that bypasses this tactic (for example a scripted source).
 * This intentionally fail-closes ordinary Supporters; a demonstrated printed
 * exception requires an explicit card-specific policy and allowance.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless game.
 * @param {{Store?:Function,TrainerType?:object,GameLog?:object,
 *          PlaySupporterTactic?:Function,allowAdditionalSupporter?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativePaperSupporterDiscipline(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const TrainerType=deps.TrainerType??
    require(path.join(base,'game/store/card/card-types')).TrainerType;
  const GameLog=deps.GameLog??
    require(path.join(base,'game/game-message')).GameLog;
  const PlaySupporterTactic=deps.PlaySupporterTactic??
    require(path.join(base,'simple-bot/simple-tactics/play-supporter-tactic'))
      .PlaySupporterTactic;
  const previous=Object.getOwnPropertyDescriptor(
    PlaySupporterTactic.prototype,'useTactic');
  assert.equal(typeof previous?.value,'function');
  const allowAdditionalSupporter=deps.allowAdditionalSupporter??(()=>false);
  assert.equal(typeof allowAdditionalSupporter,'function');
  const proposalSuppressions=[],nativeVetoes=[];

  function quotaAwareTactic(state,player) {
    if(player.supporterTurn>=1&&!allowAdditionalSupporter({
      state,owner:player,card:null,phase:'bot-proposal'
    })){
      proposalSuppressions.push({
        turn:state.turn,actorId:player.id,
        seat:state.players.indexOf(player),quota:player.supporterTurn,
        suppressedAction:'PlaySupporterTactic'
      });
      return undefined;
    }
    return previous.value.call(this,state,player);
  }
  Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',{
    ...previous,value:quotaAwareTactic
  });
  try {
    const observed=withNativeSupporterTurnAudit(
      Store,TrainerType.SUPPORTER,
      ()=>withPaperSupporterQuotaGuard(
        Store,TrainerType.SUPPORTER,execute,{
          allowAdditionalSupporter,
          onViolation:event=>nativeVetoes.push(event)
        }),{
        playSupporterLogMessage:GameLog.LOG_PLAYER_PLAYS_SUPPORTER
      });
    const accepted=observed.result.legalSupporterRoots;
    const settled=observed.events;
    const qualified=nativeVetoes.length===0 &&
      observed.unsettledPlays.length===0 &&
      observed.repeatPlays.length===0 &&
      accepted.length===settled.length &&
      settled.every(event=>event.settled &&
        event.supporterTurnBefore===0);
    return {
      result:observed.result.result,
      audit:{
        version:VERSION,appliesToBothSeats:true,
        ownerProposalSuppressions:proposalSuppressions,
        rootDispatchVetoes:nativeVetoes,
        legalSupporterRoots:accepted,
        nativeSupporterEvents:settled,
        nativeUnsettledRoots:observed.unsettledPlays,
        nativeSameTurnSecondSupporters:observed.repeatPlays,
        nativeSupporterQuotaQualified:qualified,
        scope:'Ordinary Supporter turn quota only; not a complete paper-fidelity or policy-competence certification'
      }
    };
  } catch(error) {
    error.paperSupporterQuotaEvidence={
      version:VERSION,appliesToBothSeats:true,
      nativeSupporterQuotaQualified:false,
      rootDispatchVetoes:nativeVetoes,
      ownerProposalSuppressions:proposalSuppressions
    };
    throw error;
  } finally {
    assert.strictEqual(PlaySupporterTactic.prototype.useTactic,quotaAwareTactic);
    Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',previous);
  }
}

module.exports={VERSION,withNativePaperSupporterDiscipline};
