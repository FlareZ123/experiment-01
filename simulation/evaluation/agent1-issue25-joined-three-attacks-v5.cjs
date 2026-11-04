'use strict';

const assert = require('node:assert/strict');
const {hashRegisteredFile} = require('./agent36-issue25-selected-v0.cjs');
const {
  withJoinedOwnerAttackFrontier, runJoinedIssue25V4
} = require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
const {withSourceStampedGetLostOwner} =
  require('../twinleaf/agent36-source-stamped-getlost-owner.cjs');

const VERSION='agent1-issue25-symmetric-three-source-stamped-attacks-v5-development';
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs',
  'simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs',
  'tests/agent36-source-stamped-getlost-owner.test.cjs',
  'tests/agent1-issue25-joined-three-attacks-v5.test.cjs',
  'tests/agent1-issue25-joined-three-attacks-v5.native.test.cjs'
];

/**
 * Join source-identified public Get Lost with the existing source-identified
 * Night Watch and Future Sight. Zero/one/two physical discard cards are
 * selected only by the printed Get Lost origin hook and native Store validates
 * the repaired card-count prompt. First-two public cards is a tactical
 * development baseline, not a competitively strong choice policy.
 *
 * @template T
 * @param {()=>T} next
 * @param {{
 *   joinedAttackLayer?:(f:Function)=>{result:T,audit:object},
 *   getLostLayer?:(f:Function,options:object)=>{result:T,audit:object}
 * }} [deps]
 * @returns {{result:T,audit:object}}
 */
function withThreePrintedOwnerAttackFrontiers(next,deps={}){
  assert.equal(typeof next,'function');
  const joined=deps.joinedAttackLayer??withJoinedOwnerAttackFrontier;
  const getLost=deps.getLostLayer??withSourceStampedGetLostOwner;
  assert.equal(typeof joined,'function');
  assert.equal(typeof getLost,'function');
  let getLostAudit=null;
  const selected=joined(()=>{
    const settled=getLost(next,{followSequentialNativeStores:true});
    getLostAudit=settled.audit;
    return settled.result;
  });
  return {result:selected.result,audit:{
    ...selected.audit,
    sourceStampedGetLost:getLostAudit,
    getLostPublicDiscardSelection:'first-available-up-to-two',
    getLostCountRepairScope:'only printed Girafarig LOT Get Lost',
    paperEffectCoverageComplete:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Distinct running development-v5 closure. Preserve v4 results and use the
 * same preregistered original four attempts and 48-root limit. No rank/seat
 * specific source strategy is restored, and no result is classified as a win.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 */
function runJoinedIssue25V5(deps={}){
  const attackLayer=deps.attackLayer??withThreePrintedOwnerAttackFrontiers;
  const selected=runJoinedIssue25V4({
    runner:deps.runner,layers:deps.layers,attackLayer
  });
  const attack=selected.diagnostic.audit?.firstBlockedPromptEnvelope??null;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'historical-four-original-arms-48root-symmetric-3-printed-attacks-v5',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    selectedOuterToInner:[
      ...selected.manifest.selectedOuterToInner.slice(0,-1),
      'sourceStampedGetLostPublicDiscardChoice',
      'canonicalActorCommonRunner'
    ],
    sourceStampedGetLostSelected:true,
    getLostPublicDiscardChoice:'first-available-up-to-two',
    getLostPaperEffectGloballyCertified:false,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    sourceStampedGetLost:attack?.sourceStampedGetLost??null,
    joinedPrintedAttackCount:3,
    verdict:'FAIL-full-paper-player-policy-and-match-admission-unproven',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,EXTRA_HASH_PATHS,
  withThreePrintedOwnerAttackFrontiers,runJoinedIssue25V5};
