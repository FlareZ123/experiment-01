'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {developmentTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withOwnerEnergyWindowAudit}=
  require('../twinleaf/owner-energy-window-audit.cjs');
const {withRank6BenchPsychicRedirect}=
  require('../twinleaf/agent30-rank6-bench-psychic-redirect.cjs');
const ORIGINAL_SHA=
  '87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4';

/** @returns {{trial:object,prepared:Map<string,object>}} */
function frozenRank6Trial(){
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const candidate=loadNewMoonCandidate().cards;
  assert.equal(candidate.reduce((n,c)=>n+c.count,0),60);
  const plan=planAichi({label:'new-moon-lockbreaker-v1',cards:candidate},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.opponents.find(x=>x.rank===6)?.status,'ready');
  const trial=developmentTrials().find(x=>
    x.id==='6:0:A:new-moon-lockbreaker-v1');
  assert.ok(trial);
  assert.equal(trial.seed,407516727);
  return {trial,prepared:new Map([['new-moon-lockbreaker-v1',{plan}]])};
}

/**
 * @param {object} deps Pinned compiled Twinleaf interfaces.
 * @param {{trial:object,prepared:Map<string,object>}} fixed
 * @param {number[]} selectedTurns
 * @returns {object}
 */
function runOne(deps,fixed,selectedTurns){
  let counterfactual=null;
  const execute=()=>withOwnerEnergyWindowAudit(0,()=>
    executeDevelopment(fixed.trial,fixed.prepared,{
      compressorPayload:true,opportunityAudit:true,
      lateCompressorPayload:true
    }));
  const observed=selectedTurns.length===0?execute():
    (() => {
      const output=withRank6BenchPsychicRedirect(deps,{
        candidateSeat:0,selectedTurns
      },execute);
      counterfactual=output.audit;
      return output.result;
    })();
  const game=observed.result;
  const energy=observed.audit;
  assert.equal(game.verifiedFirstTurn,true);
  assert.equal(game.actualStarterSeat,0);
  assert.equal(game.sourceSeat,1);
  assert.equal(game.candidateSeat,0);
  assert.equal(game.sourceActuallyFirst,false);
  assert.equal(energy.candidateSeat,0);
  if(selectedTurns.length===0){
    assert.equal(game.rootActionLedgerSha256,ORIGINAL_SHA,
      'Historical control must exactly reproduce original Store roots');
    assert.equal(game.actionCount,260);
    assert.equal(game.attackDeclarations.candidate,0);
  }else{
    assert.equal(counterfactual.actualBotActionReplacements[0]?.turn,9,
      'First user-visible alternative must be genuine turn9 owner attachment');
    const energy9=energy.publicEnergyTransitionsLedger.find(e=>
      e.turnBefore===9&&e.actorSeat===0&&
      e.nativeAction==='PlayCardAction'&&
      e.after.some(slot=>
        slot.pokemon==='Gengar & Mimikyu-GX TEU' &&
        slot.energyNames.includes('Psychic Energy MEE')));
    assert.ok(energy9,
      'Native Store must truly accept proposed turn9 Bench Psychic');
  }
  const ownGengar=energy.publicEnergyTransitionsLedger
    .filter(e=>e.actorSeat===0&&e.after.some(slot=>
      slot.pokemon==='Gengar & Mimikyu-GX TEU' &&
      slot.energyNames.length>0))
    .map(e=>({turn:e.turnBefore,action:e.nativeAction,
      board:e.after.filter(slot=>
        slot.pokemon==='Gengar & Mimikyu-GX TEU')}));
  const sourceLosses=energy.publicEnergyTransitionsLedger
    .filter(e=>e.actorSeat===1&&e.attachedCardDelta<0)
    .map(e=>({
      turn:e.turnBefore,action:e.nativeAction,
      delta:e.attachedCardDelta,before:e.before,after:e.after
    }));
  return {
    arm:selectedTurns.length===0?'original-native-control':
      'owner-bench-Psychic-'+selectedTurns.join('-'),
    selectedOwnerRootTurns:selectedTurns,
    trial:game.trial,
    firstTurnPlayerSeat:game.actualStarterSeat,
    sourcePhysicalDealFingerprint:game.sourceDealFingerprint,
    originalSourceOwnHandFingerprint:game.sourceFirstOwnHandSha256,
    gameActionRootSha256:game.rootActionLedgerSha256,
    rootCount:game.actionCount,turns:game.turns,finished:game.finished,
    engineWinnerSeat:game.winner,
    candidateAttackDeclarations:game.attackDeclarations.candidate,
    sourceAttackDeclarations:game.attackDeclarations.source,
    finalPrizes:game.finalPrizes,
    counterfactual,
    genuineManualEnergyAttachments:energy.nativeManualEnergy.map(e=>({
      turn:e.turn,
      name:e.energyName,target:e.target,
      beforeActive:e.before.activePokemon,
      afterActive:e.after.activePokemon,
      beforeActiveEnergies:e.before.activeEnergyNames,
      afterActiveEnergies:e.after.activeEnergyNames
    })),
    nativePowerglassLikePrompts:energy.likelyPowerglassPrompts,
    GengarWithEnergyOnOwnedBoard:ownGengar,
    trueSourceEnergyLosses:sourceLosses,
    finalBoard:game.finalBoard,
    informationScope:'Actor-own-hand+public board only',
    originalPrintedSixtiesUnchanged:true,
    opponentPolicyUnchanged:true,
    qualification:'selected-seed source replay; bot/clock/paper game unqualified'
  };
}

/** @returns {object} */
function main(){
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=require(path.join(output,'game/store/store')).Store;
  const SimpleTacticsAi=require(path.join(output,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {PlayCardAction,SlotType}=require(path.join(output,
    'game/store/actions/play-card-action'));
  const {SuperType,EnergyType}=require(path.join(output,
    'game/store/card/card-types'));
  const deps={Store,SimpleTacticsAi,PlayCardAction,SlotType,
    SuperType,EnergyType};
  const fixed=frozenRank6Trial();
  const original=runOne(deps,fixed,[]);
  const bench9=runOne(deps,fixed,[9]);
  const bench9and13=runOne(deps,fixed,[9,13]);
  for(const counter of [bench9,bench9and13]){
    assert.equal(counter.sourcePhysicalDealFingerprint,
      original.sourcePhysicalDealFingerprint);
    assert.equal(counter.originalSourceOwnHandFingerprint,
      original.originalSourceOwnHandFingerprint);
  }
  return {
    schema:'agent30-rank6-genuine-owner-t9-bench-Psychic-selected-seed-v1',
    originalControlLedgerSha256:ORIGINAL_SHA,
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    truePhysicalOriginalDeal:true,
    sourceAndCandidateSixtiesUnchanged:true,
    originallySelectedDevelopmentSeed:true,
    eligibleCompetitiveGames:0,
    rootOnlyNativeTargetReallocation:true,
    comparesAgainstSameSourceFingerprint:true,
    actualFullGameStrengthCertified:false,
    arms:[original,bench9,bench9and13]
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(main(),null,2)+'\n');
module.exports={frozenRank6Trial,runOne,main};
