'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  zoneOf,summarizePhysicalZoneTransfers,attackTransferWindows
}=require('../../simulation/evaluation/2026-11/agent13-root-zone-transfers.cjs');

const cards=[
  {id:'0:0',printing:'Psychic Energy MEE'},
  {id:'0:1',printing:'Forest Seal Stone SIT'},
  {id:'0:2',printing:'Secret Box TWM'},
  {id:'1:0',printing:'Double Colorless Energy EVO'},
  {id:'1:1',printing:'Mew V FST'}
];
const entries=[
  ['0:0','s0.deck:0'],['0:1','s0.deck:1'],
  ['0:2','s0.prizes0:0'],['1:0','s1.deck:0'],['1:1','s1.active:0']
];
const snapshot=entries=>Object.fromEntries(entries);
const receipt=(actionOrdinal,turnBefore,seat,action,before,after)=>{
  const movement=cards.flatMap(c=>
    before[c.id]===after[c.id]?[]:[{id:c.id,printing:c.printing,
      from:before[c.id]??null,to:after[c.id]??null}]);
  return {actionOrdinal,turnBefore,seat,action,
    beforePositions:before,afterPositions:after,movement,
    beforePrompts:[],afterPrompts:[],anomalies:{}};
};
function fakePacket(){
  const first=snapshot(entries);
  const shifted={...first,'0:0':'s0.deck:1','0:1':'s0.deck:0'};
  const attached={...shifted,'0:0':'s0.bench0:0'};
  const claimed={...attached,'0:2':'s0.hand:0'};
  return {schema:'agent36-live-paper-root-receipts-v1',
    originalPhysicalCards:cards,settledPhysicalIdentityClean:true,
    receipts:[
      receipt(0,4,0,'PlayCardAction',first,shifted),
      receipt(1,4,0,'ResolvePromptAction',shifted,attached),
      receipt(2,4,0,'ResolvePromptAction',attached,claimed)
    ]};
}

test('zone parser preserves physical seat/slot and erases shuffle index',()=>{
  assert.equal(zoneOf('s0.deck:17'),'s0.deck');
  assert.equal(zoneOf('s1.bench3.tools:0'),'s1.bench3.tools');
  assert.equal(zoneOf('s0.prizes5:0'),'s0.prizes5');
  assert.equal(zoneOf(null),null);
  assert.throws(()=>zoneOf('unknown'),/physical zone/i);
});

test('shuffle changes card positions without increasing genuine zone transfers',()=>{
  const result=summarizePhysicalZoneTransfers(fakePacket());
  assert.equal(result.rootCount,3);
  assert.equal(result.originalPhysicalCardCount,5);
  assert.equal(result.withinZoneReorders,2);
  assert.equal(result.trueZoneTransfers,2);
  assert.equal(result.temporaryUnaccountedIdentityEvents,0);
  assert.equal(result.prizeCardsMovedToOwnerHand,1);
  assert.equal(result.energyDeckAttachments,1);
  assert.equal(result.crossSeatPhysicalMovements,0);
  assert.equal(result.timeline[0].rawChangedPhysicalCards,2);
  assert.equal(result.timeline[0].zoneTransferCount,0);
  assert.equal(result.timeline[1].energyDeckAttachments[0].printing,
    'Psychic Energy MEE');
  assert.equal(result.timeline[2].prizeClaims[0].printing,'Secret Box TWM');
  assert.equal(result.competitiveGameQualified,false);
});

test('one attack prompt chain accumulates physical energy and Prizes',()=>{
  const changes=summarizePhysicalZoneTransfers(fakePacket());
  const roots=[
    {actionOrdinal:0,turnBefore:4,turnAfter:4,playerSlot:0,action:'AttackAction'},
    {actionOrdinal:1,turnBefore:4,turnAfter:4,playerSlot:0,action:'ResolvePromptAction'},
    {actionOrdinal:2,turnBefore:4,turnAfter:5,playerSlot:0,action:'ResolvePromptAction'}
  ];
  const modality={
    rootCount:3,events:[{initiatingRootOrdinal:0,turnBefore:4,ownerSeat:0,
      attackMechanism:'ordinary-root-printed-attack',copyChoice:null,
      ordinaryAttackName:'Full Moon Rondo',observedSameTurnPrizeDelta:1}]
  };
  const actual=attackTransferWindows(roots,modality,changes);
  assert.equal(actual.windows.length,1);
  assert.equal(actual.windows[0].prizeClaims,1);
  assert.equal(actual.windows[0].collectedZoneTransfers,2);
  assert.equal(actual.windows[0].coveredThroughRootOrdinal,2);
  assert.equal(actual.windows[0].prizeObserversAgree,true);
  assert.equal(actual.windows[0].energyAttachmentsFromDeck.length,1);
});

test('missing physical movement cannot be hidden in an abbreviated receipt',()=>{
  const packet=fakePacket();
  packet.receipts[1].movement=[];
  assert.throws(()=>summarizePhysicalZoneTransfers(packet),
    /movement list omitted/i);
});

test('phantom physical ID, changed print and duplicate moves fail closed',()=>{
  const packet=fakePacket();
  packet.receipts[1].movement[0].id='9:9';
  assert.throws(()=>summarizePhysicalZoneTransfers(packet),
    /original physical card/i);
  const another=fakePacket();
  another.receipts[1].movement[0].printing='Different Printing';
  assert.throws(()=>summarizePhysicalZoneTransfers(another),
    /printing cannot change/);
  const duplicate=fakePacket();
  duplicate.receipts[1].movement.push({
    ...duplicate.receipts[1].movement[0]});
  assert.throws(()=>summarizePhysicalZoneTransfers(duplicate),
    /One change per original physical card/);
});

test('noncontiguous accepted root or cross-seat physical movement is reported',()=>{
  const packet=fakePacket();
  packet.receipts[2].actionOrdinal=5;
  assert.throws(()=>summarizePhysicalZoneTransfers(packet),
    /ordinals must be contiguous/);
  const cross=fakePacket();
  const receipt2=cross.receipts[1];
  receipt2.afterPositions['0:0']='s1.bench0:0';
  receipt2.movement[0].to='s1.bench0:0';
  cross.receipts[2].beforePositions['0:0']='s1.bench0:0';
  const s=summarizePhysicalZoneTransfers(cross);
  assert.equal(s.crossSeatPhysicalMovements,1);
  assert.equal(s.timeline[1].crossSeatMoves[0].id,'0:0');
});
