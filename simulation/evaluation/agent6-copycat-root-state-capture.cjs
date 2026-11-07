'use strict';

const assert = require('node:assert/strict');
const {createCopycatInitialPhysicalObserver} =
  require('./agent6-copycat-source-zone-observer.cjs');

/**
 * Capture the actual Store's first stable turn-1 state without changing any
 * action, bot input, game RNG, or a speculative Store. Hook is installed on
 * one instance only and detached before the first normal root dispatch.
 *
 * @param {0|1} sourceSeat Exact source physical seat.
 * @param {3|4} sourceVCount Printed Shadow Rider Calyrex V count.
 * @returns {{onRootStoreCreated:(store:object)=>void,result:()=>object|null,audit:()=>object}}
 */
function createRealStoreCopycatRootCapture(sourceSeat,sourceVCount) {
  const observer=createCopycatInitialPhysicalObserver(sourceSeat,sourceVCount);
  let actualStore=null;
  let scopedCalls=0;
  let attached=false;
  let detached=false;
  return Object.freeze({
    onRootStoreCreated(store) {
      assert.equal(actualStore,null,'A capture binds exactly one actual Store');
      assert.equal(typeof store?.dispatch,'function');
      actualStore=store;
      const dispatch=store.dispatch;
      store.dispatch=function(...args) {
        scopedCalls++;
        const s=store.state;
        if(s.phase===2 && s.turn===1 &&
          (s.prompts??[]).every(p=>p.result!==undefined)) {
          observer.observe(s);
          store.dispatch=dispatch;
          detached=true;
        }
        return dispatch.apply(this,args);
      };
      attached=true;
    },
    result() {return observer.result();},
    audit() {return Object.freeze({actualStoreBound:actualStore!==null,
      instanceWrapperInstalled:attached,instanceWrapperDetached:detached,
      actualStoreDispatchesUntilCapture:scopedCalls,
      captured:observer.result()!==null});}
  });
}

module.exports={createRealStoreCopycatRootCapture};
