'use strict';

const assert=require('node:assert/strict');
const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {installMimikyuFundAndPromote}=
  require('../../twinleaf/2026-11/agent46-mimikyu-fund-and-promote.cjs');
const {installMimikyuDonorTreasure}=
  require('../../twinleaf/2026-11/agent46-mimikyu-donor-treasure.cjs');

const SEEDS=Object.freeze([
  1971080544,2098059327,825299264,600907754,
  1631936219,977618216,200360774,843769183
]);

/**
 * One prospective original rank1/rank10 source-game arm.
 * Both arms use the exact same native Store, observers and 180-root horizon.
 * Only the additive owner-visible donor Item preference is toggled.
 *
 * @param {Map<number,object>} decks Original source 60s.
 * @param {number} seed Preregistered fresh random seed.
 * @param {0|1} seat Candidate's original physical player seat.
 * @param {boolean} donorItem Whether donor-only Treasure branch is installed.
 * @returns {object} Physical source and native policy evidence.
 */
function arm(decks,seed,seat,donorItem){
  const ranks=seat===0?[1,10]:[10,1],events=[];
  const trial={seed,seat,rankOrder:ranks,treatment:donorItem};
  const settings={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Agent46 prospective donor Treasure '+donorItem+' '+ranks.join('-'),
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true,
    captureCopycatTurnStartSeat:seat,
    captureDecisionTrace:true
  };
  let restore;
  try{
    const install=donorItem?
      installMimikyuDonorTreasure:installMimikyuFundAndPromote;
    restore=install({seat,onEvent:e=>{
      if(events.length<128)events.push(e);
    }});
    const game=runMatch(settings);
    const own=game.attackTrace.filter(x=>x.seat===seat);
    const opponent=game.attackTrace.filter(x=>x.seat!==seat);
    const nativeRoot=game.rootActionLedger??[];
    const actualTreasureRoots=nativeRoot.filter(x=>
      x.playerSlot===seat&&x.card==='Mysterious Treasure');
    const copyChoiceRoots=nativeRoot.filter(x=>
      x.playerSlot===seat&&x.attackChoice!==undefined);
    const afterApex=game.copycatTurnStartEvidence.filter(x=>
      x.previousOpponentAttack?.name==='Apex Dragon');
    return {
      ...trial,status:game.finished?'native-terminal':'native-censored',
      finished:game.finished,reason:game.endReason,
      nativeActions:game.actions,nativeTurns:game.turns,
      winnerSeat:game.winnerSeat??null,
      nativeSourceDeal:game.initialSourceDealFingerprint,
      physicalSourceHashes:game.deckHashes,
      nativeEngine:game.engine,nativePolicy:game.policy,
      originalOpponentApex:opponent.filter(x=>x.attack==='Apex Dragon').length,
      originalOwnerCopycat:own.filter(x=>x.attack==='Copycat').length,
      nativeOwnerAttackTrace:own,
      nativeCopyChoiceRoots:copyChoiceRoots,
      acceptedOriginalTreasureRoots:actualTreasureRoots.length,
      acceptedTreasureRootEvents:actualTreasureRoots,
      donorDiscardPromptCallbacks:events.filter(e=>
        e.kind==='resolved-physical-donor-treasure-payment').length,
      donorItemRootProposalCallbacks:events.filter(e=>
        e.kind==='proposed-donor-treasure-root').length,
      ownerPostApexTurns:afterApex.map(x=>({
        turn:x.turn,usedGX:x.candidateUsedGX,
        mimikyu:x.mimikyu.map(p=>({
          location:p.location,energy:p.energyPrintings.length
        })),
        dialga:x.ownDialga
      })),
      finalState:game.finalState,
      prizeCountFinal:game.prizesRemaining,
      ownerEventProposals:events,
      competitivePaperGames:0
    };
  }catch(error){
    return {...trial,status:'native-engine-error',
      error:String(error?.stack??error),ownerEventProposals:events,
      competitivePaperGames:0};
  }finally{restore?.();}
}

/** @returns {object} Complete frozen 32-arm, 16-pair native source panel. */
function run(){
  initializeCards();
  const decks=sourceDecks(),rows=[],pairs=[];
  for(const seed of SEEDS){
    for(const seat of [0,1]){
      const baseline=arm(decks,seed,seat,false);
      const donor=arm(decks,seed,seat,true);
      rows.push(baseline,donor);
      const sourceDealMatched=Boolean(baseline.nativeSourceDeal&&
        donor.nativeSourceDeal&&
        JSON.stringify(baseline.nativeSourceDeal)===
          JSON.stringify(donor.nativeSourceDeal));
      pairs.push({
        seed,seat,sourceDealMatched,
        baselineStatus:baseline.status,treatmentStatus:donor.status,
        baselineApex:baseline.originalOpponentApex??null,
        treatmentApex:donor.originalOpponentApex??null,
        baselineCopycat:baseline.originalOwnerCopycat??null,
        treatmentCopycat:donor.originalOwnerCopycat??null,
        baselineTreasureRoots:baseline.acceptedOriginalTreasureRoots??null,
        treatmentTreasureRoots:donor.acceptedOriginalTreasureRoots??null,
        donorPaymentCallbacks:donor.donorDiscardPromptCallbacks??null,
        donorItemProposals:donor.donorItemRootProposalCallbacks??null,
        treatmentCopyChoiceRoots:donor.nativeCopyChoiceRoots??null
      });
    }
  }
  assert.equal(rows.length,32);
  const add=key=>pairs.reduce((sum,p)=>sum+(p[key]??0),0);
  const out={
    schema:'agent46-prospective-original-rank1-rank10-donor-treasure-ab-v1',
    registration:'results/methodology/registrations/agent46-mimikyu-donor-treasure-prospective-source-ab-20261110.md',
    frozenIndependentSeeds:SEEDS,physicalSeats:[0,1],
    originalSixtiesUnchanged:true,maxNativeActions:180,
    actualNativeAttempts:rows.length,sourcePairs:pairs.length,
    matchedOriginalSourceDeals:pairs.filter(p=>p.sourceDealMatched).length,
    controlCopycat:add('baselineCopycat'),
    donorCopycat:add('treatmentCopycat'),
    controlApex:add('baselineApex'),
    donorApex:add('treatmentApex'),
    donorPhysicalPaymentCallbacks:add('donorPaymentCallbacks'),
    donorItemRootProposals:add('donorItemProposals'),
    nativePaperQualifiedGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={SEEDS,arm,run};
