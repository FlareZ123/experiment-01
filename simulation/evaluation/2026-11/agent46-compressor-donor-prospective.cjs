'use strict';

const assert=require('node:assert/strict');
const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {installMimikyuFundAndPromote}=
  require('../../twinleaf/2026-11/agent46-mimikyu-fund-and-promote.cjs');
const {installMimikyuCompressorCompressor}=
  require('../../twinleaf/2026-11/agent46-mimikyu-battle-compressor-compressor.cjs');

const SEEDS=Object.freeze([
  1194354905,87531557,467709596,1366371430,
  2061785737,1043250151,793388471,739271811
]);

/**
 * One prospective original rank1/rank10 source-game arm.
 * Both arms use the exact same native Store, observers and 180-root horizon.
 * Only the additive owner-visible compressor Item preference is toggled.
 *
 * @param {Map<number,object>} decks Original source 60s.
 * @param {number} seed Preregistered fresh random seed.
 * @param {0|1} seat Candidate's original physical player seat.
 * @param {boolean} compressorItem Whether compressor-only Treasure branch is installed.
 * @returns {object} Physical source and native policy evidence.
 */
function arm(decks,seed,seat,compressorItem){
  const ranks=seat===0?[1,10]:[10,1],events=[];
  const trial={seed,seat,rankOrder:ranks,treatment:compressorItem};
  const settings={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Agent46 prospective Compressor compressor '+compressorItem+' '+ranks.join('-'),
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true,
    captureCopycatTurnStartSeat:seat,
    captureDecisionTrace:true,
    capturePublicAttackTransitions:true
  };
  let restore;
  try{
    const install=compressorItem?
      installMimikyuCompressorCompressor:installMimikyuFundAndPromote;
    restore=install({seat,includeTreasureCompressor:false,onEvent:e=>{
      if(events.length<128)events.push(e);
    }});
    const game=runMatch(settings);
    const own=game.attackTrace.filter(x=>x.seat===seat);
    const opponent=game.attackTrace.filter(x=>x.seat!==seat);
    const nativeRoot=game.rootActionLedger??[];
    const actualCompressorRoots=nativeRoot.filter(x=>
      x.playerSlot===seat&&x.card==='Battle Compressor');
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
      nativePublicAttackTransitions:game.publicAttackTransitions,
      acceptedOriginalCompressorRoots:actualCompressorRoots.length,
      acceptedCompressorRootEvents:actualCompressorRoots,
      compressorSearchPromptCallbacks:events.filter(e=>
        e.kind==='resolved-physical-compressor-compressor-search').length,
      compressorItemRootProposalCallbacks:events.filter(e=>
        e.kind==='proposed-compressor-compressor-root').length,
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
      const compressor=arm(decks,seed,seat,true);
      rows.push(baseline,compressor);
      const sourceDealMatched=Boolean(baseline.nativeSourceDeal&&
        compressor.nativeSourceDeal&&
        JSON.stringify(baseline.nativeSourceDeal)===
          JSON.stringify(compressor.nativeSourceDeal));
      pairs.push({
        seed,seat,sourceDealMatched,
        baselineStatus:baseline.status,treatmentStatus:compressor.status,
        baselineApex:baseline.originalOpponentApex??null,
        treatmentApex:compressor.originalOpponentApex??null,
        baselineCopycat:baseline.originalOwnerCopycat??null,
        treatmentCopycat:compressor.originalOwnerCopycat??null,
        baselineTreasureRoots:baseline.acceptedOriginalCompressorRoots??null,
        treatmentTreasureRoots:compressor.acceptedOriginalCompressorRoots??null,
        compressorSearchCallbacks:compressor.compressorSearchPromptCallbacks??null,
        compressorItemProposals:compressor.compressorItemRootProposalCallbacks??null,
        treatmentCopyChoiceRoots:compressor.nativeCopyChoiceRoots??null
      });
    }
  }
  assert.equal(rows.length,32);
  const add=key=>pairs.reduce((sum,p)=>sum+(p[key]??0),0);
  const out={
    schema:'agent46-prospective-original-rank1-rank10-compressor-only-ab-v1',
    registration:'results/methodology/registrations/agent46-compressor-donor-prospective-source-ab-20261110.md',
    frozenIndependentSeeds:SEEDS,physicalSeats:[0,1],
    originalSixtiesUnchanged:true,maxNativeActions:180,
    actualNativeAttempts:rows.length,sourcePairs:pairs.length,
    matchedOriginalSourceDeals:pairs.filter(p=>p.sourceDealMatched).length,
    controlCopycat:add('baselineCopycat'),
    compressorCopycat:add('treatmentCopycat'),
    controlApex:add('baselineApex'),
    compressorApex:add('treatmentApex'),
    compressorPhysicalSearchCallbacks:add('compressorSearchCallbacks'),
    compressorItemRootProposals:add('compressorItemProposals'),
    nativePaperQualifiedGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={SEEDS,arm,run};
