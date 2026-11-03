'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent20-ghala-physical-cost-to-native-payoff-attestation-v1';
const GHALA_ROOT = 'Guzma & Hala';
const GHALA_PRINTING = 'Guzma & Hala CEC';
const ATTACK = 'Volt Cyclone';
const STADIUM = 'Thunder Mountain Prism Star LOT';
const ENERGY = 'Double Colorless Energy SUM';

/**
 * Compare independent printed-card multisets, preserving duplicate
 * multiplicities. No physical card identity or hidden opponent data is read.
 * @param {unknown} lhs
 * @param {unknown} rhs
 * @returns {boolean}
 */
function samePrintings(lhs,rhs){
  return Array.isArray(lhs)&&Array.isArray(rhs)&&
    lhs.length===rhs.length&&
    JSON.stringify([...lhs].sort())===JSON.stringify([...rhs].sort());
}

/**
 * Verify the actual G&H source cost receipt against separate, previously
 * frozen native prompt/root/settlement evidence. Every premise is mandatory.
 * A successful conclusion is a *native chain* certificate, not whole-game
 * paper legality, information-set competence or tournament performance.
 *
 * @param {object} row One historical original rank6 native source arm.
 * @param {object} event Independent physical Store hand/discard observer event.
 * @returns {object} Conjunctive, fail-closed stage evidence.
 */
function attestGuzmaHalaNativeChain(row,event){
  assert.ok(row&&typeof row==='object');
  assert.ok(event&&typeof event==='object');
  const failed=[];
  const check=(good,reason)=>{if(good!==true)failed.push(reason);};
  const seat=event.sourcePhysicalSeat;
  const trial=row.trial??{};
  const sourceSeat=trial.candidateSlot==='A'?1:
    trial.candidateSlot==='B'?0:null;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const prompts=Array.isArray(row.nativePromptChoices?.events)?
    row.nativePromptChoices.events:[];
  const line=row.sourceLinePacket??{};
  const costPrintings=['Crushing Hammer POR','Team Flare Grunt XY'];

  check(trial.rank===6,'not-original-rank6');
  check(event.linkedTrialId===trial.id,'event-trial-id-mismatch');
  check(event.sourceRank===6,'event-original-source-rank-mismatch');
  check(event.ownerIsOriginalSource===true&&seat===sourceSeat&&
    event.ownerSeat===sourceSeat,'not-original-source-physical-owner');
  check(event.sourceDealFingerprint===row.sourceDealFingerprint&&
    typeof row.sourceDealFingerprint==='string',
  'physical-source-deal-does-not-match');
  check(event.globalTurnBefore===3,'source-payment-turn-not-three');
  check(event.paperSourcePaymentZoneWitness===true&&
    event.paperTwoCardZoneWitness===true&&
    event.validPhysicalSelectionBefore===true&&
    event.nativeDispatchCompleted===true&&
    event.actualSelectedCardMovementToDiscard===true&&
    event.selectedStillInHand===false&&
    event.requestedCount===2&&event.distinctSelected===2&&
    event.nativePromptMin===2&&event.nativePromptMax===2,
  'missing-native-physical-two-card-custody');
  check(samePrintings(event.selectedPrintings,costPrintings),
    'unexpected-cost-printings');

  const candidates=roots.filter(r=>r.action==='PlayCardAction'&&
    r.card===GHALA_ROOT&&r.playerSlot===seat&&r.turnBefore===3);
  const matches=[];
  for(const root of candidates){
    const ordinal=root.actionOrdinal;
    const window=roots.filter(r=>
      r.initiatingRootActionOrdinal===ordinal&&
      r.action==='ResolvePromptAction');
    const choices=prompts.filter(p=>window.some(w=>
      w.actionOrdinal===p.ordinal));
    const option=choices.find(p=>p.kind==='SelectOptionPrompt'&&
      p.selectedOption===1);
    const cost=choices.filter(p=>p.kind==='ChooseCardsPrompt'&&
      p.sourceZone==='hand'&&p.sourcePlayerSlot===seat&&
      p.actorSeat===seat&&p.turn===3&&
      p.nativePromptMin===2&&p.nativePromptMax===2&&
      samePrintings(p.selectedCards,event.selectedPrintings));
    const searched=choices.filter(p=>p.kind==='ChooseCardsPrompt'&&
      p.sourceZone==='deck'&&p.sourcePlayerSlot===seat&&
      p.actorSeat===seat&&p.turn===3&&
      samePrintings(p.selectedCards,[STADIUM,ENERGY]));
    const shuffle=window.some(p=>p.pendingPrompt==='ShuffleDeckPrompt');
    if(option&&cost.length===1&&searched.length===1&&shuffle)
      matches.push({rootOrdinal:ordinal,costOrdinal:cost[0].ordinal,
        searchOrdinal:searched[0].ordinal,
        shuffleOrdinal:window.find(w=>
          w.pendingPrompt==='ShuffleDeckPrompt').actionOrdinal});
  }
  check(matches.length===1,'ghala-native-root-prompt-linkage-missing-or-ambiguous');
  const match=matches.length===1?matches[0]:null;
  const rootOrdinal=match?.rootOrdinal??null;
  const attackRoot=line.executedSourceRoot;
  const attackOrdinal=attackRoot?.ordinal??null;
  const plays=roots.filter(r=>r.action==='PlayCardAction'&&
    r.playerSlot===seat&&r.turnBefore===3&&
    Number.isSafeInteger(rootOrdinal)&&r.actionOrdinal>rootOrdinal&&
    r.actionOrdinal<attackOrdinal);
  check(plays.some(r=>r.card==='Thunder Mountain Prism Star'),
    'searched-thunder-mountain-not-played');
  check(plays.some(r=>r.card==='Double Colorless Energy'),
    'searched-double-colorless-not-played');

  const attack=roots.find(r=>r.actionOrdinal===attackOrdinal);
  check(Number.isSafeInteger(attackOrdinal)&&
    attackOrdinal>(match?.searchOrdinal??Number.POSITIVE_INFINITY)&&
    attack?.playerSlot===seat&&attack?.action==='AttackAction'&&
    attack?.attack===ATTACK&&attack?.turnBefore===3&&
    attackRoot?.attack===ATTACK&&line.matchingSourceAttackDeclared===true,
  'selected-source-attack-not-native-declared');
  const transition=line.sourceImmediatePublicAttackTransition??{};
  const before=transition.beforePrizesRemaining;
  const after=transition.settled?.prizesRemaining;
  check(transition.actionOrdinal===attackOrdinal&&
    transition.triggerPlayerSlot===seat&&
    Array.isArray(before)&&Array.isArray(after)&&
    before[seat]===6&&after[seat]===5,
  'source-prize-settlement-unverified');
  const next=line.firstCandidateNextTurnRoot;
  const nextRoot=roots.find(r=>r.actionOrdinal===next?.ordinal);
  check(next?.playerSlot===1-seat&&next?.action==='PassTurnAction'&&
    next?.turn===4&&next?.ordinal>attackOrdinal&&
    nextRoot?.action==='PassTurnAction'&&
    nextRoot?.playerSlot===1-seat&&nextRoot?.turnBefore===4,
  'consequential-opponent-followup-unverified');
  return {
    version:VERSION,
    trialId:trial.id??null,
    sourceSeat:seat??null,
    paymentLinkedGuzmaHalaPrinting:GHALA_PRINTING,
    paymentPromptRootOrdinal:rootOrdinal,
    nativeCostPromptOrdinal:match?.costOrdinal??null,
    nativeSearchPromptOrdinal:match?.searchOrdinal??null,
    nativeShufflePromptOrdinal:match?.shuffleOrdinal??null,
    firstSourceAttackOrdinal:attackOrdinal,
    firstOpponentFollowupOrdinal:next?.ordinal??null,
    nativeSourcePaymentAttackPrizeOpponentRootChainVerified:
      failed.length===0,
    failed,
    exactSourceCardEffectsPaperVerified:false,
    opponentDecisionCompetenceVerified:false,
    officialPaperClockVerified:false,
    competitivelyQualifiedGame:false
  };
}

