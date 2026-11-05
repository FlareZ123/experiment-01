'use strict';

const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const {
  PLANS:V13PLANS,withOwnerPromptBaselines,comparePromptBaselineAba
}=require('./agent3-issue25-v13-protected-prompt-aba.cjs');

const VERSION='agent3-issue25-v14-modal-prize-plus-owner-pokemon-aba-v1';
const PLANS=Object.freeze([
  {label:'protected-modal-prize-control-initial',
    mode:'protected',withPokemon:false},
  {label:'protected-modal-prize-with-owner-pokemon',
    mode:'protected',withPokemon:true},
  {label:'protected-modal-prize-control-repeated',
    mode:'protected',withPokemon:false}
]);

/**
 * Isolate one already existing owner-legal ChoosePokemonPrompt adapter behind
 * unchanged v13 modal, own-Prize, original printed-attack policy components.
 * The baseline picks first in the actually offered native menu. This is
 * tactical decision coverage, not an optimized replacement-promotion policy.
 *
 * @template T
 * @param {()=>T} next
 * @param {{joinedAttackLayer?:Function,choosePokemonLayer?:Function,
 *   ownerPromptLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPokemonOverModalPrize(next,deps={}){
  assert.equal(typeof next,'function');
  const {withActorOnlyChoosePokemon}=
    require('../twinleaf/agent8-actor-only-choose-pokemon.cjs');
  const choosePokemon=deps.choosePokemonLayer??withActorOnlyChoosePokemon;
  const modalPrize=deps.ownerPromptLayer??withOwnerPromptBaselines;
  let baseAudit=null;
  const returned=choosePokemon(()=>{
    const old=modalPrize(next,{
      joinedAttackLayer:deps.joinedAttackLayer
    });
    baseAudit=old.audit;
    return old.result;
  });
  return {result:returned.result,audit:{
    ...baseAudit,
    ownerChoosePokemonPromptBaseline:returned.audit,
    competentGustOrPromotionChoiceDemonstrated:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Use v13's independently adversarially tested same-deal A/B/A comparator
 * without changing its frozen 2026-11-05 native code. Its internal
 * 'promptBaseline' name is only a generic B-arm field and is explicitly
 * renamed to owner-Pokémon intervention in this receipt.
 *
 * @param {object[]} campaigns
 * @returns {object}
 */
function compareOwnerPokemonAba(campaigns){
  assert.deepEqual(campaigns.map(c=>({
    label:c.label,mode:c.mode,withPokemon:c.withPokemon
  })),PLANS);
  const normalized=campaigns.map((c,i)=>({
    ...c,label:V13PLANS[i].label,
    promptBaseline:V13PLANS[i].promptBaseline
  }));
  const base=comparePromptBaselineAba(normalized);
  const {rows:raw,treatmentSelectedPromptAudit:_,...rest}=base;
  const middle=campaigns[1].selectedPromptAudit??null;
  const selected=middle?.ownerChoosePokemonPromptBaseline??null;
  return {
    ...rest,
    schema:VERSION,
    design:PLANS,
    comparatorVersionUsed:base.schema,
    baselineReplayVerdict:base.baselineReplayVerdict,
    originalModalAndPrizeHandlersRemainSelectedBothSeats:true,
    treatmentSelectedPromptAudit:{
      ownerModalPromptBaseline:middle?.ownerModalPromptBaseline??null,
      ownerFirstOccupiedPrizeBaseline:
        middle?.ownerFirstOccupiedPrizeBaseline??null,
      ownerChoosePokemonPromptBaseline:selected
    },
    rows:raw.map(row=>({
      id:row.id,sourceRank:row.sourceRank,
      completePublicRootLedgerAllThree:
        row.completePublicRootLedgerAllThree,
      identicalControlRootLedgerAndStatus:
        row.identicalControlRootLedgerAndStatus,
      identicalControlSourcePhysicalDeal:
        row.identicalControlSourcePhysicalDeal,
      identicalTreatmentSourcePhysicalDeal:
        row.identicalTreatmentSourcePhysicalDeal,
      modalPrizeBaseline:row.baseline,
      withOwnerPokemon:row.promptBaseline,
      repeatedModalPrizeBaseline:row.repeatedBaseline,
      firstNewPublicRoot:
        row.firstPromptBaselinePublicRootDifference,
      newPokemonChoiceChangesDisposition:
        row.promptBaselineChangesDisposition,
      competitivelyQualified:false
    })),
    ownerPokemonDecisionCompetenceCertified:false,
    wholePaperRulesCertified:false,
    causalDeckStrengthEstablished:false,
    certifiedPaperGames:0,
    establishedFieldWinRate:null
  };
}

/**
 * Three protected-opening native Store campaigns, 8 exact source-trial IDs
 * apiece. Fresh shared private Night Watch root seed is internally segmented
 * by the existing printed handler per native game.
 * @returns {object}
 */
function runOwnerPokemonAba(){
  const {runPrechoiceCustodyV8}=
    require('./agent1-issue25-prechoice-input-custody-v8.cjs');
  const {buildReceipt}=
    require('./agent1-issue25-v4-public-receipt.cjs');
  const {withJoinedOwnerAttackFrontier}=
    require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
  const sharedSecret=randomBytes(32);
  const joinedAttackLayer=next=>
    withJoinedOwnerAttackFrontier(next,{
      randomBytes:n=>{
        assert.equal(n,32);
        return Buffer.from(sharedSecret);
      }
    });
  const campaigns=PLANS.map(plan=>{
    const attackLayer=plan.withPokemon?
      next=>withOwnerPokemonOverModalPrize(next,{joinedAttackLayer}):
      next=>withOwnerPromptBaselines(next,{joinedAttackLayer});
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
    return {
      ...plan,receipt,
      witness:executed.diagnostic.actualNativePrechoicePhysicalInputs,
      selectedPromptAudit:
        executed.diagnostic.audit?.firstBlockedPromptEnvelope??null
    };
  });
  return compareOwnerPokemonAba(campaigns);
}

module.exports={VERSION,PLANS,withOwnerPokemonOverModalPrize,
  compareOwnerPokemonAba,runOwnerPokemonAba};
