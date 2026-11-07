'use strict';

const assert=require('node:assert/strict');

const VERSION='agent3-postprize-response-action-sequence-v2';

/**
 * Capture the candidate's post-dispatch response sequence after a physical
 * Prize exit. Player identity is tracked by stable player IDs because the
 * engine may reorder state.players between turns.
 *
 * @param {object} options
 * @param {Array<{id:string,candidateSlot:'A'|'B'}>} options.registeredTrials
 * @param {{currentTrialId:string|null}} options.rootBinding
 * @param {(state:object)=>object[]} options.publicBoardSnapshot
 * @returns {{onRootActionDispatched:Function,result:Function}}
 */
function createPostPrizeResponseActionSequenceObserver(options){
  assert.ok(Array.isArray(options?.registeredTrials));
  assert.ok(options.rootBinding&&typeof options.rootBinding==='object');
  assert.equal(typeof options.publicBoardSnapshot,'function');

  const seatsByTrial=new Map(options.registeredTrials.map(trial=>{
    assert.equal(typeof trial.id,'string');
    assert.ok(trial.candidateSlot==='A'||trial.candidateSlot==='B');
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    return [trial.id,{sourceSeat:1-candidateSeat,candidateSeat}];
  }));
  const playerIdsByTrial=new Map();
  const previousPrizeCardsByStore=new WeakMap();
  const pendingByTrial=new Map();
  const activeByTrial=new Map();
  const sequences=[];
  const unansweredPrizeExits=[];
  const diagnostics={callbackCount:0,missingTrialIdCount:0,
    unmatchedTrialIds:[],playerShapeMissCount:0,trialIdsObserved:[],
    playerIdsByTrial:[],prizeCardChanges:[]};

  function prizeCards(player){
    return player.prizes.flatMap(slot=>slot.cards);
  }

  function snapshotAction(store,action,ordinal,seat,turnBefore,playerIds){
    const state=store.state;
    const owner=state.players[seat];
    return {
      rootOrdinal:ordinal,
      turnBefore,
      actorSeat:seat,
      actorPlayerId:owner.id,
      actionType:action.constructor.name,
      ownerHandPrintingsAfterAction:owner.hand.cards.map(card=>card.fullName),
      ownerDiscardNamesAfterAction:owner.discard.cards.map(card=>card.name),
      ownerDiscardPrintingsAfterAction:owner.discard.cards.map(card=>card.fullName),
      ownerDeckCountAfterAction:owner.deck.cards.length,
      ownerPrizeCardCountAfterAction:prizeCards(owner).length,
      candidatePlayerId:playerIds.candidatePlayerId,
      sourcePlayerId:playerIds.sourcePlayerId,
      pendingPromptTypesAfterAction:(state.prompts??[])
        .filter(prompt=>prompt.result===undefined)
        .map(prompt=>({
          type:prompt.constructor.name,
          actorSeat:state.players.findIndex(player=>player.id===prompt.playerId)
        })),
      publicBoardAfterAction:options.publicBoardSnapshot(state)
    };
  }

  function finishSequence(trialId,sequence,completedByPass,turnEndObserved){
    sequence.completedByPass=completedByPass;
    sequence.turnEndObserved=turnEndObserved;
    sequence.completedAtRootOrdinal=sequence.actions.at(-1)?.rootOrdinal??null;
    sequences.push(sequence);
    activeByTrial.delete(trialId);
  }

  function onRootActionDispatched(store,action,ordinal,seat,turnBefore){
    diagnostics.callbackCount++;
    const trialId=options.rootBinding.currentTrialId;
    if(typeof trialId!=='string'){
      diagnostics.missingTrialIdCount++;
      return;
    }
    const seats=seatsByTrial.get(trialId);
    if(!seats){
      if(!diagnostics.unmatchedTrialIds.includes(trialId))
        diagnostics.unmatchedTrialIds.push(trialId);
      return;
    }
    if(!diagnostics.trialIdsObserved.includes(trialId))
      diagnostics.trialIdsObserved.push(trialId);
    const state=store.state;
    if(!Array.isArray(state.players)||state.players.length!==2){
      diagnostics.playerShapeMissCount++;
      return;
    }

    let playerIds=playerIdsByTrial.get(trialId);
    if(!playerIds){
      const candidatePlayerId=state.players[seats.candidateSeat].id;
      const sourcePlayerId=state.players[seats.sourceSeat].id;
      playerIds={candidatePlayerId,sourcePlayerId};
      playerIdsByTrial.set(trialId,playerIds);
      diagnostics.playerIdsByTrial.push({registeredTrialId:trialId,...playerIds});
    }
    const actorPlayerId=state.players[seat]?.id;
    const currentPrizeCards=new Map(state.players.map(player=>
      [player.id,prizeCards(player)]));
    const previous=previousPrizeCardsByStore.get(store);

    if(previous){
      const previousCandidateCards=previous.get(playerIds.candidatePlayerId)??[];
      const currentCandidateCards=currentPrizeCards.get(playerIds.candidatePlayerId)??[];
      const removed=previousCandidateCards.filter(card=>
        !currentCandidateCards.includes(card));
      const added=currentCandidateCards.filter(card=>
        !previousCandidateCards.includes(card));
      if(removed.length||added.length){
        diagnostics.prizeCardChanges.push({
          registeredTrialId:trialId,rootOrdinal:ordinal,actorSeat:seat,
          actorPlayerId,turnBefore,sourcePlayerId:playerIds.sourcePlayerId,
          candidatePlayerId:playerIds.candidatePlayerId,
          removedPrizeCardCount:removed.length,addedPrizeCardCount:added.length,
          previousCandidatePrizeCount:previousCandidateCards.length,
          currentCandidatePrizeCount:currentCandidateCards.length
        });
      }
      if(actorPlayerId===playerIds.sourcePlayerId&&removed.length>0){
        const pending=pendingByTrial.get(trialId);
        if(pending&&pending.sourceTurn===turnBefore){
          pending.sourcePrizeRootOrdinals.push(ordinal);
          pending.prizesTaken+=removed.length;
        }else{
          if(pending)unansweredPrizeExits.push({
            registeredTrialId:trialId,...pending
          });
          pendingByTrial.set(trialId,{
            sourceTurn:turnBefore,
            sourcePrizeRootOrdinals:[ordinal],
            prizesTaken:removed.length,
            candidatePlayerId:playerIds.candidatePlayerId,
            sourcePlayerId:playerIds.sourcePlayerId
          });
        }
      }

      const active=activeByTrial.get(trialId);
      if(active){
        if(actorPlayerId===playerIds.candidatePlayerId&&turnBefore===active.candidateTurn){
          active.actions.push(snapshotAction(store,action,ordinal,seat,turnBefore,playerIds));
          if(action.constructor.name==='PassTurnAction'||state.turn!==turnBefore){
            finishSequence(trialId,active,
              action.constructor.name==='PassTurnAction',true);
          }
        }else{
          finishSequence(trialId,active,false,true);
        }
      }

      if(!activeByTrial.has(trialId)){
        const pending=pendingByTrial.get(trialId);
        if(pending&&actorPlayerId===playerIds.candidatePlayerId){
          const sequence={
            registeredTrialId:trialId,
            sourceSeat:seats.sourceSeat,
            candidateSeat:seats.candidateSeat,
            candidatePlayerId:playerIds.candidatePlayerId,
            sourcePlayerId:playerIds.sourcePlayerId,
            sourceTurn:pending.sourceTurn,
            sourcePrizeRootOrdinals:[...pending.sourcePrizeRootOrdinals],
            prizesTaken:pending.prizesTaken,
            candidateTurn:turnBefore,
            firstResponseRootOrdinal:ordinal,
            actions:[],
            completedByPass:false,
            turnEndObserved:false,
            completedAtRootOrdinal:null
          };
          sequence.actions.push(snapshotAction(store,action,ordinal,seat,turnBefore,playerIds));
          pendingByTrial.delete(trialId);
          if(action.constructor.name==='PassTurnAction'||state.turn!==turnBefore){
            finishSequence(trialId,sequence,
              action.constructor.name==='PassTurnAction',true);
          }else{
            activeByTrial.set(trialId,sequence);
          }
        }
      }
    }
    previousPrizeCardsByStore.set(store,currentPrizeCards);
  }

  return {
    onRootActionDispatched,
    result(){
      const active=[...activeByTrial.values()].map(sequence=>({
        ...sequence,actions:[...sequence.actions]
      }));
      const completed=sequences.map(sequence=>({
        ...sequence,actions:[...sequence.actions]
      }));
      return {
        version:VERSION,
        sequences:[...completed,...active],
        pendingPrizeExits:[...unansweredPrizeExits,
          ...[...pendingByTrial.entries()].map(([registeredTrialId,pending])=>({
            registeredTrialId,...pending
          }))],
        diagnostics:{...diagnostics,
          unmatchedTrialIds:[...diagnostics.unmatchedTrialIds],
          trialIdsObserved:[...diagnostics.trialIdsObserved],
          playerIdsByTrial:[...diagnostics.playerIdsByTrial],
          prizeCardChanges:[...diagnostics.prizeCardChanges]},
        hiddenHandReadBeforeCandidateResponse:false,
        policyInputModified:false,
        paperLegalityCertified:false
      };
    }
  };
}

