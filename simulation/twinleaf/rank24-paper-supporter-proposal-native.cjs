'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withPaperSupporterQuotaGuard}=
  require('./paper-supporter-quota-guard.cjs');
const {withOwnerVisibleSupporterQuotaProposals}=
  require('./supporter-proposal-paper-quota.cjs');
const {TIER_NAMES}=require('../../scripts/aichi-thorns-crossrank-opening.cjs');

const SEED=2966203069;
const BASE_MAX_ACTIONS=105;

/** @param {unknown} value */
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** Retrospective native source hand and paper-guard proposal counterfactual. */
function main() {
  initializeCards();
  const engineRoot=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(engineRoot,'game/store/store'));
  const {TrainerType}=require(path.join(engineRoot,
    'game/store/card/card-types'));
  const {PlaySupporterTactic}=require(path.join(engineRoot,
    'simple-bot/simple-tactics/play-supporter-tactic'));

  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(entry=>entry.rank===24);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const priority=TIER_NAMES.slice(1,4).flat();
  const request={
    deckA:plan.candidate.cards,deckB:source.cards,
    seed:SEED,maxActions:BASE_MAX_ACTIONS,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const execute=()=>withBroadThornsSourceAttack(
    ()=>runMatch(request),{
      seat:1,turn:2,discardPriority:priority,
      k1ReplanAfterTagCall:true
    });
  const baseline=execute();
  assert.equal(baseline.result.firstTurnSlot,0);
  assert.equal(baseline.result.verifiedByDrawLog,true);

  let invalidProposal=null;
  let legalSubmitted=[];
  let corrected=null;
  let failure=null;
  try {
    corrected=withOwnerVisibleSupporterQuotaProposals(
      PlaySupporterTactic,TrainerType.SUPPORTER,
      ()=>withPaperSupporterQuotaGuard(
        Store,TrainerType.SUPPORTER,execute,{
          onViolation:e=>{invalidProposal=e;},
          onLegalSupporter:e=>{legalSubmitted.push(e);}
        }
      )
    );
  } catch(error) {
    failure=String(error?.message??error);
  }

  const basePrefix=(baseline.result.decisionTrace??[])
    .filter(entry=>entry.actionOrdinal<24);
  const correctedGame=corrected?.result?.result?.result??null;
  const policyResult=corrected?.result?.result??null;
  const correctedPrefix=(correctedGame?.decisionTrace??[])
    .filter(entry=>entry.actionOrdinal<24);

  // A source task that reaches an actual paper-invalid root must fail
  // closed: no game terminal winner can be interpreted from that attempt.
  const paperSafe=Boolean(correctedGame&&!failure&&!invalidProposal);
  const sourceActions=game=>(game?.decisionTrace??[])
    .filter(row=>row.playerSlot===1&&row.turnBefore===2)
    .map(row=>({rootOrdinal:row.actionOrdinal,action:row.action,
      card:row.card??null,ability:row.ability??null}));
  const report={
    schema:'rank24-same-source-paper-supporter-proposal-v1',
    status:paperSafe?'paper-quota-guard-not-triggered':'policy-incomplete',
    evidenceType:'retrospective same-deal owner-visible tactic correction',
    sourceRank:24,seed:SEED,enginePin:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    revision:process.env.GITHUB_SHA??null,
    sourceDeckHash:digest(source.cards),
    candidateDeckHash:digest(plan.candidate.cards),
    baseline:{
      firstTurnSlot:baseline.result.firstTurnSlot,
      actualVerifiedStart:baseline.result.verifiedByDrawLog,
      originalSourceTurn2Actions:sourceActions(baseline.result),
      preIllegalRootDecisionDigest:digest(basePrefix)
    },
    corrected:{
      setupReady:Boolean(correctedGame),
      ...(correctedGame?{
        firstTurnSlot:correctedGame.firstTurnSlot,
        actualVerifiedStart:correctedGame.verifiedByDrawLog,
        sourceTurn2Actions:sourceActions(correctedGame),
        preIllegalRootDecisionDigest:digest(correctedPrefix),
        prefixUnchanged:digest(basePrefix)===digest(correctedPrefix),
        finished:correctedGame.finished
      }:{}),
      proposalSuppressions:corrected?.suppressionCount??null,
      suppressedVisibleExamples:corrected?.suppressedCalls??null,
      submittedPriorLegalSupporters:legalSubmitted,
      proposedIllegalSupporter:invalidProposal,
      error:failure
    },
    qualifiedForCompetitiveInference:false,
    note:'A PaperSupporterQuotaError is a failed policy attempt, not a match loss. Neither fork has a hidden-information-safe or timed competitive policy.'
  };
  // Keep a complete source-deal-negative packet even if this opt-in policy
  // still requests an illegal root and CI intentionally fails the gate.
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(report.baseline.actualVerifiedStart,true);
  assert.ok(report.baseline.originalSourceTurn2Actions.some(x=>
    x.card==='Cynthia & Caitlin'));
  assert.equal(paperSafe,true,
    'Owner-visible tactic policy must not request a second Supporter under native paper guard: '+failure);
  assert.ok(corrected.suppressionCount>=1,
    'Native tactic must actually consult post-Supporter owner quota');
  assert.equal(correctedGame.firstTurnSlot,baseline.result.firstTurnSlot);
  assert.deepEqual(correctedGame.deckHashes,baseline.result.deckHashes);
  return report;
}
if(require.main===module)main();
module.exports={SEED,main};
