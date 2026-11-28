'use strict';
const assert=require('node:assert/strict');
const {eligibleRoot,chooseNativeSearchPrompt}=
  require('../../results/als/new-moon-guzma-hala-actor-opportunity-gate.cjs');
let passed=0;
function base(){return {
 own:{supporterUsed:false,supporterLocked:false,nativeGuzmaHalaOffered:true,hand:[
  {token:'g',name:'Guzma & Hala',lowOpportunityCost:false},
  {token:'f',name:'Field Blower',lowOpportunityCost:true},
  {token:'c',name:'Canceling Cologne',lowOpportunityCost:true},
  {token:'d',name:'Dusknoir',lowOpportunityCost:false}
 ]},
 public:{sourceActiveToolJammer:false},
 plan:{competingAceTrainerFinisher:false,criticalStadiumChange:true,
  toolHolderAvailable:true,energyAttachmentAvailable:true,hoodHolder:'active-clefairy',
  wanted:[{role:'stadium',name:'Sky Field'},
          {role:'tool',name:'Stealthy Hood'},
          {role:'specialEnergy',name:'Telepathic Psychic Energy'}]}
};}
function check(s,expected,reason) {
 const x=eligibleRoot(s);assert.equal(x.status,expected);
 if(reason)assert.equal(x.reason,reason);passed++;return x;
}
let x=check(base(),'candidate');
assert.equal(x.mode,'triple-search');
assert.deepEqual(x.discardIntents,['f','c']);
assert.equal(x.wanted.tool,'Stealthy Hood');
x=base();x.own.supporterLocked=true;check(x,'blocked','SUPPORTER_UNAVAILABLE');
x=base();x.own.supporterUsed=true;check(x,'blocked','SUPPORTER_UNAVAILABLE');
x=base();x.plan.competingAceTrainerFinisher=true;check(x,'blocked','COMPETING_TERMINAL_SUPPORTER');
x=base();x.own.nativeGuzmaHalaOffered=false;check(x,'blocked','NOT_IN_NATIVE_LEGAL_FRONTIER');
x=base();x.own.hand[1].lowOpportunityCost=false;x.own.hand[2].lowOpportunityCost=false;
x=check(x,'candidate');assert.equal(x.mode,'stadium-only');
x=base();x.own.hand[1].lowOpportunityCost=false;x.own.hand[2].lowOpportunityCost=false;
x.plan.criticalStadiumChange=false;check(x,'blocked','NO_TWO_DISCARDABLE_CARDS');
x=base();x.public.sourceActiveToolJammer=true;x.plan.hoodHolder='active-mewtwo';
x=check(x,'candidate');assert.equal(x.wanted.tool,undefined);
x=base();x.plan.toolHolderAvailable=false;x.plan.energyAttachmentAvailable=false;
x=check(x,'candidate');assert.equal(x.mode,'stadium-only');
x=base();x.plan.wanted=[{role:'tool',name:'Stealthy Hood'}];x.plan.toolHolderAvailable=false;
check(x,'blocked','NO_LIVE_AXES');
x=base();x.plan.wanted=[{role:'stadium',name:'Sky Field'}];
x.plan.criticalStadiumChange=false;check(x,'blocked','STADIUM_NOT_CRITICAL');
x=base();x.own.hand[2].token=x.own.hand[1].token;
check(x,'unsupported','DUPLICATE_HAND_TOKEN');
x=base();x.own.hand[2].lowOpportunityCost=null;
check(x,'unsupported','UNCERTIFIED_ACTOR_FIELDS');
x=base();x.plan.wanted=[{role:'other',name:'Hood'}];
check(x,'unsupported','UNCERTIFIED_ACTOR_FIELDS');
const offer={choices:[{token:'a',name:'Path to the Peak'},{token:'b',name:'Sky Field'}]};
assert.deepEqual(chooseNativeSearchPrompt(offer,'stadium','Sky Field'),
 {status:'select-choice',token:'b',name:'Sky Field'});passed++;