/**
 * @param {string[]} values Multiset to retain.
 * @param {string[]} subtract Multiset to remove.
 * @returns {string[]}
 */
function multisetDifference(values,subtract){
  const counts=new Map();
  for(const value of subtract)counts.set(value,(counts.get(value)??0)+1);
  const result=[];
  for(const value of values){
    const count=counts.get(value)??0;
    if(count>0)counts.set(value,count-1);
    else result.push(value);
  }
  return result;
}

/**
 * Join post-dispatch snapshots to the exact candidate response root identified
 * by the independent post-Prize projection and the actual headless root ledger.
 *
 * @param {object[]} rawDevelopmentRows
 * @param {object[]} projectedReplies
 * @param {object} observation Observer result.
 * @returns {object[]}
 */
function joinPostPrizeResponseActionSequences(
  rawDevelopmentRows,projectedReplies,observation
){
  assert.ok(Array.isArray(rawDevelopmentRows));
  assert.ok(Array.isArray(projectedReplies));
  assert.equal(observation?.version,VERSION);
  const rawByTrial=new Map(rawDevelopmentRows.map(row=>[row.trial.id,row]));

  return projectedReplies.map(reply=>{
    const raw=rawByTrial.get(reply.registeredTrialId);
    assert.ok(raw,'Exact registered native trial must exist');
    const sequence=observation.sequences.find(candidate=>
      candidate.registeredTrialId===reply.registeredTrialId&&
      candidate.actions.some(action=>
        action.rootOrdinal===reply.firstCandidateResponseRootOrdinal));
    if(!sequence){
      return {...reply,postPrizeResponseActionSequence:null};
    }

    assert.equal(sequence.candidateSeat,reply.candidateOwnerSeat);
    assert.equal(sequence.candidateTurn,reply.candidateReplyNativeTurn);
    assert.ok(sequence.sourcePrizeRootOrdinals.includes(
      reply.causalSourcePrizeRootOrdinal),
    'Response sequence must descend from the exact causal physical Prize root');

    const rootRows=raw.rootActionLedger??raw.nativePublicRootArchive?.rootActionLedger;
    const decisionRows=raw.decisionTrace??raw.nativePublicRootArchive?.decisionTrace??[];
    assert.ok(Array.isArray(rootRows),'Exact trial needs an actual headless root ledger');
    const roots=new Map(rootRows.map(root=>[root.actionOrdinal,root]));
    const decisions=new Map(decisionRows.map(decision=>
      [decision.actionOrdinal,decision]));
    const actions=sequence.actions.map(action=>{
      const root=roots.get(action.rootOrdinal);
      assert.ok(root,'Every post-dispatch snapshot needs an actual root ledger row');
      const decision=decisions.get(action.rootOrdinal);
      const before=decision?.decisionHandBefore?.ownHandPrintings??null;
      const after=action.ownerHandPrintingsAfterAction;
      return {
        ...action,
        actionType:root.action,
        playedCard:root.card??null,
        ownerHandPrintingsBeforeAction:before,
        handCardsAdded:before===null?null:multisetDifference(after,before),
        handCardsRemoved:before===null?null:multisetDifference(before,after),
        playedCardInDiscard:root.card===undefined?null:
          action.ownerDiscardNamesAfterAction.includes(root.card)
      };
    });

    return {
      ...reply,
      postPrizeResponseActionSequence:{
        ...sequence,
        actions,
        firstProjectedResponseAction:actions.find(action=>
          action.rootOrdinal===reply.firstCandidateResponseRootOrdinal)??null
      }
    };
  });
}

module.exports={
  VERSION,
  createPostPrizeResponseActionSequenceObserver,
  joinPostPrizeResponseActionSequences,
  multisetDifference
};
