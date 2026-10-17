'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {decisionSignature,firstDecisionDifference}=
  require('./rank10-dde-policy-drift.cjs');
const {chooseTurn2PrimeCatcher}=require('./rank10-v4-turn2-prime-catcher-fork.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Replace exactly the source-root 15 DDE play without running the generic
 * bot's decodeNextAction at this pivot. The ordinal is pinned to an earlier,
 * independently observed v4 source control on one exact seed and pair.
 * It does not guess an unobserved prior bot proposal.
 *
 * @template T
 * @param {Function} Store Pinned Store class.
 * @param {()=>T} work Synchronous source game.
 * @returns {{result:T,overrides:object[]}}
 */
function withNoPreviewPrimeAtSourceStep(Store,work) {
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType}=
    require(path.join(root,'game/store/actions/play-card-action'));
  const storeDescriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const decodeOriginal=SimpleTacticsAi.prototype.decodeNextAction;
  assert.equal(typeof storeDescriptor?.value,'function');
  assert.equal(typeof decodeOriginal,'function');
  let sourceStore=null,nextSourceStep=0,exercised=false;
  const overrides=[];

  Store.prototype.dispatch=function sourceActionCounter(...args) {
    const action=args[0];
    if(!sourceStore && action?.constructor?.name==='AddPlayerAction')
      sourceStore=this;
    if(this===sourceStore)nextSourceStep++;
    return storeDescriptor.value.apply(this,args);
  };

  SimpleTacticsAi.prototype.decodeNextAction=function directPrimeChoice(state) {
    if(!exercised && nextSourceStep===15) {
      const playerId=this.client.id;
      const owner=state.players.find(p=>p.id===playerId);
      const ddeIndex=owner?.hand.cards.findIndex(c=>
        c.fullName==='Double Dragon Energy ROS') ?? -1;
      if(ddeIndex>=0) {
        const dummySourceProposal=new PlayCardAction(playerId,ddeIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        });
        const selected=chooseTurn2PrimeCatcher(state,playerId,
          dummySourceProposal);
        if(selected) {
          exercised=true;
          overrides.push({
            rootStep:nextSourceStep,
            turn:state.turn,
            actorId:playerId,
            suppressedOriginalBotEvaluation:true,
            previousSourceControlPrinting:'Double Dragon Energy ROS',
            replacementPrinting:'Prime Catcher TEF',
            handIndex:selected.handIndex,
            target:selected.target
          });
          return new PlayCardAction(playerId,selected.handIndex,selected.target);
        }
      }
    }
    return decodeOriginal.call(this,state);
  };

  try {
    return {result:work(),overrides};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=decodeOriginal;
    Object.defineProperty(Store.prototype,'dispatch',storeDescriptor);
  }
}

/** @param {object} match @returns {object} */
function summarize(match) {
  return {
    winner:match.winner,finished:match.finished,
    turns:match.turns,actions:match.actions,
    prizesRemaining:match.prizesRemaining,
    firstTurnSlot:match.firstTurnSlot,
    attacks:(match.attackTrace||[]).slice(0,18).map(a=>({
      turn:a.turn,seat:a.seat,attacker:a.activePokemon,attack:a.attack
    }))
  };
}

/** @returns {object} */
function main() {
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const candidate=ranks.get(1),opponent=ranks.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=plan.trials.find(t=>t.phase==='pilot' && t.rank===10 &&
    t.candidateId==='champion-reference' && t.repeat===0 &&
    t.candidateEngineSlot==='B');
  assert.equal(trial?.seed,4246551499);
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
  const {Store}=require(path.join(root,'game/store/store'));
  const capture=()=>withStoreDispatchTranscript(Store,()=>runMatch(request),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const before=capture();
  const fork=withNoPreviewPrimeAtSourceStep(Store,capture);
  const after=capture();
  assert.equal(fork.overrides.length,1,'Expected one direct pinned-step override');
  assert.deepEqual(after.result,before.result,
    'Direct fork left a change in subsequent unmodified game summary');
  assert.deepEqual(after.actionTrace.map(decisionSignature),
    before.actionTrace.map(decisionSignature),
    'Direct fork left a change in subsequent unmodified source actions');
  const first=firstDecisionDifference(before.actionTrace,
    fork.result.actionTrace);
  assert.equal(first?.rootStep,15,
    'No-preview fork did not first diverge at source root 15');
  assert.equal(first.control?.beforeZone,first.corrected?.beforeZone,
    'No-preview branch inherited a different physical preaction source zone');
  return {
    kind:'rank10-v4-prime-catcher-direct-no-original-bot-evaluation',
    policy:'DDE-v4 remains active on all turns in all arms',
    rank:10,seed:trial.seed,physicalChampionSeat:'B',
    planDigest:plan.planDigest,
    override:fork.overrides[0],
    preDecisionSourceIdentical:true,
    untouchedControlRepeatIdentical:true,
    firstSourceDifference:first,
    control:summarize(before.result),
    noPreviewPrime:summarize(fork.result.result),
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    limitations:[
      'Known source-root ordinal 15 for exactly one source deal; no general play policy',
      'Direct branch uses its own chosen action without querying the normal bot at that action',
      'Unknown full live Store closure/reducer and speculative policy fidelity',
      'No opponent decision competence, independent seeds or seat-balanced inference'
    ]
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={withNoPreviewPrimeAtSourceStep,main};
