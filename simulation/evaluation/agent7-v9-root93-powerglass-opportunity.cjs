'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');

const FROZEN = Object.freeze({
  trial: '11:1000:B:new-moon-lockbreaker-v1',
  sourceDeal: 'a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317',
  fullDeal: '94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7',
  baselineLedger: '696c0f66624c5ee51026f0d006ce80e8ca9e48dcc435c338f5b6617231d75176'
});
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const count = (cards, name) => cards.filter(card => card === name).length;

/**
 * Read-only real-native evidence for a conditional printed-paper line. The
 * actor is candidate seat1; no opponent hidden hand/deck/Prize is inspected.
 * The B replay verifies Escape Rope was in the deck at root93 by observing
 * the later genuine Lillie draw on the identical physical initial deal.
 * @param {object} baseline Unmodified A native archive
 * @param {object} lillie Root93 Lillie B native archive
 * @returns {object} Source evidence and proposal, never game qualification
 */
function auditPowerglassOpportunity(baseline, lillie) {
  const a=baseline.nativeAttempt, b=lillie.nativeAttempt;
  for(const n of [a,b]) {
    assert.equal(n.id,FROZEN.trial);
    assert.equal(n.sourceSeat,0);
    assert.equal(n.candidateSeat,1);
    assert.equal(n.sourceDealFingerprint,FROZEN.sourceDeal);
    assert.equal(n.fullPhysicalDealFingerprint,FROZEN.fullDeal);
    assert.equal(n.rootActionCount,n.rootActionLedger.length);
  }
  assert.equal(digest(a.rootActionLedger),FROZEN.baselineLedger);
  assert.equal(digest(a.rootActionLedger.slice(0,93)),
    digest(b.rootActionLedger.slice(0,93)),
    'First 93 actual Store roots must be identical');
  assert.deepEqual(a.rootActionLedger[93],{
    actionOrdinal:93,turnBefore:14,turnAfter:14,playerSlot:1,
    action:'PassTurnAction',pendingPrompt:null,initiatingRootActionOrdinal:93
  });
  assert.equal(b.rootActionLedger[93].action,'PlayCardAction');
  assert.equal(b.rootActionLedger[93].card,"Lillie's Determination");
  assert.equal(b.rootActionLedger[95].pendingPrompt,'ShuffleDeckPrompt');
  assert.equal(b.rootActionLedger[98].action,'PassTurnAction');
  assert.deepEqual(b.rootActionLedger.slice(94,98).map(x=>x.action),
    ['ResolvePromptAction','ResolvePromptAction','ResolvePromptAction','PlayCardAction']);
  assert.equal(b.rootActionLedger[97].card,'Squawkabilly ex');
  const observedB=b.nativeAllOwnerPassFrontier.receipts.find(x=>x.actionOrdinal===98);
  assert.ok(observedB);
  assert.ok(observedB.ownerHandAtChosenPass.includes('Escape Rope BST'),
    'Later Lillie draw must evidence Escape Rope in the earlier deck');

  const r=a.nativeAllOwnerPassFrontier.receipts.find(x=>x.actionOrdinal===93);
  assert.ok(r);
  assert.equal(r.actorSeat,1);
  assert.equal(r.turn,14);
  assert.equal(r.role,'candidate');
  const hand=r.ownerHandAtChosenPass;
  assert.equal(hand.length,10);
  assert.equal(count(hand,'Battle VIP Pass FST'),2);
  assert.equal(count(hand,'Rescue Carrier EVS'),2);
  assert.equal(count(hand,'Secret Box TWM'),1);
  assert.equal(count(hand,'Powerglass SFA'),1);
  assert.equal(count(hand,'Escape Rope BST'),0);
  const [source,actor]=r.publicBoardBeforePass;
  assert.equal(source.active.printing,'Trubbish FST');
  assert.equal(source.bench.length,5);
  assert.equal(actor.active.printing,'Unown AOR');
  assert.equal(actor.bench.length,4);
  const mewtwo=actor.bench.find(p=>p.printing==='Mewtwo & Mew-GX UNM');
  assert.ok(mewtwo);
  assert.deepEqual(mewtwo.toolCards,[]);
  assert.deepEqual(mewtwo.energyCards,[]);
  assert.deepEqual(actor.stadium,[]);
  assert.deepEqual(source.stadium,[]);

  const ko=a.sourceAttackSettlement.attacks.find(x=>x.actionOrdinal===86);
  assert.ok(ko);
  assert.equal(ko.attackName,'Super Poison Breath');
  assert.deepEqual(ko.prizesBefore,[6,6]);
  assert.deepEqual(ko.prizesAfter,[5,6]);
  assert.equal(ko.publicBoardBefore[1].active.printing,'Unown AOR');
  assert.deepEqual(ko.publicBoardBefore[1].active.energyCards,
    ['Psychic Energy','Psychic Energy']);
  const energyRoots=a.rootActionLedger.filter(x=>x.playerSlot===1 &&
    x.action==='PlayCardAction'&&x.card==='Psychic Energy'&&
    x.actionOrdinal<93).map(x=>x.actionOrdinal);
  assert.deepEqual(energyRoots,[25,38]);

  return {
    schema:'agent7-v9-root93-powerglass-paper-opportunity-v1',
    originalTrial:FROZEN.trial,sourceSeat:0,actorSeat:1,
    initialFullDeal:FROZEN.fullDeal,
    baselineAcceptedRootLedger:FROZEN.baselineLedger,
    commonNativePrefixRoots:93,root:93,turn:14,
    ownerHandCount:hand.length,
    paperDiscardPayment:['Battle VIP Pass FST','Battle VIP Pass FST',
      'Rescue Carrier EVS'],
    sourceUnownKnockoutRoot:86,
    priorEnergyAttachmentRootOrdinals:energyRoots,
    basicEnergyCardsPreviouslyAttachedToKnockedOutUnown:2,
    initialAvailableBenchTarget:'Mewtwo & Mew-GX UNM',
    searchableItemSupportedByLaterSameDealOwnerDraw:'Escape Rope BST',
    proposedActions:[
      'Secret Box: discard two now-dead Battle VIP Pass and one of two Rescue Carrier',
      'Search for Escape Rope in the type-limited Item search',
      'Attach held Powerglass to untooled Benched Mewtwo & Mew-GX',
      'Play Escape Rope, allow opponent to switch first, promote own Mewtwo & Mew-GX',
      'End turn; resolve optional Powerglass Basic Psychic attachment from own discard to Active Mewtwo & Mew-GX'
    ],
    claim:'Conditional paper-play opportunity, not an observed Store sequence',
    caveat:'Native Secret Box payment/search, Tool and Escape Rope acceptance, Powerglass prompt, later attacks and adversarial opponent are untested',
    competitiveGamesQualified:0
  };
}

if(require.main===module) {
  assert.equal(process.argv.length,4,'Provide extracted A and B JSON archives');
  const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  process.stdout.write(JSON.stringify(
    auditPowerglassOpportunity(load(process.argv[2]),load(process.argv[3])),
    null,2)+'\n');
}
module.exports={FROZEN,auditPowerglassOpportunity};
