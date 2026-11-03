'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent20-frozen-rank6-candidate-stadium-at-pass-clone-v1';
const SERVER=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const PRINTINGS=['Dimension Valley PHF','Path to the Peak CRE'];

/** @param {string} relative @returns {unknown} */
const native=relative=>require(path.join(SERVER,relative));

/**
 * Counterfactually dispatch held Stadiums on independent native Store copies
 * at the exact physical owner decision where the unchanged bot chose Pass.
 * Never dispatch an alternate root into the real original game.
 *
 * @param {object} state Real pre-Pass Store state.
 * @param {0|1} ownerSeat Actual candidate physical seat.
 * @param {object} [deps] Injected compiled-store dependencies for pure tests.
 * @returns {object}
 */
function detachedStadiumAtPass(state,ownerSeat,deps={}){
  assert.ok(ownerSeat===0||ownerSeat===1);
  const {deepClone}=deps.utils??native('utils');
  const {Store}=deps.store??native('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=deps.play??
    native('game/store/actions/play-card-action');
  const {TrainerCard}=deps.trainer??
    native('game/store/card/trainer-card');
  const {TrainerType}=deps.types??
    native('game/store/card/card-types');
  const owner=state.players[ownerSeat];
  const enemy=state.players[1-ownerSeat];
  assert.ok(Array.isArray(owner?.hand?.cards)&&
    Array.isArray(enemy?.stadium?.cards));
  const eligibleRoot=state.activePlayer===ownerSeat&&
    !state.prompts.some(p=>p.result===undefined);
  const before={
    globalTurn:state.turn,candidatePhysicalSeat:ownerSeat,
    candidateOwnerHandPrintings:owner.hand.cards.map(c=>c.fullName),
    candidateStadium:owner.stadium.cards.map(c=>c.fullName),
    originalSourceStadium:enemy.stadium.cards.map(c=>c.fullName),
    stadiumPlayedTurn:owner.stadiumPlayedTurn,
    stadiumPlayLocked:owner.cannotPlayStadiumCards===true,
    activeOwnerIsCandidate:state.activePlayer===ownerSeat,
    anyUnresolvedNativePrompt:
      state.prompts.some(p=>p.result===undefined)
  };
  const candidates=owner.hand.cards.map((card,index)=>({
    index,printing:card?.fullName??null,name:card?.name??null,
    isStadium:card instanceof TrainerCard&&
      card.trainerType===TrainerType.STADIUM
  })).filter(c=>c.isStadium);
  const attempts=[];
  for(const candidate of candidates){
    const baseline=enemy.stadium.cards.concat(owner.stadium.cards);
    const samePrintedName=baseline.some(c=>c.name===candidate.name);
    const onePerTurnConsumed=owner.stadiumPlayedTurn===state.turn;
    const publicGenericRuleBlocker=
      !eligibleRoot?'not-owner-root':
      before.stadiumPlayLocked?'public-stadium-lock':
      onePerTurnConsumed?'stadium-already-played':
      samePrintedName?'same-named-stadium':
      null;
    const evidence={
      printing:candidate.printing,
      name:candidate.name,
      realOwnerHandIndex:candidate.index,
      publicGenericRuleBlocker,
      ownerTurnStadiumBudgetUnspent:!onePerTurnConsumed,
      differentPrintedNameFromStadiumInPlay:!samePrintedName,
      onNativeStoreClone:true,
      nativeRootAccepted:false,promptsSettled:false,
      originalLiveStoreMutated:false,nativeError:null,
      replacedPreviousSourceStadium:false,
      exactNewStadiumPhysicalCustody:false,
      nativeSourcePrismStarDisposal:'not-evaluated',
      nativeStateContinuationPaperQualified:false,
      competitivelyQualifiedGame:false
    };
    if(publicGenericRuleBlocker){
      attempts.push(evidence);
      continue;
    }
    const clone=new Store({onStateChange(){}});
    clone.state=deepClone(state);
    const copiedOwner=clone.state.players[ownerSeat];
    const copiedEnemy=clone.state.players[1-ownerSeat];
    const moved=copiedOwner.hand.cards[candidate.index];
    const originals=[
      ...copiedEnemy.stadium.cards,...copiedOwner.stadium.cards
    ];
    const previousRandom=Math.random;
    Math.random=()=>0.5;
    try {
      clone.dispatch(new PlayCardAction(copiedOwner.id,candidate.index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      evidence.nativeRootAccepted=true;
      evidence.promptCountAfterRoot=clone.state.prompts.length;
      const {ResolvePromptAction}=deps.resolve??
        native('game/store/actions/resolve-prompt-action');
      for(let step=0;step<12;step++){
        const pending=clone.state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        const kind=pending.constructor?.name;
        let answer;
        if(kind==='WaitPrompt')answer=null;
        else if(kind==='ShowCardsPrompt')answer=true;
        else if(kind==='ShuffleDeckPrompt'){
          const who=clone.state.players.find(p=>
            p.id===pending.getPerspectivePlayerId());
          if(!who)throw Error('Detached Stadium shuffle has no owner');
          answer=Array.from({length:who.deck.cards.length},(_,i)=>i);
        }else{
          evidence.unhandledNativePrompt=kind??'UNKNOWN_PROMPT';
          break;
        }
        clone.dispatch(new ResolvePromptAction(pending.id,answer));
      }
      evidence.promptsSettled=clone.state.prompts.every(p=>
        p.result!==undefined);
      evidence.exactNewStadiumPhysicalCustody=
        copiedOwner.stadium.cards.includes(moved)&&
        !copiedOwner.hand.cards.includes(moved);
      evidence.replacedPreviousSourceStadium=
        originals.length>0&&originals.every(c=>
          !copiedOwner.stadium.cards.includes(c)&&
          !copiedEnemy.stadium.cards.includes(c));
      evidence.nativeOwnerStadiumAfter=
        copiedOwner.stadium.cards.map(c=>c.fullName);
      evidence.nativeSourceStadiumAfter=
        copiedEnemy.stadium.cards.map(c=>c.fullName);
      evidence.nativeSourcePrismStarDisposal=originals.some(c=>
        c.fullName==='Thunder Mountain Prism Star LOT')?{
          ownerLostZone:copiedEnemy.lostZone.cards.filter(c=>
            c.fullName==='Thunder Mountain Prism Star LOT').length,
          ownerDiscard:copiedEnemy.discard.cards.filter(c=>
            c.fullName==='Thunder Mountain Prism Star LOT').length
        }:'no-thunder-mountain-prism-original';
      evidence.nativeStadiumTransitionWitnessed=evidence.nativeRootAccepted&&
        evidence.promptsSettled&&
        evidence.exactNewStadiumPhysicalCustody&&
        evidence.replacedPreviousSourceStadium;
    }catch(error){
      evidence.nativeError=String(error?.message??error);
    }finally{
      Math.random=previousRandom;
    }
    attempts.push(evidence);
  }
  return {
    schema:VERSION,before,requestedSourcePrintings:PRINTINGS,
    queriedRealHeldStadiumCopyCount:candidates.length,
    anyPaperGenericUnblockedStadium:candidates.some(c=>{
      const x=attempts.find(a=>a.realOwnerHandIndex===c.index);
      return x?.publicGenericRuleBlocker===null;
    }),
    nativeCounterfactualAcceptedReplacements:attempts.filter(a=>
      a.nativeStadiumTransitionWitnessed===true).length,
    attempts,competitiveGameQualified:false
  };
}

/**
 * Read-only one-turn witness on each frozen candidate-seat-A source-root
 * reply. The existing original native policy remains exactly unchanged.
 *
 * @template T
 * @param {()=>T} execute Existing unchanged frozen 4-arm run.
 * @param {object[]} trials Four immutable preregistered arms.
 * @param {object} [deps] Test seam.
 * @returns {{result:T,audit:object}}
 */
function withFrozenCandidateStadiumPassProbe(execute,trials,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(trials)&&trials.length===4);
  const {Store}=deps.store??native('game/store/store');
  const probe=deps.probe??detachedStadiumAtPass;
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof old?.value,'function');
  const nativeStores=new WeakMap();
  const events=[];
  let games=0;
  function observed(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&!nativeStores.has(this))
      nativeStores.set(this,games++);
    const ordinal=nativeStores.get(this);
    const trial=ordinal===undefined?null:trials[ordinal];
    const candidateSeat=trial?.candidateSlot==='A'?0:1;
    const actorId=action?.clientId??action?.id;
    const valid=trial?.candidateSlot==='A'&&
      type==='PassTurnAction'&&this.state?.turn===4&&
      this.state?.activePlayer===candidateSeat&&
      this.state.players[candidateSeat]?.id===actorId&&
      !events.some(x=>x.trialId===trial.id);
    let witness=null;
    if(valid)witness={
      trialId:trial.id,candidateId:trial.candidateId,
      sourceRank:trial.rank,candidateSeat,realAction:'PassTurnAction',
      detached:probe(this.state,candidateSeat)
    };
    try{
      const result=old.value.call(this,action,...args);
      if(witness)events.push({...witness,nativePassAccepted:true});
      return result;
    }catch(error){
      if(witness)events.push({...witness,nativePassAccepted:false,
        nativePassError:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:observed});
  try{
    return {result:execute(),audit:{
      schema:VERSION,observedActualNativeGames:games,
      registeredTrialIds:trials.map(t=>t.id),events,
      noRealActionReplaced:true,sourcePolicyUnchanged:true,
      nativeCounterfactualIsNotCompetitiveEvidence:true,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',old);
  }
}

module.exports={VERSION,PRINTINGS,detachedStadiumAtPass,
  withFrozenCandidateStadiumPassProbe};
