'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withEarlyShadowRiderHood}=require('./early-shadow-rider-hood.cjs');
const {withProtectedUnderworldDoor}=require('./protected-underworld-door.cjs');

const BASE=20261018, RANK=11, REPEATS=8;

/**
 * Prospective source-seat-balanced seed frame fixed before observing outcomes.
 * The actual first player is recorded from the draw log, never presumed.
 * @returns {Array<{repeat:number,sourceSeat:0|1,candidateSeat:0|1,seed:number}>}
 */
function fixedSeedFrame(){
  const rows=[];
  for(let repeat=1;repeat<=REPEATS;repeat++){
    const p=deriveSlotSeeds(BASE,'pilot',RANK,repeat);
    rows.push({repeat,sourceSeat:0,candidateSeat:1,seed:p.A});
    rows.push({repeat,sourceSeat:1,candidateSeat:0,seed:p.B});
  }
  return rows;
}

/**
 * Action policy and Store effect ledger with every prospective deal retained.
 * No stage is a qualified competitive game or a win-rate estimator.
 * @param {object} game
 * @param {object} hood
 * @param {object} door
 * @param {object} item
 */
function observe(game,hood,door,item){
  assert.equal(game.verifiedByDrawLog,true,'True start order required');
  assert.ok(Array.isArray(game.deckHashes)&&game.deckHashes.length===2);
  const source=game.rank11AutonomousPolicy||null;
  const chosen=hood.events.filter(row=>row.kind==='selected-root-play');
  const declared=(game.attackDeclarationTrace||[]).filter(row=>
    row.playerSlot===item.candidateSeat);
  const rootAbilities=(game.abilityTrace||[]).filter(row=>
    row.seat===item.candidateSeat && row.name==='Underworld Door');
  const observedDoor=door.events.filter(row=>row.kind==='verified-real-store-effect');
  return {
    ...item,
    status:'engine-observed',
    verifiedTrueFirstPlayer:game.firstTurnSlot,
    actualSourceStartedFirst:game.firstTurnSlot===item.sourceSeat,
    sourceOpenerOpportunity:source?.opportunityDetected===true,
    sourceOpenerCompleted:source?.completeAtDecisionBoundary===true,
    sourceEquippedGarbodorWitness:source?.nextTurnLockWitness?.equippedGarbodor===true,
    selectedHoodAssignments:chosen.length,
    rootHoodSelections:chosen,
    selectedDoorAbility:door.selected===true,
    rootDoorDeclarations:rootAbilities.length,
    verifiedDoorEffects:observedDoor.filter(row=>row.attached&&row.drawnTwo&&
      row.garbodorStillTooled&&row.hoodStillAttached).length,
    doorActionAudit:door.events,
    candidateAttackDeclarations:declared.length,
    candidateAttackNames:declared.slice(0,8).map(row=>row.attackName),
    engineReachedTerminal:game.finished===true,
    rootActions:game.actions,
    engineWinnerDiagnosticOnly:game.finished?game.winner:null,
    enginePrizesDiagnosticOnly:game.prizesRemaining,
    qualifiedCompetitiveGame:false
  };
}

/** One bounded, fully retained source-opponent/candidate opportunity census. */
function run(){
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
    require('./policy-profiles.cjs');
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const rank11=plan.opponents.find(row=>row.rank===11);
  assert.equal(rank11?.status,'ready');
  const frame=fixedSeedFrame();
  assert.equal(frame.length,2*REPEATS);
  const records=[];
  const hashes={
    source:createHash('sha256').update(JSON.stringify(rank11.cards)).digest('hex'),
    candidate:createHash('sha256').update(JSON.stringify(plan.candidate.cards))
      .digest('hex')
  };
  for(const item of frame){
    const request={
      deckA:item.sourceSeat===0?rank11.cards:plan.candidate.cards,
      deckB:item.sourceSeat===1?rank11.cards:plan.candidate.cards,
      rank11SourceSeat:item.sourceSeat,seed:item.seed,maxActions:140,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      label:'rank11-hood-prospective:'+item.repeat+':'+item.sourceSeat
    };
    try{
      const selected=withEarlyShadowRiderHood(item.candidateSeat,()=>
        withProtectedUnderworldDoor(item.candidateSeat,()=>
          runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE)));
      const game=selected.result.result;
      assert.equal(game.seed,item.seed);
      assert.equal(game.engine,'twinleafgg/'+plan.engineRevision);
      assert.deepEqual(game.deckHashes,item.sourceSeat===0?
        [hashes.source,hashes.candidate]:[hashes.candidate,hashes.source]);
      records.push(observe(game,selected.policyAudit,
        selected.result.policyAudit,item));
    }catch(error){
      records.push({...item,status:'engine-exception',
        error:String(error?.stack||error),qualifiedCompetitiveGame:false});
    }
  }
  return {
    schema:'rank11-hood-original-deal-prospective-policy-exposure-v1',
    seedFrameProtocol:'aichi-decorrelated-slots-v3',
    seedBase:BASE,repeatCount:REPEATS,sourceRank:RANK,
    originalSourceListDigest:hashes.source,
    frozenCandidateDigest:hashes.candidate,
    engine:'twinleafgg/'+plan.engineRevision,
    maxActionsPerDeal:140,
    prospectiveFrame:frame,
    attempted:records.length,
    engineObserved:records.filter(r=>r.status==='engine-observed').length,
    sourceOpportunities:records.filter(r=>r.sourceOpenerOpportunity).length,
    equippedSourceWitnesses:records.filter(r=>r.sourceEquippedGarbodorWitness).length,
    hoodAssignments:records.filter(r=>r.selectedHoodAssignments>0).length,
    verifiedDoorEffects:records.filter(r=>r.verifiedDoorEffects>0).length,
    qualifiedCompetitiveGames:0,
    records,
    warning:'These prospectively seeded true-deal policy exposures are NOT competitive games: 140-action cap, partial Twinleaf mechanics, weak bots, zero Japanese paper-printing certification. All nonexposures and failures retained.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={BASE,RANK,REPEATS,fixedSeedFrame,observe,run};
