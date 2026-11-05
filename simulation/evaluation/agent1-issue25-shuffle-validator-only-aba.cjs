'use strict';

const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const {runPrechoiceCustodyV8}=
  require('./agent1-issue25-prechoice-input-custody-v8.cjs');
const {buildReceipt}=require('./agent1-issue25-v4-public-receipt.cjs');
const {withJoinedOwnerAttackFrontier}=
  require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
const {withOwnerPokemonOverModalPrize}=
  require('./agent3-issue25-v14-owner-pokemon-aba.cjs');
const {withNumericShuffleValidator}=
  require('../twinleaf/agent22-numeric-shuffle-validation-hook.cjs');
const {
  PLANS:V13PLANS,comparePromptBaselineAba
}=require('./agent3-issue25-v13-protected-prompt-aba.cjs');

const VERSION='agent1-issue25-owner-shuffle-validator-only-aba-v1';
const PLANS=Object.freeze([
  Object.freeze({label:'owner-modal-prize-pokemon-raw-shuffle',
    mode:'protected',correctNumericShuffle:false}),
  Object.freeze({label:'owner-modal-prize-pokemon-corrected-shuffle',
    mode:'protected',correctNumericShuffle:true}),
  Object.freeze({label:'owner-modal-prize-pokemon-raw-shuffle-repeat',
    mode:'protected',correctNumericShuffle:false})
]);

/**
 * Isolate the exact numeric native ShuffleDeckPrompt validator introduced
 * into Agent3's planned Wonder Tag intervention. Every other wrapper is
 * precisely the existing v14 owner-modal/Prize/Pokemon baseline.
 *
 * This is a replay of eight previously selected original rank6/rank11
 * development deals. It can falsify causal isolation; it cannot establish
 * prospective game strengths or a complete paper-legal player.
 * @template T
 * @param {()=>T} next
 * @param {{correctNumericShuffle:boolean,joinedAttackLayer:Function,
 *   numericLayer?:(fn:Function)=>T}} opts
 * @returns {{result:T,audit:object}}
 */
function withShuffleOnlyOverV14(next,opts){
  assert.equal(typeof next,'function');
  assert.equal(typeof opts?.joinedAttackLayer,'function');
  assert.equal(typeof opts.correctNumericShuffle,'boolean');
  const numeric=opts.numericLayer??withNumericShuffleValidator;
  assert.equal(typeof numeric,'function');
  const result=withOwnerPokemonOverModalPrize(
    opts.correctNumericShuffle?()=>numeric(next):next,{
      joinedAttackLayer:opts.joinedAttackLayer
    });
  return {result:result.result,audit:{
    ...result.audit,
    numericShuffleOnlyTreatmentSelected:opts.correctNumericShuffle,
    wonderTagYesSelected:false,
    allOtherV14OwnerModalPrizePokemonComponentsHeldFixed:true,
    nativeErrorOrAbortPreserved:true,
    competitiveGamesQualified:0
  }};
}

/**
 * Run the original 8 registered native trials in A/B/A with all root statuses.
 * Uses the same private Night Watch entropy material within this invocation.
 * @returns {object}
 */
function runShuffleOnlyAba(){
  const secret=randomBytes(32);
  const joinedAttackLayer=next=>withJoinedOwnerAttackFrontier(next,{
    randomBytes:n=>{
      assert.equal(n,32);
      return Buffer.from(secret);
    }
  });
  const campaigns=PLANS.map(plan=>{
    const attackLayer=next=>withShuffleOnlyOverV14(next,{
      correctNumericShuffle:plan.correctNumericShuffle,joinedAttackLayer
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
  const normalized=campaigns.map((c,i)=>({
    ...c,label:V13PLANS[i].label,
    promptBaseline:V13PLANS[i].promptBaseline
  }));
  const comparison=comparePromptBaselineAba(normalized);
  const {rows,design:ignored,...rest}=comparison;
  const shaped=rows.map(row=>({
    id:row.id,sourceRank:row.sourceRank,
    completePublicRootLedgerAllThree:row.completePublicRootLedgerAllThree,
    identicalControlRootLedgerAndStatus:
      row.identicalControlRootLedgerAndStatus,
    identicalControlSourcePhysicalDeal:
      row.identicalControlSourcePhysicalDeal,
    identicalTreatmentSourcePhysicalDeal:
      row.identicalTreatmentSourcePhysicalDeal,
    rawShuffleControl:row.baseline,
    numericShuffleOnlyTreatment:row.promptBaseline,
    repeatedRawShuffleControl:row.repeatedBaseline,
    firstPublicRootDifference:row.firstPromptBaselinePublicRootDifference,
    nativeDispositionChanged:row.promptBaselineChangesDisposition,
    nativePaperQualified:false
  }));
  return {
    ...rest,schema:VERSION,design:PLANS,
    comparatorVersionUsed:comparison.schema,
    rows:shaped,
    numericShuffleOnlyTreatmentInstalled:true,
    rootChanges:shaped.filter(row=>row.firstPublicRootDifference!==null),
    dispositionChanges:shaped.filter(row=>row.nativeDispositionChanged),
    wholeGamePolicyCertified:false,
    retrospectiveDevelopmentOnly:true,
    certifiedPaperGames:0,
    establishedFieldWinRate:null
  };
}

module.exports={VERSION,PLANS,withShuffleOnlyOverV14,runShuffleOnlyAba};
