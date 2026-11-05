'use strict';

const assert=require('node:assert/strict');
const {withOwnerFirstPrizeReveal}=
  require('../twinleaf/agent21-owner-first-prize-reveal.cjs');
const {withActorOnlyChoosePokemon}=
  require('../twinleaf/agent8-actor-only-choose-pokemon.cjs');
const {chooseChargedOwnPromotion}=
  require('../twinleaf/agent1-charged-promotion-choice.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runStewardSelectedIssue25V4}=
  require('./agent36-issue25-steward-selected-v4.cjs');

const VERSION='agent36-issue25-steward-owner-prize-promotion-v5-retro';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/twinleaf/agent21-owner-first-prize-reveal.cjs',
  'simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs',
  'simulation/twinleaf/agent1-charged-promotion-choice.cjs',
  'tests/agent36-issue25-steward-innermost-prize-v5.test.cjs',
  'tests/agent36-issue25-steward-innermost-prize-v5.native.test.cjs'
]);

/**
 * Add two existing, narrowly guarded owner prompt actions at the innermost
 * native Store boundary. This is necessary because the canonical common
 * decoder can mask an outer wrapper installed before runMatch.
 *
 * The native wrapper is reversible; no upstream/vendor file is edited.
 * Each source registration retains native error/cap status on failure.
 *
 * @template T
 * @param {()=>T} next Synchronous pinned native game batch.
 * @param {{headless?:{runMatch:Function},prize?:Function,pokemon?:Function,
 *   choose?:Function}} [deps] Pure injection or actual pinned environment.
 * @returns {{result:T,audit:object}}
 */
function withStewardInnermostOwnerPrompts(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const prize=deps.prize??withOwnerFirstPrizeReveal;
  const pokemon=deps.pokemon??withActorOnlyChoosePokemon;
  const choose=deps.choose??chooseChargedOwnPromotion;
  const prior=headless.runMatch;
  assert.equal(typeof prior,'function');
  assert.equal(typeof prize,'function');
  assert.equal(typeof pokemon,'function');
  assert.equal(typeof choose,'function');
  const attempts=[];

  function runMatchWithOwnerPrompts(request){
    assert.ok(request&&typeof request==='object');
    const id=request.label??null;
    let prizeAudit=null;
    const executeWithPrize=()=>{
      try{
        const selected=prize(()=>prior(request));
        prizeAudit=selected.audit;
        return selected.result;
      }catch(error){
        prizeAudit=error?.agent21OwnerPrizeAudit??null;
        throw error;
      }
    };
    try{
      const selected=pokemon(executeWithPrize,{choose});
      attempts.push({
        nativeMatchLabel:id,status:'returned-unqualified',
        ownerPrizeAudit:prizeAudit,
        ownerPokemonAudit:selected.audit??null,
        qualifiedGames:0
      });
      return selected.result;
    }catch(error){
      attempts.push({
        nativeMatchLabel:id,status:'engine-aborted-unqualified',
        ownerPrizeAudit:prizeAudit,
        ownerPokemonAudit:null,
        qualifiedGames:0
      });
      throw error;
    }
  }
  headless.runMatch=runMatchWithOwnerPrompts;
  try{
    return {result:next(),audit:{
      version:VERSION,
      nativeMatchCalls:attempts.length,
      nativeMatchAttempts:attempts,
      sharedOwnerPromptSelectionBothSeats:true,
      prizeFacesReadBySelector:false,
      nativePrizeTransferPhysicallyCertified:false,
      competitiveGamesQualified:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,runMatchWithOwnerPrompts,
      'Concurrent native runMatch patch replaced the selected owner handler');
    headless.runMatch=prior;
  }
}

/**
 * Retrospective treatment of the frozen selected v4 original-eight contexts.
 * The sole treatment is the source-independent native Prize and Pokémon
 * prompt continuation. This experiment is development-only.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function,
 *   innerLayer?:Function}} [deps] Pure test injection.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runStewardInnermostPrizeV5(deps={}){
  const layer=deps.innerLayer??withStewardInnermostOwnerPrompts;
  assert.equal(typeof layer,'function');
  const wrapped=layer(()=>runStewardSelectedIssue25V4({
    ...(deps.runner?{runner:deps.runner}:{}),
    ...(deps.layers?{layers:deps.layers}:{}),
    ...(deps.attackLayer?{attackLayer:deps.attackLayer}:{})
  }));
  const selected=wrapped.result;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'retro-v4-eight-registered-source-pairs-48root-owner-prize-promotion',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    addedNativePromptLayer:'innermost-owner-prize-and-pokemon',
    nativePromptActorPolicy:'same-guarded-choice-both-physical-seats',
    sourceIndependentCommonPolicy:true,
    nativePrizeTransferPhysicallyCertified:false,
    comparisonType:'retrospective-same-printed-sixties-source-deal-audit',
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    innerNativeOwnerPromptAudit:wrapped.audit,
    verdict:'FAIL-retrospective-native-liveness-only',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,EXTRA_HASH_PATHS,withStewardInnermostOwnerPrompts,
  runStewardInnermostPrizeV5};
