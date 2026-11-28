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
 branchContexts:{fairyZoneDirect:null,duskTerminalBlast:null,duskCounterCatcher:null,duskExactAttack:null,
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
assert.equal(x.evaluations.length,7);
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
x=check(root({}),'none');assert.equal(x.evaluations.length,7);
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
const terminal={public:{ownPrizesRemaining:2,opponentPrizesRemaining:3,
 targets:[{token:'enemy-vstar',remainingHp:100,prizeValue:2,abilityCountersApply:true}]},
 own:{benchedDusknoirReady:true},
 combat:{abilityLegal:true,abilityNotSuppressed:true,reactiveEffectsResolved:true}};
x=check(root({duskTerminalBlast:terminal,duskExactAttack:blast(),
 guzmaHala:gh()}),'candidate','duskTerminalBlast');
assert.equal(x.firstAction.targetToken,'enemy-vstar');
assert.equal(x.entry.projectedOwnPrizesAfterKO,0);
// Single opposing Active is a separate win condition even with five Prizes
// remaining: the opponent has no Pokemon to promote after the Ability KO.
const solo={public:{ownPrizesRemaining:5,opponentPrizesRemaining:3,
 opponentBenchCount:0,opponentActiveTargetToken:'solo-active',
 targets:[{token:'solo-active',remainingHp:110,prizeValue:2,
 abilityCountersApply:true}]},own:{benchedDusknoirReady:true},
 combat:{abilityLegal:true,abilityNotSuppressed:true,
 reactiveEffectsResolved:true}};
x=check(root({duskTerminalBlast:solo,guzmaHala:gh()}),
 'candidate','duskTerminalBlast');
assert.equal(x.entry.terminalMode,'no-opponent-pokemon');
assert.equal(x.entry.projectedOwnPrizesAfterKO,3);
let ss=JSON.parse(JSON.stringify(solo));ss.public.opponentBenchCount=1;
check(root({duskTerminalBlast:ss,guzmaHala:gh()}),'candidate','guzmaHala');
ss=JSON.parse(JSON.stringify(solo));ss.public.opponentPrizesRemaining=1;
check(root({duskTerminalBlast:ss,guzmaHala:gh()}),'candidate','guzmaHala');
ss=JSON.parse(JSON.stringify(solo));delete ss.public.opponentBenchCount;
check(root({duskTerminalBlast:ss,guzmaHala:gh()}),'candidate','guzmaHala');

const counter=()=>({public:{ownPrizesRemaining:3,opponentPrizesRemaining:3,
 benchTargets:[{token:'bench-mega',remainingHp:330,prizeValue:3,
 blastCountersApply:true,attackOptions:[{name:'Miraculous Duo-GX',
 sourceToken:'active-mew',damageAfterAllEffects:200,paidAfterSelfKo:true,
 legalAfterGust:true,sourceProvenanceCertified:true,
 attackEffectsCertified:true,requiresGX:true}]}]},
 own:{hand:[{token:'cc',name:'Counter Catcher'}],
 benchedDusknoirReady:true,itemPlayLocked:false,
 counterCatcherNativeInHand:true,activeAttackerStillPresent:true,gxUsed:false},
 combat:{cursedBlastLegal:true,cursedBlastCountersApply:true,
 reactiveEffectsAccountedFor:true,counterCatcherPostKOAllowed:true,
 allPostGustEffectsCertified:true}});
// A non-terminal direct Dragon OHKO gains only two of our three remaining
// Prizes; by contrast Dusk -> Counter Catcher -> 3 Prize gust is a win now.
b=fairy();b.public.ownPrizesRemaining=3;b.public.targetPrizeValue=2;
x=check(root({fairyZoneDirect:b,duskCounterCatcher:counter()}),
 'candidate','duskCounterCatcher');
assert.equal(x.gameTerminalProposed,true);
assert.equal(x.entry.targetToken,'bench-mega');
assert.equal(x.continuation.length,3);
// If the same paid attack takes our final Prizes, save Dusknoir and GX slot.
b=fairy();b.public.ownPrizesRemaining=2;b.public.targetPrizeValue=2;
x=check(root({fairyZoneDirect:b,duskCounterCatcher:counter()}),
 'candidate','fairyZoneDirect');
assert.equal(x.gameTerminalProposed,true);
assert.equal(x.entry.terminalMode,'all-prizes');
// An Ability-only Prize close outranks a no-selfKO attack that would need
// another turn, but not an immediate certified paid game-winning attack.
b=fairy();b.public.ownPrizesRemaining=3;b.public.targetPrizeValue=2;
ss=JSON.parse(JSON.stringify(terminal));
ss.public.ownPrizesRemaining=3;ss.public.targets[0].prizeValue=3;
x=check(root({fairyZoneDirect:b,duskTerminalBlast:ss}),
 'candidate','duskTerminalBlast');
assert.equal(x.gameTerminalProposed,true);
b=fairy();b.public.ownPrizesRemaining=2;b.public.targetPrizeValue=2;
x=check(root({fairyZoneDirect:b,duskTerminalBlast:terminal}),
 'candidate','fairyZoneDirect');
assert.equal(x.gameTerminalProposed,true);
// Proposed 130 + paid Night Watch taking last two Prizes beats nonterminal
// Rondo and retains first-action requirement to recheck after the self-KO.
b=blast();b.own.prizesRemaining=2;
let nonterminal=fairy();nonterminal.public.ownPrizesRemaining=3;
nonterminal.public.targetPrizeValue=2;
x=check(root({fairyZoneDirect:nonterminal,duskExactAttack:b}),
 'candidate','duskExactAttack');
assert.equal(x.gameTerminalProposed,true);
// Item-lock prevents the Counter Catcher continuation; direct attack stays.
let locked=counter();locked.own.itemPlayLocked=true;
x=check(root({fairyZoneDirect:nonterminal,duskCounterCatcher:locked}),
 'candidate','fairyZoneDirect');
assert.equal(x.gameTerminalProposed,false);
// Unknown higher priority visible branch blocks choosing the lower one.
x=check(root({fairyZoneDirect:{unsupported:true},
 duskCounterCatcher:counter()}),'unsupported');
assert.equal(x.firstUnresolvedBranch,'fairyZoneDirect');
assert.equal(count,30);
console.log('Agent22 whole-turn composite: '+count+' synthetic contracts passed');
