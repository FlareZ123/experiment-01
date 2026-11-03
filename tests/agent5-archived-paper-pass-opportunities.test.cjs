'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {paperOptionsAtAcceptedPass,summarizePaperOpportunities} =
  require('../simulation/evaluation/agent5-archived-paper-pass-opportunities.cjs');

/** @param {object} [override] @returns {object} */
function root(override={}){
  return {ordinal:1,seat:1,turn:1,
    chosen:{action:'PassTurnAction'},dispatch:'native-accepted',
    ownerVisibleStadiumContext:{ownerDeckCount:45,
      ownerStadium:[],opponentStadium:[],ownerStadiumPlayedTurn:0,
      ownerStadiumPlayLocked:false},
    trainers:[{printing:'Battle Compressor PHF',name:'Battle Compressor',
      type:'Item',handIndex:2,publicBlocker:null,nativeEnumeratorOffered:true}],
    ...override};
}

test('genuine first-player public information can certify deck discarder',()=>{
  const answer=paperOptionsAtAcceptedPass(root());
  assert.equal(answer.candidates.length,1);
  assert.equal(answer.candidates[0].paperBasis,
    'unrestricted-own-deck-search-and-discard');
  assert.equal(answer.candidates[0].cardMaxDiscard,3);
  assert.equal(answer.candidates[0].ownerDeckCount,45);
});

test('zero, missing, or forged deck counts prevent paper candidate proof',()=>{
  for(const value of [0,null,-1,1.5,'45']){
    const r=root();r.ownerVisibleStadiumContext.ownerDeckCount=value;
    assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
  }
});

test('generic lock blocks Item, even with nonempty owner deck',()=>{
  const r=root();r.trainers[0].publicBlocker='public-item-lock';
  assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
});

test('rejected or otherwise selected root is excluded from actual Pass count',()=>{
  assert.equal(paperOptionsAtAcceptedPass(root({dispatch:'native-rejected'}))
    .acceptedPass,false);
  assert.equal(paperOptionsAtAcceptedPass(root({chosen:{action:'AttackAction'}}))
    .acceptedPass,false);
});

test('original own Stadium can be replaced when printed names differ',()=>{
  const r=root({ordinal:21,seat:0,turn:10});
  r.ownerVisibleStadiumContext={ownerDeckCount:36,
    ownerStadium:['Wondrous Labyrinth Prism Star TEU'],
    opponentStadium:[],ownerStadiumPlayedTurn:2,
    ownerStadiumPlayLocked:false};
  r.trainers=[{printing:'Thunder Mountain Prism Star LOT',
    type:'Stadium',handIndex:7,publicBlocker:null,
    nativeEnumeratorOffered:false}];
  const answer=paperOptionsAtAcceptedPass(r);
  assert.equal(answer.candidates.length,1);
  assert.equal(answer.candidates[0].previousStadium,
    'Wondrous Labyrinth Prism Star TEU');
  assert.equal(answer.candidates[0].nativeEnumeratorOffered,false);
});

test('quota, same printed name, lock, and unknown current card veto Stadium',()=>{
  const r=root({turn:10});
  r.trainers=[{printing:'Silent Lab PRC',type:'Stadium',handIndex:2,
    publicBlocker:null,nativeEnumeratorOffered:false}];
  const board=r.ownerVisibleStadiumContext;
  board.ownerStadium=['PokéStop PGO'];
  board.ownerStadiumPlayedTurn=10;
  assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
  board.ownerStadiumPlayedTurn=2;
  board.ownerStadium=['Silent Lab PRC'];
  assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
  board.ownerStadium=['Some Stadium NOV'];
  assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
  board.ownerStadium=['PokéStop PGO'];
  board.ownerStadiumPlayLocked=true;
  assert.equal(paperOptionsAtAcceptedPass(r).candidates.length,0);
});

test('unsupported Trainer families remain unproven and are never substituted',()=>{
  const r=root();r.trainers=[{printing:'Secret Box TWM',
    type:'Item',handIndex:4,publicBlocker:null,nativeEnumeratorOffered:true}];
  const a=paperOptionsAtAcceptedPass(r);
  assert.equal(a.candidates.length,0);
  assert.equal(a.unproven[0].reason,
    'printed-ability-target-or-payment-unverified');
});

test('two source physical deals retain all actual Pass denominators',()=>{
  const a=root(),b=root({ordinal:8,turn:3});
  const c=root({ordinal:19,turn:8});
  c.ownerVisibleStadiumContext={ownerDeckCount:33,
    ownerStadium:['PokéStop PGO'],opponentStadium:[],
    ownerStadiumPlayedTurn:2,ownerStadiumPlayLocked:false};
  c.trainers=[{printing:'Silent Lab PRC',type:'Stadium',handIndex:8,
    publicBlocker:null,nativeEnumeratorOffered:false}];
  const q=root({ordinal:21,turn:10});q.trainers=[];
  const doc={registeredOriginalRanks:[6,9],
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows:[{primaryRankSeat:0,initialFullPhysicalDealDigest:'a'.repeat(64),
      capped:true,completed:false,
      sameSeedThreeArmParity:{control:'same',observed:'same',repeatedControl:'same'},
      frontiers:{roots:[a,b]}},
      {primaryRankSeat:1,initialFullPhysicalDealDigest:'b'.repeat(64),
        capped:true,completed:false,
        sameSeedThreeArmParity:{control:'same2',observed:'same2',repeatedControl:'same2'},
        frontiers:{roots:[c,q]}}]};
  const out=summarizePaperOpportunities(doc);
  assert.equal(out.selectedPassRoots,4);
  assert.equal(out.paperCertifiedPassRoots,3);
  assert.equal(out.stillUnprovenPassRoots,1);
  assert.equal(out.printedDeckDiscardOptions,2);
  assert.equal(out.paperStadiumOptions,1);
  assert.equal(out.nativeUnenumeratedCertifiedOptions,1);
});
