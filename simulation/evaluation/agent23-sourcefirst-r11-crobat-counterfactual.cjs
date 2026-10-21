'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {withSourceCrobatConfirmYes}=
  require('../twinleaf/agent23-source-crobat-confirm-counterfactual.cjs');

const ORIGINAL_SOURCE_DEAL=
  '60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const ORIGINAL_LEDGER=
  'b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6';

function run(){
  initializeCards();
  const trial=sourceFirstPressureTrials().find(row=>
    row.rank===11&&row.candidateId==='new-moon-lockbreaker-v1');
  assert.equal(trial?.seed,482443328);
  assert.equal(trial.candidateSlot,'B');
  const inputs=loadCampaignInputs();
  const candidate=inputs.candidates.find(x=>
    x.id==='new-moon-lockbreaker-v1');
  assert.ok(candidate);
  const plan=planAichi({
    label:candidate.id,cards:candidate.cards
  },{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const prepared=new Map([[candidate.id,{plan}]]);
  const Bot=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'))
    .SimpleTacticsAi;
  const execute=()=>{
    const observed=withCanonicalActorOnlyPolicy(
      ()=>executeDevelopment(trial,prepared,{
        mandatoryOptionFallback:true,paperSupporterQuota:true,
        initializationWindow:false,garbotoxinWindow:true
      }),{},{
        ownerSingleSearch:true,genericFallbackAttribution:true,
        actorHandDiscard:true,actorChoosePokemon:true
      });
    return observed.result;
  };
  const control=execute();
  const observed=withSourceCrobatConfirmYes(execute,{
    SimpleTacticsAi:Bot
  });
  const treatment=observed.result;
  const baselineAuthenticated=control.sourceDealFingerprint===
      ORIGINAL_SOURCE_DEAL&&control.rootActionLedgerSha256===
      ORIGINAL_LEDGER&&control.actionCount===175&&
      control.actualStarterSeat===0&&control.verifiedFirstTurn===true&&
      control.sourceActuallyFirst===true&&control.winner===1&&
      JSON.stringify(control.finalPrizes)==='[6,0]';
  const sourceDealPaired=treatment.sourceDealFingerprint===
    control.sourceDealFingerprint;
  const starterPaired=treatment.actualStarterSeat===
    control.actualStarterSeat&&treatment.verifiedFirstTurn===true;
  const controlLedger=control.rootActionLedger??[];
  const testLedger=treatment.rootActionLedger??[];
  const actionKey=a=>a?JSON.stringify({
    turn:a.turnBefore,seat:a.playerSlot,type:a.action,
    prompt:a.pendingPrompt,card:a.card??null
  }):null;
  let commonPrefix=0;
  while(commonPrefix<Math.min(controlLedger.length,testLedger.length)&&
    actionKey(controlLedger[commonPrefix])===
    actionKey(testLedger[commonPrefix]))commonPrefix++;
  const summary=row=>({
    sourceDealFingerprint:row.sourceDealFingerprint,
    actionLedgerSha256:row.rootActionLedgerSha256,
    sourceFirst:row.sourceActuallyFirst,
    firstSeat:row.actualStarterSeat,actionCount:row.actionCount,
    turns:row.turns,finished:row.finished,
    status:row.status??null,winner:row.winner,
    endReason:row.endReason,prizes:row.finalPrizes,
    attacks:row.attackDeclarations,
    settledPublicAttacks:row.settledPublicAttackCount,
    sourceAttacks:row.sourceAttackSettlement,
    firstSettledPublicAttack:row.firstSettledPublicAttack,
    finalBoard:row.finalBoard,
    rootActionLedger:row.rootActionLedger
  });
  const report={
    schema:'agent23-sourcefirst-r11-crobat-ability-confirm-native-pair-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    trial,baselineAuthenticated,
    sourceDealPaired,starterPaired,
    commonActionRootPrefix:commonPrefix,
    firstControlOnlyAction:controlLedger[commonPrefix]??null,
    firstTreatmentOnlyAction:testLedger[commonPrefix]??null,
    nativeCrobatConfirmation:observed.audit,
    control:summary(control),
    treatment:summary(treatment),
    competitiveQualifiedGames:0,winRateCertified:false,
    limitation:'One previously selected source-first deal, weak both-side '+
      'common policy and branch-local source action substitution. Native '+
      'acceptance, owner consistency and engine terminal changes are evidence '+
      'about the selected scenario only, not paper game win probability.'
  };
  assert.ok(baselineAuthenticated,
    'Control diverged from published 175-action native physical game');
  assert.ok(sourceDealPaired&&starterPaired,
    'Control and treatment did not share the initial physical source deal');
  assert.equal(observed.audit.liveMatchCalls,1);
  assert.equal(observed.audit.nativeYesProposals,1);
  assert.equal(observed.audit.nativeYesAccepted,1);
  assert.equal(observed.audit.nativeYesRejected,0);
  return report;
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write(JSON.stringify({
    originalAuthenticated:r.baselineAuthenticated,
    paired:r.sourceDealPaired,commonPrefix:r.commonActionRootPrefix,
    confirm:r.nativeCrobatConfirmation,
    original:{winner:r.control.winner,prizes:r.control.prizes,
      attacks:r.control.settledPublicAttacks},
    treatment:{winner:r.treatment.winner,prizes:r.treatment.prizes,
      attacks:r.treatment.settledPublicAttacks}
  })+'\n');
}
module.exports={run,ORIGINAL_SOURCE_DEAL,ORIGINAL_LEDGER};
