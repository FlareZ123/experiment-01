'use strict';

const assert=require('node:assert/strict');
const {PRINTS,summarizeCopycatInitialPhysicalZones}=
  require('./agent6-copycat-source-zone-observer.cjs');

/**
 * Sidecar for an *exact* final, valid seven-card starting hand and six Prizes.
 * Observe the real source player's Choose Starting Pokemon prompt BEFORE any
 * setup placement or compensation, then the first stable turn-1 PLAYER_TURN
 * Store root BEFORE the first ordinary player action. Never expose to a bot.
 *
 * @param {0|1} sourceSeat Real physical source player slot.
 * @param {3|4} sourceVCount Printed count of Shadow Rider Calyrex V.
 * @param {string|number} startingMessage Engine's CHOOSE_STARTING_POKEMONS value.
 * @returns {object}
 */
function createOriginalSevenCopycatCapture(sourceSeat,sourceVCount,startingMessage) {
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(sourceVCount===3||sourceVCount===4);
  assert.ok(startingMessage!==null&&startingMessage!==undefined);
  let store=null;
  let exactSeven=null;
  let postsetup=null;
  let constructed=null;
  let dispatches=0;
  let setupSelectionObservations=0;
  let detached=false;
  return Object.freeze({
    onRootStoreCreated(realStore) {
      assert.equal(store,null,'one actual Store per copycat start-hand capture');
      assert.equal(typeof realStore?.dispatch,'function');
      store=realStore;
      const previous=realStore.dispatch;
      realStore.dispatch=function(...args) {
        dispatches++;
        const state=realStore.state;
        const source=state?.players?.[sourceSeat];
        const pending=state?.prompts?.find(p=>p.result===undefined);
        if(pending?.message===startingMessage &&
          source && pending.playerId===source.id) {
          setupSelectionObservations++;
          const hand=source.hand?.cards;
          assert.ok(Array.isArray(hand));
          assert.equal(hand.length,7,'source setup selection must see original seven');
          if(exactSeven===null) {
            exactSeven=Object.freeze({
              size:hand.length,
              namedInHand:Object.freeze(Object.fromEntries(
                ['mimikyu','dialga','ball','seal'].map(role=>[role,
                  hand.filter(c=>c.fullName===PRINTS[role]).length===1]))),
              shadowRiderVCount:hand.filter(c=>c.fullName===PRINTS.shadowRiderV).length
            });
          }
        }
        if(state?.phase===2&&state.turn===1&&
          (state.prompts??[]).every(p=>p.result!==undefined)) {
          assert.ok(exactSeven,'No valid seven-card hand seen at source starting prompt');
          postsetup=summarizeCopycatInitialPhysicalZones(state,sourceSeat,sourceVCount);
          const originalZone={};
          for(const role of ['mimikyu','dialga','ball','seal']) {
            if(exactSeven.namedInHand[role]) {
              assert.notEqual(postsetup.physicalLocations[role],'prizes',
                'A named card from original seven cannot become an initial Prize');
              originalZone[role]='hand';
            } else if(postsetup.physicalLocations[role]==='prizes') {
              originalZone[role]='prizes';
            } else {
              originalZone[role]='deck';
            }
          }
          const corePrized=Number(originalZone.mimikyu==='prizes')+
            Number(originalZone.dialga==='prizes');
          constructed=Object.freeze({
            schema:'copycat-source-exact-seven-prizes-v1',
            sourceSeat,
            initialSeven:Object.freeze({...exactSeven}),
            originalTaggedZones:Object.freeze(originalZone),
            exactInitialSevenComparable:true,
            oneCorePrizedBallDeck:corePrized===1&&originalZone.ball==='deck',
            directInitialSealAndV:corePrized===1&&originalZone.ball==='deck'&&
              originalZone.seal==='hand'&&exactSeven.shadowRiderVCount>0,
            postsetupTaggedZones:postsetup.physicalLocations,
            postsetupObserverOnly:true,
            includesHiddenSourcePrizeIdentities:true,
            excludedFromBothLiveDecisionPolicies:true
          });
          realStore.dispatch=previous;
          detached=true;
        }
        return previous.apply(this,args);
      };
    },
    result(){return constructed;},
    audit(){return Object.freeze({actualStoreBound:store!==null,
      originalSevenCaptured:exactSeven!==null,
      sourceStartingPromptsSeen:setupSelectionObservations,
      realDispatchesThroughSnapshot:dispatches,
      exactSevenAndSixPrizeCaptured:constructed!==null,
      instanceWrapperDetached:detached});}
  });
}

module.exports={createOriginalSevenCopycatCapture};
