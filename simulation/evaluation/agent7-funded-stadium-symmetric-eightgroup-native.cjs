'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { runMatch, initializeCards } =
  require('../twinleaf/headless.cjs');
const { planAichi } = require('./aichi-pilot.cjs');
const { deriveSlotSeeds } =
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const { trainerPrintCatalog } =
  require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const { identity } = require('./agent7-stadium-source-impact-receipt.cjs');
const { withSelectedFundedStadium } =
  require('../twinleaf/agent7-funded-stadium-selected-native.cjs');
const REGISTRATION =
  require('../../results/aichi-2026/registrations/agent7-funding-stadium-owner-symmetric-8group-20261103.json');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));

/** @param {object} game */
const digest = game => game ? createHash('sha256').update(JSON.stringify({
  deckHashes:game.deckHashes,
  firstTurnSlot:game.firstTurnSlot,
  fullDeal:game.initialFullPhysicalDealFingerprint,
  decisionTrace:game.decisionTrace,
  rootActionLedger:game.rootActionLedger,
  finished:game.finished,winner:game.winner
})).digest('hex') : null;

/** @param {object} a @param {object} b */
function nativeFirstDifference(a,b){
  if(!a?.rootActionLedger || !b?.rootActionLedger)return null;
  const left=a.rootActionLedger,right=b.rootActionLedger;
  let prefix=0;
  while(prefix<left.length&&prefix<right.length&&
    JSON.stringify(identity(left[prefix]))===
    JSON.stringify(identity(right[prefix])))prefix++;
  return {
    matchedActionsBeforeFirstDivergence:prefix,
    firstControl:left[prefix]??null,
    firstTreatment:right[prefix]??null
  };
}

/**
 * One prespecified physical group. No selection based on observed success.
 * @param {object} group
 * @param {'A'|'B'} slot
 * @param {string[]} rankPrimary
 * @param {string[]} rankSecondary
 * @param {object} deps Native types and prepared public printed catalog.
 */
function runGroup(group,slot,rankPrimary,rankSecondary,deps){
  const primarySeat=slot==='A'?0:1;
  const seed=group.slots[slot];
  const deckA=primarySeat===0?rankPrimary:rankSecondary;
  const deckB=primarySeat===0?rankSecondary:rankPrimary;
  const request={
    deckA,deckB,seed,maxActions:REGISTRATION.maxActions,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    label:'agent7-funded-stadium-symmetric-'+group.primaryRank+
      'v'+group.otherRank+'-'+group.kind+'-'+slot
  };
  const attempt=(arm,fn)=>{
    try{
      return {arm,status:'executed',payload:fn()};
    }catch(error){
      return {
        arm,status:'native-error',
        error:String(error?.stack??error),
        partialNativeAudit:error?.agent7FundedAudit??null
      };
    }
  };
  const control=attempt('native-control',()=>runMatch(request));
  const selected=attempt('actor-public-funded-stadium',()=>
    withSelectedFundedStadium(()=>runMatch(request),deps));
  const repeated=attempt('native-control-repeat',()=>runMatch(request));
  const first=control.payload;
  const chosen=selected.payload?.result;
  const repeat=repeated.payload;
  const audit=selected.payload?.audit??selected.partialNativeAudit??null;
  const physicalFingerprints=[first,chosen,repeat].map(game=>
    game?.initialFullPhysicalDealFingerprint?.digestSha256??null);
  const parity={
    identicalPhysicalDeal:physicalFingerprints.every(x=>
      x!==null && x===physicalFingerprints[0]),
    originalNativeControlRepeated:!!first&&!!repeat&&
      digest(first)===digest(repeat),
    physicalFingerprints,
    rootLedgerDigests:[digest(first),digest(chosen),digest(repeat)]
  };
  const divergence=nativeFirstDifference(first,chosen);
  const event=audit?.firstSelected??null;
  const selectedRootVerified=!!event&&
    event.dispatch==='accepted' &&
    event.newStadiumOnOwnBoard===true &&
    divergence?.firstControl?.action==='PassTurnAction' &&
    divergence.firstTreatment?.action==='PlayCardAction' &&
    divergence.firstTreatment.turnBefore===event.globalTurn &&
    divergence.firstTreatment.playerSlot===event.seat &&
    divergence.firstControl.playerSlot===event.seat &&
    divergence.firstControl.turnBefore===event.globalTurn;
  const sourceAttacksAfter=chosen?.decisionTrace?.filter(row=>
    event&&row.playerSlot===event.seat&&row.turnBefore>=event.globalTurn&&
    row.action==='AttackAction').map(row=>({
    turn:row.turnBefore,attack:row.attack,prizesAfter:row.prizesAfter
  }))??[];
  const sourceAttacksControl=first?.decisionTrace?.filter(row=>
    event&&row.playerSlot===event.seat&&row.turnBefore>=event.globalTurn&&
    row.action==='AttackAction').map(row=>({
    turn:row.turnBefore,attack:row.attack,prizesAfter:row.prizesAfter
  }))??[];
  return {
    originalRanks:[group.primaryRank,group.otherRank],
    seedKind:group.kind,sourceSlot:slot,primaryRankSeat:primarySeat,
    seed,trialArmStatus:{
      control:control.status,selected:selected.status,repeat:repeated.status,
      errors:[control,selected,repeated].filter(a=>a.error).map(a=>({
        arm:a.arm,error:a.error
      }))
    },
    exactOriginal60BothSeats:true,parity,
    changedActualRoot:!!event,
    nativeSelectedStoreStatus:audit?.nativeStoreStatus??'error',
    selectedRootVerified,firstDivergence:divergence,
    selectedFirstRoot:event,
    observedRealOwnerRoots:audit?.nativeRealOwnerRootsExamined??null,
    observedNativePassRoots:audit?.nativePassRootsExamined??null,
    fundableNativePassRoots:audit?.nativePassesWithFundableStadium??null,
    nativeStoreAfterSelected:audit?.laterStoreActions??null,
    selectedSourceAttacksAfter:sourceAttacksAfter,
    originalSourceAttacksAfter:sourceAttacksControl,
    controlFinalPrizes:first?.decisionTrace?.at(-1)?.prizesAfter??null,
    selectedFinalPrizes:chosen?.decisionTrace?.at(-1)?.prizesAfter??null,
    controlEnd:{finished:first?.finished??null,
      winner:first?.winner??null,actions:first?.actions??null},
    selectedEnd:{finished:chosen?.finished??null,
      winner:chosen?.winner??null,actions:chosen?.actions??null},
    fullRootLedgerControl:first?.rootActionLedger??null,
    fullRootLedgerTreatment:chosen?.rootActionLedger??null,
    originalNativeControlDecisionTrace:first?.decisionTrace??null,
    treatmentDecisionTrace:chosen?.decisionTrace??null,
    competitiveQualifiedGames:0
  };
}

