'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const SEED=1244180408;
const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;

/** @param {object} game */
function summary(game) {
  const candidateTurns=game.decisionTrace.filter(row =>
    row.playerSlot===CANDIDATE_SEAT);
  let previousPrizes=[6,6];
  const prizeTransitions=[];
  for(const row of game.decisionTrace) {
    if(row.prizesAfter && row.prizesAfter.some((n,i)=>n<previousPrizes[i])) {
      prizeTransitions.push({
        actionOrdinal:row.actionOrdinal,turn:row.turnBefore,
        actorSeat:row.playerSlot,action:row.action,
        card:row.card??null,ability:row.ability??null,
        attack:row.attack??null,
        previousPrizes,prizesAfter:row.prizesAfter
      });
    }
    if(row.prizesAfter) previousPrizes=row.prizesAfter;
  }
  const declarations=(game.attackDeclarationTrace||[]).filter(row =>
    row.playerSlot===CANDIDATE_SEAT).map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      trigger:row.triggerAction,attack:row.attackName,
      status:row.resolutionStatus
    }));
  const sourceSelections=game.decisionTrace.filter(row=>
    row.playerSlot===CANDIDATE_SEAT &&
    row.attackChoice?.selection).map(row=>{
      const selected=row.attackChoice.selection;
      const logged=declarations.find(entry=>
        entry.ordinal===row.actionOrdinal);
      return {
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        printing:selected.printing,
        selectedAttack:selected.attackName,
        loggedAttack:logged?.attack??null,
        exactStoreMatch:logged?.attack===selected.attackName
      };
    });
  // Read-only retrospective source-own-hand census immediately after the
  // original rank-11 policy chose an action and before live Store dispatch.
  // No opponent-hidden information is passed into either decision policy.
  const sourceTurn49OwnerChoices=game.decisionTrace.filter(row=>
    row.playerSlot===SOURCE_SEAT && row.turnBefore===49 &&
    ['PlayCardAction','AttackAction','PassTurnAction'].includes(row.action))
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      action:row.action,card:row.card??null,attack:row.attack??null,
      ownHandPrintings:row.decisionHandBefore?.ownHandPrintings??null,
      sourceDeckRemainingAfter:row.decksAfter?.[SOURCE_SEAT]??null
    }));
  const sourceResponses=game.decisionTrace.filter(row =>
    row.playerSlot===SOURCE_SEAT && row.turnBefore>=3 &&
    row.turnBefore<=5 && (row.action==='PlayCardAction' ||
      row.action==='PassTurnAction')).map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      action:row.action,card:row.card??null
    }));
  return {
    actualFirstTurn:game.firstTurnSlot,
    firstDrawValidated:game.verifiedByDrawLog,
    sourceOpener:game.rank11AutonomousPolicy,
    actions:game.actions,turns:game.turns,
    finished:game.finished,winner:game.winner,
    prizesRemaining:game.prizesRemaining,
    endReason:game.endReason,
    terminalTransition:game.terminalTransition??null,
    storeAttackProtocol:game.attackDeclarationTraceProtocol??null,
    candidateStoreDeclarations:declarations,
    candidateSelectedCopiedAttacks:sourceSelections,
    prizeTransitions,
    sourceAttackActions:game.attackTrace.filter(row=>row.seat===SOURCE_SEAT)
      .map(row=>({turn:row.turn,attack:row.attack,
        prizeCountBefore:row.prizeCountBefore,
        prizeCountAfter:row.prizeCountAfter})),
    candidateAttacks:game.attackTrace.filter(row=>row.seat===CANDIDATE_SEAT)
      .map(row=>({turn:row.turn,attack:row.attack})),
    candidateLilliePlays:candidateTurns.filter(row=>
      row.action==='PlayCardAction' && row.card==="Lillie's Determination")
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
        hand:row.decisionHandBefore?.ownHandPrintings??null})),
    candidateFieldBlowerPlays:candidateTurns.filter(row=>
      row.action==='PlayCardAction' && row.card==='Field Blower')
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
        hand:row.decisionHandBefore?.ownHandPrintings??null})),
    candidateAbilityCalls:candidateTurns.filter(row=>
      row.action==='UseAbilityAction').map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      ability:row.ability??null
    })),
    candidateFirstTurnDecisions:candidateTurns.filter(row=>
      row.turnBefore===2).slice(0,15).map(row=>({
      ordinal:row.actionOrdinal,action:row.action,card:row.card??null,
      selected:row.cardSelection?.selectedCards??null,
      lastPassBoard:row.action==='PassTurnAction'?
        row.publicBoardBeforePass??null:null
    })),
    sourceNextTurns:sourceResponses,
    sourceTurn49OwnerChoices
  };
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'newmoon-rank11-unqualified-autonomous-Blower-v1'
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline=play();
  const adapted=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play);
  const followup=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,
    {lowHandLillieAfterBlower:true});
  const effectReplay=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
    ()=>runWithResearchProfile({
      ...request,capturePoltergeistEffectTrace:true
    },RANK11_AUTONOMOUS_PROFILE),{lowHandLillieAfterBlower:true});
  const restored=play();
  const after=adapted.result;
  const afterSupporter=followup.result;
  for (const game of [baseline,after,afterSupporter,restored]) {
    assert.equal(game.firstTurnSlot,SOURCE_SEAT);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
  }
  assert.deepEqual(baseline.deckHashes,after.deckHashes);
  assert.deepEqual(baseline.deckHashes,afterSupporter.deckHashes);
  assert.deepEqual(baseline.deckHashes,restored.deckHashes);
  assert.deepEqual(baseline.decisionTrace,restored.decisionTrace,
    'Candidate automatic-policy wrapper must restore raw generic decision trace');
  for(const game of [baseline,after,afterSupporter,restored]) {
    assert.equal(game.attackDeclarationTraceProtocol,
      'real-store-attack-log-declarations-v1',
      'Do not use root AttackAction counts as copied-attack evidence');
  }
  const sourceOpening=game=>game.decisionTrace.filter(row=>row.turnBefore<=1);
  assert.deepEqual(sourceOpening(baseline),sourceOpening(after),
    'Source first-turn real actions must be unchanged');
  assert.deepEqual(sourceOpening(baseline),sourceOpening(afterSupporter),
    'Lillie follow-up must leave actual source opening untouched');
  assert.equal(adapted.policyAudit.opportunitySelections,1,
    'Seed-independent candidate policy should recognize one real held Item');
  assert.equal(adapted.policyAudit.confirmedToolRemovals,1,
    'Live candidate own-prompt target must remove public Garbodor Tool');
  assert.equal(summary(baseline).candidateFieldBlowerPlays.length,0);
  assert.equal(summary(after).candidateFieldBlowerPlays.length,1);
  assert.ok(followup.policyAudit.opportunitySelections>=1,
    'Autonomous source must encounter at least its documented first Tool answer');
  assert.ok(followup.policyAudit.confirmedToolRemovals>=1,
    'At least the authentic first removal must be confirmed by public board');
  assert.equal(summary(afterSupporter).candidateLilliePlays.length,
    followup.policyAudit.lowHandLillieSelections,
    'Every selected real Supporter must appear in the recorded Store decisions');
  const observedEffectGame=effectReplay.result;
  const stable=game=>JSON.stringify({
    actions:game.actions,turns:game.turns,winner:game.winner,
    prizes:game.prizesRemaining,decisions:game.decisionTrace,
    root:game.rootActionLedger,attacks:game.attackDeclarationTrace,
    terminal:game.terminalTransition
  });
  assert.equal(stable(afterSupporter),stable(observedEffectGame),
    'Read-only Poltergeist effect observer changed the complete action ledger or winner');
  assert.deepEqual(followup.policyAudit,effectReplay.policyAudit,
    'Read-only attack observation changed owner-information policy decisions');
  const selectedCopies=summary(afterSupporter).candidateSelectedCopiedAttacks;
  assert.equal(selectedCopies.length,3,
    'This frozen seed previously selected three copied attacks; fail on unexplained drift');
  assert.ok(selectedCopies.every(x=>x.exactStoreMatch &&
    x.printing==='Gengar & Mimikyu-GX TEU' &&
    x.selectedAttack==='Poltergeist'));
  // This validates the missing predecision own-hand premise of the
  // rank-11 turn49 Quick Ball counterfactual with source-dealt evidence.
  const turn49=summary(afterSupporter).sourceTurn49OwnerChoices;
  const firstSourceAction=turn49.find(row=>row.ordinal===288);
  assert.equal(firstSourceAction?.card,'Darkness Energy',
    'Archived source turn49 first source action drifted');
  assert.ok(Array.isArray(firstSourceAction.ownHandPrintings),
    'Source turn49 must have an independently captured own-hand snapshot');
  assert.equal(turn49.some(row=>
    row.ordinal===289 && row.attack==='Claw of Darkness'),true,
    'Source turn49 printed attack action drifted');
  const effectWindows=observedEffectGame.poltergeistEffectTrace||[];
  const copiedAttackEffects=selectedCopies.map(choice=>{
    const effect=effectWindows.find(row=>row.actionOrdinal===choice.ordinal);
    assert.ok(effect?.assessment,
      'A copied Store declaration must have its printed-effect window');
    assert.equal(effect.attackerSeat,CANDIDATE_SEAT);
    assert.equal(effect.assessment.printedBaseDamage,
      effect.before[SOURCE_SEAT].handTrainerCount*50,
      'Printed multiplier must use the opponent actual hand at attack choice');
    return {
      turn:effect.turnBefore,ordinal:choice.ordinal,
      sourcePrinting:choice.printing,attack:choice.selectedAttack,
      enemyHandTrainerCount:effect.before[SOURCE_SEAT].handTrainerCount,
      observedPrintedBaseDamage:effect.assessment.printedBaseDamage,
      assessment:effect.assessment,
      originalBoard:effect.publicBefore,
      resolvedSteps:effect.steps.map(row=>({
        ordinal:row.actionOrdinal,action:row.actionName,
        pendingPrompt:row.pendingPrompt,
        beforePrizes:row.before.map(x=>x.prizesRemaining),
        afterPrizes:row.after.map(x=>x.prizesRemaining),
        beforeInPlay:row.before.map(x=>x.inPlayPokemon),
        afterInPlay:row.after.map(x=>x.inPlayPokemon)
      })),
      sourceFollowingTurn:observedEffectGame.rootActionLedger.filter(row=>
        row.playerSlot===SOURCE_SEAT &&
        row.turnBefore===effect.turnBefore+1)
    };
  });
  return {
    schema:'rank11-garbotoxin-newmoon-autonomous-Field-Blower-and-Lillie-exam-v2',
    sourceRank:11,sourceSeed:SEED,sourceSeat:SOURCE_SEAT,
    candidateSeat:CANDIDATE_SEAT,
    fixedCandidate:candidate.id,candidateProxyIdCountHash:candidate.proxyIdCountHash,
    engineRevision:plan.engineRevision,
    deckHashes:baseline.deckHashes,
    policyAdapter:'newmoon-garbotoxin-blower-autonomous-v1',
    candidatePolicyAudit:adapted.policyAudit,
    baseline:summary(baseline),automatic:summary(after),
    automaticWithLowHandLillie:summary(afterSupporter),
    lowHandFollowupAudit:followup.policyAudit,
    copiedAttackEffects,
    readOnlyEffectReplayNoninterferenceVerified:true,
    restorationVerified:true,sourceOpeningIdentical:true,
    attackEvidenceContract:'Observed Perfection selections are matched against real Store declarations by root action ordinal; a declaration is not full damage/effect proof',
    qualification:'Source-dealt single-case policy regression; no independent held-out seeds or qualified competitive games',
    competitiveGamesQualified:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summary};
