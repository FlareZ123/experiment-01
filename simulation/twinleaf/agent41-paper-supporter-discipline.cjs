'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {withNativeSupporterTurnAudit} = require('./native-supporter-turn-audit.cjs');
const {withPaperSupporterQuotaGuard} = require('./paper-supporter-quota-guard.cjs');
const {withOwnerVisibleSupporterQuotaProposals} =
  require('./supporter-proposal-paper-quota.cjs');

const VERSION = 'agent41-bilateral-native-paper-supporter-discipline-v2-shared-owner-tactic';

/**
 * Reversible native paper Supporter guard for both actual actors. Reuse Agent
 * 8's owner-visible proposal filter, Agent 34's original Store interception,
 * and the independent printed-log postcondition audit. The Store remains the
 * final veto for any directly scripted Supporter outside the ordinary tactic.
 * This is a quota-only proof, not a legal-game or competitive qualification.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless match.
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
  const allowAdditionalSupporter=deps.allowAdditionalSupporter??(()=>false);
  assert.equal(typeof allowAdditionalSupporter,'function');
  const proposalSuppressions=[],nativeVetoes=[];
  let suppressionCount=0;
  try {
    const proposed=withOwnerVisibleSupporterQuotaProposals(
      PlaySupporterTactic,TrainerType.SUPPORTER,
      ()=>withNativeSupporterTurnAudit(
        Store,TrainerType.SUPPORTER,
        ()=>withPaperSupporterQuotaGuard(
          Store,TrainerType.SUPPORTER,execute,{
            allowAdditionalSupporter,
            onViolation:event=>nativeVetoes.push(event)
          }),{
          playSupporterLogMessage:GameLog.LOG_PLAYER_PLAYS_SUPPORTER
        }),{
        allowAdditionalSupporter:({state,owner})=>
          allowAdditionalSupporter({state,owner,card:null,phase:'bot-proposal'}),
        onSuppressed:event=>{
          suppressionCount++;
          if(proposalSuppressions.length<64)proposalSuppressions.push(event);
        }
      });
    const observed=proposed.result;
    const accepted=observed.result.legalSupporterRoots;
    const settled=observed.events;
    const qualified=nativeVetoes.length===0 &&
      observed.unsettledPlays.length===0 &&
      observed.repeatPlays.length===0 &&
      accepted.length===settled.length &&
      settled.every(event=>event.settled &&
        event.supporterTurnBefore===0);
    assert.equal(suppressionCount,proposed.suppressionCount);
    return {
      result:observed.result.result,
      audit:{
        version:VERSION,appliesToBothSeats:true,
        ownerProposalSuppressions:proposalSuppressions,
        ownerProposalSuppressionCount:suppressionCount,
        nativeProposalFilterVersion:proposed.version,
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
      ownerProposalSuppressions:proposalSuppressions,
      ownerProposalSuppressionCount:suppressionCount
    };
    throw error;
  }
}

module.exports={VERSION,withNativePaperSupporterDiscipline};
