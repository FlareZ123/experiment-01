'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {initializeCards,runMatch} = require('./headless.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {pairedCandidateSlots} = require('./new-moon-lockbreak-source-diagnostic.cjs');
const {inspectRank15PrizePrerequisites} = require('./rank15-prize-prereq.cjs');

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Inspect physical Pokémon only after a successful authentic root Store
 * dispatch. Speculative bot Simulator Store instances have different identity.
 * This is an opportunity census under unqualified generic policies.
 * @template T
 * @param {Function} Store Pinned Store constructor
 * @param {number} opponentSeat Physical source-rank-15 seat
 * @param {number} candidateSeat Physical New Moon seat
 * @param {()=>T} execute Synchronous headless match
 * @returns {{result:T,first:object,max:object,rootSnapshots:number,firstNormalTurnZoneDigest:string|null,firstNormalTurnPrizeGate:object|null}}
 */
function observeSourceLock(Store,opponentSeat,candidateSeat,execute) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root=null,rootSnapshots=0,firstNormalTurnZoneDigest=null;
  let firstNormalTurnPrizeGate=null;
  const first={aor:null,bus:null,busActive:null,dual:null,
    dusclops:null,dusclopsActive:null,dusclopsAgainstDual:null,
    twoSourceStageLineSlots:null,fullSourceBenchBelowTwoStageLines:null,
    sourceBunnelbyActive:null,sourceBunnelbyActiveWithTM:null,
    sourceBunnelbyActiveWithTMAndEnergy:null,
    sourceOddishOnBench:null};
  const max={aorCount:0,busCount:0,dusclopsCount:0,
    sourceStageLineSlots:0};

  const instrument=function(...args) {
    const action=args[0];
    const type=action?.constructor?.name??'UnknownAction';
    if(root===null && type==='AddPlayerAction')root=this;
    const actual=this===root;
    const state=this.state;
    // The first genuine main-turn source state predates all policy-dependent
    // root actions. It includes exact original physical hands, deck order
    // and hidden Prize composition for paired replay validation only.
    if(actual && firstNormalTurnZoneDigest===null &&
        state?.phase===2 && state.players?.length===2 &&
        state.players.every(p=>p.prizes.length===6)) {
      const physicalPrizes=state.players[opponentSeat].prizes.map(p=>
        p.cards[0]?.fullName??'');
      firstNormalTurnPrizeGate=inspectRank15PrizePrerequisites(physicalPrizes);
      firstNormalTurnZoneDigest=digest(state.players.map(p=>({
        active:p.active.cards.map(c=>c.fullName),
        bench:p.bench.map(slot=>slot.cards.map(c=>c.fullName)),
        hand:p.hand.cards.map(c=>c.fullName),
        deck:p.deck.cards.map(c=>c.fullName),
        prizes:p.prizes.map(prize=>prize.cards.map(c=>c.fullName))
      })));
    }
    const result=descriptor.value.apply(this,args);
    if(!actual || this.state.players?.length!==2)return result;
    const source=this.state.players[opponentSeat];
    const candidate=this.state.players[candidateSeat];
    if(source.prizes.length!==6 || candidate.prizes.length!==6)return result;
    const opponentActive=source.active.getPokemonCard()?.fullName??null;
    const opponentBoard=[opponentActive,...source.bench.map(b=>b.getPokemonCard()?.fullName??null)];
    const candidateActive=candidate.active.getPokemonCard()?.fullName??null;
    const candidateBoard=[candidateActive,...candidate.bench.map(b=>b.getPokemonCard()?.fullName??null)];
    const aorCount=opponentBoard.filter(n=>n==='Vileplume AOR').length;
    const busCount=opponentBoard.filter(n=>n==='Vileplume BUS').length;
    const dusclopsCount=candidateBoard.filter(n=>n==='Dusclops SFA').length;
    const stageNames=new Set(['Oddish UNB','Gloom UNB',
      'Vileplume AOR','Vileplume BUS']);
    const sourceStageLineSlots=opponentBoard.filter(n=>stageNames.has(n)).length;
    const occupiedSourceBench=opponentBoard.slice(1).filter(Boolean).length;
    const activeBunnelby=opponentActive==='Bunnelby PRC';
    const activeToolNames=source.active.tools.map(tool=>tool.fullName);
    const activeEnergyNames=source.active.energies.cards.map(card=>card.fullName);
    const activeHasTM=activeToolNames.includes('Technical Machine: Evolution PAR');
    const flags={
      aor:aorCount>0,bus:busCount>0,
      busActive:opponentActive==='Vileplume BUS',
      dual:aorCount>0 && opponentActive==='Vileplume BUS',
      dusclops:dusclopsCount>0,
      dusclopsActive:candidateActive==='Dusclops SFA',
      dusclopsAgainstDual:aorCount>0 &&
        opponentActive==='Vileplume BUS' && candidateActive==='Dusclops SFA',
      twoSourceStageLineSlots:sourceStageLineSlots>=2,
      sourceOddishOnBench:opponentBoard.slice(1).includes('Oddish UNB'),
      fullSourceBenchBelowTwoStageLines:occupiedSourceBench===5 &&
        sourceStageLineSlots<2,
      sourceBunnelbyActive:activeBunnelby,
      sourceBunnelbyActiveWithTM:activeBunnelby&&activeHasTM,
      sourceBunnelbyActiveWithTMAndEnergy:activeBunnelby&&activeHasTM&&
        activeEnergyNames.length>0
    };
    rootSnapshots++;
    max.aorCount=Math.max(max.aorCount,aorCount);
    max.busCount=Math.max(max.busCount,busCount);
    max.dusclopsCount=Math.max(max.dusclopsCount,dusclopsCount);
    max.sourceStageLineSlots=Math.max(
      max.sourceStageLineSlots,sourceStageLineSlots);
    for(const [name,available] of Object.entries(flags)) {
      if(available && first[name]===null) {
        first[name]={
          ordinal:rootSnapshots,turn:this.state.turn,
          action:type,activePlayer:this.state.activePlayer,
          opponentActive,opponentBoard,candidateActive,candidateBoard,
          occupiedSourceBench,sourceStageLineSlots,
          activeToolNames,activeEnergyNames
        };
        // The acting rank-15 player can inspect their own hand. Capture it
        // only at the first genuinely dispatched powered-TM position; never
        // use the source's hidden deck, Prizes, or candidate hand as a policy
        // input. This is a read-only diagnostic for why no Oddish was Benched.
        if(name==='sourceBunnelbyActiveWithTMAndEnergy'){
          first[name].sourceOwnerHandNames=
            source.hand.cards.map(card=>card.fullName);
        }
      }
    }
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:instrument});
  try {
    const result=execute();
    return {result,first,max,rootSnapshots,firstNormalTurnZoneDigest,
      firstNormalTurnPrizeGate};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

/**
 * Fixed before inspecting any deals: 4 repeats x both physical seats,
 * max 260 dispatches per game, source rank15 and frozen New Moon challenger.
 */
function run() {
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(x=>x.rank===15);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const rows=[];
  for(let repeat=0;repeat<4;repeat++) {
    for(const candidateSeat of [0,1]) {
      const seed=deriveSlotSeeds(20261018,'pilot',15,repeat)[
        candidateSeat===0?'A':'B'];
      const request={
        deckA:candidateSeat===0?candidate:opponent.cards,
        deckB:candidateSeat===1?candidate:opponent.cards,
        seed,maxActions:260,
        label:'rank15-original-root-duallock-census',
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        supporterDecisionCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        isolatePolicyRandomness:true,
        pendingEndTurnSwitchCleanupCorrection:true,
        captureDecisionTrace:true
      };
      const observed=observeSourceLock(Store,1-candidateSeat,candidateSeat,
        ()=>runMatch(request));
      const game=observed.result;
      assert.equal(game.verifiedByDrawLog,true);
      assert.ok(observed.rootSnapshots>0);
      assert.equal(game.rootActionLedger.length,game.actions,
        'Incomplete successful root dispatch ledger');
      rows.push({
        repeat,seed,candidateSeat,actualFirstSlot:game.firstTurnSlot,
        candidateActuallyFirst:game.firstTurnSlot===candidateSeat,
        printedOpponentHash:digest(opponent.cards),
        printedCandidateHash:digest(candidate),
        finished:game.finished,endReason:game.endReason,actions:game.actions,
        turns:game.turns,rootSnapshots:observed.rootSnapshots,
        first:observed.first,max:observed.max,
        firstNormalTurnPrizeGate:observed.firstNormalTurnPrizeGate,
        rootActionDigest:digest(game.rootActionLedger)
      });
    }
  }
  assert.equal(rows.length,8);
  return {
    schema:'newmoon-rank15-source-duallock-opportunity-census-v1',
    sourceRank:15,
    candidate:'new-moon-lockbreaker-v1-unchanged-60-English-mechanics-proxy',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seedPlan:'decorrelated-slots-v3; base 20261018, pilot rank15 repeats 0..3, physical seats A/B',
    maxActionsPerTrial:260,trialCount:rows.length,
    jointSourceDualLockExposures:rows.filter(x=>x.first.dual!==null).length,
    candidateDusclopsAgainstJointExposures:rows.filter(
      x=>x.first.dusclopsAgainstDual!==null).length,
    candidateActuallyFirstCount:rows.filter(x=>x.candidateActuallyFirst).length,
    sourceOpponentPolicy:'generic SimpleTacticsAi; unqualified',
    sourceCandidatePolicy:'generic SimpleTacticsAi; unqualified',
    sourceInitialPrizeGateObserved:rows.filter(x=>x.firstNormalTurnPrizeGate!==null).length,
    sourceInitialPrizeGateEligible:rows.filter(x=>
      x.firstNormalTurnPrizeGate?.beforeTakingPrizesEligible===true).length,
    limitations:'Post-dispatch live-board position only: does not independently prove operating Abilities, source Vileplume evolution legality, complete attack resolution, a competent opponent, or gameplay win strength.',
    qualifiedForCompetitiveInference:false,
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeSourceLock,run};
