'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {offerPublicRondo,publicRondoReadiness,publicRondoBenchFunding}=require('../simulation/twinleaf/agent7-public-rondo-attack-offer.cjs');

test('exports a public attack offer',()=>assert.equal(typeof offerPublicRondo,'function'));

const catalog={basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialEnergies:new Set(),stages:{BASIC:0},specialConditions:{}};
const attack={name:'Full Moon Rondo',damage:20,cost:[5,9],
  text:"This attack does 20 more damage for each Benched Pokémon (both yours and your opponent's)."};
function view(){
 return {decisionKind:'owner-root',globalTurn:6,
  ownPublic:{stadium:[],active:{printing:"Lillie's Clefairy ex JTG",
    printed:{stage:0},energies:['Psychic Energy SVE','Psychic Energy SVE'],
    attacks:[attack]},bench:[{}, {}, {}]},
  opponentPublic:{stadium:[],bench:[{}, {}]}};
}
test('count only public occupied Bench slots',()=>{
 assert.equal(offerPublicRondo(view(),catalog).estimatedDamage,120);
 const x=view();x.ownPublic.active.energies=['Psychic Energy SVE'];
 assert.equal(offerPublicRondo(x,catalog),null);
});

test('source access categories distinguish active payment from Bench position',()=>{
 const v=view();
 assert.equal(publicRondoReadiness(v,catalog),'active-payable');
 v.ownPublic.active.energies=['Psychic Energy SVE'];
 assert.equal(publicRondoReadiness(v,catalog),'active-fewer-than-two-energy-cards');
 v.ownPublic.active=null;
 v.ownPublic.bench[0]={printing:"Lillie's Clefairy ex JTG"};
 assert.equal(publicRondoReadiness(v,catalog),'benched-not-active');
 v.ownPublic.bench[0]=null;
 assert.equal(publicRondoReadiness(v,catalog),'not-in-play');
});

test('read-only Rondo proposer leaves ordinary Pass unchanged',()=>{
 const {PROPOSERS,collectAndChooseOwnerRoot}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
 const r=PROPOSERS.find(p=>p.name==='public-rondo');
 assert.equal(r.flag,'rondoPublicOpportunity');
 const v=view(),pass={kind:'pass'};
 let decision=collectAndChooseOwnerRoot(v,catalog,pass,{rondoPublicOpportunity:true},[r]);
 assert.equal(decision.intent.kind,'pass');
 assert.equal(decision.receipt.supportedAlternativeCount,1);
 decision=collectAndChooseOwnerRoot(v,catalog,pass,
  {rondoPublicOpportunity:true,sameRootChoiceApply:true},[r]);
 assert.equal(decision.intent.kind,'pass');
 decision=collectAndChooseOwnerRoot(v,catalog,pass,
  {rondoPublicOpportunity:true,sameRootChoiceApply:true,
   rondoPublicAttackPreference:true},[r]);
 assert.equal(decision.intent.attackName,'Full Moon Rondo');
 assert.equal(decision.receipt.changed,true);
});

test('Benched Clefairy paper funding remains separate from Active action',()=>{
 const v=view();
 const active=v.ownPublic.active;
 v.ownPublic.active={printing:'Other Active',energies:[],printed:{retreatCost:[]}};
 v.ownPublic.bench=[active,null];
 v.ownTurnResources={retreatedTurn:0};
 v.ownHand=[];
 const x=publicRondoBenchFunding(v,catalog);
 assert.equal(x.benchedCopies,1);
 assert.equal(x.fundedBenchedCopies,1);
 assert.deepEqual(x.benchedEnergyCounts,[2]);
 assert.equal(x.activePrinting,'Other Active');
 assert.equal(x.retreatUnused,true);
 assert.equal(publicRondoReadiness(v,catalog),'benched-not-active');
 active.energies=['Psychic Energy SVE'];
 assert.equal(publicRondoBenchFunding(v,catalog).fundedBenchedCopies,0);
});
