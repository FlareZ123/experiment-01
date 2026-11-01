'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const VERSION='agent27-dual-pass-same-root-shadow-choice-v1';

/** Return the physical fields exposed in the existing same-root offer receipt. */
function physicalKey(row){
  const kind=row.kind;
  const slot=row.slot??(kind==='bench-basic'?'bench':null);
  const index=row.index??row.benchIndex??null;
  return JSON.stringify({kind,printing:row.printing??null,
    handIndex:row.handIndex??null,attackName:row.attackName??null,
    slot,index,
    discardPrinting:row.proposedDiscardPrinting??row.discardPrinting??null,
    discardIndex:row.proposedDiscardIndex??row.discardSourceIndex??null});
}

/**
 * Run guarded selection, independent shadow, and guarded selection on the SAME
 * immutable owner observation. No native State or Store is supplied.
 * This certifies shadow noninterference and offer membership, not native canPlay or
 * whether the selected action settles or earns a Prize.
 *
 * @param {object} view Detached acting-player observation.
 * @param {object} catalog Public printing catalog.
 * @param {object} baseline Existing first-return intent.
 * @param {object} options One frozen option map for both passes.
 * @param {Function} [chooser] Existing collectAndChooseOwnerRoot, or test seam.
 * @returns {object} Two full receipts and a fail-closed membership/noninterference audit.
 */
function reconcileShadowAndChoice(view,catalog,baseline,options={},chooser){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(baseline&&typeof baseline.kind==='string');
  assert.ok(options&&typeof options==='object');
  const evaluate=chooser??require('./agent41-same-root-proposal-choice.cjs')
    .collectAndChooseOwnerRoot;
  assert.equal(typeof evaluate,'function');
  const viewBefore=structuredClone(view);
  const catalogBefore=structuredClone(catalog);
  const baselineBefore=structuredClone(baseline);
  const optionsBefore=structuredClone(options);
  const digest=createHash('sha256').update(JSON.stringify(viewBefore)).digest('hex');

  // Measure selection before the broad shadow pass to detect module-global
  // state or cache contamination that deep-equal owner checks cannot see.
  const preSelection=evaluate(view,catalog,baseline,{
    ...options,sameRootProbeAll:false,sameRootChoiceApply:true});
  assert.deepStrictEqual(view,viewBefore,
    'Pre-shadow selector mutated detached owner view');
  assert.deepStrictEqual(catalog,catalogBefore,
    'Pre-shadow selector mutated catalog');
  assert.deepStrictEqual(baseline,baselineBefore,
    'Pre-shadow selector mutated baseline');
  assert.deepStrictEqual(options,optionsBefore,
    'Pre-shadow selector mutated options');
  assert.equal(preSelection?.receipt?.mode,'select');
  const shadow=evaluate(view,catalog,baseline,{
    ...options,sameRootProbeAll:true,sameRootChoiceApply:false});
  assert.deepStrictEqual(view,viewBefore,'Shadow observer mutated detached owner view');
  assert.deepStrictEqual(catalog,catalogBefore,'Shadow observer mutated catalog');
  assert.deepStrictEqual(baseline,baselineBefore,'Shadow observer mutated baseline');
  assert.deepStrictEqual(options,optionsBefore,'Shadow observer mutated options');
  assert.equal(shadow?.receipt?.mode,'all-proposers-observe');
  assert.deepStrictEqual(shadow.intent,baseline,
    'Read-only observer changed the real first-return action');
  assert.ok(Array.isArray(shadow.receipt.offers));

  const selected=evaluate(view,catalog,baseline,{
    ...options,sameRootProbeAll:false,sameRootChoiceApply:true});
  assert.deepStrictEqual(view,viewBefore,'Selector mutated detached owner view');
  assert.deepStrictEqual(catalog,catalogBefore,'Selector mutated catalog');
  assert.deepStrictEqual(baseline,baselineBefore,'Selector mutated baseline');
  assert.deepStrictEqual(options,optionsBefore,'Selector mutated options');
  assert.equal(selected?.receipt?.mode,'select');
  assert.ok(selected.intent&&typeof selected.intent.kind==='string');
  assert.ok(Array.isArray(selected.receipt.offers));
  assert.deepStrictEqual(selected,preSelection,
    'All-proposer shadow changed a later same-root executable decision');
  const selectedKey=physicalKey(selected.intent);
  const selectedVisible=selected.receipt.offers.some(row=>
    row.source===selected.receipt.selectedSource&&
    physicalKey(row)===selectedKey);
  assert.ok(selectedVisible,
    'Selector intent absent from its own executable-mode physical offers');
  const inShadow=shadow.receipt.offers.some(row=>
    physicalKey(row)===selectedKey);
  assert.ok(inShadow,
    'Selected physical action absent from all-proposer same-view shadow');
  const incompletePaymentDetail=selected.intent.kind==='play-plumeria-payment-menu';
  return {
    version:VERSION,ownerObservationSha256:digest,
    shadowReceipt:shadow.receipt,selectionReceipt:selected.receipt,
    selectedIntent:selected.intent,
    verification:{
      sameDetachedOwnerView:true,
      prePostShadowExecutableDecisionIdentical:true,
      selectedPhysicalOfferInShadow:true,
      selectedPhysicalOfferInExecutableMode:true,
      selectedPayloadFullyRepresented:!incompletePaymentDetail,
      nativeCanPlayVerified:false,
      nativeStoreAccepted:false,
      promptsSettled:false,
      opposingReplyVerified:false,
      competitiveQualified:false
    }
  };
}
/**
 * Optional complete same-kind final Bench opportunity in the independent
 * shadow and executable-offer censuses. Native dispatch remains prohibited
 * for this injected offer, even if it is the first in the owner's hand.
 *
 * @param {object} view
 * @param {object} catalog
 * @param {object} baseline
 * @param {object} [options]
 * @returns {object} Same-root receipts with one additional observer family.
 */
function reconcileIncludingLastBench(view,catalog,baseline,options={}){
  const {PROPOSERS,collectAndChooseOwnerRoot}=
    require('./agent41-same-root-proposal-choice.cjs');
  const {lastBenchShadowProposer}=
    require('./agent27-owner-lastbench-basic-conflict.cjs');
  const proposerFamilies=[...PROPOSERS,lastBenchShadowProposer()];
  const chooser=(v,c,b,o)=>collectAndChooseOwnerRoot(
    v,c,b,o,proposerFamilies);
  return reconcileShadowAndChoice(view,catalog,baseline,
    {...options,agent27LastBenchShadow:true},chooser);
}
module.exports={VERSION,physicalKey,reconcileShadowAndChoice,
  reconcileIncludingLastBench};
