'use strict';

const assert=require('node:assert/strict');
const {runMatch,initializeCards} = require('../../twinleaf/headless.cjs');
const {sourceDecks} = require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {runTreatment:runFogControl} =
  require('./agent46-mimikyu-fog-owner-setup-source-ab.cjs');
const {installTreasureMimikyuSetup} =
  require('../../twinleaf/2026-11/agent46-mimikyu-treasure-search-setup.cjs');

const SEEDS=Object.freeze([
  1233900764,2010259355,1438280417,293593134,
  1232271394,40972780,1317229925,980224543
]);

/**
 * One real original-source full-60 two-player Treasure-treatment game.
 * @param {Map<number,object>} decks
 * @param {number} seed
 * @param {0|1} seat
 * @returns {object}
 */
function runTreasure(decks,seed,seat){
  const ranks=seat===0?[1,10]:[10,1];
  const events=[];
  const request={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:140,
    label:'Agent46 Mysterious Treasure dual-axis '+ranks.join('-'),
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const meta={seed,seat,ranks,treatment:'treasure-plus-fog-owner'};
  let restore;
  try{
    restore=installTreasureMimikyuSetup({seat,onEvent:e=>{
      if(events.length<80)events.push(e);
    }});
    const game=runMatch(request);
    const own=game.attackTrace.filter(row=>row.seat===seat);
    return {...meta,status:game.finished?'native-terminal':'native-censored',
      finished:game.finished,endReason:game.endReason,actions:game.actions,
      turns:game.turns,winner:game.winner??null,winnerSeat:game.winnerSeat??null,
      realCopycat:own.filter(row=>row.attack==='Copycat').length,
      actualOpponentApex:game.attackTrace.filter(row=>row.seat!==seat&&
        row.attack==='Apex Dragon').length,
      nativeInitialSourceDeal:game.initialSourceDealFingerprint,
      nativeFull60Hashes:game.deckHashes,
      prizesRemaining:game.prizesRemaining,
      finalState:game.finalState,
      engine:game.engine,policy:game.policy,
      ownerEvents:events,competitivePaperGames:0};
  }catch(error){
    return {...meta,status:'native-error',
      error:String(error?.stack??error),ownerEvents:events,
      competitivePaperGames:0};
  }finally{restore?.();}
}

/** @returns {object} All preregistered source 60 pairs. */
function run(){
  initializeCards();
  const decks=sourceDecks();
  const pairs=[],rows=[];
  for(const seed of SEEDS){
    for(const seat of [0,1]){
      const fog=runFogControl(decks,seed,seat,140);
      const treasure=runTreasure(decks,seed,seat);
      rows.push(fog,treasure);
      const samePhysicalDeal=Boolean(fog.nativeInitialSourceDeal&&
        treasure.nativeInitialSourceDeal&&
        JSON.stringify(fog.nativeInitialSourceDeal)===
          JSON.stringify(treasure.nativeInitialSourceDeal));
      pairs.push({
        seed,seat,samePhysicalDeal,
        fogStatus:fog.status,treasureStatus:treasure.status,
        fogCopycat:fog.actualCopycatCount??null,
        treasureCopycat:treasure.realCopycat??null,
        treasureProposals:treasure.ownerEvents.filter(e=>
          e.kind==='proposed-treasure').length,
        physicalDragonDiscards:treasure.ownerEvents.filter(e=>
          e.kind==='selected-physical-treasure-discard').length,
        physicalMimikyuSelections:treasure.ownerEvents.filter(e=>
          e.kind==='selected-physical-treasure-mimikyu').length
      });
    }
  }
  assert.equal(rows.length,32);
  const summary={
    schema:'agent46-mysterious-treasure-dual-axis-native-source-ab-v1',
    registration:'results/methodology/registrations/agent46-mimikyu-treasure-dual-axis-source-ab-20261109.md',
    sourceRanks:[1,10],frozenOriginalSixties:true,
    seeds:SEEDS,actionLimit:140,attempts:rows.length,
    comparableOriginalSourceDeals:pairs.filter(p=>p.samePhysicalDeal).length,
    treasureProposals:pairs.reduce((s,p)=>s+p.treasureProposals,0),
    physicalDragonDiscards:pairs.reduce((s,p)=>s+p.physicalDragonDiscards,0),
    physicalMimikyuSelections:pairs.reduce((s,p)=>s+p.physicalMimikyuSelections,0),
    competitivelyQualifiedGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(summary));
  return summary;
}
if(require.main===module)run();
module.exports={SEEDS,runTreasure,run};