/**
 * Evaluate every observed physical source payment independently, including
 * failed, unlinked and non-source events.
 * @param {object} native Frozen run returned by runFrozenCanary.
 * @param {object} evidence Prior read-only payment observer result.
 * @returns {object}
 */
function attestHistoricalFourArmReplay(native,evidence){
  assert.ok(Array.isArray(native?.rawNativeResult?.rows));
  assert.ok(Array.isArray(evidence?.events));
  const rows=native.rawNativeResult.rows;
  const audited=evidence.events.map(event=>{
    const row=Number.isSafeInteger(event.gameOrdinal)?
      rows[event.gameOrdinal]:null;
    return row?attestGuzmaHalaNativeChain(row,event):{
      trialId:null,
      nativeSourcePaymentAttackPrizeOpponentRootChainVerified:false,
      failed:['no-matching-native-original-game'],
      competitivelyQualifiedGame:false
    };
  });
  return {
    schema:VERSION,registeredNativeArms:rows.length,
    totalObserverEvents:audited.length,
    sourceCostToNativePayoffChains:audited.filter(x=>
      x.nativeSourcePaymentAttackPrizeOpponentRootChainVerified).length,
    allObservedSourceCostChainsVerified:audited.length>0&&
      audited.every(x=>
        x.nativeSourcePaymentAttackPrizeOpponentRootChainVerified),
    audits:audited,competitivelyQualifiedGames:0,
    cardTextAndOfficialClockUnqualified:true
  };
}

module.exports={VERSION,samePrintings,
  attestGuzmaHalaNativeChain,attestHistoricalFourArmReplay};
