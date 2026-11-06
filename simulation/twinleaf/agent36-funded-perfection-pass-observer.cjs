'use strict';

const assert=require('node:assert/strict');
const {createFundedPerfectionPassSampler}=require('./agent24-funded-perfection-postpass-stratum.cjs');

/**
 * Capture the immutable pre-dispatch state for real PassTurnAction roots, then
 * run Agent24's detached funded-Perfection probe from the matching native root
 * callback. The probe is observational and never changes the live action.
 *
 * @param {{
 *   Store:Function,
 *   maxRecords?:number,
 *   samplerFactory?:Function
 * }} options
 */
function createFundedPerfectionPassObserver({
  Store,
  maxRecords=4,
  samplerFactory=createFundedPerfectionPassSampler
}={}) {
  assert.ok(Store?.prototype&&typeof Store.prototype.dispatch==='function',
    'Twinleaf Store class is required');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor&&typeof descriptor.value==='function',
    'Twinleaf Store.prototype.dispatch must be a data method');
  const originalDispatch=descriptor.value;
  const beforeByAction=new WeakMap();
  const sampler=samplerFactory({maxRecords});
  assert.ok(typeof sampler.observe==='function'&&
    typeof sampler.summary==='function',
  'Funded Perfection sampler must expose observe and summary');

  let installed=false;
  let passRootCount=0;
  let missingPreStateCount=0;
  const records=[];

  function install() {
    assert.equal(installed,false,'Funded Perfection observer is already installed');
    Object.defineProperty(Store.prototype,'dispatch',{
      ...descriptor,
      value:function dispatchWithPrePassCapture(action,...args) {
        if(action?.constructor?.name==='PassTurnAction') {
          beforeByAction.set(action,this.state);
        }
        return originalDispatch.apply(this,[action,...args]);
      }
    });
    installed=true;
  }

  /**
   * Callback contract matches Twinleaf headless onRootActionDispatched.
   * @param {object} store
   * @param {object} action
   * @param {number} actionOrdinal
   * @param {number} seat
   * @param {number} turnBefore
   * @returns {object|null}
   */
  function onRootActionDispatched(store,action,actionOrdinal,seat,turnBefore) {
    if(action?.constructor?.name!=='PassTurnAction') return null;
    passRootCount++;
    const before=beforeByAction.get(action);
    beforeByAction.delete(action);
    if(!before) {
      missingPreStateCount++;
      return null;
    }
    const owner=before.players?.[seat];
    assert.ok(owner?.id,'Pass root must identify its physical-seat owner');
    const sample=sampler.observe(before,owner.id,'PassTurnAction',actionOrdinal);
    if(sample) records.push({...sample,seat,turnBefore});
    return sample;
  }

  function restore() {
    if(!installed) return;
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
    installed=false;
  }

  function summary() {
    return {
      passRootCount,
      missingPreStateCount,
      records:records.slice(),
      sampler:sampler.summary()
    };
  }

  return {install,restore,onRootActionDispatched,summary};
}

module.exports={createFundedPerfectionPassObserver};
