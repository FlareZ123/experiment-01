'use strict';

const assert = require('node:assert/strict');
const {initializeCards, runMatch} = require('../../twinleaf/headless.cjs');
const {sourceDecks} = require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {runEnergyFocus} = require('./agent46-underworld-mimikyu-energy-source-ab.cjs');
const {installMimikyuFundAndPromote} =
  require('../../twinleaf/2026-11/agent46-mimikyu-fund-and-promote.cjs');

// Immutable 9 November preregistration; do not replace successful/failed seeds.
const SEEDS = Object.freeze([
  2059253117,1055096635,538692660,
  589307622,1330764334,1965056889
]);

/**
 * An actual unmodified original rank1-versus-rank10 native game.
 * @param {Map<number,object>} decks Original printed 60s, by rank.
 * @param {number} seed Registered physical-deal seed.
 * @param {0|1} seat Original champion's physical seat.
 * @returns {object} Native observations, including failures and censored games.
 */
function runTreatment(decks,seed,seat) {
  const ranks=seat===0?[1,10]:[10,1];
  const events=[];
  const meta={seed,seat,ranks,treatment:'manual-psychic-and-apex-promotion'};
  const settings={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Agent46 post-Apex funding and promotion '+ranks.join('-'),
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
  try {
    restore=installMimikyuFundAndPromote({seat,onEvent:event=>{
      if(events.length<128) events.push(event);
    }});
    const game=runMatch(settings);
    const own=game.attackTrace.filter(row=>row.seat===seat);
    const opponent=game.attackTrace.filter(row=>row.seat!==seat);
    return {...meta,
      status:game.finished?'native-terminal':'native-censored',
      finished:game.finished,endReason:game.endReason,
      actions:game.actions,turns:game.turns,
      winner:game.winner??null,winnerSeat:game.winnerSeat??null,
      actualCopycat:own.filter(row=>row.attack==='Copycat').length,
      actualOpponentApex:opponent.filter(row=>row.attack==='Apex Dragon').length,
      nativeOwnerAttackTrace:own,nativeOpponentAttackTrace:opponent,
      nativeInitialSourceDeal:game.initialSourceDealFingerprint,
      nativeFull60Hashes:game.deckHashes,
      prizesRemaining:game.prizesRemaining,
      finalState:game.finalState,
      engine:game.engine,policy:game.policy,
      ownerEvents:events,qualifiedPaperGames:0
    };
  } catch(error) {
    return {...meta,status:'native-engine-error',
      error:String(error?.stack??error),
      ownerEvents:events,qualifiedPaperGames:0};
  } finally {
    restore?.();
  }
}

/** @returns {object} The entire preregistered matched-source panel. */
function run() {
  initializeCards();
  const decks=sourceDecks(),pairs=[],rows=[];
  for(const seed of SEEDS) {
    for(const seat of [0,1]) {
      const baseline=runEnergyFocus(decks,seed,seat);
      const treatment=runTreatment(decks,seed,seat);
      rows.push(baseline,treatment);
      const samePhysicalDeal=Boolean(baseline.nativeInitialSourceDeal&&
        treatment.nativeInitialSourceDeal&&
        JSON.stringify(baseline.nativeInitialSourceDeal)===
          JSON.stringify(treatment.nativeInitialSourceDeal));
      const proposals=kind=>treatment.ownerEvents.filter(e=>e.kind===kind).length;
      pairs.push({
        seed,seat,samePhysicalDeal,
        baselineStatus:baseline.status,treatmentStatus:treatment.status,
        baselineCopycat:baseline.actualCopycat??null,
        treatmentCopycat:treatment.actualCopycat??null,
        baselineApex:baseline.actualOpponentApex??null,
        treatmentApex:treatment.actualOpponentApex??null,
        manualPsychicProposals:proposals('proposed-manual-psychic-to-mimikyu'),
        nativeKoPromotionProposals:proposals('proposed-funded-mimikyu-ko-promotion'),
        nativePaidRetreatProposals:proposals('proposed-funded-mimikyu-retreat'),
        underworldProposals:proposals('proposed-underworld-door'),
        underworldPsychicProposals:proposals('proposed-physical-underworld-to-mimikyu')
      });
    }
  }
  assert.equal(rows.length,24);
  const sum=key=>pairs.reduce((n,p)=>n+p[key],0);
  const result={
    schema:'agent46-original-rank1-rank10-manual-psychic-apex-promotion-ab-v1',
    registration:'results/methodology/registrations/agent46-mimikyu-manual-energy-promote-after-apex-source-ab-20261109.md',
    sourceRanks:[1,10],originalSixtiesUnchanged:true,
    seeds:SEEDS,maxActions:180,
    nativeAttempts:rows.length,
    matchedPhysicalSourceDealPairs:pairs.filter(p=>p.samePhysicalDeal).length,
    manualPsychicProposals:sum('manualPsychicProposals'),
    nativeKoPromotionProposals:sum('nativeKoPromotionProposals'),
    nativePaidRetreatProposals:sum('nativePaidRetreatProposals'),
    qualifiedCompetitivePaperGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(result));
  return result;
}

if(require.main===module)run();
module.exports={SEEDS,runTreatment,run};
