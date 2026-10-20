'use strict';

const assert=require('node:assert/strict');
const {countPolicyRandomDraws}=require('./policy-random-draw-audit.cjs');

const VERSION='native-supporter-proposal-validation-observer-v1';

/**
 * Read-only native proposal/validation trace. Must be installed before any
 * other wrapper that captures PlaySupporterTactic.useTactic. Do not convert
 * this trace into a legal-Game or information-set certification.
 *
 * @param {Function} BotClass Pinned SimpleTacticsAi constructor.
 * @param {Function} SupporterTacticClass Pinned PlaySupporterTactic constructor.
 * @param {{maxDecisions?:number}} [options]
 * @returns {{report:object,restore:()=>void}}
 */
function installNativeSupporterProposalValidationTrace(
  BotClass,SupporterTacticClass,{maxDecisions=256}={}
) {
  assert.equal(typeof BotClass,'function');
  assert.equal(typeof SupporterTacticClass,'function');
  assert.ok(Number.isSafeInteger(maxDecisions)&&maxDecisions>=1);
  const bot=BotClass.prototype,tactic=SupporterTacticClass.prototype;
  const decision=Object.getOwnPropertyDescriptor(bot,'decodeNextAction');
  const valid=Object.getOwnPropertyDescriptor(bot,'isValidAction');
  const proposal=Object.getOwnPropertyDescriptor(tactic,'useTactic');
  for(const descriptor of [decision,valid,proposal]) {
    assert.equal(typeof descriptor?.value,'function',
      'Expected pinned native method');
  }
  let current=null,calls=0,proposals=0,rejected=0,proposalMutations=0;
  let rejectedMutatedQuota=0,dropped=0;
  const decisions=[];

  /** @param {object} state @param {object|null} action */
  function actionSummary(state,action) {
    if(!action)return null;
    const seat=state?.activePlayer;
    const actor=state?.players?.[seat];
    const index=action.handIndex;
    return {
      kind:action.constructor?.name??null,
      name:typeof action.name==='string'?action.name:null,
      handIndex:Number.isSafeInteger(index)?index:null,
      ownerHeldPrinting:Number.isSafeInteger(index)?
        actor?.hand?.cards?.[index]?.fullName??null:null
    };
  }
  function observedProposal(state,owner) {
    const before=owner?.supporterTurn??null;
    const result=proposal.value.apply(this,arguments);
    const after=owner?.supporterTurn??null;
    if(current){
      const changed=!Object.is(before,after);
      if(result!==undefined||changed){
        proposals++;
        if(changed)proposalMutations++;
        const seat=state.players.indexOf(owner);
        current.proposals.push({
          ref:result,ownerRef:owner,
          public:{
            order:current.proposals.length,seat,
            ownerIsLivePlayer:seat>=0,
            supporterTurnBefore:before,
            supporterTurnAfter:after,
            quotaChangedDuringProposal:changed,
            action:actionSummary(state,result)
          }
        });
      }
    }
    return result;
  }
  function observedValid(state,action) {
    const linkedEntry=current?.proposals.findLast(entry=>entry.ref===action);
    const actor=linkedEntry?.ownerRef??state?.players?.[state.activePlayer];
    const quotaBefore=actor?.supporterTurn??null;
    let result,errorName=null;
    try {
      result=valid.value.apply(this,arguments);
      return result;
    } catch(error) {
      errorName=error?.constructor?.name??'Error';
      throw error;
    } finally {
      if(current) {
        const match=current.proposals.findLastIndex(
          entry=>entry.ref===action);
        const linked=match>=0?current.proposals[match].public:null;
        const accepted=errorName===null&&result===true;
        if(!accepted)rejected++;
        if(!accepted&&linked?.quotaChangedDuringProposal) {
          rejectedMutatedQuota++;
        }
        current.validations.push({
          action:actionSummary(state,action),accepted,errorName,
          supporterTurnBeforeValidation:quotaBefore,
          supporterTurnAfterValidation:actor?.supporterTurn??null,
          proposalOwnerLiveSeatAtValidation:state?.players?.indexOf(actor)??null,
          linkedProposalOrder:match>=0?match:null,
          linkedProposalQuotaMutated:linked?.quotaChangedDuringProposal??null
        });
      }
    }
  }
  function observedDecision(state) {
    const ordinal=++calls;
    const seat=state?.activePlayer;
    const actor=state?.players?.[seat];
    const prior=current;
    const event={
      ordinal,globalTurn:state?.turn??null,seat,
      actorId:actor?.id??null,
      supporterTurnAtEntry:actor?.supporterTurn??null,
      proposals:[],validations:[],
      selected:null,rngDraws:null,rngDigestSha256:null,
      supporterTurnAtExit:null,errorName:null
    };
    current=event;
    try {
      const observed=countPolicyRandomDraws(()=>
        decision.value.apply(this,arguments));
      event.rngDraws=observed.draws;
      event.rngDigestSha256=observed.drawDigest;
      event.selected=actionSummary(state,observed.result);
      return observed.result;
    } catch(error) {
      event.errorName=error?.constructor?.name??'Error';
      throw error;
    } finally {
      event.supporterTurnAtExit=actor?.supporterTurn??null;
      if(decisions.length<maxDecisions) {
        decisions.push({
          ...event,proposals:event.proposals.map(x=>x.public)
        });
      }else dropped++;
      current=prior;
    }
  }
  Object.defineProperty(bot,'decodeNextAction',{
    ...decision,value:observedDecision
  });
  Object.defineProperty(bot,'isValidAction',{...valid,value:observedValid});
  Object.defineProperty(tactic,'useTactic',{
    ...proposal,value:observedProposal
  });
  return {
    get report() {
      return {
        version:VERSION,decisionsObserved:calls,
        proposalObservations:proposals,proposalQuotaMutations:proposalMutations,
        rejectedValidations:rejected,
        rejectedValidationsLinkedToMutatedQuota:rejectedMutatedQuota,
        boundedStoredDecisions:decisions.slice(),
        droppedDecisions:dropped,
        limitation:'Read-only method observations and policy RNG count/hash only. Does not replay RNG stream or certify validity of paper actions.'
      };
    },
    restore() {
      assert.strictEqual(bot.decodeNextAction,observedDecision);
      assert.strictEqual(bot.isValidAction,observedValid);
      assert.strictEqual(tactic.useTactic,observedProposal);
      Object.defineProperty(tactic,'useTactic',proposal);
      Object.defineProperty(bot,'isValidAction',valid);
      Object.defineProperty(bot,'decodeNextAction',decision);
    }
  };
}

module.exports={VERSION,installNativeSupporterProposalValidationTrace};
