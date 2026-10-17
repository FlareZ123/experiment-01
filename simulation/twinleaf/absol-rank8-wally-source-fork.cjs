'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {firstDecisionDifference,decisionSignature}=
  require('./rank10-dde-policy-drift.cjs');
const {loadCampaignInputs}=require('../evaluation/aichi-campaign-runner.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Prefer exact known Wally in own hand only at rank-8 opponent's first actual
 * turn when the unmodified bot instead Passes with Benched Trubbish.
 * No opponent private zones or omniscient deck information are inspected.
 * @param {object} state Live state.
 * @param {number} playerId Acting opponent ID.
 * @param {object} proposed Existing bot's proposed action.
 * @returns {number} Own-hand Wally index, or -1.
 */
function sourceWallyIndex(state,playerId,proposed) {
  if(state.turn!==2 || state.activePlayer!==0 || playerId!==101 ||
      proposed?.constructor?.name!=='PassTurnAction' ||
      state.prompts.some(p=>p.result===undefined))return -1;
  const player=state.players.find(p=>p.id===playerId);
  if(!player?.bench.some(slot=>
    slot.getPokemonCard()?.name==='Trubbish'))return -1;
  return player.hand.cards.findIndex(card=>card.fullName==='Wally ROS');
}

/**
 * One source Pass -> Wally research fork with DDE-v4 otherwise unchanged.
 * @template T
 * @param {()=>T} work Execute the one synchronous source game.
 * @returns {{result:T,overrides:object[]}}
 */
function withOneSourceWallyInsteadOfPass(work) {
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction}=require(path.join(output,
    'game/store/actions/play-card-action'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let exercised=false;
  const overrides=[];
  SimpleTacticsAi.prototype.decodeNextAction=function wallySourceFork(state) {
    const proposed=original.call(this,state);
    if(exercised)return proposed;
    const handIndex=sourceWallyIndex(state,this.client.id,proposed);
    if(handIndex<0)return proposed;
    exercised=true;
    overrides.push({
      turn:state.turn,actorId:this.client.id,
      original:proposed.constructor.name,
      replacement:'Wally ROS',handIndex,
      benchBefore:state.players.find(p=>p.id===this.client.id).bench
        .map(slot=>slot.getPokemonCard()?.fullName||null)
    });
    return new PlayCardAction(this.client.id,handIndex,{
      player:0,slot:0,index:0
    });
  };
  try{return {result:work(),overrides};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}

/** @param {object} event @returns {object} */
function boundedRoot(event) {
  return {
    rootStep:event.step,turn:event.before.turn,seat:event.before.activePlayer,
    action:event.action,
    pendingPrompt:event.pendingPrompt||null,
    selectedCards:event.choiceReferences?.selectedCards||null,
    slotChoice:event.slotChoice||null,
    prizesBefore:event.before.prizesRemaining,
    prizesAfter:event.after?.prizesRemaining
  };
}

/** @param {object} game @returns {object} */
function ending(game) {
  return {
    winner:game.winner,finished:game.finished,
    firstTurnSlot:game.firstTurnSlot,
    turns:game.turns,actions:game.actions,
    prizesRemaining:game.prizesRemaining,
    attacks:(game.attackTrace||[]).slice(0,16).map(x=>({
      turn:x.turn,seat:x.seat,attacker:x.activePokemon,attack:x.attack
    }))
  };
}

/** @returns {object} */
function main() {
  const inputs=loadCampaignInputs();
  const candidate=inputs.candidates.find(c=>c.id==='temple-v1');
  assert.ok(candidate);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=plan.trials.find(t=>t.phase==='pilot' && t.rank===8 &&
    t.candidateId==='temple-v1' && t.repeat===0 &&
    t.candidateEngineSlot==='B');
  assert.equal(trial?.seed,4168858073);
  const prepared=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=prepared.opponents.find(x=>x.rank===8);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:prepared.candidate.cards,
    seed:trial.seed,maxActions:600,label:trial.trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureAttackPassProbes:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  initializeCards();
  const {Store}=require(path.join(output,'game/store/store'));
  const capture=()=>withStoreDispatchTranscript(Store,()=>runMatch(request),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const first=capture();
  let branch=null,branchError=null,branchOverride=null;
  try{
    const modified=withOneSourceWallyInsteadOfPass(capture);
    branch=modified.result;
    branchOverride=modified.overrides;
  }catch(error){branchError=String(error.message||error);}
  const repeat=capture();
  assert.deepEqual(repeat.result,first.result,
    'Source control summary changed after Wally override experiment');
  assert.deepEqual(repeat.actionTrace.map(decisionSignature),
    first.actionTrace.map(decisionSignature),
    'Source control action stream changed after Wally branch');
  assert.equal(first.result.firstTurnSlot,1,
    'Opponent was not actually going second in source seed');
  if(branch)assert.equal(branchOverride.length,1,
    'Expected exactly one source-ranked Wally Pass substitution');
  const difference=branch?
    firstDecisionDifference(first.actionTrace,branch.actionTrace):null;
  if(difference)assert.equal(difference.control?.beforeZone,
    difference.corrected?.beforeZone,
    'Source zone changed before first Wally action');
  return {
    kind:'rank8-temple-b-source-wally-versus-pass',
    seed:trial.seed,trialId:trial.trialId,
    candidateSlot:'B',actualCandidateFirst:true,
    sourceManifestRank:8,planDigest:plan.planDigest,
    identicalUnchangedSourceRepeat:true,
    fork:branchOverride?.[0]||null,
    firstRootDifference:difference,
    original:ending(first.result),
    wallyFork:branch?ending(branch.result):null,
    firstBranchActions:branch&&difference?
      branch.actionTrace.slice(difference.rootStep,
        difference.rootStep+18).map(boundedRoot):[],
    error:branchError,
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    limitations:[
      'Single published rank8 source game; rank8 opponent actually second',
      'Original proposed Pass computed once before replacing it; speculative bot may alter source state',
      'Wally card legality, prompt selection and future policy still require scrutiny',
      'Any engine winner here is unqualified and not a win-rate observation'
    ]
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={sourceWallyIndex,withOneSourceWallyInsteadOfPass,main};
