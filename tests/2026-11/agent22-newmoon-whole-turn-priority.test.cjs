'use strict';
const assert=require('node:assert/strict');
const {compareNewMoonTurn:choose}=require('../../results/als/new-moon-whole-turn-action-priority.cjs');
let count=0;
const offer=(name,stage,damage)=>({name,attackerStage:stage,
 preWeaknessBaseDamage:damage,sourceToken:name,nativeLegalNow:true,
 energyPaidNow:true,gxNativeAllowed:true});
const fairy=()=>({
 public:{targetIsDragon:true,psychicWeaknessX2Certified:true,preventBasicAttackDamage:false,
 otherAttackEffectsCertified:true,totalHp:280,remainingHp:280,postWeaknessDamageReduction:0},
 own:{gxAlreadyUsed:true},combat:{offers:[offer('Full Moon Rondo','Basic',140)]}});
const blast=()=>({
 own:{prizesRemaining:6,supporterUsed:false,supporterLocked:false,
 aceTrainerInHand:true,gxAttackUsed:false,
 bench:[{printId:'sv6pt5-20',abilityReady:true}]},
 opponent:{prizesRemaining:6,active:{hp:280,damage:0,prizeValue:2}},
 combat:{abilityCanActivate:true,abilityWillPlaceCounters:true,reactiveEffectsAccountedFor:true,
 attackOffers:[{name:'Night Watch',projectedDamage:150,
 legal:true,hasCorrectSource:true,gxAllowed:true,source:'Mewtwo'}]}});
const dragon=()=>({
 public:{sourceHp:280,sourceDamage:0,sourceBenchCount:0,sourcePrizesRemaining:4,
 dragonType:true,fairyZoneWeaknessX2:true,basicAttackDamagePrevented:false},
 own:{benchBeforeBlast:3,benchCapacity:3},
 action:{postBlastBasicsFromHand:0,postBlastBasicsFromTpe:1,
 abilityCursedBlastLegal:true,abilityCountersActuallyPlaced:true,
 fullMoonRondoAttackLegalAfterRefill:true,attackEnergyPaidAfterRefill:true,
 benchRefillCertified:true,otherEffectsResolved:true}});
const thorns=()=>({
 public:{sourceHp:230,sourceDamage:0,sourceBenchCount:1,sourcePrizesRemaining:4},
 own:{benchBeforeBlast:3,benchCapacity:5},
 action:{postBlastBasicsFromHand:0,postBlastBasicsFromTpe:1,
 fullMoonAttackEnergyAvailable:true,fullMoonAttackLegal:true,
 cursedBlastAbilityLegal:true,cursedBlastAffectsTarget:true,
 wondrousCostResolved:true,stadiumProtectionCertified:true,
 reactivesResolved:true,gxUsed:true}});
const gh=()=>({
 own:{supporterUsed:false,supporterLocked:false,nativeGuzmaHalaOffered:true,
 hand:[{token:'g',name:'Guzma & Hala',lowOpportunityCost:false},
 {token:'f',name:'Field Blower',lowOpportunityCost:true},
 {token:'c',name:'Canceling Cologne',lowOpportunityCost:true}]},
 public:{sourceActiveToolJammer:false},
 plan:{competingAceTrainerFinisher:false,criticalStadiumChange:true,
 toolHolderAvailable:true,energyAttachmentAvailable:true,hoodHolder:'active-clefairy',
 wanted:[{role:'stadium',name:'Sky Field'},{role:'tool',name:'Stealthy Hood'},
 {role:'specialEnergy',name:'Telepathic Psychic Energy'}]}});
function root(b){return {actorStateFingerprint:'actor-public-root',
 branchContexts:{fairyZoneDirect:null,duskExactAttack:null,
 duskDragonRondo:null,duskThornsRondo:null,guzmaHala:null,...b}};}
function check(r,status,branch){
 const o=choose(r);assert.equal(o.status,status);
 if(branch)assert.equal(o.branch,branch);count++;return o;}
let x=check(root({fairyZoneDirect:fairy(),duskExactAttack:blast()}),'candidate','fairyZoneDirect');
assert.equal(x.firstAction.name,'Full Moon Rondo');
assert.equal(x.entry.preventDusknoirCursedBlastThisRoot,true);
x=check(root({duskExactAttack:blast(),guzmaHala:gh()}),'candidate','duskExactAttack');
assert.equal(x.firstAction.ability,'Cursed Blast');
x=check(root({duskDragonRondo:dragon(),guzmaHala:gh()}),'candidate','duskDragonRondo');
assert.equal(x.entry.projectedTotalDamage,290);
x=check(root({duskThornsRondo:thorns(),guzmaHala:gh()}),'candidate','duskThornsRondo');
assert.equal(x.entry.projectedTotalDamage,230);
x=check(root({guzmaHala:gh()}),'candidate','guzmaHala');
assert.equal(x.firstAction.type,'play-supporter');assert.equal(x.firstAction.name,'Guzma & Hala');
assert.deepEqual(x.firstAction.discardIntents,['f','c']);
x=check(root({fairyZoneDirect:fairy(),duskDragonRondo:dragon()}),'candidate','fairyZoneDirect');
assert.equal(x.evaluations.length,1);
let b=fairy();b.public.preventBasicAttackDamage=true;
check(root({fairyZoneDirect:b,duskExactAttack:blast()}),'candidate','duskExactAttack');
b=fairy();delete b.public.psychicWeaknessX2Certified;
x=check(root({fairyZoneDirect:b,duskExactAttack:blast()}),'unsupported');
assert.equal(x.reason,'HIGHER_PRIORITY_BRANCH_UNCERTIFIED');
b=blast();b.opponent.prizesRemaining=1;
check(root({duskExactAttack:b,guzmaHala:gh()}),'candidate','guzmaHala');
b=gh();b.own.supporterLocked=true;
check(root({guzmaHala:b}),'none');
b=gh();b.own.hand[1].lowOpportunityCost=false;b.own.hand[2].lowOpportunityCost=false;
x=check(root({guzmaHala:b}),'candidate','guzmaHala');
assert.equal(x.entry.mode,'stadium-only');
x=check(root({}),'none');assert.equal(x.evaluations.length,5);
x=check({branchContexts:{fairyZoneDirect:fairy()}},'unsupported');
assert.equal(x.reason,'NO_COMMON_NATIVE_ACTOR_STATE_FINGERPRINT');
x=check(root({duskExactAttack:false}),'unsupported');
assert.equal(x.reason,'NON_OBJECT_BRANCH_STATE');
b=dragon();b.public.basicAttackDamagePrevented=true;
check(root({duskDragonRondo:b,guzmaHala:gh()}),'candidate','guzmaHala');
b=thorns();b.action.postBlastBasicsFromTpe=0;
check(root({duskThornsRondo:b,guzmaHala:gh()}),'candidate','guzmaHala');
x=check(root({fairyZoneDirect:{foo:1}}),'unsupported');
assert.equal(x.reason,'BRANCHES_UNCERTIFIED');
b=fairy();b.public.totalHp=b.public.remainingHp=370;b.own.gxAlreadyUsed=false;
b.combat.offers=[offer('Miraculous Duo-GX','Basic',200)];
x=check(root({fairyZoneDirect:b,duskExactAttack:blast()}),'candidate','fairyZoneDirect');
assert.equal(x.firstAction.name,'Miraculous Duo-GX');
assert.equal(count,19);
console.log('Agent22 whole-turn composite: '+count+' synthetic contracts passed');