function run(){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {GamePhase}=native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType,CardType,Stage,SpecialCondition}=
    native('game/store/card/card-types');
  const catalog=trainerPrintCatalog(manager.getAllCards(),{
    TrainerCard,TrainerType
  });
  const deps={Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,Stage,CardType,SpecialCondition,catalog};
  const rows=[];
  for(const group of REGISTRATION.seedGroups){
    const plan=planAichi(group.primaryRank,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
    const p=plan.candidate.cards;
    const o=plan.opponents.find(row=>row.rank===group.otherRank)?.cards;
    assert.equal(p?.length,60);
    assert.equal(o?.length,60);
    const expected=deriveSlotSeeds(group.seedBase,'pilot',
      group.primaryRank,group.repeat);
    assert.deepEqual(expected,group.slots,
      'Registered seed mismatch before native execution');
    for(const slot of /** @type {const} */ (['A','B'])){
      rows.push(runGroup(group,slot,p,o,deps));
    }
  }
  assert.equal(rows.length,8,'Preregistered exactly eight physical groups');
  const changed=rows.filter(row=>row.changedActualRoot);
  const output={
    schema:REGISTRATION.schema,
    enginePin:REGISTRATION.nativePin,
    compiledResearchSha:process.env.GITHUB_SHA??null,
    source:REGISTRATION,
    attemptedPhysicalGroups:rows.length,
    attemptedStoreGames:rows.length*3,
    nativeAbortedGroups:rows.filter(row=>
      row.trialArmStatus.errors.length>0).length,
    matchedFullPhysicalGroups:rows.filter(row=>
      row.parity.identicalPhysicalDeal).length,
    matchingRepeatedControlGames:rows.filter(row=>
      row.parity.originalNativeControlRepeated).length,
    actualSelectedStadiumRoots:changed.length,
    acceptedActualSelectedStadiumRoots:changed.filter(row=>
      row.nativeSelectedStoreStatus==='accepted').length,
    selectedFirstDivergencesVerified:changed.filter(row=>
      row.selectedRootVerified).length,
    byRegistrationKind:{
      historic:rows.filter(row=>row.seedKind==='historic').length,
      freshPreselected:rows.filter(row=>row.seedKind==='fresh-preselected').length
    },
    competitiveQualifiedGames:0,
    strengthScope:'Selected native root and response only; original policy, game clock and full 32 field not validated',
    rows
  };
  return output;
}

if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  process.stderr.write('AGENT7_FUNDING_STADIUM_SYMMETRIC_8GROUP '+
    JSON.stringify({
      attempted:output.attemptedStoreGames,
      groups:output.attemptedPhysicalGroups,
      sourceParity:output.matchedFullPhysicalGroups,
      controlParity:output.matchingRepeatedControlGames,
      nativeErrorGroups:output.nativeAbortedGroups,
      selected:output.actualSelectedStadiumRoots,
      accepted:output.acceptedActualSelectedStadiumRoots,
      exactSelectedFirstDivergences:output.selectedFirstDivergencesVerified,
      cases:output.rows.map(r=>({
        ranks:r.originalRanks,
        kind:r.seedKind,
        seat:r.primaryRankSeat,
        seed:r.seed,
        selected:r.changedActualRoot,
        selectedNativeStore:r.nativeSelectedStoreStatus,
        firstDivergence:r.firstDivergence?.firstTreatment?.action??null,
        attackCount:r.selectedSourceAttacksAfter.length,
        controlAttackCount:r.originalSourceAttacksAfter.length,
        errors:r.trialArmStatus.errors.length
      }))
    })+'\n');
  if(output.nativeAbortedGroups>0 ||
      output.matchedFullPhysicalGroups!==8 ||
      output.matchingRepeatedControlGames!==8 ||
      output.acceptedActualSelectedStadiumRoots!==
        output.actualSelectedStadiumRoots ||
      output.selectedFirstDivergencesVerified!==
        output.actualSelectedStadiumRoots)process.exitCode=1;
}

module.exports={run,runGroup,nativeFirstDifference,digest};
