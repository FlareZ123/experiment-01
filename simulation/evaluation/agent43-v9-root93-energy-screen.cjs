'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const VERSION = 'agent43-v9-root93-lillie-energy-census-v1';
const FROZEN = Object.freeze({
  trial: '11:1000:B:new-moon-lockbreaker-v1',
  sourceDeal: 'a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317',
  fullDeal: '94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7',
  ledger: '696c0f66624c5ee51026f0d006ce80e8ca9e48dcc435c338f5b6617231d75176'
});

/** @param {number} n @param {number} k @returns {bigint} */
function binomial(n,k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if(k>n) return 0n;
  let v=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) {
    v=v*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  }
  return v;
}

/**
 * Uniform draw of at least one eligible card, conditional on known deck count.
 * @param {number} deckSize
 * @param {number} targetCount
 * @param {number} draws
 * @returns {number}
 */
function probabilityAtLeastOne(deckSize,targetCount,draws) {
  assert.ok(Number.isSafeInteger(targetCount)&&targetCount>=0&&targetCount<=deckSize);
  assert.ok(Number.isSafeInteger(draws)&&draws>=0&&draws<=deckSize);
  return 1-Number(binomial(deckSize-targetCount,draws))/Number(binomial(deckSize,draws));
}

/**
 * Strictly validates the actual exposed native owner/public receipt. It never
 * accesses the hidden opponent hand or deduces which cards were Prized.
 * @param {object} archive Frozen original native archived JSON packet.
 * @returns {object} Conditional resource-screen table, zero game qualifications.
 */
function auditRoot93(archive) {
  const a=archive.nativeAttempt;
  assert.equal(a.id,FROZEN.trial);
  assert.equal(a.sourceSeat,0);
  assert.equal(a.candidateSeat,1);
  assert.equal(a.sourceDealFingerprint,FROZEN.sourceDeal);
  assert.equal(a.fullPhysicalDealFingerprint,FROZEN.fullDeal);
  assert.equal(a.rootActionCount,209);
  const roots=a.rootActionLedger;
  assert.equal(roots.length,209);
  const sha=createHash('sha256').update(JSON.stringify(roots)).digest('hex');
  assert.equal(sha,FROZEN.ledger);
  assert.equal(a.publicRootLedgerSha256Computed,sha);
  const pass=roots.find(x=>x.actionOrdinal===93);
  assert.equal(pass.action,'PassTurnAction');
  assert.equal(pass.playerSlot,1);
  assert.equal(pass.turnBefore,14);
  const receipt=a.nativeAllOwnerPassFrontier.receipts.find(x=>x.actionOrdinal===93);
  assert.equal(receipt.actorSeat,1);
  assert.equal(receipt.role,'candidate');
  const hand=receipt.ownerHandAtChosenPass;
  assert.equal(hand.length,10);
  for(const [name,count] of [
    ["Lillie's Determination M1L",2],['Battle VIP Pass FST',2],
    ['Secret Box TWM',1]
  ]) assert.equal(hand.filter(x=>x===name).length,count);
  assert.equal(hand.filter(x=>x.includes('Energy')).length,0);
  const board=receipt.publicBoardBeforePass[1];
  assert.equal(board.active.printing,'Unown AOR');
  assert.equal(board.bench.length,4);
  for(const mon of [board.active,...board.bench])
    assert.equal(mon.energyCards.length,0);
  assert.equal(receipt.publicBoardBeforePass[0].active.printing,'Trubbish FST');
  const ko=a.sourceAttackSettlement.attacks.find(x=>x.actionOrdinal===86);
  assert.deepEqual(ko.prizesAfter,[5,6]);
  assert.equal(ko.publicBoardBefore[1].active.printing,'Unown AOR');
  assert.deepEqual(ko.publicBoardBefore[1].active.energyCards,
    ['Psychic Energy','Psychic Energy']);
  assert.deepEqual(roots.filter(x=>x.actionOrdinal<93&&x.playerSlot===1&&
    x.card==='Psychic Energy').map(x=>x.actionOrdinal),[25,38]);
  assert.deepEqual(roots.filter(x=>x.actionOrdinal<93&&x.playerSlot===1&&
    x.card==='Fog Crystal'&&x.action==='PlayCardAction')
    .map(x=>x.actionOrdinal),[19]);
  const deckBefore=60-6-hand.length-5-4;
  assert.equal(deckBefore,35);
  const afterShuffle=deckBefore+hand.length-1;
  assert.equal(afterShuffle,44);
  const scenarios=Array.from({length:5},(_,prizedEnergy)=>({
    prizedEnergy,energyInDeck:4-prizedEnergy,
    pEnergyInDrawEight:probabilityAtLeastOne(afterShuffle,4-prizedEnergy,8)
  }));
  // This optional marginal presumes the 4 unidentified Energy are uniformly
  // exchangeable across all 35 deck plus 6 Prize positions. It does NOT
  // describe the fixed private deal or the actor's possible K1 knowledge.
  const hypotheticalMarginal=scenarios.reduce((sum,x)=>sum+
    x.pEnergyInDrawEight*Number(binomial(4,x.prizedEnergy)*
      binomial(37,6-x.prizedEnergy))/Number(binomial(41,6)),0);
  return {version:VERSION,trialId:FROZEN.trial,root:93,turn:14,
    fullPhysicalDealSha256:FROZEN.fullDeal,
    publicRootLedgerSha256:FROZEN.ledger,
    originalEnergy:6,alreadyKnockedOutBasicEnergy:2,
    knownHandEnergy:0,knownBoardEnergy:0,
    ownerSixPrizes:true,ownerHeldLillie:2,
    preSupporterDeckCount:deckBefore,returnOtherHandCards:9,
    afterHypotheticalLillieShuffle:afterShuffle,drawsIfLegalLillie:8,
    scenarios,hypotheticalExchangeableMarginal:hypotheticalMarginal,
    qualifier:'No actual Lillie played; Prize identities and paper legality unresolved',
    competitiveGamesQualified:0};
}

