'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');
const {withHorrorHouseExtraPsychicHook}=
  require('./gengar-horror-house-extra-psychic-hook.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PLAN_OPTIONS={allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true};
const RUN_OPTIONS={
  strictPromptValidation:true,forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
  entryDrawLockCorrection:true,isolatePolicyRandomness:true,
  pendingEndTurnSwitchCleanupCorrection:true,
  captureHorrorHouseRootResolution:true
};
/** @param {string[]} first @param {string[]} second @param {0|1} seat
 * @param {number} seed @param {number} maxActions @param {boolean} pivot */
function play(first,second,seat,seed,maxActions,pivot=false) {
  return runMatch({...RUN_OPTIONS,seed,maxActions,
    deckA:seat===0?first:second,deckB:seat===1?first:second,
    ...(pivot?{newMoonNativeOpeningPivotSeat:seat}:{})});
}
/** @param {object} game @param {number} sourceSeat */
function observe(game,sourceSeat) {
  const all=game.horrorHouseRootTrace??[];
  const source=all.filter(event=>event.playerSlot===sourceSeat);
  return {
    finished:game.finished,endReason:game.endReason,
    winnerUnqualified:game.winner,
    rootActions:game.actions,turns:game.turns,
    physicalFirst:game.firstTurnSlot,
    verifiedFirstByDrawLog:game.verifiedByDrawLog,
    attackDeclarations:game.attackDeclarationTrace.filter(row=>
      row.playerSlot===sourceSeat).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attack:row.attackName,trigger:row.triggerAction
      })),
    actualHorrorHouseDeclarations:source.length,
    rootEvents:source,
    deckHashes:game.deckHashes,
    qualifiedCompetitiveGames:0
  };
}
function run() {
  const plan=planAichi(1,PLAN_OPTIONS);
  assert.equal(plan.candidate.cards?.length,60);
  const rank6=plan.opponents.find(row=>row.rank===6);
  const rank9=plan.opponents.find(row=>row.rank===9);
  assert.equal(rank6?.status,'ready');
  assert.equal(rank9?.status,'ready');
  assert.equal(rank9.cards.length,60);
  const candidate=pairedCandidateSlots().source;
  assert.equal(candidate.length,60);

  // Retrospective source-dealt positive control: the compiled New Moon pivot
  // was previously observed using native Horror House under this exact seed.
  const knownSeat=1, knownSeed=3730588627;
  const control=play(candidate,rank6.cards,knownSeat,knownSeed,160,true);
  const positive=observe(control,knownSeat);
  assert.equal(positive.verifiedFirstByDrawLog,true);
  assert.equal(positive.physicalFirst,0);
  assert.ok(positive.actualHorrorHouseDeclarations>0,
    'Root observer must see the previously authenticated native attack');
  const hooked=withHorrorHouseExtraPsychicHook(()=>
    play(candidate,rank6.cards,knownSeat,knownSeed,160,true));
  const patchedPositive=observe(hooked,knownSeat);
  assert.deepEqual(positive.deckHashes,patchedPositive.deckHashes);
  assert.equal(patchedPositive.actualHorrorHouseDeclarations,
    positive.actualHorrorHouseDeclarations);

  // Prospectively fixed distinct 16 source deals, 8 per physical source seat.
  // No selection based on wins, attacks, or first turn is allowed.
  const rank9Source=[];
  for(const seat of [0,1]) {
    for(let repeat=0;repeat<8;repeat++) {
      const seed=deriveSlotSeeds(20261018,'pilot',9,repeat)[seat===0?'A':'B'];
      try {
        const baseline=play(rank9.cards,plan.candidate.cards,seat,seed,180);
        const observation=observe(baseline,seat);
        rank9Source.push({seat,repeat,seed,status:'observed',...observation});
      } catch(error) {
        rank9Source.push({seat,repeat,seed,status:'source-run-error',
          message:String(error?.message||error),qualifiedCompetitiveGames:0});
      }
    }
  }
  const events=rank9Source.filter(row=>row.status==='observed')
    .flatMap(row=>row.rootEvents);
  return {
    schema:'rank9-horror-house-authentic-source-root-exposure-v1',
    pinnedTwinleaf:PIN,
    sourceRank:9,sourcePlayer:rank9.player,
    controlRank:6,controlSelectedSeed:knownSeed,
    referenceRank:1,
    sourcePrintedSixty:true,
    seedProtocol:'decorrelated-slots-v3 pilot base 20261018, rank9 repeats 0-7, both physical seats, all included',
    positive,patchedPositive,rank9Source,
    registeredDeals:16,
    authenticatedDeals:rank9Source.filter(row=>
      row.status==='observed'&&row.verifiedFirstByDrawLog).length,
    sourceErrors:rank9Source.filter(row=>row.status!=='observed').length,
    observedRank9HorrorHouseRootDeclarations:events.length,
    resultScope:'unqualified 180-action original-source engine exposures, not 16 completed competitive games',
    effectivePsychicConditionIndependentAudit:false,
    resolutionIndependentAudit:false,
    opponentPolicyQualified:false,qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,observe,play};
