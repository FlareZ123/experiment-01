'use strict';

const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const {
  PLANS:V13PLANS,comparePromptBaselineAba
}=require('./agent3-issue25-v13-protected-prompt-aba.cjs');
const {
  withOwnerPokemonOverModalPrize
}=require('./agent3-issue25-v14-owner-pokemon-aba.cjs');

const VERSION='agent3-issue25-v15-wondertag-true-vs-decline-aba-v1';
const PLANS=Object.freeze([
  {label:'modal-prize-pokemon-decline-wondertag-control',
    mode:'protected',wonderTagYes:false},
  {label:'modal-prize-pokemon-affirm-wondertag-and-native-search',
    mode:'protected',wonderTagYes:true},
  {label:'modal-prize-pokemon-decline-wondertag-control-repeat',
    mode:'protected',wonderTagYes:false}
]);

/**
 * Add *only to treatment* a genuine printed Tapu Lele-GX GRI Wonder Tag
 * source-hook that can affirm the optional Ability and perform the real
 * Supporter owner-deck search. Also select the existing pinned native
 * numeric ShuffleDeckPrompt validation correction only in treatment to
 * ensure a legal native shuffle order, if one is offered.
 *
 * This is a mechanical liveness study: owner Supporter choice is the
 * existing first-native-valid physical Supporter, not a strategic ranking.
 * Neither source card identity nor later winner may be used to select trials.
 * @template T
 * @param {()=>T} next
 * @param {{joinedAttackLayer?:Function,sourceLayer?:Function,
 *   numericShuffleLayer?:Function,baseLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withWonderTagYesOnTop(next,deps={}){
  assert.equal(typeof next,'function');
  const {withOwnerWonderTagPrompts}=
    require('../twinleaf/agent8-owner-wondertag-prompt.cjs');
  const {withNumericShuffleValidator}=
    require('../twinleaf/agent22-numeric-shuffle-validation-hook.cjs');
  const yes=deps.sourceLayer??withOwnerWonderTagPrompts;
  const numeric=deps.numericShuffleLayer??withNumericShuffleValidator;
  const baseline=deps.baseLayer??withOwnerPokemonOverModalPrize;
  let wonderAudit=null;
  const result=baseline(()=>numeric(()=>{
    const native=yes(next);
    wonderAudit=native.audit;
    return native.result;
  }),{joinedAttackLayer:deps.joinedAttackLayer});
  return {result:result.result,audit:{
    ...result.audit,
    sourceStampedWonderTagYes:wonderAudit,
    numericNativeShuffleValidationHookSelected:true,
    ownerSupporterTacticalPreferenceCertified:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Reuse v13's fail-closed A/B/A physical-source HMAC/ledger comparator.
 * Its internal source trial renaming is explicitly reported.
 * @param {object[]} campaigns
 * @returns {object}
 */
function compareWonderTagAba(campaigns){
  assert.deepEqual(campaigns.map(c=>({
    label:c.label,mode:c.mode,wonderTagYes:c.wonderTagYes
  })),PLANS);
  const normalized=campaigns.map((c,i)=>({
    ...c,label:V13PLANS[i].label,
    promptBaseline:V13PLANS[i].promptBaseline
  }));
  const base=comparePromptBaselineAba(normalized);
  const {rows,treatmentSelectedPromptAudit:ignored,...rest}=base;
  const enhanced=campaigns[1].selectedPromptAudit??null;
  return {...rest,schema:VERSION,design:PLANS,
    comparatorVersionUsed:base.schema,
    allOtherV14OwnerPromptComponentsHeldFixed:true,
    nativeWonderTagSourceAudit:enhanced?.sourceStampedWonderTagYes??null,
    treatmentSelectedPromptAudit:{
      ownerModal:enhanced?.ownerModalPromptBaseline??null,
      ownerFirstPrize:enhanced?.ownerFirstOccupiedPrizeBaseline??null,
      ownerPokemon:enhanced?.ownerChoosePokemonPromptBaseline??null,
      ownerWonderTagYes:enhanced?.sourceStampedWonderTagYes??null
    },
    rows:rows.map(row=>({
      id:row.id,sourceRank:row.sourceRank,
      completePublicRootLedgerAllThree:
        row.completePublicRootLedgerAllThree,
      identicalControlRootLedgerAndStatus:
        row.identicalControlRootLedgerAndStatus,
      identicalControlSourcePhysicalDeal:
        row.identicalControlSourcePhysicalDeal,
      identicalTreatmentSourcePhysicalDeal:
        row.identicalTreatmentSourcePhysicalDeal,
      wonderTagDeclineControl:row.baseline,
      wonderTagYesAndSearch:row.promptBaseline,
      wonderTagDeclineRepeat:row.repeatedBaseline,
      firstPublicRootDifference:row.firstPromptBaselinePublicRootDifference,
      changesNativeDisposition:row.promptBaselineChangesDisposition,
      nativeCompetitivelyQualified:false
    })),
    wholePaperNativeEffectsCertified:false,
    strategicSupporterSearchPolicyQualified:false,
    certifiedPaperGames:0,establishedFieldWinRate:null
  };
}

/** @returns {object} 24 native attempts from eight original registered IDs. */
function runWonderTagAba(){
  const {runPrechoiceCustodyV8}=
    require('./agent1-issue25-prechoice-input-custody-v8.cjs');
  const {buildReceipt}=
    require('./agent1-issue25-v4-public-receipt.cjs');
  const {withJoinedOwnerAttackFrontier}=
    require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
  const secret=randomBytes(32);
  const joinedAttackLayer=next=>
    withJoinedOwnerAttackFrontier(next,{
      randomBytes:n=>{
        assert.equal(n,32);
        return Buffer.from(secret);
      }
    });
  const campaigns=PLANS.map(plan=>{
    const attackLayer=plan.wonderTagYes?
      next=>withWonderTagYesOnTop(next,{joinedAttackLayer}):
      next=>withOwnerPokemonOverModalPrize(next,{joinedAttackLayer});
    const executed=runPrechoiceCustodyV8('protected',{attackLayer});
    const receipt=buildReceipt(executed,{
      policyEntryPoint:
        'simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs'
    });
    const rawById=new Map(executed.rawDevelopment.rows.map(row=>
      [row.trial.id,row]));
    assert.equal(rawById.size,8);
    for(const row of receipt.attempts)
      row.sourceDealFingerprint=
        rawById.get(row.id)?.sourceDealFingerprint??null;
    return {...plan,receipt,
      witness:executed.diagnostic.actualNativePrechoicePhysicalInputs,
      selectedPromptAudit:
        executed.diagnostic.audit?.firstBlockedPromptEnvelope??null};
  });
  return compareWonderTagAba(campaigns);
}
module.exports={VERSION,PLANS,withWonderTagYesOnTop,
  compareWonderTagAba,runWonderTagAba};
