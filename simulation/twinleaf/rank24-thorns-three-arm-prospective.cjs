'use strict';

const assert = require('node:assert/strict');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const { runMatch } = require('./headless.cjs');
const { withSourceOpeningProbe } = require('./rank6-seed-opening-probe.cjs');
const { withBroadThornsSourceAttack } = require('./rank6-broad-thorns-policy.cjs');
const { publicTurnLedger } = require('./rank6-response-projection.cjs');
const { TIER_NAMES, groupsForRank } =
  require('../../scripts/aichi-thorns-crossrank-opening.cjs');

// 24 distinct CSPRNG uint32 values frozen before any source execution.
const FROZEN_SEEDS = Object.freeze([
  1150814608,1227663392,1536200185,2738504777,
  3947869777,1646324166,530785730,3392296998,
  2966203069,1612901860,1454548326,1245565188,
  780632397,3414027287,362426168,1707024377,
  2271301293,307969223,2087054058,3364644363,
  245444614,672333298,2804067880,2069970111
]);
const PROFILES = Object.freeze([
  Object.freeze({id:'default-generic-source-bot',tier:null}),
  Object.freeze({id:'source-ownhand-protected25',tier:3}),
  Object.freeze({id:'source-ownhand-broad32',tier:4})
]);

/** @param {number} tier */
function priorityForTier(tier) {
  return TIER_NAMES.slice(1, tier + 1).flat();
}

/** @param {object} game */
function gameSummary(game) {
  return {
    seed: game.seed,
    actualFirstSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    sourceDeckHashes:game.deckHashes,
    actions:game.actions,
    turns:game.turns,
    finished:game.finished,
    winnerIndex:game.finished?game.winner:null,
    firstTurnSourceAttacks:game.attackTrace.filter(a=>
      a.seat===1 && a.turn===2).map(a=>a.attack),
    championThirdTurnReply:publicTurnLedger(game.decisionTrace,{seat:0,turn:3})
      .slice(0,12),
    championThirdTurnTotalActions:publicTurnLedger(
      game.decisionTrace,{seat:0,turn:3}).length
  };
}

/** @param {object} request @param {{id:string,tier:number|null}} profile */
function executeArm(request,profile) {
  try {
    const trial=withSourceOpeningProbe(()=>
      profile.tier===null ? runMatch(request) :
      withBroadThornsSourceAttack(()=>runMatch(request),{
        seat:1,turn:2,discardPriority:priorityForTier(profile.tier)
      }));
    const policy=profile.tier===null?null:trial.out;
    const game=policy?policy.result:trial.out;
    const observer=trial.observed;
    return {
      profile:profile.id,summary:gameSummary(game),
      sourceVisibleOpening:observer ? {
        active:observer.active,hand:observer.hand,
        dceZoneCounts:Object.fromEntries(Object.entries(observer.doubleColorless)
          .map(([zone,cards])=>[zone,cards.length]))
      }:null,
      // Privileged Prize data is retained exclusively for paired equality;
      // do not serialize it or provide it to the source-owner bot.
      _privatePairingPrizes:observer?.prizes??null,
      triggered:policy?.started??false,
      actionProposed:policy?.completed??false,
      openingPlan:policy?.openingPlan??null,
      abortReason:policy?.abortReason??null,
      chosenSourceActions:policy?.events??[],
      actuallyAnnouncedSourceAttack:game.attackTrace.some(a=>
        a.seat===1 && a.turn===2 && a.attack==='Volt Cyclone')
    };
  } catch (error) {
    return {profile:profile.id,error:String(error?.message??error).slice(0,1200),
      policyErrorStage:error?.rank6PolicyEvidence??null};
  }
}

/** Precommitted source-dealt owner-policy comparison, without a win-rate claim. */
function main() {
  assert.equal(new Set(FROZEN_SEEDS).size,FROZEN_SEEDS.length);
  assert.equal(groupsForRank(24,3).discards,25);
  assert.equal(groupsForRank(24,4).discards,32);
  const field=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opposing=field.opponents.find(x=>x.rank===24);
  assert.ok(opposing&&field.candidate);
  assert.equal(field.candidate.cards.length,60);
  assert.equal(opposing.cards.length,60);
  assert.equal(groupsForRank(24,0).thorns,4);
  assert.equal(groupsForRank(24,0).dce,3);
  const base={
    deckA:field.candidate.cards,deckB:opposing.cards,
    maxActions:105,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const rows=FROZEN_SEEDS.map(seed=>{
    const arms=PROFILES.map(profile=>executeArm({...base,seed},profile));
    const ok=arms.every(arm=>arm.summary);
    const sameSourceDeal=ok &&
      arms.every(arm=>arm.summary.actualFirstSlot===arms[0].summary.actualFirstSlot &&
        JSON.stringify(arm.summary.sourceDeckHashes)===
          JSON.stringify(arms[0].summary.sourceDeckHashes) &&
        JSON.stringify(arm.sourceVisibleOpening?.hand??null)===
          JSON.stringify(arms[0].sourceVisibleOpening?.hand??null) &&
        JSON.stringify(arm._privatePairingPrizes)===
          JSON.stringify(arms[0]._privatePairingPrizes));
    const sanitized=arms.map(({_privatePairingPrizes,...other})=>other);
    return {seed,arms:sanitized,sameSourceDeal,
      actualSourceGoesSecond:ok&&arms[0].summary.actualFirstSlot===0,
      validReproduciblePair:ok && sameSourceDeal &&
        arms.every(arm=>arm.summary.verifiedByDrawLog===true)};
  });
  const valid=rows.filter(row=>row.validReproduciblePair &&
    row.actualSourceGoesSecond);
  const report={
    schema:'rank24-thorns-three-arm-prospective-source-policy-v1',
    candidateRank:1,opponentRank:24,
    fieldSource:'results/aichi-2026/full-decklists.json',
    publishedOpponentPlayer:opposing.player,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    precommittedSeeds:FROZEN_SEEDS, policyProfiles:PROFILES,
    controlAndInterventions:'same genuine dealt source 60s, true starting order, own-hand policy only. Protected tier3 has 25 eligible physical copies; broad tier4 has 32. Source owner deck is read only inside actual prompted search. Candidate policy is unchanged generic, not qualified.',
    summary:{
      totalPrespecifiedSeeds:rows.length,
      fullPairedArms:rows.filter(x=>x.validReproduciblePair).length,
      actualSourceSecondValidPairs:valid.length,
      protectedSourcePolicyStarted:valid.filter(x=>x.arms[1].triggered).length,
      protectedSourceAttackProposed:valid.filter(x=>x.arms[1].actionProposed).length,
      protectedRecordedVoltCyclone:valid.filter(x=>
        x.arms[1].actuallyAnnouncedSourceAttack).length,
      broadSourcePolicyStarted:valid.filter(x=>x.arms[2].triggered).length,
      broadSourceAttackProposed:valid.filter(x=>x.arms[2].actionProposed).length,
      broadRecordedVoltCyclone:valid.filter(x=>
        x.arms[2].actuallyAnnouncedSourceAttack).length,
      errors:rows.flatMap(row=>row.arms.filter(a=>a.error)
        .map(a=>({seed:row.seed,profile:a.profile,error:a.error})))
    },
    rows,
    competitiveQualifiedGames:0,
    caveat:'Prospective fixed-seed source-game *decision* diagnostic only. Generic full-game policies, incomplete games, printed-card correctness, official match clock and three unpublished field lists prevent competitive win inference. No trial substitution permitted.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={FROZEN_SEEDS,PROFILES,priorityForTier,main};
