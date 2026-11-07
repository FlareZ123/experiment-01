'use strict';

const assert=require('node:assert/strict');
const VERSION='agent2-native-accepted-root-retreat-object-receipt-v1';

/**
 * Bind an owner-selected retreat object to its successful real Store dispatch.
 * Exact object identity, seat, turn and ordinal are necessary.
 * The callback alone does not certify paper legality or physical Energy payment.
 * @returns {object} Composable callbacks and aggregate receipt.
 */
function createPaidRetreatAcceptedRootReceipt(){
  let rootStore=null,bots=null,pending=new WeakMap();
  const audit={version:VERSION,rootStoreRegistrations:0,
    realBotRegistrations:0,selectedProposals:0,
    acceptedNativeProposals:0,invalidNativeJoins:0,receipts:[]};

  function attach(request){
    assert.ok(request&&typeof request==='object');
    const oldStore=request.onRootStoreCreated;
    const oldBots=request.onRootAgentsCreated;
    const oldDispatch=request.onRootActionDispatched;
    for(const fn of [oldStore,oldBots,oldDispatch]){
      if(fn!==undefined)assert.equal(typeof fn,'function');
    }
    return {
      ...request,
      onRootStoreCreated(store){
        oldStore?.(store);
        assert.ok(store?.state&&typeof store.state==='object');
        rootStore=store;
        bots=null;
        pending=new WeakMap();
        audit.rootStoreRegistrations++;
      },
      onRootAgentsCreated(agents){
        oldBots?.(agents);
        assert.ok(rootStore,'actual Store registration required');
        assert.ok(Array.isArray(agents)&&agents.length===2&&
          agents[0]&&agents[1]&&agents[0]!==agents[1]);
        bots=agents.slice();
        audit.realBotRegistrations++;
      },
      onRootActionDispatched(store,action,ordinal,seat,turnBefore){
        oldDispatch?.(store,action,ordinal,seat,turnBefore);
        if(store!==rootStore||!action||!pending.has(action))return;
        const prior=pending.get(action);
        pending.delete(action);
        if(prior.seat!==seat||prior.turn!==turnBefore||
           !Number.isSafeInteger(ordinal)||ordinal<0){
          audit.invalidNativeJoins++;
          return;
        }
        audit.acceptedNativeProposals++;
        audit.receipts.push({actionOrdinal:ordinal,actorSeat:seat,
          turnBefore,actionName:action.constructor?.name??null});
      }
    };
  }

  function onRetreatSelected(bot,action,state,seat){
    assert.ok(action&&typeof action==='object');
    assert.ok(rootStore&&bots&&rootStore.state===state&&
      (seat===0||seat===1)&&bots[seat]===bot,
      'selected action must have genuine Store and bot identity');
    assert.ok(Number.isSafeInteger(state.turn));
    pending.set(action,{seat,turn:state.turn});
    audit.selectedProposals++;
  }

  return {attach,onRetreatSelected,audit};
}

module.exports={VERSION,createPaidRetreatAcceptedRootReceipt};
