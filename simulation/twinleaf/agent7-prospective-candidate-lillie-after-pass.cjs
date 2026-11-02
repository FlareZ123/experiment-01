'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseLillieAfterPass}=require('./agent12-actor-only-lillie-after-pass.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('./agent24-native-lillie-settlement-audit.cjs');

const VERSION='agent7-candidate-only-owner-visible-lillie-pass-rescue-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Add exactly one owner-visible option after the selected actor root policy.
 * Both original candidate 60s receive the same rule; original Aichi source
 * actor is untouched. Every actual native root is still Store-validated.
 *
 * @template T
 * @param {()=>T} execute Real synchronous one-trial native match.
 * @param {object} trial Pre-registered trial with physical candidate slot.
 * @param {object} [deps] Controlled test seams.
 * @returns {{result:T,audit:object}}
 */
function withCandidateLillieAfterPass(execute,trial,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(trial?.candidateSlot==='A'||trial?.candidateSlot==='B');
  const seat=trial.candidateSlot==='A'?0:1;
  const {SimpleTacticsAi}=deps.bot??require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {Store}=deps.store??require(path.join(output,'game/store/store'));
  const {PlayCardAction,PlayerType,SlotType}=deps.actions??require(path.join(
    output,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const choose=deps.chooseLillie??chooseLillieAfterPass;
  const previousDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const previousDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof previousDecode?.value,'function');
  assert.equal(typeof previousDispatch?.value,'function');

  let liveStore=null;
  const intentMap=new WeakMap();
  const audit={
    schema:VERSION,trialId:trial.id,candidatePhysicalSeat:seat,
    originalSourcePolicyUntouched:true,
    proposed:0,accepted:0,rejected:0,
    events:[],candidateLillieNativeDraws:null,
    competitiveGameQualified:false,
    scope:'Only an owner-root native Pass may be replaced with physically held payable Lillie; decision stays native'
  };

  function candidateDecision(state){
    const native=previousDecode.value.call(this,state);
    if(native?.constructor?.name!=='PassTurnAction'||
        state!==liveStore?.state||state.activePlayer!==seat||
        state.players?.[seat]?.id!==this.client?.id||
        state.prompts?.some(p=>p.result===undefined))
      return native;
    const view=observe(state,seat);
    const alternative=choose(view);
    if(!alternative)return native;
    const action=new PlayCardAction(this.client.id,alternative.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const receipt={
      trialId:trial.id,seat,turn:view.globalTurn,
      printing:alternative.printing,handIndex:alternative.handIndex,
      handCountBefore:view.ownHand.length,
      deckCountBefore:view.ownPublic.deckCount,
      sourceChosenAction:'PassTurnAction'
    };
    intentMap.set(action,receipt);
    audit.proposed++;
    return action;
  }

  function observedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const intent=this===liveStore?intentMap.get(action):null;
    try{
      const result=previousDispatch.value.call(this,action,...args);
      if(intent){
        audit.accepted++;
        audit.events.push({...intent,nativeRootAccepted:true});
      }
      return result;
    }catch(error){
      if(intent){
        audit.rejected++;
        audit.events.push({...intent,nativeRootAccepted:false,
          error:String(error?.message??error)});
      }
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previousDecode,value:candidateDecision
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...previousDispatch,value:observedDispatch
  });
  try{
    // Effect settlement and the actual game are separate: neither test
    // fixture nor Lillie observer gets a say in the candidate decision.
    const observed=deps.withNativeDrawAudit?
      deps.withNativeDrawAudit(execute):
      withNativeLillieDrawSettlementAudit(execute);
    audit.candidateLillieNativeDraws={
      supportRoots:observed.audit.supportRoots,
      printedDrawConfirmed:observed.audit.printedDrawConfirmed,
      events:observed.audit.events.filter(e=>e.seat===seat)
    };
    return {result:observed.result,audit};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',previousDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      candidateDecision);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previousDecode);
  }
}

/**
 * Install a scoped root-adapter seam only for one already registered panel.
 * The baseline shared root policy remains exactly the same, and the hook
 * restores the CommonJS module export descriptor even after native failure.
 *
 * @template T
 * @param {()=>T} execute Existing unmodified runDevelopment invocation.
 * @param {object[]} trials Exactly the pre-registered ordered native rows.
 * @param {object} [deps] Pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withRegisteredCandidateLilliePanel(execute,trials,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(trials)&&trials.length>0);
  const root=deps.root??require('./agent34-actor-only-root-policy.cjs');
  const prior=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  assert.equal(typeof prior?.value,'function');
  const runTrial=deps.runTrial??withCandidateLillieAfterPass;
  const audits=[];
  let index=0;
  function rootAdapter(underlying,options){
    assert.ok(index<trials.length,'More real root compositions than registered trials');
    const trial=trials[index++];
    return prior.value.call(root,()=>{
      const intervention=runTrial(underlying,trial);
      audits.push(intervention.audit);
      return intervention.result;
    },options);
  }
  Object.defineProperty(root,'withActorOnlyRootPolicy',{
    ...prior,value:rootAdapter
  });
  try{
    const result=execute();
    assert.equal(index,trials.length,
      'Every registered trial must instantiate exactly one selected root');
    return {result,audit:{
      schema:VERSION,
      inputTrialIds:trials.map(t=>t.id),
      rootCompositions:index,
      interventions:audits,
      competitiveGameQualified:false
    }};
  }finally{
    assert.strictEqual(root.withActorOnlyRootPolicy,rootAdapter);
    Object.defineProperty(root,'withActorOnlyRootPolicy',prior);
  }
}
module.exports={
  VERSION,withCandidateLillieAfterPass,withRegisteredCandidateLilliePanel
};
