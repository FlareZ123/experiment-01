'use strict';

const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const {
  PLANS,compareWonderTagAba
}=require('./agent3-issue25-v15-wondertag-affirm-aba.cjs');
const {runPrechoiceCustodyV8}=
  require('./agent1-issue25-prechoice-input-custody-v8.cjs');
const {buildReceipt}=require('./agent1-issue25-v4-public-receipt.cjs');
const {withJoinedOwnerAttackFrontier}=
  require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
const {withOwnerPokemonOverModalPrize}=
  require('./agent3-issue25-v14-owner-pokemon-aba.cjs');
const {withOwnerWonderTagPrompts}=
  require('../twinleaf/agent8-owner-wondertag-prompt.cjs');
const {withNumericShuffleValidator}=
  require('../twinleaf/agent22-numeric-shuffle-validation-hook.cjs');
const {withPublicSupporterRevealWitness}=
  require('../twinleaf/agent1-native-public-supporter-reveal-witness.cjs');

const VERSION='agent1-issue25-wondertag-shuffle-held-fixed-three-arm-aba-v1';

/**
 * The same native ShuffleDeckPrompt validator and v14 owner baseline wrap
 * every arm. The only policy contrast is owner Lele Wonder Tag confirmation
 * and resulting genuine owner-search settlement when an offer occurs.
 *
 * This does not select a tactical Supporter by value and does not confer
 * full-game or paper competitive admission.
 * @template T
 * @param {()=>T} next
 * @param {{wonderTagYes:boolean,joinedAttackLayer:Function,
 *  numericLayer?:Function,ownerLayer?:Function,sourceLayer?:Function,
 *  publicRevealLayer?:Function}} opts
 * @returns {{result:T,audit:object}}
 */
function withShuffleHeldWonderTag(next,opts){
  assert.equal(typeof next,'function');
  assert.equal(typeof opts?.wonderTagYes,'boolean');
  assert.equal(typeof opts.joinedAttackLayer,'function');
  const numeric=opts.numericLayer??withNumericShuffleValidator;
  const baseline=opts.ownerLayer??withOwnerPokemonOverModalPrize;
  const wonder=opts.sourceLayer??withOwnerWonderTagPrompts;
  const publicReveal=opts.publicRevealLayer??withPublicSupporterRevealWitness;
  for(const layer of [numeric,baseline,wonder,publicReveal])
    assert.equal(typeof layer,'function');
  let wonderAudit=null,publicRevealAudit=null;
  const selected=baseline(()=>numeric(()=>{
    const witnessed=publicReveal(()=>{
      if(!opts.wonderTagYes)return next();
      const result=wonder(next);
      wonderAudit=result.audit;
      return result.result;
    });
    publicRevealAudit=witnessed.audit;
    return witnessed.result;
  }),{joinedAttackLayer:opts.joinedAttackLayer});
  return {result:selected.result,audit:{
    ...selected.audit,
    sourceStampedWonderTagYes:wonderAudit,
    postAcceptedPublicSupporterRevealAudit:publicRevealAudit,
    publicRevealWitnessIdenticalInAllArms:true,
    numericNativeShuffleValidationHookSelected:true,
    allArmsNumericShuffleValidationIdentical:true,
    wonderTagYesOnlyPolicyIntervention:opts.wonderTagYes,
    sourceTacticalSupporterChoiceCertified:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Retrospective replay of eight original Aichi source trial IDs in A/B/A.
 * Source physical deals, seat, protected opening and private Night Watch
 * seed are shared; compare exactly via frozen v13-derived v15 comparator.
 * @returns {object}
 */
function runShuffleHeldWonderTagAba(){
  const seed=randomBytes(32);
  const joinedAttackLayer=next=>withJoinedOwnerAttackFrontier(next,{
    randomBytes:n=>{
      assert.equal(n,32);
      return Buffer.from(seed);
    }
  });
  const campaigns=PLANS.map(plan=>{
    const attackLayer=next=>withShuffleHeldWonderTag(next,{
      wonderTagYes:plan.wonderTagYes,joinedAttackLayer
    });
    const executed=runPrechoiceCustodyV8('protected',{attackLayer});
    const receipt=buildReceipt(executed,{
      policyEntryPoint:
        'simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs'
    });
    const byId=new Map(executed.rawDevelopment.rows.map(row=>
      [row.trial.id,row]));
    assert.equal(byId.size,8);
    for(const row of receipt.attempts)
      row.sourceDealFingerprint=
        byId.get(row.id)?.sourceDealFingerprint??null;
    return {...plan,receipt,
      witness:executed.diagnostic.actualNativePrechoicePhysicalInputs,
      selectedPromptAudit:
        executed.diagnostic.audit?.firstBlockedPromptEnvelope??null};
  });
  const compared=compareWonderTagAba(campaigns);
  const {publicAcceptedRoot}=
    require('./agent3-issue25-v12-public-first-difference.cjs');
  const positiveById=new Map(campaigns[1].receipt.attempts.map(attempt=>
    [attempt.id,attempt]));
  const publicSupporterRevealByArm=campaigns.map(campaign=>
    campaign.selectedPromptAudit?.postAcceptedPublicSupporterRevealAudit??null);
  const nativeOwnerPublicContinuations=compared.rows.filter(row=>
    row.firstPublicRootDifference!==null).map(row=>{
    const attempt=positiveById.get(row.id);
    assert.ok(attempt&&Array.isArray(attempt.publicRootActions));
    assert.equal(attempt.publicRootActionsTruncated,false);
    const start=row.firstPublicRootDifference.zeroBasedRootIndex;
    assert.ok(Number.isSafeInteger(start)&&start>=0);
    const from=Math.max(0,start-2);
    const turn=attempt.publicRootActions[start].turnBefore;
    const sameTurnPublicRootsBeforeSearch=attempt.publicRootActions
      .slice(0,start).filter(action=>action.turnBefore===turn)
      .map(publicAcceptedRoot);
    const publicRoots=attempt.publicRootActions.slice(from,start+21)
      .map(publicAcceptedRoot);
    return {
      id:row.id,sourceRank:row.sourceRank,
      firstDifferentZeroBasedRootIndex:start,
      firstIncludedZeroBasedRootIndex:from,
      precedingSameTurnPublicRoots:sameTurnPublicRootsBeforeSearch,
      upTo21PostDifferenceAcceptedPublicRoots:publicRoots,
      positiveRootActionsComplete:true,
      nativePromptResultPrivacyPreserved:true,
      qualifiedGame:false
    };
  });
  const rows=compared.rows.map(row=>({...row,
    competitivelyQualified:false
  }));
  return {...compared,schema:VERSION,
    comparatorVersionUsed:compared.schema,
    rows,
    allThreeArmsUseSameNumericValidator:true,
    nativeOwnerPublicContinuations,
    postAcceptedPublicSupporterRevealByArm:publicSupporterRevealByArm,
    v15JointTreatmentConfoundRemoved:true,
    experimentalOnly:true,
    certifiedPaperGames:0,
    establishedFieldWinRate:null
  };
}

module.exports={VERSION,PLANS,withShuffleHeldWonderTag,
  runShuffleHeldWonderTagAba};
