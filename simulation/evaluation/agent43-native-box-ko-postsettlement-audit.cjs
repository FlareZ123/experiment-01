'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {auditRoot93}=require('./agent43-v9-root93-energy-screen.cjs');

const VERSION='agent43-original-rank11-root93-paid-box-real-ko-postsettlement-v1';
const FROZEN=Object.freeze({
  trial:'11:1000:B:new-moon-lockbreaker-v1',
  sourceDeal:'a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317',
  fullDeal:'94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7',
  baselineLedger:'696c0f66624c5ee51026f0d006ce80e8ca9e48dcc435c338f5b6617231d75176',
  treatedLedger:'a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e'
});

/** @param {object[]} accepted Native physical accepted-root objects. */
function ledgerSha256(accepted){
  return createHash('sha256').update(JSON.stringify(accepted)).digest('hex');
}

/**
 * Read-only native Store and aftermath certificate. All claims are
 * conditional on the specific exposed dealt rank11 vs New Moon v1 game.
 * Neither an accepted attack nor a root-capped apparent lead is a win.
 * @param {object} baseline Frozen genuine original v9 artifact.
 * @param {object} treatment Genuine native Secret Box historical variant.
 * @returns {object} Public settlement and bounded physical-choice receipts.
 */
function auditNativeOnePrizeBoxKo(baseline,treatment){
  const control=auditRoot93(baseline);
  const a=treatment.nativeAttempt;
  assert.equal(a.id,FROZEN.trial);
  assert.equal(a.sourceDealFingerprint,FROZEN.sourceDeal);
  assert.equal(a.fullPhysicalDealFingerprint,FROZEN.fullDeal);
  assert.equal(a.seed,626469135);
  assert.equal(a.sourceSeat,0);
  assert.equal(a.candidateSeat,1);
  assert.equal(control.publicRootLedgerSha256,FROZEN.baselineLedger);
  assert.equal(a.rootActionCount,260);
  assert.equal(a.rootActionLedger.length,260);
  assert.equal(ledgerSha256(a.rootActionLedger),FROZEN.treatedLedger);
  assert.equal(a.publicRootLedgerSha256Computed,FROZEN.treatedLedger);
  assert.deepEqual(a.rootActionLedger.slice(0,93),
    baseline.nativeAttempt.rootActionLedger.slice(0,93));
  assert.deepEqual(a.rootActionLedger.slice(93,105).map(x=>[
    x.actionOrdinal,x.playerSlot,x.action,x.card??null,
    x.pendingPrompt??null
  ]),[
    [93,1,'PlayCardAction','Secret Box',null],
    [94,1,'ResolvePromptAction',null,'ChooseCardsPrompt'],
    [95,1,'ResolvePromptAction',null,'ChooseCardsPrompt'],
    [96,0,'ResolvePromptAction',null,'ShowCardsPrompt'],
    [97,1,'ResolvePromptAction',null,'ShuffleDeckPrompt'],
    [98,1,'PlayCardAction','Fog Crystal',null],
    [99,1,'ResolvePromptAction',null,'ChooseCardsPrompt'],
    [100,0,'ResolvePromptAction',null,'ShowCardsPrompt'],
    [101,1,'ResolvePromptAction',null,'ShuffleDeckPrompt'],
    [102,1,'ResolvePromptAction',null,'WaitPrompt'],
    [103,1,'PlayCardAction','Psychic Energy',null],
    [104,1,'AttackAction',null,null]
  ]);
  const nativeAudit=treatment.nativeAdapterAudit.agent43OneEnergyBoxKo;
  assert.equal(nativeAudit.liveRuns,1);
  assert.equal(nativeAudit.candidatePlans,1);
  assert.equal(nativeAudit.acceptedActions,7);
  assert.equal(nativeAudit.rejectedActions,0);
  for(const field of [
    'paperPaymentsAccepted','physicalBoxSearches',
    'physicalFogSearches','physicallyAttachedBasic','submittedAttacks'
  ])assert.equal(nativeAudit[field],1);
  assert.deepEqual(nativeAudit.actions.map(x=>x.kind),[
    'play-box','box-payment','box-search','play-fog',
    'fog-search','attach-basic','attack'
  ]);
  assert.ok(nativeAudit.actions.every(x=>x.accepted===true));
  const payment=nativeAudit.actions.find(x=>x.kind==='box-payment');
  assert.deepEqual(payment.paidPhysicalPrintings,
    ['Battle VIP Pass FST','Battle VIP Pass FST','Rescue Carrier EVS']);
  assert.equal(nativeAudit.actions.find(x=>x.kind==='box-search')
    .selectedSearchPrinting,'Fog Crystal CRE');
  const selectedEnergy=nativeAudit.actions.find(x=>x.kind==='fog-search')
    .selectedSearchPrinting;
  assert.ok(/^Psychic Energy [A-Z0-9]+$/.test(selectedEnergy));
  assert.equal(nativeAudit.actions.find(x=>x.kind==='attach-basic')
    .attachedBasicPrinting,selectedEnergy);
  const info=nativeAudit.promptObservations;
  assert.equal(info.length,1);
  assert.equal(info[0].ownerAuthenticated,true);
  assert.equal(info[0].promptOnOwnerDeck,true);
  assert.equal(info[0].offeredBasicPhysicalCount,1);
  assert.equal(info[0].offeredBasicNativeValid,true);
  const settlement=a.candidateAttackSettlement;
  assert.equal(settlement.candidateSeat,1);
  const attack=settlement.attacks.find(x=>x.actionOrdinal===104);
  assert.ok(attack,'Missing attack104 native settlement');
  assert.equal(attack.attackName,'Hidden Power');
  assert.equal(attack.settledPromptChain,true);
  assert.equal(attack.completionRootOrdinal,109);
  assert.equal(attack.nextSourceSameEpochProven,true);
  assert.equal(attack.settlementCrossesClockReset,false);
  assert.deepEqual(attack.prizesBefore,[5,6]);
  assert.deepEqual(attack.prizesAfter,[5,5]);
  assert.equal(attack.publicBoardBefore[0].active.printing,'Trubbish FST');
  assert.equal(attack.publicBoardBefore[0].active.damage,60);
  assert.deepEqual(attack.publicBoardBefore[0].active.energyCards,
    ['Darkness Energy','Darkness Energy','Darkness Energy']);
  assert.equal(attack.publicBoardBefore[1].active.printing,'Unown AOR');
  assert.deepEqual(attack.publicBoardBefore[1].active.energyCards,
    ['Psychic Energy']);
  assert.equal(attack.publicBoardAfter[0].active.printing,'Tapu Lele-GX GRI');
  assert.equal(attack.publicBoardAfter[0].active.damage,0);
  assert.deepEqual(attack.publicBoardAfter[0].active.energyCards,[]);
  assert.equal(attack.publicBoardAfter[1].active.printing,'Unown AOR');
  assert.deepEqual(attack.publicBoardAfter[1].active.energyCards,
    ['Psychic Energy']);
  assert.deepEqual(attack.nextSourceTurnActions.map(x=>x.action),
    ['PlayCardAction','PassTurnAction','ResolvePromptAction']);
  assert.equal(attack.nextSourceTurnActions[0].card,'Mega Absol ex');
  assert.equal(attack.nextSourceRoot.ordinal,110);
  assert.ok(settlement.attacks.some(x=>
    x.actionOrdinal===114&&x.attackName==='Hidden Power'&&
    x.settledPromptChain===true));
  // Compare the same two source turn numbers after the 93-root divergence.
  // This is a real local matched-state contrast; downstream hands/draw order
  // can diverge and are not presumed counterfactually identical.
  const sourceActions=(attempt,turn)=>attempt.rootActionLedger
    .filter(x=>x.playerSlot===0&&x.turnBefore===turn);
  const initialControl=baseline.nativeAttempt;
  assert.deepEqual(sourceActions(initialControl,15)
    .filter(x=>x.action==='AttackAction').map(x=>x.actionOrdinal),[96]);
  assert.deepEqual(sourceActions(initialControl,17)
    .filter(x=>x.action==='AttackAction').map(x=>x.actionOrdinal),[103]);
  assert.deepEqual(sourceActions(a,15)
    .filter(x=>x.action==='PassTurnAction').map(x=>x.actionOrdinal),[111]);
  assert.deepEqual(sourceActions(a,17)
    .filter(x=>x.action==='PassTurnAction').map(x=>x.actionOrdinal),[118]);
  assert.equal(sourceActions(a,15).some(x=>x.action==='AttackAction'),false);
  assert.equal(sourceActions(a,17).some(x=>x.action==='AttackAction'),false);
  const sourceBaseline=initialControl.sourceAttackSettlement.attacks;
  const control15=sourceBaseline.find(x=>x.actionOrdinal===96);
  const control17=sourceBaseline.find(x=>x.actionOrdinal===103);
  assert.equal(control15.attackName,'Super Poison Breath');
  assert.deepEqual(control15.prizesAfter,[5,6]);
  assert.equal(control15.publicBoardAfter[1].active.printing,'Unown AOR');
  assert.equal(control15.publicBoardAfter[1].active.damage,30);
  assert.equal(control17.attackName,'Super Poison Breath');
  assert.deepEqual(control17.prizesBefore,[5,6]);
  assert.deepEqual(control17.prizesAfter,[4,6]);
  assert.equal(control17.publicBoardAfter[1].active.printing,
    'Mewtwo & Mew-GX UNM');
  assert.equal(a.status,'root-cap-unqualified');
  assert.equal(a.finished,false);
  assert.equal(a.winner,null);
  assert.equal(a.endReason,'action-limit');
  assert.deepEqual(a.finalPrizes,[5,3]);
  assert.equal(treatment.manifest.samePolicyBothSeats,true);
  assert.equal(treatment.manifest.competitiveGamesQualified,0);
  assert.equal(treatment.qualification.competitiveAdmission,false);
  return {
    version:VERSION,originalRegisteredTrial:FROZEN.trial,
    originalSourcePhysicalSeat:0,candidatePhysicalSeat:1,
    physicalDealSha256:FROZEN.fullDeal,sourceDealSha256:FROZEN.sourceDeal,
    baselineLedgerSha256:FROZEN.baselineLedger,
    treatmentLedgerSha256:FROZEN.treatedLedger,
    identicalOriginalStoreRootsBeforeCounterfactual:93,
    originalBaselineAction93:'PassTurnAction',
    replacementFirstAction93:'Secret Box',
    mandatoryOtherCardsPaid:3,
    paidPhysicalPrintings:payment.paidPhysicalPrintings,
    physicalBoxFogSearch:true,
    physicalFogBasicPsychicSearch:true,
    actualEnergyPrinting:selectedEnergy,
    basicPsychicNormalAttachmentToActive:true,
    attackOrdinal:104,attackName:'Hidden Power',
    sourcePreAttack:{active:'Trubbish FST',damage:60,hp:70,
      darknessEnergyCount:3},
    sourcePostAttackActive:'Tapu Lele-GX GRI',
    firstCandidatePrizeTakenFromThisAttack:true,
    candidatePrizeBefore:6,candidatePrizeAfter:5,
    nextSourceTurnHadAttack:false,
    nextSourceTurnPlayedMegaAbsol:true,
    comparisonControlTurn15:{attack:'Super Poison Breath',
      attackRoot:96,candidateActiveAfter:'Unown AOR',
      candidateDamageAfter:30,sourcePrizesAfter:5},
    comparisonTreatmentTurn15:{sourcePassedAtRoot:111,sourceAttacks:0},
    comparisonControlTurn17:{attack:'Super Poison Breath',
      attackRoot:103,sourcePrizesBefore:5,sourcePrizesAfter:4,
      candidateActiveAfter:'Mewtwo & Mew-GX UNM'},
    comparisonTreatmentTurn17:{sourcePassedAtRoot:118,sourceAttacks:0},
    nextCandidateHiddenPowerSettled:true,
    postgameRootCap:260,sourcePrizesAtCap:5,candidatePrizesAtCap:3,
    nativeWinner:null,competitiveGamesQualified:0,
    limitations:['Retrospective source-exposed physical deal',
      'One source opponent with weak uncertified bot policy',
      'Native Store acceptance and printed card texts require separate paper certification',
      'Root-capped game, no terminal win or win-rate inference',
      'Bilateral fully competent opponent decisions not demonstrated']
  };
}
module.exports={VERSION,FROZEN,ledgerSha256,auditNativeOnePrizeBoxKo};
