'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {decisionSignature,firstDecisionDifference}=
  require('./rank10-dde-policy-drift.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

/**
 * Select a real counterfactual Item only when the unmodified bot would choose
 * Double Dragon Energy. Reads only own hand, own Active and public turn fields.
 * @param {object} state Live game state.
 * @param {number} playerId Current bot player's ID.
 * @param {object} proposedAction Action chosen by the current-v4 bot.
 * @returns {{handIndex:number,target:object}|null}
 */
function chooseTurn2PrimeCatcher(state,playerId,proposedAction) {
  if(state.turn!==2 || state.activePlayer!==0 || state.phase!==2 ||
      playerId!==101 || state.prompts.some(p=>p.result===undefined) ||
      proposedAction?.constructor?.name!=='PlayCardAction') return null;
  const player=state.players.find(p=>p.id===playerId);
  if(player?.active.getPokemonCard()?.fullName!=='Regidrago V SIT')return null;
  if(player.hand.cards[proposedAction.handIndex]?.fullName!==
      'Double Dragon Energy ROS')return null;
  const primeIndex=player.hand.cards.findIndex(c=>c.fullName==='Prime Catcher TEF');
  if(primeIndex<0)return null;
  return {handIndex:primeIndex,target:{player:0,slot:0,index:0}};
}

/**
 * One-action source-policy counterfactual. Keeps DDE-v4 enabled throughout
 * both games; restores the engine's method after the full source game.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,overrides:object[]}}
 */
function withOnePrimeCatcherInsteadOfDde(execute) {
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction}=require(path.join(root,'game/store/actions/play-card-action'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let exercised=false;
  const overrides=[];
  SimpleTacticsAi.prototype.decodeNextAction=function sourceTurn2Override(state) {
    const proposed=original.call(this,state);
    const choice=!exercised?
      chooseTurn2PrimeCatcher(state,this.client.id,proposed):null;
    if(!choice)return proposed;
    exercised=true;
    overrides.push({turn:state.turn,playerId:this.client.id,
      originalPrinting:state.players.find(p=>p.id===this.client.id)
        .hand.cards[proposed.handIndex].fullName,
      replacementPrinting:'Prime Catcher TEF',
      target:choice.target});
    return new PlayCardAction(this.client.id,choice.handIndex,choice.target);
  };
  try{return {result:execute(),overrides}}finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/** @param {object} match @returns {object} */
function endResult(match) {
  return {
    winner:match.winner,finished:match.finished,turns:match.turns,
    actions:match.actions,prizesRemaining:match.prizesRemaining,
    firstTurnSlot:match.firstTurnSlot,
    turn27Seen:(match.copycatTurnStartEvidence||[]).some(x=>x.turn===27),
    firstAttacks:(match.attackTrace||[]).slice(0,12).map(x=>({
      turn:x.turn,seat:x.seat,attacker:x.activePokemon,attack:x.attack,
      prizesBefore:x.prizeCountBefore,prizesAfter:x.prizeCountAfter
    }))
  };
}

function main() {
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const opponent=byRank.get(10),candidate=byRank.get(1);
  assert.ok(opponent?.playableUnderEngine && candidate?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=plan.trials.find(t=>t.phase==='pilot' && t.rank===10 &&
    t.candidateId==='champion-reference' && t.repeat===0 &&
    t.candidateEngineSlot==='B');
  assert.ok(trial);assert.equal(trial.seed,4246551499);
  const request={
    deckA:opponent.cardIds,deckB:candidate.cardIds,
    seed:trial.seed,maxActions:350,label:trial.trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const capture=()=>withStoreDispatchTranscript(Store,()=>runMatch(request),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const control=capture();
  const replacement=withOnePrimeCatcherInsteadOfDde(capture);
  const repeat=capture();
  assert.deepEqual(repeat.result,control.result,
    'Unmodified v4 result was changed by the one-action policy override');
  assert.deepEqual(repeat.actionTrace.map(decisionSignature),
    control.actionTrace.map(decisionSignature),
    'Unmodified v4 source root actions changed after policy override');
  assert.equal(replacement.overrides.length,1,
    'Expected exactly one true source-dealt v4 DDE-to-Prime choice');
  const divergence=firstDecisionDifference(control.actionTrace,
    replacement.result.actionTrace);
  assert.equal(divergence?.rootStep,15,
    'Single-choice fork did not first diverge at genuine source root 15');
  assert.equal(divergence.control?.beforeZone,divergence.corrected?.beforeZone,
    'Physical source zones changed before the substituted live action');
  assert.equal(divergence.control?.action,'PlayCardAction');
  assert.equal(divergence.corrected?.action,'PlayCardAction');
  return {
    kind:'rank10-v4-single-source-turn2-prime-catcher-counterfactual',
    source:{rank:10,seed:trial.seed,candidateSlot:'B',
      planDigest:plan.planDigest},
    branchPolicy:'DoubleDragonAttachTactic-v4 remains enabled',
    sourceActionPrefixEqual:true,
    repeatControlIdentical:true,
    firstSourceDivergence:divergence,
    override:replacement.overrides[0],
    control:endResult(control.result),
    forcedPrimeCatcher:endResult(replacement.result.result),
    qualification:'diagnostic-only',
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    limitations:[
      'One fixed seed, one physical starting seat, no independent samples',
      'Bot-decoding source policy and simulated-clone mechanics unqualified',
      'Override replaces only the first DDE action, then returns to v4 policy',
      'Winner and turn outcomes are engine results, not paper Expanded evidence'
    ]
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={chooseTurn2PrimeCatcher,
  withOnePrimeCatcherInsteadOfDde,main};
