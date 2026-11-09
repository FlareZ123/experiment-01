'use strict';

const assert=require('node:assert/strict');
const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=
  require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {runTreasure}=
  require('./agent46-mimikyu-treasure-dual-axis-source-ab.cjs');
const {installUnderworldMimikyuFocus}=
  require('../../twinleaf/2026-11/agent46-underworld-mimikyu-energy-focus.cjs');
const SEEDS=Object.freeze([
  2145606871,1755802779,805507324,
  1889111531,1465231646,1025444877
]);

/**
 * Original source 60s, original rule hooks and policies; treatment adds
 * only owner-visible Underworld Door Mimikyu Energy focus.
 * @param {Map<number,object>} decks
 * @param {number} seed
 * @param {0|1} seat
 * @returns {object}
 */
function runEnergyFocus(decks,seed,seat){
  const ranks=seat===0?[1,10]:[10,1];
  const events=[];
  const meta={seed,seat,ranks,treatment:'treasure-fog-underworld-door'};
  const settings={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Agent46 owner-physical Underworld Door '+ranks.join('-'),
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  let restore;
  try{
    restore=installUnderworldMimikyuFocus({seat,onEvent:e=>{
      if(events.length<96)events.push(e);
    }});
    const game=runMatch(settings);
    const own=game.attackTrace.filter(row=>row.seat===seat);
    const opposing=game.attackTrace.filter(row=>row.seat!==seat);
    return {...meta,status:game.finished?'native-terminal':'native-censored',
      finished:game.finished,endReason:game.endReason,
      actions:game.actions,turns:game.turns,
      winner:game.winner??null,winnerSeat:game.winnerSeat??null,
      actualCopycat:own.filter(x=>x.attack==='Copycat').length,
      actualOpponentApex:opposing.filter(x=>x.attack==='Apex Dragon').length,
      nativeOwnerAttackTrace:own,nativeOpponentAttackTrace:opposing,
      nativeInitialSourceDeal:game.initialSourceDealFingerprint,
      nativeFull60Hashes:game.deckHashes,
      nativeFinalState:game.finalState,
      prizesRemaining:game.prizesRemaining,
      engine:game.engine,policy:game.policy,
      ownerEvents:events,
      qualifiedPaperGames:0};
  }catch(error){
    return {...meta,status:'native-error',error:String(error?.stack??error),
      ownerEvents:events,qualifiedPaperGames:0};
  }finally{restore?.();}
}

/** @returns {object} Frozen six-seed, two-seat, two-arm source comparison. */
function run(){
  initializeCards();
  const decks=sourceDecks(),pairs=[],rows=[];
  for(const seed of SEEDS){
    for(const seat of [0,1]){
      const baseline=runTreasure(decks,seed,seat,180);
      const focus=runEnergyFocus(decks,seed,seat);
      rows.push(baseline,focus);
      const equal=Boolean(baseline.nativeInitialSourceDeal&&
        focus.nativeInitialSourceDeal&&
        JSON.stringify(baseline.nativeInitialSourceDeal)===
          JSON.stringify(focus.nativeInitialSourceDeal));
      pairs.push({
        seed,seat,samePhysicalDeal:equal,
        baselineStatus:baseline.status,treatmentStatus:focus.status,
        baselineCopycat:baseline.realCopycat??null,
        treatmentCopycat:focus.actualCopycat??null,
        baselineApex:baseline.actualOpponentApex??null,
        treatmentApex:focus.actualOpponentApex??null,
        underworldProposals:focus.ownerEvents.filter(e=>
          e.kind==='proposed-underworld-door').length,
        psychicAssignments:focus.ownerEvents.filter(e=>
          e.kind==='proposed-physical-underworld-to-mimikyu').length
      });
    }
  }
  assert.equal(rows.length,24);
  const result={
    schema:'agent46-original-source-underworld-mimikyu-energy-focus-ab-v1',
    registration:'results/methodology/registrations/agent46-underworld-door-mimikyu-energy-focus-source-ab-20261109.md',
    originalRank1And10FixedSixties:true,
    maxActions:180,seeds:SEEDS,
    nativeAttempts:rows.length,
    matchedPhysicalStartPairs:pairs.filter(p=>p.samePhysicalDeal).length,
    underworldProposals:pairs.reduce((sum,p)=>sum+p.underworldProposals,0),
    psychicAssignments:pairs.reduce((sum,p)=>sum+p.psychicAssignments,0),
    qualifiedCompetitivePaperGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(result));
  return result;
}
if(require.main===module)run();
module.exports={SEEDS,runEnergyFocus,run};
