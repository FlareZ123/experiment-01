'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VIP,guaranteedOwnDeckBasics,certifyFirstTurnBattleVip}=
  require('../simulation/twinleaf/agent5-owner-firstturn-basic-search-k0.cjs');

const BASIC='Genesect V FST',OTHER='Mew V FST',ENERGY='Psychic Energy MEE';
const basics=new Set([BASIC,OTHER]);
const registered=[
  ...Array(4).fill(BASIC),...Array(4).fill(OTHER),
  ...Array(52).fill(ENERGY)
];

function ownerView(overrides={}){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:1,
    ownHand:[VIP,BASIC],
    ownPublic:{
      active:{
        printing:OTHER,evolutionPrintings:[OTHER],
        energies:[],tools:[]
      },
      bench:[null,null,null,null,null],
      discard:[],lostZone:[],resolvingSupporter:[],
      prizeCount:6,deckCount:45,
      publicTurnRestrictions:{itemPlayLocked:false}
    },
    opponentPublic:{
      handCount:5,concealedHand:['SECRET'],
      prizeCount:6
    },
    ownTurnResources:{itemPlayLocked:false},
    ...overrides
  };
}

test('K0 guaranteed-Basic bound subtracts every potentially prized Basic',()=>{
  const c=guaranteedOwnDeckBasics(ownerView(),registered,basics);
  assert.deepEqual(c,{
    basicRegistered:8,basicVisibleOutsideDeck:2,
    possibleBasicPrized:6,minimumBasicStillInDeck:0,
    exactVisibleBasicCopiesReconcile:true
  });
  assert.equal(certifyFirstTurnBattleVip(ownerView(),registered,basics),
    null,'No proof of an unprized Basic if all six unknown Prize might contain it');
});

test('K0 certificate requires one more Basic than all unknown Prize slots',()=>{
  const strong=[...registered.slice(0,8),OTHER,ENERGY,...registered.slice(10)];
  assert.equal(strong.length,60);
  const c=certifyFirstTurnBattleVip(ownerView(),strong,basics);
  assert.ok(c);
  assert.equal(c.minimumBasicStillInDeck,1);
  assert.equal(c.paperActuallyPlayed,undefined);
  assert.equal(c.nativePlayOrPromptResolutionProven,false);
  assert.equal(c.competitorAlternativesEvaluated,false);
  assert.equal(c.publicEmptyBenchSlots,5);
});

test('one open Bench slot is sufficient; empty or locked Bench prevents certificate',()=>{
  const strong=[...registered.slice(0,8),OTHER,ENERGY,...registered.slice(10)];
  const filled=Array(5).fill({
    printing:BASIC,evolutionPrintings:[BASIC],tools:[],energies:[]
  });
  const almost=ownerView();
  almost.ownPublic.bench=[...filled.slice(0,4),null];
  const cert=certifyFirstTurnBattleVip(almost,strong,basics);
  assert.equal(cert,null,
    '5 extra visible Basic copies invalidate the known 9-Basic conservation witness');
  const much=[...Array(16).fill(BASIC),OTHER,...Array(43).fill(ENERGY)];
  const cert2=certifyFirstTurnBattleVip(almost,much,basics);
  assert.equal(cert2.publicEmptyBenchSlots,1);
  assert.equal(certifyFirstTurnBattleVip({...almost,ownPublic:{
    ...almost.ownPublic,bench:filled
  }},much,basics),null);
});

test('first owner-turn Item lock and no deck prohibit certification',()=>{
  const strong=[...Array(16).fill(BASIC),OTHER,...Array(43).fill(ENERGY)];
  assert.equal(certifyFirstTurnBattleVip(ownerView({globalTurn:3}),strong,basics),
    null);
  const locked=ownerView();
  locked.ownTurnResources.itemPlayLocked=true;
  assert.equal(certifyFirstTurnBattleVip(locked,strong,basics),null);
  const empty=ownerView();
  empty.ownPublic.deckCount=0;
  assert.equal(certifyFirstTurnBattleVip(empty,strong,basics),null);
});

test('opponent hidden hand and Prize identities are outside the certificate',()=>{
  const strong=[...Array(16).fill(BASIC),OTHER,...Array(43).fill(ENERGY)];
  const a=certifyFirstTurnBattleVip(ownerView(),strong,basics);
  const b=certifyFirstTurnBattleVip(ownerView({
    opponentPublic:{
      concealedHand:['DIFFERENT'],
      prizeIdentities:['CENSORED'],
      deckContents:['CENSORED']
    }
  }),strong,basics);
  assert.deepEqual(a,b);
  assert.equal(JSON.stringify(b).includes('DIFFERENT'),false);
  assert.equal(JSON.stringify(b).includes('CENSORED'),false);
});


test('K0 does not certify impossible visible printing multiplicities',()=>{
  const bad=[...Array(16).fill(BASIC),...Array(44).fill(ENERGY)];
  const v=ownerView();
  const q=guaranteedOwnDeckBasics(v,bad,basics);
  assert.equal(q.exactVisibleBasicCopiesReconcile,false);
  assert.equal(q.minimumBasicStillInDeck,0);
  assert.equal(certifyFirstTurnBattleVip(v,bad,basics),null);
});