/**
 * Independently check the existing Agent7 Lillie treatment against the same
 * original deal and the full untouched predecision source/candidate Store roots.
 * The eight-card zero-Energy event is inferred from owner-hand custody after
 * one Bench play, not from the private identities of the opponent's cards.
 * @param {object} baseline Native control JSON.
 * @param {object} treatment Native real-Store Lillie JSON.
 * @returns {object}
 */
function auditMatchedLillieMiss(baseline,treatment) {
  const base=auditRoot93(baseline);
  const a=treatment.nativeAttempt;
  assert.equal(a.id,FROZEN.trial);
  assert.equal(a.sourceSeat,0);
  assert.equal(a.candidateSeat,1);
  assert.equal(a.fullPhysicalDealFingerprint,FROZEN.fullDeal);
  assert.equal(a.sourceDealFingerprint,FROZEN.sourceDeal);
  assert.equal(a.rootActionCount,186);
  const changed=a.rootActionLedger;
  assert.equal(changed.length,186);
  const changedSha=createHash('sha256').update(JSON.stringify(changed))
    .digest('hex');
  assert.equal(changedSha,
    'a3c7bcba914a233f7ae99831a8e0bca135a819524004cbe7d965cbd874efdc16');
  assert.equal(a.publicRootLedgerSha256Computed,changedSha);
  assert.deepEqual(changed.slice(0,93),baseline.nativeAttempt.rootActionLedger.slice(0,93));
  assert.deepEqual(changed.slice(93,99).map(x=>[
    x.actionOrdinal,x.action,x.card??null,x.pendingPrompt??null
  ]),[
    [93,'PlayCardAction',"Lillie's Determination",null],
    [94,'ResolvePromptAction',null,'WaitPrompt'],
    [95,'ResolvePromptAction',null,'ShuffleDeckPrompt'],
    [96,'ResolvePromptAction',null,'WaitPrompt'],
    [97,'PlayCardAction','Squawkabilly ex',null],
    [98,'PassTurnAction',null,null]
  ]);
  const after=a.nativeAllOwnerPassFrontier.receipts.find(x=>x.actionOrdinal===98);
  assert.equal(after.actorSeat,1);
  const hand=after.ownerHandAtChosenPass;
  assert.equal(hand.length,7);
  assert.equal(hand.filter(x=>x.includes('Energy')).length,0);
  const own=after.publicBoardBeforePass[1];
  assert.equal(own.bench.length,5);
  assert.ok(own.bench.some(x=>x.printing==='Squawkabilly ex PAL'));
  assert.ok([own.active,...own.bench].every(x=>x.energyCards.length===0));
  assert.equal(a.finished,true);
  assert.equal(a.winner,0);
  return {
    version:'agent43-v9-root93-matched-lillie-zero-energy-observation-v1',
    trialId:base.trialId,sourceDeal:FROZEN.sourceDeal,
    preInterventionRootsIdentical:93,firstDifferenceRoot:93,
    storeLillieAccepted:true,shufflePromptSettledAtRoot:95,
    postShuffleSingleOwnerBoardAction:'Bench Squawkabilly ex',
    ownerHandAfterShuffleAndBenchCount:7,
    ownerHandAfterShuffleAndBenchEnergy:0,
    ownerBoardEnergy:0,
    inferredEnergyHitInEightCardDraw:0,
    actualNativeWinner:'original-rank11-source',
    gameOutcomeCompetitivelyQualified:false,
    limitations:['No full individual card-object draw custody proof',
      'Previously exposed physical deal with unqualified opposing policy',
      'Shuffling may change future random streams; no causal win-rate inference'],
    competitivelyQualifiedGames:0
  };
}


