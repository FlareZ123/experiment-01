'use strict';

const assert=require('node:assert/strict');
const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {runTreatment:runFundedControl}=
  require('./agent46-mimikyu-manual-promote-source-ab.cjs');
const {installMimikyuDonorTreasure}=
  require('../../twinleaf/2026-11/agent46-mimikyu-donor-treasure.cjs');

const CASES=Object.freeze([
  {seed:589307622,seat:0},
  {seed:538692660,seat:1}
]);

/**
 * Exactly unchanged original-source sixty and prior funded setup policy,
 * with one additional owner-hand Dialga donor payment option through an
 * actual Mysterious Treasure. Entire selection is retrospective.
 * @param {Map<number,object>} decks Source-original printed deck map.
 * @param {number} seed Historical seed.
 * @param {0|1} seat Historical physical owner seat.
 * @returns {object} Genuine Store outcomes and owner-only turn-start.
 */
function runDonor(decks,seed,seat){
  const ranks=seat===0?[1,10]:[10,1],events=[];
  const settings={
    deckA:decks.get(ranks[0]).cardIds,
    deckB:decks.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Agent46 retrospective post-Apex physical Dialga donor payment',
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
  const restore=installMimikyuDonorTreasure({seat,onEvent:e=>{
    if(events.length<128)events.push(e);
  }});
  try {
    const game=runMatch(settings);
    const postApex=game.copycatTurnStartEvidence.filter(t=>
      t.previousOpponentAttack?.name==='Apex Dragon');
    const ledger=game.rootActionLedger??[];
    const ownerTreasureRoots=ledger.filter(root=>
      root.playerSlot===seat&&root.card==='Mysterious Treasure');
    const own=game.attackTrace.filter(a=>a.seat===seat);
    const opponent=game.attackTrace.filter(a=>a.seat!==seat);
    return {
      seed,seat,ranks,
      status:game.finished?'native-terminal':'native-censored',
      actions:game.actions,turns:game.turns,
      actualSourceDeal:game.initialSourceDealFingerprint,
      winnerSeat:game.winnerSeat??null,
      ownerActualTreasureRootCount:ownerTreasureRoots.length,
      ownerActualTreasureRoots:ownerTreasureRoots,
      originalOpponentApex:opponent.filter(a=>a.attack==='Apex Dragon').length,
      actualCopycat:own.filter(a=>a.attack==='Copycat').length,
      ownActualAttackTrace:own,
      physicalDonorDiscardCallbacks:events.filter(e=>
        e.kind==='resolved-physical-donor-treasure-payment').length,
      treasureRootProposals:events.filter(e=>
        e.kind==='proposed-donor-treasure-root').length,
      actualPostApexOwnerTurns:postApex.map(x=>({
        turn:x.turn,usedGX:x.candidateUsedGX,
        mimikyu:x.mimikyu.map(m=>({where:m.location,
          energyCount:m.energyPrintings.length})),
        dialga:x.ownDialga,
        ownerHeldTreasure:x.candidateHand.includes('Mysterious Treasure FLI'),
        ownerHeldBattleCompressor:x.candidateHand.includes('Battle Compressor PHF')
      })),
      callbacks:events,
      competitivelyQualifiedGames:0
    };
  }catch(error){
    return {seed,seat,status:'native-error',
      error:String(error?.stack??error),callbacks:events,
      competitivelyQualifiedGames:0};
  }finally{restore();}
}

function run(){
  initializeCards();
  const decks=sourceDecks(),rows=[],pairs=[];
  for(const {seed,seat} of CASES){
    const baseline=runFundedControl(decks,seed,seat);
    const donor=runDonor(decks,seed,seat);
    rows.push(baseline,donor);
    const sameDeal=Boolean(baseline.nativeInitialSourceDeal&&
      donor.actualSourceDeal&&
      JSON.stringify(baseline.nativeInitialSourceDeal)===
        JSON.stringify(donor.actualSourceDeal));
    pairs.push({
      seed,seat,samePhysicalDeal:sameDeal,
      baselineStatus:baseline.status,donorStatus:donor.status,
      baselineApex:baseline.actualOpponentApex??null,
      donorApex:donor.originalOpponentApex??null,
      baselineCopycat:baseline.actualCopycat??null,
      donorCopycat:donor.actualCopycat??null,
      nativeDonorTreasureRoots:donor.ownerActualTreasureRootCount??null,
      donorDiscardPaymentCallbacks:donor.physicalDonorDiscardCallbacks??null,
      donorSourceTurnStates:donor.actualPostApexOwnerTurns??null
    });
  }
  assert.equal(rows.length,4);
  const out={
    schema:'agent46-retrospective-original-rank1-mimikyu-donor-treasure-v1',
    evaluationType:'historical-source-window-pair-not-prospective',
    sourceRanks:[1,10],original60sUnchanged:true,seedSeatCases:CASES,
    matchedPhysicalPairs:pairs.filter(x=>x.samePhysicalDeal).length,
    competitivelyQualifiedPaperGames:0,
    pairs,rows
  };
  console.log(JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={CASES,runDonor,run};
