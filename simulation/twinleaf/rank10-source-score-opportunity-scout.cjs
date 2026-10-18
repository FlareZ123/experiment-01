'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');
const {actionSignature,withRootDispatchCounter}=
  require('./rank10-hidden-order-live-probe.cjs');
const {captureTacticScores}=require('./tactic-score-trace.cjs');

/**
 * Record evaluated tactic proposals in the *actual* root bot without
 * proposing additional moves. The live Store state must be authenticated
 * by object identity; speculative Simulator states are not admitted.
 *
 * @template T
 * @param {Function} Ai
 * @param {()=>T} run
 * @param {()=>object|null} rootState
 * @param {()=>number} rootOrdinal
 * @returns {{result:T,events:object[],rootCalls:number}}
 */
function withRootScoreCensus(Ai,run,rootState,rootOrdinal) {
  const own=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.ok(own && typeof own.value==='function');
  const events=[];
  let rootCalls=0;
  function observed(state) {
    if(state!==rootState() ||
       state.prompts.some(prompt=>prompt.result===undefined))
      return own.value.call(this,state);
    rootCalls++;
    const capture=captureTacticScores(this,()=>own.value.call(this,state));
    if(capture.trace.length>0) {
      const names={},scoredNames={};
      for(const record of capture.trace) {
        names[record.tactic]=(names[record.tactic]??0)+1;
        if(Number.isFinite(record.score))
          scoredNames[record.tactic]=(scoredNames[record.tactic]??0)+1;
      }
      const acting=state.players.find(player=>player.id===this.client.id);
      const action=capture.result;
      const handIndex=action?.constructor?.name==='PlayCardAction'?
        action.handIndex:null;
      events.push({
        rootStep:rootOrdinal(),turn:state.turn,
        actorSeat:state.activePlayer,actorId:this.client.id,
        proposedAction:actionSignature(action),
        playedHandPrinting:handIndex===null?
          null:acting?.hand?.cards?.[handIndex]?.fullName??null,
        candidateEvaluations:capture.trace.length,
        finiteCandidateScores:Object.values(scoredNames).reduce(
          (total,count)=>total+count,0),
        tacticCounts:names,scoredTacticCounts:scoredNames,
        traceDigest:crypto.createHash('sha256')
          .update(JSON.stringify(capture.trace)).digest('hex')
      });
    }
    return capture.result;
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...own,value:observed});
  let result;
  try{result=run();}
  finally{Object.defineProperty(Ai.prototype,'decodeNextAction',own);}
  return {result,events,rootCalls};
}

/** Score-exposure census on the fixed published rank10 source game. */
function auditRank10SourceScoreCensus() {
  initializeCards();
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const rank1=byRank.get(1),rank10=byRank.get(10);
  assert.ok(rank1?.playableUnderEngine&&rank10?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const matches=plan.trials.filter(t=>t.phase==='pilot'&&t.rank===10&&
    t.repeat===0&&t.candidateId==='champion-reference'&&
    t.candidateEngineSlot==='B');
  assert.equal(matches.length,1);
  assert.equal(matches[0].seed,4246551499);
  const common={
    deckA:rank10.cardIds,deckB:rank1.cardIds,
    seed:matches[0].seed,maxActions:350,label:matches[0].trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {Store}=require(path.join(output,'game/store/store'));
  const control=runMatch(common);
  const observed=withRootDispatchCounter(Store,
    (getOrdinal,getSearches,getBoundary,getRootState)=>
      withRootScoreCensus(SimpleTacticsAi,()=>runMatch(common),
        getRootState,getOrdinal),0);
  assert.deepEqual(observed.result,control,
    'Score observation changed the authentic source match result');
  const events=observed.events.slice();
  const topByScore=events.sort((a,b)=>
    b.finiteCandidateScores-a.finiteCandidateScores||
    b.candidateEvaluations-a.candidateEvaluations||
    a.rootStep-b.rootStep).slice(0,16);
  const supporterAttempts=observed.events.filter(event=>
    Object.keys(event.tacticCounts).some(name=>/supporter/i.test(name)));
  const scoredSupporters=observed.events.filter(event=>
    Object.keys(event.scoredTacticCounts).some(name=>/supporter/i.test(name)));
  return {
    study:'authentic-rank10-v4-policy-score-exposure-census',
    sourceTrialId:matches[0].trialId,seed:matches[0].seed,
    rootPolicyCalls:observed.rootCalls,
    nonzeroScoreExposureCalls:observed.events.length,
    topByScore,
    firstSupporterEvaluationAttempt:supporterAttempts[0]??null,
    firstSupporterScoreOpportunity:scoredSupporters[0]??null,
    sourceTerminal:{
      winner:control.winner,turns:control.turns,actions:control.actions
    },
    matchedUninstrumentedGame:true,
    qualifiedForCompetitiveInference:false,
    interpretation:'Attempted evaluations and finite scored proposals are distinct; no counterfactual difference or win-rate proof'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(auditRank10SourceScoreCensus(),null,2)+'\n');
module.exports={withRootScoreCensus,auditRank10SourceScoreCensus};
