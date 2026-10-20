'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent22-authentic-supporter-proposal-state-observer-v2';

/**
 * Observe the exact native decision-to-dispatch path without changing any
 * proposal, validity decision, bot RNG, Store State, or returned action.
 * Compare the genuine native State object identity, not a postgame clone.
 *
 * @template T
 * @param {()=>T} execute Synchronous original match or canonical runner arm.
 * @param {{Store?:Function,SimpleTacticsAi?:Function,PlaySupporterTactic?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSupporterProposalStateAudit(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const PlaySupporterTactic=deps.PlaySupporterTactic??
    require(path.join(base,'simple-bot/simple-tactics/play-supporter-tactic'))
      .PlaySupporterTactic;
  const dispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const decode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  const tactic=Object.getOwnPropertyDescriptor(PlaySupporterTactic.prototype,
    'useTactic');
  for(const entry of [dispatch,decode,tactic])
    assert.equal(typeof entry?.value,'function');

  const records=[];
  let rootStore=null,rootOrdinal=0,decisionOrdinal=0,currentDecision=null;
  const selectedByAction=new WeakMap();
  const originByEntry=new WeakMap();
  const idOf=action=>action?.constructor?.name??null;
  function observedTactic(state,owner) {
    const before=owner.supporterTurn;
    const decision=currentDecision;
    const action=tactic.value.call(this,state,owner);
    const after=owner.supporterTurn;
    if(decision){
      const entry={
        schema:VERSION,decisionOrdinal:decision.ordinal,
        seat:state.players.indexOf(owner),
        ownerId:owner.id,globalTurn:state.turn,
        physicalRootStateAlias:rootStore!==null&&state===rootStore.state,
        proposalType:idOf(action),
        ownerProposedCard:action?.constructor?.name==='PlayCardAction'?
          owner.hand.cards[action.handIndex]?.fullName??null:null,
        quotaBeforeProposal:before,quotaAfterProposal:after,
        quotaAfterBotDecision:null,
        rootStateAliasAtBotExit:null,
        rootOwnerAliasAtBotExit:null,
        mutatedQuotaDuringProposal:before!==after,
        selectedByBot:false,proposedButNotSelected:false,
        botFinalAction:null,nativeRootDispatchOrdinal:null,
        quotaAtNativeDispatch:null,quotaAfterNativeDispatch:null,
        rootStateAliasAtDispatch:null,
        rootOwnerAliasAtDispatch:null,
        nativeDispatchOutcome:'not-dispatched'
      };
      records.push(entry);
      originByEntry.set(entry,{state,owner});
      decision.proposals.push({action,entry});
    }
    return action;
  }
  function observedDecode(state) {
    const previous=currentDecision;
    const decision={ordinal:++decisionOrdinal,proposals:[]};
    currentDecision=decision;
    try{
      const finalAction=decode.value.call(this,state);
      for(const proposal of decision.proposals){
        const entry=proposal.entry;
        entry.botFinalAction=idOf(finalAction);
        const origin=originByEntry.get(entry);
        entry.quotaAfterBotDecision=origin.owner.supporterTurn;
        entry.rootStateAliasAtBotExit=
          rootStore!==null&&origin.state===rootStore.state;
        entry.rootOwnerAliasAtBotExit=
          rootStore!==null&&rootStore.state.players.includes(origin.owner);
        entry.selectedByBot=proposal.action!==undefined&&
          proposal.action===finalAction;
        entry.proposedButNotSelected=proposal.action!==undefined&&
          proposal.action!==finalAction;
        if(entry.selectedByBot&&typeof finalAction==='object'&&finalAction)
          selectedByAction.set(finalAction,entry);
      }
      return finalAction;
    }finally{
      currentDecision=previous;
    }
  }
  function observedDispatch(...args){
    const action=args[0];
    if(rootStore===null&&idOf(action)==='AddPlayerAction')
      rootStore=this;
    const authentic=this===rootStore;
    if(authentic)rootOrdinal++;
    const entry=authentic&&typeof action==='object'&&action?
      selectedByAction.get(action):undefined;
    const owner=entry?this.state.players.find(p=>p.id===entry.ownerId):null;
    if(entry){
      entry.nativeRootDispatchOrdinal=rootOrdinal;
      entry.quotaAtNativeDispatch=owner?.supporterTurn??null;
      const origin=originByEntry.get(entry);
      entry.rootStateAliasAtDispatch=origin.state===this.state;
      entry.rootOwnerAliasAtDispatch=origin.owner===owner;
    }
    try{
      const result=dispatch.value.apply(this,args);
      if(entry){
        entry.nativeDispatchOutcome='returned';
        entry.quotaAfterNativeDispatch=
          this.state.players.find(p=>p.id===entry.ownerId)?.supporterTurn??null;
      }
      return result;
    }catch(error){
      if(entry){
        entry.nativeDispatchOutcome='threw';
        entry.nativeDispatchError=String(error?.message??error);
        entry.quotaAfterNativeDispatch=
          this.state.players.find(p=>p.id===entry.ownerId)?.supporterTurn??null;
      }
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',{...dispatch,value:observedDispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...decode,value:observedDecode});
  Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',
    {...tactic,value:observedTactic});
  try{
    const result=execute();
    const relevant=records.filter(x=>x.proposalType!==null);
    return {result,audit:{
      schema:VERSION,readOnly:true,
      nativeRootIdentified:rootStore!==null,
      totalTacticCalls:records.length,
      proposals:relevant.length,
      realRootStateAliasProposals:relevant.filter(x=>
        x.physicalRootStateAlias).length,
      mutatedRootProposals:relevant.filter(x=>
        x.physicalRootStateAlias&&x.mutatedQuotaDuringProposal).length,
      proposedButNotSelectedOnRoot:relevant.filter(x=>
        x.physicalRootStateAlias&&x.proposedButNotSelected).length,
      rejectedAndMutatedRootProposals:relevant.filter(x=>
        x.physicalRootStateAlias&&x.proposedButNotSelected&&
        x.mutatedQuotaDuringProposal).length,
      nativeDispatchedSelected:relevant.filter(x=>
        x.nativeDispatchOutcome!=='not-dispatched').length,
      proposalMarkerPersistedToBotExit:relevant.filter(x=>
        x.mutatedQuotaDuringProposal&&
        x.quotaAfterBotDecision===x.quotaAfterProposal).length,
      physicalRootStatePreservedToDispatch:relevant.filter(x=>
        x.nativeDispatchOutcome!=='not-dispatched'&&
        x.rootStateAliasAtDispatch).length,
      physicalRootOwnerPreservedToDispatch:relevant.filter(x=>
        x.nativeDispatchOutcome!=='not-dispatched'&&
        x.rootOwnerAliasAtDispatch).length,
      records:records.slice(0,128),
      truncatedRecords:Math.max(0,records.length-128),
      qualification:'Observation only: not proof of policy correctness or game legality'
    }};
  }finally{
    assert.strictEqual(PlaySupporterTactic.prototype.useTactic,observedTactic);
    Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',tactic);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,observedDecode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',decode);
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',dispatch);
  }
}
module.exports={VERSION,withSupporterProposalStateAudit};
