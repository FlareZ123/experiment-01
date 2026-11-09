'use strict';

const assert=require('node:assert/strict');
const {runMatch} = require('../../twinleaf/headless.cjs');
const {sourceDecks,arm:baselineArm} =
  require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {installFogMimikyuSetup} =
  require('../../twinleaf/2026-11/agent46-mimikyu-fog-search-setup.cjs');

const SEEDS=Object.freeze([
  1001270777,1138187360,2102740022,8718389,
  271436081,310057278,1384695747,1168501868,
  899479537,115596758,1766789714,1155172579
]);

/**
 * Actual original rank1/rank10 native Store continuation with only
 * owner-visible Fog setup variant on champion physical seat.
 * @param {Map<number,object>} decks
 * @param {number} seed
 * @param {0|1} seat
 * @param {number} [maxActions] Original preregistered default remains 180.
 * @returns {object}
 */
function runTreatment(decks,seed,seat,maxActions=180) {
  const rankOrder=seat===0?[1,10]:[10,1];
  const events=[];
  const options={
    deckA:decks.get(rankOrder[0]).cardIds,
    deckB:decks.get(rankOrder[1]).cardIds,
    seed,maxActions,
    label:'Agent46 Fog owner-search source treatment '+rankOrder.join('-'),
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const meta={seed,seat,treatment:'fog-owner-search-preserve',rankOrder};
  let restore=null;
  try {
    restore=installFogMimikyuSetup({seat,onEvent:event=>{
      if(events.length<64)events.push(event);
    }});
    const game=runMatch(options);
    const own=game.attackTrace.filter(row=>row.seat===seat);
    const opposing=game.attackTrace.filter(row=>row.seat!==seat);
    return {...meta,
      status:game.finished?'native-terminal':'native-censored',
      finished:game.finished,endReason:game.endReason,
      actionCount:game.actions,turns:game.turns,
      winner:game.winner??null,winnerSeat:game.winnerSeat??null,
      actualCopycatCount:own.filter(a=>a.attack==='Copycat').length,
      actualOpponentApexCount:opposing.filter(a=>a.attack==='Apex Dragon').length,
      nativeOwnerAttackTrace:own,nativeOpponentAttackTrace:opposing,
      nativeInitialSourceDeal:game.initialSourceDealFingerprint,
      nativeFinalState:game.finalState,
      nativePrizesRemaining:game.prizesRemaining,
      printedSource60Hashes:game.deckHashes,
      nativePolicyVersion:game.policy,
      nativeEngine:game.engine,
      researchOwnerEvents:events,
      qualifiedPaperGames:0
    };
  }catch(error){
    return {...meta,status:'native-engine-error',
      error:String(error?.stack??error),researchOwnerEvents:events,
      qualifiedPaperGames:0};
  }finally{restore?.();}
}

/** @returns {object} Frozen 24 source-deal pairs, 48 actual native arms. */
function run(){
  const decks=sourceDecks();
  const rows=[],pairs=[];
  for(const seed of SEEDS){
    for(const seat of [0,1]){
      const baseline=baselineArm(decks,seed,seat,false);
      const treatment=runTreatment(decks,seed,seat);
      rows.push(baseline,treatment);
      const equal=Boolean(baseline.nativeInitialSourceDeal&&
        treatment.nativeInitialSourceDeal&&
        JSON.stringify(baseline.nativeInitialSourceDeal)===
          JSON.stringify(treatment.nativeInitialSourceDeal));
      pairs.push({
        seed,seat,sameInitialSourceDeal:equal,
        baselineStatus:baseline.status,treatmentStatus:treatment.status,
        baselineCopycat:baseline.actualCopycatCount??null,
        treatmentCopycat:treatment.actualCopycatCount??null,
        setupEvents:treatment.researchOwnerEvents.length,
        actualFogSelections:treatment.researchOwnerEvents
          .filter(x=>x.kind==='selected-physical-fog-mimikyu').length
      });
    }
  }
  assert.equal(rows.length,48);
  const out={
    schema:'agent46-prospective-original-rank1-rank10-owner-fog-setup-ab-v1',
    registration:'results/methodology/registrations/agent46-rank1-mimikyu-fog-owner-search-preserve-ab-20261109.md',
    sourceRanks:[1,10],originalSource60sUnchanged:true,
    seeds:SEEDS,actionHorizon:180,nativeAttempts:rows.length,
    matchedPhysicalPairs:pairs.filter(x=>x.sameInitialSourceDeal).length,
    setupProposalEvents:pairs.reduce((sum,x)=>sum+x.setupEvents,0),
    selectedPhysicalFogMimikyu:pairs.reduce((sum,x)=>sum+x.actualFogSelections,0),
    qualifiedCompetitivePaperGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={SEEDS,runTreatment,run};
