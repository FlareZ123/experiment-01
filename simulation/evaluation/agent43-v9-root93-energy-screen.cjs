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
module.exports={VERSION,FROZEN,binomial,probabilityAtLeastOne,auditRoot93};
