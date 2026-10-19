'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile,DEFAULT_PROFILE}=require('./policy-profiles.cjs');
const {withEarlyShadowRiderHood}=require('./early-shadow-rider-hood.cjs');
const {withProtectedUnderworldDoor}=require('./protected-underworld-door.cjs');
const hoodCandidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

const BASE=20261019, RANK=6, REPEATS=8;
const PRINT_POLICY={allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};

/**
 * Precommitted original-shuffle source physical seat/seed protocol.
 * @returns {Array<{repeat:number,sourceSeat:0|1,candidateSeat:0|1,seed:number}>}
 */
function fixedFrame(){
  const rows=[];
  for(let repeat=1;repeat<=REPEATS;repeat++){
    const seeds=deriveSlotSeeds(BASE,'pilot',RANK,repeat);
    rows.push({repeat,sourceSeat:0,candidateSeat:1,seed:seeds.A});
    rows.push({repeat,sourceSeat:1,candidateSeat:0,seed:seeds.B});
  }
  return rows;
}
/** @param {unknown} value */
function digest(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Observe real Store state only after physical root dispatch. The recorded
 * surfaces are our visible Pokemon/Tools, never the opponent's hidden cards.
 * The original source Store dispatcher is restored in all circumstances.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,actualHoodAttachments:object[]}}
 */