assert.equal(chooseNativeSearchPrompt(offer,'stadium','Dimension Valley').status,'unsupported');passed++;
assert.equal(chooseNativeSearchPrompt(offer,'tool','Stealthy Hood').status,'unavailable');passed++;
assert.equal(chooseNativeSearchPrompt({choices:[{token:3,name:'Sky Field'}]},'stadium','Sky Field').status,'unsupported');passed++;
x=base();x.plan.wanted[0]={role:'stadium',name:'Dimension Valley'};
x.plan.rondoAttackNeedsValleyDiscount=true;
x.public.ownNewMoonActive=true;
check(x,'blocked','OWN_NEW_MOON_NULLIFIES_VALLEY_DISCOUNT');
x=base();x.plan.wanted[0]={role:'stadium',name:'Dimension Valley'};
x.plan.rondoAttackNeedsValleyDiscount=true;
x.public.ownNewMoonActive=false;
x=check(x,'candidate');assert.equal(x.wanted.stadium,'Dimension Valley');
x=base();x.plan.wanted[0]={role:'stadium',name:'Dimension Valley'};
x.plan.rondoAttackNeedsValleyDiscount=true;
check(x,'unsupported','VALLEY_NEW_MOON_ORDER_UNCERTIFIED');
x=base();x.plan.wanted[0]={role:'stadium',name:'Dimension Valley'};
x.plan.rondoAttackNeedsValleyDiscount=false;
x.public.ownNewMoonActive=true;
x=check(x,'candidate');assert.equal(x.mode,'triple-search');
const tpeSelect=require('../../results/als/new-moon-guzma-hala-actor-opportunity-gate.cjs').selectValleyCompatibleTpeBasics;
const tpeOffer={choices:[{token:'s',name:'Solrock'},{token:'l',name:'Lunatone'},
 {token:'u',name:'Unown'},{token:'d',name:'Duskull'}]};
let state={needBasicCount:2,openBenchSlots:2,hasSolrockInPlay:false,
 hasLunatoneInPlay:false,valleyDiscountNeeded:true};
let chosen=tpeSelect(tpeOffer,state);
assert.equal(chosen.status,'candidate');
assert.equal(chosen.selectedNames.includes('Solrock')&&chosen.selectedNames.includes('Lunatone'),false);passed++;
state={...state,hasSolrockInPlay:true};
chosen=tpeSelect(tpeOffer,state);
assert.equal(chosen.status,'candidate');
assert.equal(chosen.selectedNames.includes('Lunatone'),false);passed++;
state={...state,hasSolrockInPlay:false,hasLunatoneInPlay:true};
chosen=tpeSelect(tpeOffer,state);
assert.equal(chosen.status,'candidate');
assert.equal(chosen.selectedNames.includes('Solrock'),false);passed++;
chosen=tpeSelect({choices:[{token:'s',name:'Solrock'},{token:'l',name:'Lunatone'}]},
 {...state,hasLunatoneInPlay:false});
assert.equal(chosen.status,'blocked');
assert.equal(chosen.reason,'TPE_SEARCH_WOULD_ACTIVATE_NEW_MOON');passed++;
chosen=tpeSelect({choices:[{token:'s',name:'Solrock'},{token:'l',name:'Lunatone'}]},
 {...state,hasLunatoneInPlay:false,valleyDiscountNeeded:false});
assert.equal(chosen.status,'candidate');assert.equal(chosen.tokens.length,2);passed++;
chosen=tpeSelect(tpeOffer,{...state,hasSolrockInPlay:true,hasLunatoneInPlay:true});
assert.equal(chosen.reason,'NEW_MOON_ALREADY_ACTIVE');passed++;
chosen=tpeSelect(tpeOffer,{...state,openBenchSlots:1});
assert.equal(chosen.reason,'INSUFFICIENT_BENCH_SLOTS');passed++;
chosen=tpeSelect({choices:[{token:'u',name:'Unown'},{token:'u',name:'Duskull'}]},state);
assert.equal(chosen.reason,'TPE_OFFER_DUPLICATE_SOURCE_TOKEN');passed++;
assert.equal(passed,30);
console.log('New Moon G&H actor opportunity: '+passed+' synthetic contracts passed (including v9 TPE search preserving Valley discount)');
