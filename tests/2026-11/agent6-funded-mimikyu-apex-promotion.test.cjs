'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFundedMimikyuApexPromotion,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent6-funded-mimikyu-apex-promotion.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P=5,C=9;
const E='Psychic Energy CRE';
const M='Mimikyu GRI';
const D='Dialga-GX UPR';
const R='Regidrago VSTAR SIT';

/**
 * Minimal detached actor-root fixture. All fields are public board or actor
 * hand information. No opponent private identities are included.
 * @param {0|1} seat Physical acting player.
 */
function fixture(seat=0){
  const mimikyu={
    printing:M,energies:[E,E],
    attacks:[{name:'Copycat',cost:[P,C],gxAttack:false}],
    publicRestrictions:{},specialConditions:[],abilityDetails:[],
    tools:[],printed:{types:[P],retreatCost:[C]}
  };
  return {
    view:{
      decisionKind:'owner-root',actorSeat:seat,globalTurn:6,
      ownHand:[],
      ownPublic:{
        active:{
          printing:'Shadow Rider Calyrex VMAX CRE',
          printed:{retreatCost:[C,C]},energies:[E,E],
          attacks:[],tools:[],abilityDetails:[],
          publicRestrictions:{},specialConditions:[]
        },
        bench:[mimikyu,null,null,null,null],
        discard:[D],stadium:[],prizeCount:6,
        publicTurnRestrictions:{gxUsed:false,attackLockTurnsRemaining:0}
      },
      opponentPublic:{active:{
        printing:R,name:'Regidrago VSTAR',
        tools:[],abilityDetails:[]},stadium:[],prizeCount:6},
      ownTurnResources:{retreatedTurn:0},
      publicEventReceipt:{
        actorSeat:seat,turn:6,opponentLastTurnTurn:5,
        opponentCopycatChoices:[{
          turn:5,sourcePrinting:R,attackName:'Apex Dragon',
          gxAttack:false,copycatAttack:true
        }]
      }
    },
    catalog:{
      basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
      basicEnergies:new Set([E]),specialEnergies:new Set(),
      stages:{BASIC:0},
      specialConditions:{ASLEEP:3,PARALYZED:4},
      basics:new Set(),abilityBasics:new Set()
    }
  };
}

test('actual post-Apex owner funding proposes two-card paid Retreat in either seat',()=>{
  for(const seat of [0,1]){
    const {view,catalog}=fixture(seat);
    const p=chooseFundedMimikyuApexPromotion(view,catalog);
    assert.equal(p?.source,VERSION);
    assert.equal(p.kind,'paid-retreat');
    assert.equal(p.printing,M);
    assert.equal(p.benchIndex,0);
    assert.equal(p.paymentMode,'two-unit-basic-paid');
    assert.deepEqual(p.predictedPaymentIndices,[0,1]);
    assert.deepEqual(p.predictedPaymentPrintings,[E,E]);
    assert.equal(p.nativeRetreatAndCopycatUnverified,true);
  }
});

test('root integration selects the opted-in paid promotion before generic alternatives',()=>{
  for(const seat of [0,1]){
    const {view,catalog}=fixture(seat);
    assert.equal(chooseActorRootIntent(view,catalog,{
      mimikyuApexFundedPromotion:true
    }).source,VERSION);
  }
});

test('Float Stone and printed-zero retreat alternatives require no discarded Energy',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.active.tools=['Float Stone BKT'];
  const float=chooseFundedMimikyuApexPromotion(view,catalog);
  assert.equal(float?.paymentMode,'float-stone-free');
  assert.deepEqual(float.predictedPaymentIndices,[]);
  view.ownPublic.active.tools=[];
  view.ownPublic.active.printed.retreatCost=[];
  view.ownPublic.active.energies=[];
  const zero=chooseFundedMimikyuApexPromotion(view,catalog);
  assert.equal(zero?.paymentMode,'printed-zero');
});

test('no promotion after a missing or different previous opponent attack',()=>{
  const {view,catalog}=fixture();
  view.publicEventReceipt.opponentCopycatChoices=[];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.publicEventReceipt.opponentCopycatChoices=[{
    turn:5,sourcePrinting:R,attackName:'Apex Dragon',
    gxAttack:true,copycatAttack:false
  }];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.publicEventReceipt.opponentCopycatChoices[0].gxAttack=false;
  view.publicEventReceipt.opponentLastTurnTurn=6;
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('GX already used, donor absent, and already-retreated turn each abstain',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.gxUsed=false;
  view.ownPublic.discard=[];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.ownPublic.discard=[D];
  view.ownTurnResources.retreatedTurn=6;
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('underfunded Mimikyu, unknown Energy and active-payable alternative abstain',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.bench[0].energies.pop();
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.ownPublic.bench[0].energies=[E,E];
  view.ownPublic.active.energies=['Unknown Energy ABC',E];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.ownPublic.active.energies=[E,E];
  view.ownPublic.active.attacks=[{
    name:'Ready Attack',cost:[P,C],gxAttack:false
  }];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('public retreat locks and preserved Active-only effects abstain',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=false;
  view.ownPublic.active.abilityDetails=[{
    name:'Sentinel',text:'As long as this Pokémon is in the Active Spot, your opponent cannot play Supporter cards.'
  }];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('Tool Jammer suppresses Float Stone and source board must be payable',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.active.tools=['Float Stone BKT'];
  view.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
  view.opponentPublic.active.tools=[];
  view.ownPublic.stadium=['Jamming Tower TWM'];
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('owner-visible receipt is tied to the actual acting seat',()=>{
  const {view,catalog}=fixture();
  view.publicEventReceipt.actorSeat=1;
  assert.equal(chooseFundedMimikyuApexPromotion(view,catalog),null);
});

test('default actor root remains unchanged when no opt-in is supplied',()=>{
  const {view,catalog}=fixture();
  const out=chooseActorRootIntent(view,catalog,{});
  assert.notEqual(out?.source,VERSION);
});