function withPhysicalHoodObserver(seat,execute){
  const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(compiled,'game/store/store'));
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const attached=[];
  let root;
  /** @param {object} state */
  function worn(state){
    const own=state?.players?.[seat];
    return own?[own.active,...own.bench].flatMap((zone,index)=>
      zone.tools.filter(t=>t.name==='Stealthy Hood').map(t=>({
        slot:index===0?'ACTIVE':'BENCH',index:index===0?0:index-1,
        pokemon:zone.getPokemonCard()?.fullName||null,tool:t.fullName}))):[];
  }
  function dispatch(action,...rest){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    const before=this===root?worn(this.state):[];
    const result=descriptor.value.call(this,action,...rest);
    if(this===root){
      const after=worn(this.state);
      if(after.length>before.length)attached.push({
        turn:this.state.turn,action:action.constructor.name,
        newTools:after.filter(entry=>!before.some(old=>
          old.slot===entry.slot&&old.index===entry.index&&
          old.tool===entry.tool&&old.pokemon===entry.pokemon)),
        boardAfter:after
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),actualHoodAttachments:attached};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/**
 * Condensed original-root observations, fail-closed on all certification.
 * @param {object} game
 * @param {object} item
 * @param {'hood'|'champion'} kind
 * @param {object|null} hood
 * @param {object|null} door
 * @param {object[]} actualHoodAttachments
 * @returns {object}
 */
function observe(game,item,kind,hood,door,actualHoodAttachments){
  assert.equal(game.verifiedByDrawLog,true,'Source true-start draw log missing');
  assert.ok([0,1].includes(game.firstTurnSlot));
  const ownAttacks=(game.attackDeclarationTrace||[]).filter(row=>
    row.playerSlot===item.candidateSeat);
  const opposingAttacks=(game.attackDeclarationTrace||[]).filter(row=>
    row.playerSlot===item.sourceSeat);
  const selectedHoods=(hood?.events||[]).filter(row=>row.kind==='selected-root-play');
  const physicalMatches=actualHoodAttachments.filter(row=>
    row.newTools.some(entry=>selectedHoods.some(selected=>
      selected.target.slot===entry.slot &&
      selected.target.index===entry.index &&
      selected.target.pokemon===entry.pokemon)));
  const effects=(door?.events||[]).filter(row=>
    row.kind==='verified-real-store-effect');
  const validEffects=effects.filter(row=>row.attached&&row.drawnTwo&&
    row.ironThornsStillActive&&row.hoodStillAttached);
  return {
    ...item,kind,status:'engine-observed',
    sourceActuallyFirst:game.firstTurnSlot===item.sourceSeat,
    trueFirstTurnSeat:game.firstTurnSlot,
    sourceAndCandidateEngineDeckHashes:game.deckHashes,
    sourceActiveThreatAtHoodSelection:selectedHoods.some(row=>
      row.opponentActive?.startsWith('Iron Thorns ex')),
    selectedHoodActions:selectedHoods.length,
    actualHoodAttachments:actualHoodAttachments.length,
    matchingSelectedHoodAttachments:physicalMatches.length,
    hoodActionEvidence:selectedHoods.slice(0,2),
    physicalHoodEvidence:physicalMatches.slice(0,2),
    selectedProtectedDoor:door?.selected===true,
    selectedDoorActions:(door?.events||[]).filter(row=>
      row.kind==='selected-live-ability').length,
    verifiedProtectedDoorEffects:validEffects.length,
    protectedDoorEvidence:(door?.events||[]).slice(0,7),
    candidateAttackDeclarations:ownAttacks.length,
    opponentAttackDeclarations:opposingAttacks.length,
    candidateAttackNames:ownAttacks.slice(0,6).map(row=>row.attackName),
    opponentAttackNames:opposingAttacks.slice(0,6).map(row=>row.attackName),
    engineTerminal:game.finished===true,
    rootActions:game.actions,
    diagnosticEngineWinner:game.finished?game.winner:null,
    diagnosticPrizesRemaining:game.prizesRemaining,
    qualifiedCompetitiveGame:false
  };
}

/** @returns {object} Fixed 32-arm, 16-paired actual-shuffle exposure experiment. */
function run(){
  const hoodPlan=planAichi(hoodCandidate,PRINT_POLICY);
  const championPlan=planAichi(1,PRINT_POLICY);
  const source=hoodPlan.opponents.find(row=>row.rank===RANK);
  const championSource=championPlan.opponents.find(row=>row.rank===RANK);
  assert.equal(source?.status,'ready');
  assert.equal(championSource?.status,'ready');
  assert.deepEqual(source.cards,championSource.cards);
  assert.equal(hoodPlan.engineRevision,championPlan.engineRevision);
  assert.equal(hoodPlan.candidate.cards.length,60);
  assert.equal(championPlan.candidate.cards.length,60);
  const candidateByKind={
    hood:hoodPlan.candidate.cards,
    champion:championPlan.candidate.cards
  };
  const deckHashes={source:digest(source.cards),
    hood:digest(candidateByKind.hood),
    champion:digest(candidateByKind.champion)};
  const records=[];
  for(const item of fixedFrame()){
    for(const kind of ['hood','champion']){
      const deck=candidateByKind[kind];
      const request={
        deckA:item.sourceSeat===0?source.cards:deck,
        deckB:item.sourceSeat===1?source.cards:deck,
        seed:item.seed,maxActions:140,
        strictPromptValidation:true,forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        label:'rank6-hood-benchmark:'+item.repeat+':'+item.sourceSeat+':'+kind
      };
      try{
        const physical=kind==='hood'?withPhysicalHoodObserver(item.candidateSeat,()=>
          withEarlyShadowRiderHood(item.candidateSeat,()=>
            withProtectedUnderworldDoor(item.candidateSeat,()=>
              runWithResearchProfile(request,DEFAULT_PROFILE),
              {lockKind:'initialization'}),
            {lockKind:'initialization'})):{
              result:{result:{result:runWithResearchProfile(request,DEFAULT_PROFILE),
                policyAudit:null},policyAudit:null},actualHoodAttachments:[]
            };
        const game=physical.result.result.result;
        assert.equal(game.seed,item.seed);
        assert.equal(game.engine,'twinleafgg/'+hoodPlan.engineRevision);
        assert.deepEqual(game.deckHashes,item.sourceSeat===0?
          [deckHashes.source,deckHashes[kind]] :
          [deckHashes[kind],deckHashes.source]);
        const hood=physical.result.policyAudit;
        const door=physical.result.result.policyAudit;
        records.push(observe(game,item,kind,hood,door,
          physical.actualHoodAttachments));
      }catch(error){
        records.push({...item,kind,status:'engine-exception',
          error:String(error?.stack||error),qualifiedCompetitiveGame:false});
      }
    }
  }
  const count=(kind,key)=>records.filter(row=>
    row.kind===kind && (typeof row[key]==='number'?row[key]>0:row[key]===true)).length;
  return {
    schema:'agent7-rank6-hood-versus-champion-source-prospective-v1',
    registration:'results/aichi-2026/agent7-hood-rank6-prospective-registration.md',
    seedBase:BASE,seedProtocol:'aichi-decorrelated-slots-v3',
    repeatCount:REPEATS,sourceRank:RANK,engine:'twinleafgg/'+hoodPlan.engineRevision,
    physicalSourceListDigest:deckHashes.source,
    fixedHood60Digest:deckHashes.hood,
    championReference60Digest:deckHashes.champion,
    candidate60Digest:hoodPlan.candidateDigest,
    championSource60Digest:championPlan.candidateDigest,
    trialFrame:fixedFrame(),attempts:records.length,
    successful:records.filter(row=>row.status==='engine-observed').length,
    exceptions:records.filter(row=>row.status==='engine-exception').length,
    hoodSelectedTrials:count('hood','selectedHoodActions'),
    physicalHoodTrials:count('hood','matchingSelectedHoodAttachments'),
    protectedDoorEffectTrials:count('hood','verifiedProtectedDoorEffects'),
    hoodAttackTrials:count('hood','candidateAttackDeclarations'),
    referenceAttackTrials:count('champion','candidateAttackDeclarations'),
    hoodEngineTerminals:count('hood','engineTerminal'),
    referenceEngineTerminals:count('champion','engineTerminal'),
    qualifiedCompetitiveGames:0,
    records,
    warning:'All 32 attempts retained. Weak default bots, original Deal only, 140-action cap, unknown printed Japanese equivalences, absent official clock. No competitive inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={BASE,RANK,REPEATS,fixedFrame,observe,run};
