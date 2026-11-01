'use strict';
const assert=require('node:assert/strict');

const SAMPLE_LIMIT=48;
const VERSION='agent33-native-coheld-positive-witness-retention-v1';

/**
 * Aggregate a genuine same-root native Plumeria/Team Flare canPlay witness.
 * The first genuine positive, negative and error witness are retained in
 * separate slots, independent of the bounded general sample.
 * This is one per-game audit, not an independent-game counter.
 * @param {object} audit Mutable research-only source-arm audit.
 * @param {object} witness Native root eligibility receipt.
 */
function retainNativeCoheldWitness(audit,witness){
  assert.ok(audit&&witness);
  assert.ok(Array.isArray(audit.nativeCoheldDenialCanPlayWitnesses));
  const positive=witness.bothHaveNativePlayablePhysicalCopy===true;
  const all=[...(witness.plumeria??[]),...(witness.teamFlare??[])];
  const errored=all.some(row=>row.error!==null&&row.error!==undefined);
  audit.nativeCoheldDenialCanPlayRoots++;
  if(positive){
    audit.nativeCoheldDenialBothPlayableRoots++;
    if(audit.nativeCoheldDenialFirstPositiveWitness===null)
      audit.nativeCoheldDenialFirstPositiveWitness=witness;
  }else if(!errored&&audit.nativeCoheldDenialFirstNegativeWitness===null){
    audit.nativeCoheldDenialFirstNegativeWitness=witness;
  }
  if(errored){
    audit.nativeCoheldDenialNativeCanPlayErrorRoots++;
    if(audit.nativeCoheldDenialFirstErrorWitness===null)
      audit.nativeCoheldDenialFirstErrorWitness=witness;
  }
  if(audit.nativeCoheldDenialCanPlayWitnesses.length<SAMPLE_LIMIT){
    audit.nativeCoheldDenialCanPlayWitnesses.push(witness);
  }else{
    audit.nativeCoheldDenialExamplesTruncated=true;
    if(positive)audit.nativeCoheldDenialPositiveExamplesTruncated=true;
    if(errored)audit.nativeCoheldDenialErrorExamplesTruncated=true;
  }
  audit.nativeCoheldDenialPositiveWitnessMissing=
    audit.nativeCoheldDenialBothPlayableRoots>0&&
    audit.nativeCoheldDenialFirstPositiveWitness===null;
}

module.exports={SAMPLE_LIMIT,VERSION,retainNativeCoheldWitness};
