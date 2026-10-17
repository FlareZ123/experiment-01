'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');
const {writeLockedArtifact} =
  require('../evaluation/aichi-campaign-envelope-runner.cjs');

const SEED=1260748957;
const SOURCE_RANK=8;
const CANDIDATE_SLOT=1;

/** @param {unknown} value @returns {string} */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {object} action @returns {string} */
const actionSignature=action=>[
  action.action,action.playerSlot,action.card??'',
  action.attack??'',action.ability??''
].join('|');

/**
 * Extract root, observable actions and gameplay outcomes from one bounded
 * source-locked experiment. Engine completion is not competitive evidence.
 * @param {object} game Pinned headless match response.
 * @returns {object}
 */
function summarize(game) {
  const actions=Array.isArray(game.decisionTrace)?game.decisionTrace:[];
  const starActions=actions.filter(action=>action.action==='UseAbilityAction' &&
    action.ability==='Star Alchemy');
  return {
    seed:game.seed,firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    engine:game.engine,policy:game.policy,
    attachedToolPowerPolicy:game.attachedToolPowerPolicy,
    deckHashes:game.deckHashes,
    finished:game.finished,physicalWinner:game.winner,
    prizeCounts:game.prizesRemaining,turns:game.turns,rootActions:game.actions,
    endReason:game.endReason,
    stonePlaysBySeat:(game.cardsPlayedBySeat||[]).map(
      plays=>plays['Forest Seal Stone']||0),
    starAlchemyRootActions:starActions.map(action=>({
      ordinal:action.actionOrdinal,turn:action.turnBefore,
      physicalSeat:action.playerSlot,ability:action.ability
    })),
    abilityTraceStarCount:(game.abilityTrace||[])
      .filter(action=>action.name==='Star Alchemy').length,
    attacksBySeat:(game.attackTrace||[]).reduce((n,action)=>{
      n[action.seat]+=1;return n;
    },[0,0]),
    decisionSignatures:actions.map(actionSignature),
    decisionTrace:actions,
    fullActionAndPromptReplay:false
  };
}

/**
 * Pre-registered falsification contrast on exactly the original 1260748957
 * candidate-second deal and exact Hood/rank8 source 60s. The sole changed
 * experimental bit is the equal-seat Tool-granted Ability candidate policy.
 * No outcome- or hand-based seed selection occurs.
 * @returns {object}
 */
function main() {
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const source=require('../../results/aichi-2026/full-decklists.json')
    .decks.find(deck=>deck.rank===SOURCE_RANK);
  assert.ok(source);
  assert.equal(candidate.cards.reduce((n,card)=>n+card.count,0),60);
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(deck=>deck.rank===SOURCE_RANK);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const base={
    deckA:opponent.cards,deckB:plan.candidate.cards,seed:SEED,
    maxActions:800,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true
  };
  initializeCards();
  const arms=[];
  for(const [name,toolPolicy] of [['baseline',false],['tool-power-v1',true]]) {
    const game=runMatch({...base,attachedToolPowerPolicy:toolPolicy,
      label:'rank8-source-hood-stone-policy-'+name});
    const result=summarize(game);
    assert.equal(result.seed,SEED);
    assert.equal(result.firstTurnSlot,0,'Frozen deal must start candidate second');
    assert.equal(result.verifiedByDrawLog,true);
    assert.equal(result.attachedToolPowerPolicy,toolPolicy);
    assert.equal(result.policy.includes('+AttachedToolPowerCandidate-v1'),toolPolicy);
    assert.deepEqual(result.deckHashes,[digest(base.deckA),digest(base.deckB)]);
    arms.push({name,...result});
  }
  const a=arms[0].decisionSignatures,b=arms[1].decisionSignatures;
  const firstDifference=Array.from(
    {length:Math.max(a.length,b.length)},(_,i)=>i)
    .find(i=>a[i]!==b[i])??null;
  return {
    schema:'rank8-hood-tool-power-source-contrast-v1',
    sourceResearchRevision:process.env.GITHUB_SHA||'unrecorded',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed:SEED,seedProtocol:'previously registered decorrelated-slots-v3',
    seedSelectionRule:'candidate-second draw-log only; ordinal 2 from source study',
    candidatePhysicalSeat:'B',candidateTrueTurn:'second',
    candidateName:'hood-shield-v1',candidateSourceSha256:digest(candidate.cards),
    sourceOpponentRank:SOURCE_RANK,sourceOpponentSha256:digest(source.cards),
    resolvedSourceDeckHashes:[digest(base.deckA),digest(base.deckB)],
    soleIntendedPolicyChange:'attachedToolPowerPolicy false versus true for both seats',
    firstRootDecisionDifference:firstDifference,
    comparedRootPrefixLength:firstDifference===null?Math.min(a.length,b.length):firstDifference,
    arms,qualifiedForCompetitiveInference:false,
    limitations:[
      'Opposing generic bot is not independently qualified, including source Garbotoxin Tool setup and attack target decisions',
      'Independent policy randomness streams do not guarantee identical draws after policy action branches',
      'DecisionTrace is an action summary, not a complete prompt-replay transcript',
      'A missing Star Alchemy use does not prove the Tool route is unplayable',
      'Two matched trajectories cannot estimate any game win rate'
    ]
  };
}
if(require.main===module){
  const report=main();
  writeLockedArtifact('rank8-hood-stone-policy-contrast.json',
    JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({
    seed:report.seed,firstDifference:report.firstRootDecisionDifference,
    arms:report.arms.map(a=>({name:a.name,finished:a.finished,
      actions:a.rootActions,turns:a.turns,stone:a.stonePlaysBySeat,
      star:a.starAlchemyRootActions,abilityStar:a.abilityTraceStarCount,
      attacks:a.attacksBySeat,prizes:a.prizeCounts,policy:a.policy})),
    qualified:false
  },null,2));
}
module.exports={digest,actionSignature,summarize,main};
