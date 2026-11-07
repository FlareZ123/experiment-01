'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {snapshotFirstUnsupportedOwnerRoot,VERSION}=require(
  '../simulation/twinleaf/agent2-first-unsupported-owner-root-observer.cjs');

function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:17,phase:2,
    ownHand:['VS Seeker PHF','Quick Ball FST'],
    ownPublic:{
      active:{printing:'Regidrago V SIT',energies:['Fire Energy MEE'],
        damage:40},bench:[null,'Dedenne-GX UNB',null,null,null],
      discard:["Professor's Research JTG"],
      lostZone:[],deckCount:18,prizeCount:4
    },
    opponentPublic:{
      active:{printing:'Bunnelby PRC'},
      bench:[null,'Snorlax PGO',null,null,null],
      discard:['Battle Compressor PHF'],deckCount:12,
      handCount:2,prizeCount:4
    },
    ownTurnResources:{
      supporterPlayedTurn:0,itemPlayLocked:false,
      supporterPlayLocked:false,energyPlayedTurn:17
    },
    opponentPrivateHand:['SECRET_HAND_1'],
    ownDeckUnsearchedIdentities:['SECRET_DECK_1'],
    ownerPrizeUnknownIdentities:['SECRET_PRIZE_1'],
    ownerK1:{knownPrintings:['SECRET_K1_1']}
  };
}

test('public actor root snapshot contains only owner-available fields',()=>{
  const input=view();
  const a=snapshotFirstUnsupportedOwnerRoot(input);
  assert.equal(a.version,VERSION);
  assert.equal(a.ownerView.actorSeat,0);
  assert.equal(a.ownerView.globalTurn,17);
  assert.deepEqual(a.ownerView.ownHand,input.ownHand);
  assert.equal(a.ownerView.ownPublic.deckCount,18);
  const json=JSON.stringify(a);
  for(const forbidden of ['SECRET_HAND_1','SECRET_DECK_1',
    'SECRET_PRIZE_1','SECRET_K1_1']){
    assert.equal(json.includes(forbidden),false);
  }
  assert.equal(a.hiddenSourceIdentitiesIncluded,false);
  assert.match(a.ownerVisibleSha256,/^[a-f0-9]{64}$/);
});

test('counterfactual concealed zones cannot influence root diagnostic',()=>{
  const original=view();
  const changed=structuredClone(original);
  changed.opponentPrivateHand=['FAKE'];
  changed.ownDeckUnsearchedIdentities=['FAKE'];
  changed.ownerPrizeUnknownIdentities=['FAKE'];
  changed.ownerK1={knownPrintings:['FAKE']};
  assert.deepEqual(snapshotFirstUnsupportedOwnerRoot(original),
    snapshotFirstUnsupportedOwnerRoot(changed));
  assert.deepEqual(original.ownHand,['VS Seeker PHF','Quick Ball FST']);
});

test('public owner hand or board changes digest deterministically',()=>{
  const a=view(),b=structuredClone(a);
  b.ownHand=['VS Seeker PHF'];
  assert.notEqual(snapshotFirstUnsupportedOwnerRoot(a).ownerVisibleSha256,
    snapshotFirstUnsupportedOwnerRoot(b).ownerVisibleSha256);
  assert.equal(snapshotFirstUnsupportedOwnerRoot(a).ownerVisibleSha256,
    snapshotFirstUnsupportedOwnerRoot(a).ownerVisibleSha256);
});

test('prompt, absent actor seat and missing own public zones fail',()=>{
  const a=view();
  a.decisionKind='owner-prompt';
  assert.throws(()=>snapshotFirstUnsupportedOwnerRoot(a));
  a.decisionKind='owner-root';
  a.actorSeat=2;
  assert.throws(()=>snapshotFirstUnsupportedOwnerRoot(a));
  a.actorSeat=0;a.ownPublic=null;
  assert.throws(()=>snapshotFirstUnsupportedOwnerRoot(a));
});
