'use strict';

const assert=require('node:assert/strict');
const {createFundedPerfectionPassSampler}=require('./agent24-funded-perfection-postpass-stratum.cjs');

const DEEP_CLONE_IMPLEMENTATION='Twinleaf ptcg-server output/utils/utils.deepClone';

/**
 * Redact arbitrary engine exception strings. Such strings can contain card
 * identities from hidden zones even when the probe itself is post-choice.
 * @param {object|null|undefined} probe
 * @returns {object|null}
 */
function sanitizePostPassProbe(probe) {
  if(!probe||typeof probe!=='object')return null;
  const rejectionPresent=typeof probe.rejection==='string';
  const auditErrorPresent=typeof probe.auditError==='string';
  return {
    evidenceType:probe.evidenceType??null,
    sourceEligibility:probe.sourceEligibility??null,
    playerId:probe.playerId??null,
    activePokemon:probe.activePokemon??null,
    publicCopySourceInventory:probe.publicCopySourceInventory??null,
    activationAccepted:probe.activationAccepted??null,
    choicePromptObserved:probe.choicePromptObserved??null,
    pendingPromptType:probe.pendingPromptType??null,
    validAttackSources:probe.validAttackSources??[],
    validAttackNames:probe.validAttackNames??[],
    scope:probe.scope??null,
    rejectionPresent,
    auditErrorPresent,
    errorCategory:rejectionPresent||auditErrorPresent?
      'native-detached-probe-error':null
  };
}

/**
 * @param {object|null|undefined} probe
 * @returns {object|null}
 */
function sanitizeHeldTelepathProbe(probe) {
  if(!probe||typeof probe!=='object')return null;
  const rejectionPresent=typeof probe.nativeRejection==='string';
  return {
    schema:probe.schema??null,
    activePokemon:probe.activePokemon??null,
    heldPrinting:probe.heldPrinting??null,
    openBenchSlots:probe.openBenchSlots??null,
    nativeAccepted:probe.nativeAccepted??null,
    physicalEnergyAttached:probe.physicalEnergyAttached??null,
    unresolvedPromptTypes:probe.unresolvedPromptTypes??null,
    nativeRejectionPresent:rejectionPresent,
    errorCategory:rejectionPresent?'native-attachment-rejected':null,
    note:probe.note??null
  };
}

/**
 * @param {object} finalPass
 * @returns {object|null}
 */
function sanitizeFinalPass(finalPass) {
  if(!finalPass||typeof finalPass!=='object')return null;
  return {
    ordinal:finalPass.ordinal??null,
    turn:finalPass.turn??null,
    ownerHandAfterDecision:finalPass.ownerHandAfterDecision??null,
    publicBoardBeforePass:finalPass.publicBoardBeforePass??null,
    printedBasicEnergyBeforePass:finalPass.printedBasicEnergyBeforePass??null,
    postChoiceAttackProbe:sanitizePostPassProbe(
      finalPass.postChoiceAttackProbe),
    clonedHeldTelepathActiveAttachment:sanitizeHeldTelepathProbe(
      finalPass.clonedHeldTelepathActiveAttachment)
  };
}

/**
 * @param {object} sample
 * @param {number} seat
 * @param {number} turnBefore
 * @returns {object}
 */
function sanitizeSample(sample,seat,turnBefore) {
  return {
    schema:sample.schema??null,
    actionOrdinal:sample.actionOrdinal,
    actorPlayerId:sample.actorPlayerId,
    eligible:true,
    reason:sample.reason??null,
    donorCount:sample.donorCount??0,
    energyCards:sample.energyCards??0,
    detachedMenu:sanitizePostPassProbe(sample.detachedMenu),
    optionPaperAffordabilityCertified:false,
    ownerEligibilityFilterReadsOpponentHiddenZones:false,
    detachedNativeProbeUsesFullStateClone:true,
    hiddenInformationIndependenceCertified:false,
    livePolicyChangedByObserver:false,
    note:sample.note??null,
    seat,
    turnBefore
  };
}

/**
 * Capture a detached pre-dispatch state for real PassTurnAction roots, then
 * run Agent24's post-choice funded-Perfection probe from the matching native
 * root callback. Twinleaf Store dispatch mutates its state in place, so the
 * clone must be made before calling the original dispatch method.
 *
 * @param {{
 *   Store:Function,
 *   deepClone?:(state:object)=>object,
 *   deepCloneImplementation?:string,
 *   maxRecords?:number,
 *   samplerFactory?:Function
 * }} options
 */
function createFundedPerfectionPassObserver({
  Store,
  deepClone,
  deepCloneImplementation=DEEP_CLONE_IMPLEMENTATION,
  maxRecords=4,
  samplerFactory=createFundedPerfectionPassSampler
}={}) {
  assert.ok(Store?.prototype&&typeof Store.prototype.dispatch==='function',
    'Twinleaf Store class is required');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor&&typeof descriptor.value==='function',
    'Twinleaf Store.prototype.dispatch must be a data method');
  const originalDispatch=descriptor.value;
  const cloneState=deepClone??require(
    '../../vendor/twinleaf/ptcg-server/output/utils/utils.js').deepClone;
  assert.equal(typeof cloneState,'function',
    'Pinned Twinleaf utils.deepClone is required');
  const beforeByAction=new WeakMap();
  const cloneErrorByAction=new WeakSet();
  const sampler=samplerFactory({maxRecords});
  assert.ok(typeof sampler.observe==='function'&&
    typeof sampler.summary==='function',
  'Funded Perfection sampler must expose observe and summary');

  let installed=false;
  let passRootCount=0;
  let missingPreStateCount=0;
  let preDispatchCloneErrorCount=0;
  const records=[];

  function install() {
    assert.equal(installed,false,'Funded Perfection observer is already installed');
    Object.defineProperty(Store.prototype,'dispatch',{
      ...descriptor,
      value:function dispatchWithDetachedPrePassCapture(action,...args) {
        if(action?.constructor?.name==='PassTurnAction') {
          try {
            beforeByAction.set(action,cloneState(this.state));
          } catch {
            cloneErrorByAction.add(action);
          }
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
      if(cloneErrorByAction.has(action))preDispatchCloneErrorCount++;
      else missingPreStateCount++;
      cloneErrorByAction.delete(action);
      return null;
    }
    const owner=before.players?.[seat];
    assert.ok(owner?.id,'Pass root must identify its physical-seat owner');
    const sample=sampler.observe(before,owner.id,'PassTurnAction',actionOrdinal);
    if(sample)records.push(sanitizeSample(sample,seat,turnBefore));
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
      preDispatchCloneErrorCount,
      preDispatchStateDetached:true,
      deepCloneImplementation,
      ownerEligibilityFilterReadsOpponentHiddenZones:false,
      detachedNativeProbeUsesFullStateClone:true,
      hiddenInformationIndependenceCertified:false,
      livePolicyChangedByObserver:false,
      optionPaperAffordabilityCertified:false,
      records:records.slice(),
      sampler:sampler.summary()
    };
  }

  return {install,restore,onRootActionDispatched,summary};
}

module.exports={createFundedPerfectionPassObserver,sanitizePostPassProbe,
  sanitizeHeldTelepathProbe,sanitizeFinalPass,sanitizeSample};
