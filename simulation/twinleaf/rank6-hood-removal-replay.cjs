'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {fixedFrame}=require('./rank6-hood-prospective-exposure.cjs');
const {runWithResearchProfile,DEFAULT_PROFILE}=require('./policy-profiles.cjs');
const {withEarlyShadowRiderHood}=require('./early-shadow-rider-hood.cjs');
const {withProtectedUnderworldDoor}=require('./protected-underworld-door.cjs');
const {withRank6HoodRemoval}=require('./rank6-hood-removal-policy.cjs');
const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

/** @param {unknown} value */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Root-Store-only physical public-board Tool transitions. Deck/hand/private
 * zones are neither recorded nor queried. The callback sees the original
 * opponent state only; simulation subgraphs never count as live reductions.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,physicalToolTransitions:object[]}}
 */
function withRootToolTransitions(candidateSeat,execute){
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root;
  const physicalToolTransitions=[];
  /** @param {object} state */
  function publicHoods(state){
    const player=state?.players?.[candidateSeat];
    if(!player)return [];
    return [player.active,...player.bench].flatMap((zone,index)=>
      zone.tools.filter(card=>card.name==='Stealthy Hood')
        .map(card=>({slot:index===0?'ACTIVE':'BENCH',
          index:index===0?0:index-1,
          card:card.fullName,pokemon:zone.getPokemonCard()?.fullName||null})));
  }
  function dispatch(action,...rest){
    if(!root && action?.constructor?.name==='AddPlayerAction')root=this;
    const before=this===root?publicHoods(this.state):[];
    const turn=this===root?this.state?.turn:null;
    const actorSeat=this===root?this.state?.activePlayer:null;
    const result=descriptor.value.call(this,action,...rest);
    if(this===root){
      const after=publicHoods(this.state);
      if(before.length!==after.length)physicalToolTransitions.push({
        turnBefore:turn,turnAfter:this.state?.turn,
        actorSeat,action:action?.constructor?.name||null,
        previousCount:before.length,currentCount:after.length,
        before,after
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),physicalToolTransitions};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/**
 * All accepted root effects are separate from speculative or proposed
 * bot choices. This method does not compute a win rate.
 * @param {object} game
 * @param {object} item
 * @param {'control'|'removal'|'faba-target'} arm
 * @param {object} hood
 * @param {object} door
 * @param {object|null} source
 * @param {object[]} transitions
 */
function observe(game,item,arm,hood,door,source,transitions){
  assert.equal(game.verifiedByDrawLog,true);
  const chosen=(hood.events||[]).filter(row=>row.kind==='selected-root-play');
  const attached=transitions.filter(row=>row.currentCount>row.previousCount);
  const removed=transitions.filter(row=>row.currentCount<row.previousCount);
  const chosenSource=(source?.events||[]).filter(row=>
    row.kind==='selected-source-play');
  const completedDoor=(door.events||[]).filter(row=>
    row.kind==='verified-real-store-effect'&&row.attached&&row.drawnTwo&&
    row.ironThornsStillActive&&row.hoodStillAttached);
  const sourceAttacks=(game.attackDeclarationTrace||[]).filter(row=>
    row.playerSlot===item.sourceSeat);
  const ownAttacks=(game.attackDeclarationTrace||[]).filter(row=>
    row.playerSlot===item.candidateSeat);
  return {
    ...item,arm,status:'engine-observed',
    trueFirstTurnSeat:game.firstTurnSlot,
    sourceActuallyFirst:game.firstTurnSlot===item.sourceSeat,
    deckHashes:game.deckHashes,
    sourceOwnerRemovalSelected:chosenSource.length,
    sourceOwnerRemovalActions:chosenSource,
    sourceOwnerRemovalRejections:(source?.events||[]).filter(row=>
      row.kind==='pinned-source-play-rejected'),
    sourceFabaPromptSelections:(source?.events||[]).filter(row=>
      row.kind==='selected-source-faba-prompt'),
    sourceFabaStage:source?.fabaStage??null,
    selectedHoodActions:chosen.length,
    hoodActualAttachments:attached.length,
    completedProtectedDoorEffects:completedDoor.length,
    actualPhysicalHoodReductions:removed.length,
    rootPhysicalToolTransitions:transitions.slice(0,12),
    candidateAttackDeclarations:ownAttacks.length,
    opponentAttackDeclarations:sourceAttacks.length,
    candidateAttackNames:ownAttacks.slice(0,6).map(row=>row.attackName),
    sourceAttackNames:sourceAttacks.slice(0,6).map(row=>row.attackName),
    engineFinished:game.finished===true,
    actionCount:game.actions,
    winnerDiagnosticOnly:game.finished?game.winner:null,
    prizesDiagnosticOnly:game.prizesRemaining,
    qualifiedCompetitiveGame:false
  };
}

/**
 * Historical-rank6 policy counterfactual on a fixed already-observed frame.
 * @param {{targetFabaHood?:boolean}} [options]
 * @returns {object}
 */
function run({targetFabaHood=false}={}){
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(row=>row.rank===6);
  assert.equal(rank6?.status,'ready');
  const hashes={source:digest(rank6.cards),candidate:digest(plan.candidate.cards)};
  const records=[];
  const arms=targetFabaHood?['removal','faba-target']:['control','removal'];
  for(const item of fixedFrame()){
    for(const arm of arms){
      const request={
        deckA:item.sourceSeat===0?rank6.cards:plan.candidate.cards,
        deckB:item.sourceSeat===1?rank6.cards:plan.candidate.cards,
        seed:item.seed,maxActions:140,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        label:'rank6-source-hood-remover:'+item.repeat+':'+item.sourceSeat+':'+arm
      };
      try{
        const physical=withRootToolTransitions(item.candidateSeat,()=>{
          const play=()=>withEarlyShadowRiderHood(item.candidateSeat,()=>
            withProtectedUnderworldDoor(item.candidateSeat,()=>
              runWithResearchProfile(request,DEFAULT_PROFILE),
              {lockKind:'initialization'}),
            {lockKind:'initialization'});
          return arm==='removal'?
            withRank6HoodRemoval(item.sourceSeat,play,
              {targetHoodWithFaba:arm==='faba-target'}):{
              result:play(),policyAudit:null
            };
        });
        const source=physical.result.policyAudit;
        const hood=physical.result.result.policyAudit;
        const door=physical.result.result.result.policyAudit;
        const game=physical.result.result.result.result;
        assert.equal(game.seed,item.seed);
        assert.equal(game.engine,'twinleafgg/'+plan.engineRevision);
        assert.deepEqual(game.deckHashes,item.sourceSeat===0?
          [hashes.source,hashes.candidate]:[hashes.candidate,hashes.source]);
        records.push(observe(game,item,arm,hood,door,source,
          physical.physicalToolTransitions));
      }catch(error){
        records.push({...item,arm,status:'engine-exception',
          error:String(error?.stack||error),qualifiedCompetitiveGame:false});
      }
    }
  }
  const count=(arm,key)=>records.filter(row=>
    row.arm===arm&&row.status==='engine-observed'&&row[key]>0).length;
  const success=records.filter(row=>row.status==='engine-observed').length;
  const actualStarts=records.filter(row=>row.arm==='control'&&
    row.sourceActuallyFirst===true).length;
  return {
    schema:targetFabaHood?
      'agent7-rank6-faba-target-retrospective-replay-v2':
      'agent7-rank6-owner-hood-removal-retrospective-replay-v1',
    registration:targetFabaHood?
      'results/aichi-2026/agent7-rank6-faba-target-reply-registration.md':
      'results/aichi-2026/agent7-rank6-hood-source-reply-registration.md',
    studyArms:arms,targetFabaHood,
    context:'Historical source deals; source-counterplay policy frozen before replay; do not count as independent prospective games',
    seedFrame:fixedFrame(),sourceRank:6,
    engine:'twinleafgg/'+plan.engineRevision,
    sourceDeckHash:hashes.source,candidateDeckHash:hashes.candidate,
    attempts:records.length,success,
    failures:records.length-success,
    uniqueDeals:fixedFrame().length,
    actualSourceFirstDeals:actualStarts,
    controlHoodAttachmentDeals:count('control','hoodActualAttachments'),
    controlDoorEffectDeals:count('control','completedProtectedDoorEffects'),
    counterplaySelectionDeals:count('removal','sourceOwnerRemovalSelected'),
    actualHoodReductionDeals:count('removal','actualPhysicalHoodReductions'),
    removalHoodAttachmentDeals:count('removal','hoodActualAttachments'),
    removalDoorEffectDeals:count('removal','completedProtectedDoorEffects'),
    fabaTargetSourceChoiceDeals:count('faba-target','sourceOwnerRemovalSelected'),
    fabaTargetActualHoodReductionDeals:count('faba-target','actualPhysicalHoodReductions'),
    fabaTargetProtectedDoorDeals:count('faba-target','completedProtectedDoorEffects'),
    qualifiedCompetitiveGames:0,
    records,
    warning:'All arms are opponent-decision probes on inspected prior source seeds with unqualified bots. Physical Tool reduction can also arise from KO/switch/other reducers; inspect action ledger before attributing it to Faba or Megaton Blower.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withRootToolTransitions,observe,run};