/**
 * Printed-card and native-prefix necessary-condition screen for a possible
 * first-Pass Secret Box -> Fog Crystal -> one-Energy Hidden Power KO. The
 * follow-up B archive is used ONLY to show deck accessibility retrospectively.
 * This does not play a card, resolve native prompts or prove the line legal.
 * @param {object} original Archived unchanged genuine native v9 match.
 * @param {object} treatment Archived matched native Lillie variant.
 * @param {object} [cards] Source-printed card JSON, injectable for tests.
 * @returns {object}
 */
function auditRoot93OnePrizeHypothesis(original,treatment,cards) {
  const paired=auditMatchedLillieMiss(original,treatment);
  const a=original.nativeAttempt, b=treatment.nativeAttempt;
  const fromFile=(file,id)=>require('../../resources/cards/en/'+file+'.json')
    .find(x=>x.id===id);
  const printed=cards??{
    unown:fromFile('xy7','xy7-30'),
    trubbish:fromFile('swsh8','swsh8-168'),
    secret:fromFile('sv6','sv6-163'),
    fog:fromFile('swsh6','swsh6-140')
  };
  assert.equal(printed.unown?.id,'xy7-30');
  assert.equal(printed.trubbish?.id,'swsh8-168');
  assert.equal(printed.secret?.id,'sv6-163');
  assert.equal(printed.fog?.id,'swsh6-140');
  const attack=printed.unown.attacks.find(x=>x.name==='Hidden Power');
  assert.deepEqual(attack.cost,['Colorless']);
  assert.equal(Number(attack.damage),10);
  assert.equal(Number(printed.trubbish.hp),70);
  assert.ok(printed.secret.rules.some(x=>
    x.includes('discard 3 other cards from your hand')&&
    x.includes('Search your deck for an Item card')));
  assert.ok(printed.fog.rules.some(x=>
    x.includes('a Psychic Energy card or a Basic Psychic Pokémon')));
  const before=a.nativeAllOwnerPassFrontier.receipts
    .find(x=>x.actionOrdinal===93);
  const self=before.publicBoardBeforePass[1];
  const source=before.publicBoardBeforePass[0];
  assert.equal(self.active.printing,'Unown AOR');
  assert.equal(self.active.energyCards.length,0);
  assert.equal(source.active.printing,'Trubbish FST');
  assert.equal(source.active.damage,60);
  assert.deepEqual(source.active.energyCards,[
    'Darkness Energy','Darkness Energy','Darkness Energy']);
  assert.deepEqual(source.active.toolCards,[]);
  assert.deepEqual(source.stadium,[]);
  assert.equal(printed.trubbish.weaknesses[0].type,'Fighting');
  const hand=before.ownerHandAtChosenPass;
  assert.equal(hand.filter(x=>x==='Battle VIP Pass FST').length,2);
  assert.equal(hand.filter(x=>x==='Rescue Carrier EVS').length,2);
  assert.equal(hand.filter(x=>x==='Secret Box TWM').length,1);
  const proposedPhysicalPayments=[
    'Battle VIP Pass FST','Battle VIP Pass FST','Rescue Carrier EVS'];
  for(const card of new Set(proposedPhysicalPayments))
    assert.ok(hand.filter(x=>x===card).length>=
      proposedPhysicalPayments.filter(x=>x===card).length);
  const later=b.rootActionLedger;
  const candidatePlays=later.filter(x=>x.playerSlot===1&&
    x.action==='PlayCardAction'&&x.actionOrdinal>93);
  for(const [ordinal,printing] of [[143,'Fog Crystal'],
    [148,'Psychic Energy'],[156,'Telepathic Psychic Energy']]) {
    assert.ok(candidatePlays.some(x=>x.actionOrdinal===ordinal&&x.card===printing));
  }
  const priorToFog=candidatePlays.filter(x=>x.actionOrdinal<143)
    .map(x=>x.card);
  assert.deepEqual(priorToFog,['Squawkabilly ex','Duskull']);
  assert.deepEqual(b.finalPrizes,[0,6]);
  assert.equal(b.sourceSeat,0);
  assert.equal(b.candidateSeat,1);
  assert.ok(Number(printed.trubbish.hp)-source.active.damage<=
    Number(attack.damage));
  const eligibleRemainingEnergyDrawCounts=[4,3,2];
  const scenarioHitBounds=eligibleRemainingEnergyDrawCounts.map(live=>({
    liveEnergy:live,prizedEnergy:4-live,
    chanceAtLeastOneInPrintedLillieDraw:probabilityAtLeastOne(44,live,8)
  }));
  return {
    version:'agent43-v9-root93-secretbox-fog-hiddenpower-paper-preflight-v1',
    originalTrial:paired.trialId,
    noPlayedAlternateLine:true,
    originalSourceHp:70,sourceDamageBeforeRoot93:60,
    sourceActiveDarkEnergyCount:3,
    candidateActive:'Unown AOR',attack:'Hidden Power',
    printedAttackCost:['Colorless'],printedDamage:10,
    targetKnockedOutIfDamageUnprevented:true,
    threeOtherDistinctPhysicalCardsAvailable:proposedPhysicalPayments,
    samePhysicalDealBHasPost93FogBasicAndTelepath:true,
    atLeastOneBasicPsychicOriginallyInDeck:true,
    atLeastOneTelepathicOriginallyInDeck:true,
    possibleRemainingTotalEnergyPrized:[0,1,2],
    eightCardLillieEnergyScreenAfterB:scenarioHitBounds,
    lineToValidate:['Pay and play Secret Box with exactly three other cards',
      'Native choose Fog Crystal from original deck',
      'Native Fog Crystal selects remaining Basic Psychic Energy',
      'Normal attach Basic Psychic to own Active Unown',
      'Native Unown Hidden Power, 10 damage, source Trubbish KO and one Prize',
      'Original-source owner promotion and meaningful next-turn reply'],
    caveats:['Later-treatment future information used only for posthoc eligibility, not decision policy',
      'Neither Secret Box payment nor search nor attack was executed in this original root',
      'Item locks, tool effects, damage prevention and actual Prize promotion require native proof',
      'Same seed is source-exposed and paper qualifications are still zero'],
    competitivelyQualifiedGames:0
  };
}

module.exports={VERSION,FROZEN,binomial,probabilityAtLeastOne,auditRoot93,auditMatchedLillieMiss,auditRoot93OnePrizeHypothesis};
