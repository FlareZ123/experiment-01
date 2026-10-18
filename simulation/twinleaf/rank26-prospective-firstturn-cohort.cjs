'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {firstTurnState}=require('./meloetta-rank26-firstturn-source-window.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const {withRank26DceReservation}=require('./rank26-dce-reservation.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
const {withRank26FarewellDraw}=require('./rank26-farewell-source-draw.cjs');

const SEED_BASE=20261105;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>i+40));
const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const MAX_ACTIONS=120;
/** @param {string[]} cards */
function digest(cards){return crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');}

/** @param {object} game @param {number} rank26Seat @param {number} seed @param {string[]} deckA @param {string[]} deckB */
function summarize(game,rank26Seat,seed,deckA,deckB){
  assert.equal(game.seed,seed);
  assert.equal(game.engine,ENGINE);
  assert.equal(game.verifiedByDrawLog,true,'Real first draw was not verified');
  assert.deepEqual(game.deckHashes,[digest(deckA),digest(deckB)],
    'Pinned engine source deck identity mismatch');
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  const first=game.decisionTrace?.filter(t=>
    t.playerSlot===rank26Seat && t.turnBefore===1)||[];
  const counts={};
  const abilityCounts={};
  for(const e of first){
    if(e.card)counts[e.card]=(counts[e.card]||0)+1;
    if(e.ability)abilityCounts[e.ability]=(abilityCounts[e.ability]||0)+1;
  }
  return {
    sourceTurn1Actions:first.map(e=>({
      ordinal:e.actionOrdinal,kind:e.action,
      card:e.card||null,ability:e.ability||null,
      selected:e.cardSelection?.selectedCards||null
    })),
    sourceTurn1CardCounts:counts,sourceTurn1AbilityCounts:abilityCounts,
    sourceTurn1Passes:first.filter(e=>e.action==='PassTurnAction').length,
    sourceTurn1RootAttackActions:first.filter(e=>e.action==='AttackAction').length,
    sourceTurn1OpponentPrizeAfter:first.length
      ?first[first.length-1].prizesAfter[1-rank26Seat]:null,
    observedSourceTurn1ActionCount:first.length,
    endingStatus:game.finished===true?'engine-terminal':'action-capped',
    actions:game.actions,finalEngineWinner:game.finished===true?game.winner:null
  };
}

/** @returns {object} */
function execute(){
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(r=>r.rank===6);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const cases=[],uniqueSeeds=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(SEED_BASE,'pilot',26,repeat);
    for(const [seatLetter,seed,rank26Seat] of [
      ['A',seeds.A,0],['B',seeds.B,1]]){
      assert.ok(seed>0 && !uniqueSeeds.has(seed));
      uniqueSeeds.add(seed);
      const root=firstTurnState(source,opponent.cards,rank26Seat,seed);
      assert.equal(root.seed,seed);
      assert.equal(root.verifiedByDrawLog,true);
      assert.equal(root.attackerSeat,rank26Seat);
      const deckA=rank26Seat===0?source:opponent.cards;
      const deckB=rank26Seat===1?source:opponent.cards;
      const request={
        deckA,deckB,rank26SourceSeat:rank26Seat,seed,
        maxActions:MAX_ACTIONS,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        forestSealSearchCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'rank26-20261105-heldout-'+repeat+'-'+seatLetter
      };
      const control=runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE);
      const variant=withRank26FarewellDraw(rank26Seat,()=>
        withRank26DceReservation(rank26Seat,()=>
          withMailScout(rank26Seat,()=>
            runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)),
          {lateBasicFallback:true}));
      const changed=variant.result.result.result;
      assert.equal(control.firstTurnSlot,root.firstTurnSlot);
      assert.equal(changed.firstTurnSlot,root.firstTurnSlot);
      assert.equal(control.firstTurnPlayerId,changed.firstTurnPlayerId);
      assert.equal(control.firstDrawLogName,changed.firstDrawLogName);
      cases.push({
        repeat,seatLetter,seed,rank26Seat,
        sourceActuallyFirst:root.firstTurnSlot===rank26Seat,
        root:{
          firstTurnSlot:root.firstTurnSlot,
          sourceActive:root.attackerActive,sourceBench:root.attackerBench,
          sourceHand:root.attackerHand,
          opponentActive:root.defenderActive,opponentBench:root.defenderBench,
          initialOpponentPrizes:root.defenderPrizeCount
        },
        control:summarize(control,rank26Seat,seed,deckA,deckB),
        variant:summarize(changed,rank26Seat,seed,deckA,deckB),
        variantPolicies:{
          farewellSelections:variant.policyAudit.selections.length,
          farewellDraw:variant.policyAudit.after
            ?variant.policyAudit.after.ownHand.at(-1):null,
          energyDecisions:variant.result.policyAudit.decisions.map(x=>x.decision),
          mailSelections:variant.result.result.policyAudit.selections.length
        },
        competitiveGameQualified:false
      });
    }
  }
  assert.equal(cases.length,24);
  const sourceFirst=cases.filter(c=>c.sourceActuallyFirst);
  const genuineMeloettaActive=sourceFirst.filter(c=>
    c.root.sourceActive?.startsWith('Meloetta ex '));
  const loneDefender=genuineMeloettaActive.filter(c=>
    c.root.opponentBench.length===0);
  const summary={
    totalDeals:cases.length,trueSourceFirst:sourceFirst.length,
    firstWithMeloettaActive:genuineMeloettaActive.length,
    firstWithMeloettaActiveAndSoloDefender:loneDefender.length,
    firstSourceRootCologne:cases.filter(c=>
      c.variant.sourceTurn1CardCounts['Canceling Cologne']>0).length,
    firstSourceRootMail:cases.filter(c=>
      c.variant.sourceTurn1CardCounts["Trainers' Mail"]>0).length,
    firstSourceRootFarewell:cases.filter(c=>
      c.variant.sourceTurn1AbilityCounts['Farewell Letter']>0).length,
    firstSourceRootDceAttached:cases.filter(c=>
      c.variant.sourceTurn1CardCounts['Double Colorless Energy']>0).length,
    firstSourceRootBasicLightning:cases.filter(c=>
      c.variant.sourceTurn1CardCounts['Lightning Energy']>0).length,
    firstSourceRootAttackActions:cases.filter(c=>
      c.variant.sourceTurn1RootAttackActions>0).length,
    firstSourceRootOppPrizesBelowSix:cases.filter(c=>
      c.variant.sourceTurn1OpponentPrizeAfter!==null &&
      c.variant.sourceTurn1OpponentPrizeAfter<6).length,
    sourceFarewellAdditionalChosen:cases.filter(c=>
      c.variantPolicies.farewellSelections>0).length
  };
  return {
    schema:'rank26-prospective-firstturn-policy-exposure-v1',
    seedProtocol:'aichi-decorrelated-slots-v3',
    seedBase:SEED_BASE,repeatRange:[40,51],seats:['A','B'],
    engine:ENGINE,sourceRank:26,opponentRank:6,registered60s:[60,60],
    sourceDigest:plan.candidateDigest,actionCap:MAX_ACTIONS,
    policyControl:RANK26_PROPAGATION_PROFILE,
    policyVariant:[
      'rank26-mail-scout-v1','rank26-one-farewell-firstturn-v1',
      'rank26-first-turn-dce-reservation-v2'
    ],
    qualification:{policyCompetence:false,paperEffectCoverage:false,
      paperClock:false,competitiveGameWinRate:false},
    summary,cases
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(execute(),null,2)+'\n');
module.exports={execute,SEED_BASE,REPEATS};
