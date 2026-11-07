'use strict';

const assert=require('node:assert/strict');

const VERSION='agent3-postprize-response-action-sequence-v2';

/**
 * Capture the responding player's post-dispatch sequence after a physical
 * Prize exit. By default the source takes the Prize and the candidate responds;
 * prizeTakingSlot can reverse those roles. Stable IDs tolerate player reordering.
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
  const prizeTakingSlot=options.prizeTakingSlot??'source';
  assert.ok(prizeTakingSlot==='source'||prizeTakingSlot==='candidate',
    'prizeTakingSlot must be source or candidate');
  const responseSlot=prizeTakingSlot==='source'?'candidate':'source';

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
      prizeTakingSlot,
      responseSlot,
      prizeTakingSeat:playerIds.prizeTakingSeat,
      responseSeat:playerIds.responseSeat,
      prizeTakingPlayerId:playerIds.prizeTakingPlayerId,
      responsePlayerId:playerIds.responsePlayerId,
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
    const prizeTakingSeat=prizeTakingSlot==='source'?seats.sourceSeat:seats.candidateSeat;
    const responseSeat=prizeTakingSlot==='source'?seats.candidateSeat:seats.sourceSeat;
    const prizeTakingPlayerId=prizeTakingSlot==='source'
      ?playerIds.sourcePlayerId:playerIds.candidatePlayerId;
    const responsePlayerId=prizeTakingSlot==='source'
      ?playerIds.candidatePlayerId:playerIds.sourcePlayerId;
    const playerContext={
      ...playerIds,prizeTakingSeat,responseSeat,
      prizeTakingPlayerId,responsePlayerId
    };
    const currentPrizeCards=new Map(state.players.map(player=>
      [player.id,prizeCards(player)]));
    const previous=previousPrizeCardsByStore.get(store);

    if(previous){
      const previousResponseCards=previous.get(responsePlayerId)??[];
      const currentResponseCards=currentPrizeCards.get(responsePlayerId)??[];
      const removed=previousResponseCards.filter(card=>
        !currentResponseCards.includes(card));
      const added=currentResponseCards.filter(card=>
        !previousResponseCards.includes(card));
      if(removed.length||added.length){
        diagnostics.prizeCardChanges.push({
          registeredTrialId:trialId,rootOrdinal:ordinal,actorSeat:seat,
          actorPlayerId,turnBefore,prizeTakingSlot,responseSlot,
          prizeTakingPlayerId,responsePlayerId,
          removedPrizeCardCount:removed.length,addedPrizeCardCount:added.length,
          previousResponsePrizeCount:previousResponseCards.length,
          currentResponsePrizeCount:currentResponseCards.length,
          previousCandidatePrizeCount:responseSlot==='candidate'
            ?previousResponseCards.length:null,
          currentCandidatePrizeCount:responseSlot==='candidate'
            ?currentResponseCards.length:null
        });
      }
      if(actorPlayerId===prizeTakingPlayerId&&removed.length>0){
        const pending=pendingByTrial.get(trialId);
        if(pending&&pending.prizeTakingTurn===turnBefore){
          pending.prizeTakingRootOrdinals.push(ordinal);
          pending.prizesTaken+=removed.length;
        }else{
          if(pending)unansweredPrizeExits.push({
            registeredTrialId:trialId,...pending
          });
          pendingByTrial.set(trialId,{
            prizeTakingSlot,responseSlot,
            prizeTakingSeat,responseSeat,
            prizeTakingPlayerId,responsePlayerId,
            prizeLosingPlayerId:responsePlayerId,
            prizeTakingTurn:turnBefore,
            prizeTakingRootOrdinals:[ordinal],
            prizesTaken:removed.length,
            candidatePlayerId:playerIds.candidatePlayerId,
            sourcePlayerId:playerIds.sourcePlayerId
          });
        }
      }

      const active=activeByTrial.get(trialId);
      if(active){
        if(actorPlayerId===active.responsePlayerId&&turnBefore===active.responseTurn){
          active.actions.push(snapshotAction(store,action,ordinal,seat,turnBefore,playerContext));
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
        if(pending&&actorPlayerId===responsePlayerId){
          const prizeTakingRootOrdinals=[...pending.prizeTakingRootOrdinals];
          const sourcePrizeRootOrdinals=prizeTakingSlot==='source'
            ?[...prizeTakingRootOrdinals]:[];
          const candidatePrizeRootOrdinals=prizeTakingSlot==='candidate'
            ?[...prizeTakingRootOrdinals]:[];
          const sequence={
            registeredTrialId:trialId,
            sourceSeat:seats.sourceSeat,
            candidateSeat:seats.candidateSeat,
            prizeTakingSlot,responseSlot,
            prizeTakingSeat,responseSeat,
            prizeTakingPlayerId,responsePlayerId,
            prizeLosingPlayerId:responsePlayerId,
            sourcePlayerId:playerIds.sourcePlayerId,
            candidatePlayerId:playerIds.candidatePlayerId,
            prizeTakingTurn:pending.prizeTakingTurn,
            responseTurn:turnBefore,
            sourceTurn:seats.sourceSeat===prizeTakingSeat
              ?pending.prizeTakingTurn:turnBefore,
            candidateTurn:seats.candidateSeat===prizeTakingSeat
              ?pending.prizeTakingTurn:turnBefore,
            prizeTakingRootOrdinals,
            sourcePrizeRootOrdinals,
            candidatePrizeRootOrdinals,
            prizesTaken:pending.prizesTaken,
            firstResponseRootOrdinal:ordinal,
            firstCandidateResponseRootOrdinal:responseSlot==='candidate'
              ?ordinal:null,
            actions:[],
            completedByPass:false,
            turnEndObserved:false,
            completedAtRootOrdinal:null
          };
          sequence.actions.push(snapshotAction(store,action,ordinal,seat,turnBefore,playerContext));
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
        prizeTakingSlot,responseSlot,
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
        hiddenHandReadBeforeResponse:false,
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
 * Join post-dispatch snapshots to the exact response root identified by the
 * independent Prize projection and the actual headless root ledger.
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
    const responseSeat=reply.responseOwnerSeat??reply.candidateOwnerSeat;
    const responseTurn=reply.responseNativeTurn??reply.candidateReplyNativeTurn;
    const firstResponseRootOrdinal=
      reply.firstResponseRootOrdinal??reply.firstCandidateResponseRootOrdinal;
    const prizeTakingRootOrdinal=
      reply.causalPrizeTakingRootOrdinal??reply.causalSourcePrizeRootOrdinal;
    const sequence=observation.sequences.find(candidate=>
      candidate.registeredTrialId===reply.registeredTrialId&&
      candidate.actions.some(action=>
        action.rootOrdinal===firstResponseRootOrdinal));
    if(!sequence){
      return {...reply,postPrizeResponseActionSequence:null};
    }

    assert.equal(sequence.responseSeat??sequence.candidateSeat,responseSeat);
    assert.equal(sequence.responseTurn??sequence.candidateTurn,responseTurn);
    if(reply.prizeTakingSlot!==undefined){
      assert.equal(sequence.prizeTakingSlot,reply.prizeTakingSlot);
    }
    if(reply.responseSlot!==undefined){
      assert.equal(sequence.responseSlot,reply.responseSlot);
    }
    if(reply.prizeTakingSeat!==undefined){
      assert.equal(sequence.prizeTakingSeat,reply.prizeTakingSeat);
    }
    if(reply.responsePlayerId!==undefined){
      assert.equal(sequence.responsePlayerId,reply.responsePlayerId);
    }
    const prizeRoots=sequence.prizeTakingRootOrdinals??
      sequence.sourcePrizeRootOrdinals;
    assert.ok(prizeRoots.includes(prizeTakingRootOrdinal),
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
          action.rootOrdinal===firstResponseRootOrdinal)??null
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
