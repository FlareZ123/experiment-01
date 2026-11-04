'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runIssue25InnerPrizeV12}=
  require('./agent20-issue25-inner-prize-recovery-v12.cjs');
const {withOwnerFirstPrizeReveal}=
  require('../twinleaf/agent21-owner-first-prize-reveal.cjs');
const {withActorOnlyChoosePokemon}=
  require('../twinleaf/agent8-actor-only-choose-pokemon.cjs');
const {chooseChargedOwnPromotion}=
  require('../twinleaf/agent1-charged-promotion-choice.cjs');

const VERSION='agent20-issue25-inner-prize-and-source-promotion-v13';
const SOURCE='simulation/evaluation/agent20-issue25-inner-prize-promotion-v13.cjs';
const ROOT=path.resolve(__dirname,'../..');
const sha256=value=>createHash('sha256').update(value).digest('hex');

/**
 * Chain two previously established owner-facing selectors at the SAME
 * actual native Store boundary under v12's reversible runMatch export
 * patch. Prize choice owns the concealed physical Prize-zone indices.
 * ActorChoosePokemon presents only public board and the acting owner's
 * own legal Pokémon targets and validates against real pinned Store.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{prize?:(f:Function)=>{result:T,audit:object},
 *   pokemon?:(f:Function,options:object)=>{result:T,audit:object}}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPrizeAndPromotion(execute,deps={}){
  assert.equal(typeof execute,'function');
  const prize=deps.prize??withOwnerFirstPrizeReveal;
  const pokemon=deps.pokemon??withActorOnlyChoosePokemon;
  assert.equal(typeof prize,'function');
  assert.equal(typeof pokemon,'function');
  let prizeAudit=null;
  const playWithPrize=()=>{
    try{
      const outcome=prize(execute);
      prizeAudit=outcome.audit;
      return outcome.result;
    }catch(error){
      prizeAudit=error?.agent21OwnerPrizeAudit??null;
      throw error;
    }
  };
  try{
    const outcome=pokemon(playWithPrize,{choose:chooseChargedOwnPromotion});
    return {result:outcome.result,audit:{
      version:VERSION,
      ownerPrize:prizeAudit,
      ownerPromotion:outcome.audit,
      bothOwnerVisible:true,
      competitiveGamesQualified:0
    }};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent21OwnerPrizeAudit={
        version:VERSION,
        ownerPrize:prizeAudit,
        ownerPromotion:'UNRESOLVED_NO_COMPLETED_AUDIT',
        competitiveGamesQualified:0
      };
    throw error;
  }
}

/**
 * Same 8 frozen source-deal original-sixty arms. Compare against the
 * unaltered v6 first 25 action SHA; any new Source reply is native-only.
 *
 * @param {{runner?:Function,ownerPrizeChoice?:Function}} [deps]
 * @returns {object}
 */
function runIssue25PrizeAndPromotionV13(deps={}){
  let nativeRows=null;
  const nativeRunner=deps.runner??require('./agent1-issue25-mirrored-r6-r11-v6.cjs')
    .runMirroredIssue25V6;
  const runner=()=>{
    const result=nativeRunner();
    nativeRows=result.rawDevelopment?.rows??null;
    return result;
  };
  const full=runIssue25InnerPrizeV12({
    runner,
    ownerPrizeChoice:deps.ownerPrizeChoice??withOwnerPrizeAndPromotion
  });
  const targetId='11:102:A:champion-reference';
  const row=nativeRows?.find(r=>(r?.trial?.id??r?.id)===targetId);
  const roots=row?.rootActionLedger??null;
  const publicRootWindow=roots?.filter(r=>
    r.actionOrdinal>=20&&r.actionOrdinal<=Math.min(roots.length-1,37))??null;
  const prizePrompt=full.innerPrizeNativeAudit.nativePrizePrompts.find(r=>
    r.nativeMatchLabel?.endsWith(targetId));
  const target=full.comparedById.find(r=>r.id===targetId);
  return {
    schema:VERSION,
    sourceBranch:'research/agent20-issue25-inner-prize-recovery-20261104',
    sourceCodeSha256:sha256(fs.readFileSync(path.join(ROOT,SOURCE))),
    originalEightV6Reference:full.originalRegistration,
    v12InnerPrizeBaselineRun:41930421605,
    samePhysicalSourceDeals:full.sameSourceDealCount,
    sameFullPhysicalDeals:full.sameFullDealCount,
    originalRoot25PrefixPreserved:full.root25PrefixReproduced,
    sourceRank11Target:{
      ...target,
      ownerAudit:prizePrompt?.ownerPrizeAudit??null,
      publicRootWindow,
      lastAcceptedRoot:roots?.at(-1)??null,
      disposition:full.actualAttempts.find(r=>r.id===targetId)??null
    },
    allEightAttemptDispositions:full.actualAttempts,
    innerNativeOwnerAudits:full.innerPrizeNativeAudit.nativePrizePrompts,
    nativeErrorCount:full.nativeErrors,
    nativeFinishedCount:full.nativeFinished,
    policyPin:full.manifest?.version??null,
    qualifiedGames:0,
    gameStrengthClaimsSupported:false
  };
}

module.exports={VERSION,withOwnerPrizeAndPromotion,runIssue25PrizeAndPromotionV13};
