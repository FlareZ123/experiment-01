'use strict';
const assert=require('node:assert/strict');
const {counterCatcherAfterSelfKo:choose}=
 require('../../results/als/new-moon-countercatcher-after-selfko-finisher.cjs');
let count=0;
function fixture(){
 return {
  public:{ownPrizesRemaining:3,opponentPrizesRemaining:3,
   benchTargets:[{token:'bench-mega',remainingHp:330,prizeValue:3,
    blastCountersApply:true,attackOptions:[{
     name:'Miraculous Duo-GX',sourceToken:'active-mew',
     damageAfterAllEffects:200,paidAfterSelfKo:true,legalAfterGust:true,
     sourceProvenanceCertified:true,attackEffectsCertified:true,
     requiresGX:true}]}]},
  own:{hand:[{token:'cc',name:'Counter Catcher'}],
   benchedDusknoirReady:true,itemPlayLocked:false,
   counterCatcherNativeInHand:true,activeAttackerStillPresent:true,
   gxUsed:false},
  combat:{cursedBlastLegal:true,cursedBlastCountersApply:true,
   reactiveEffectsAccountedFor:true,counterCatcherPostKOAllowed:true,
   allPostGustEffectsCertified:true}
 };
}
const clone=x=>JSON.parse(JSON.stringify(x));
function test(change,status,reason){
 const x=fixture();if(change)change(x);
 const r=choose(x);assert.equal(r.status,status);
 if(reason)assert.equal(r.reason,reason);
 count++;return r;
}
let r=test(null,'terminal-candidate','BLAST_SELFKO_ENABLES_COUNTER_CATCHER_FOR_WIN');
assert.equal(r.terminalMode,'all-prizes');
assert.equal(r.firstAction.targetToken,'bench-mega');
assert.equal(r.projectedPrizes.ownAfterTargetKO,0);
assert.equal(r.projectedPrizes.opponentAfterSelfKO,2);
assert.equal(r.proposedDamage.total,330);
assert.equal(r.conditionalContinuation.length,3);
test(x=>x.public.opponentPrizesRemaining=4,'blocked',
 'SELF_KO_DOES_NOT_NEWLY_ENABLE_COUNTER_CATCHER');
test(x=>x.public.opponentPrizesRemaining=2,'blocked',
 'SELF_KO_DOES_NOT_NEWLY_ENABLE_COUNTER_CATCHER');
test(x=>x.public.opponentPrizesRemaining=1,'blocked',
 'SELF_KO_AWARDS_OPPONENT_LAST_PRIZE');
test(x=>x.own.itemPlayLocked=true,'blocked','POST_KO_ITEM_GUST_UNAVAILABLE');
test(x=>x.own.hand=[],'blocked','POST_KO_ITEM_GUST_UNAVAILABLE');
test(x=>x.own.counterCatcherNativeInHand=false,'blocked',
 'POST_KO_ITEM_GUST_UNAVAILABLE');
test(x=>x.combat.counterCatcherPostKOAllowed=false,'blocked',
 'POST_KO_ITEM_GUST_UNAVAILABLE');
test(x=>x.own.gxUsed=true,'blocked','NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].remainingHp=331,'blocked',
 'NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].remainingHp=130,'blocked',
 'NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].blastCountersApply=false,'blocked',
 'NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].prizeValue=2,'blocked',
 'NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.combat.allPostGustEffectsCertified=false,'blocked',
 'POST_GUST_ATTACK_UNCERTIFIED');
test(x=>x.public.benchTargets[0].attackOptions[0].legalAfterGust=false,
 'blocked','NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].attackOptions[0].sourceProvenanceCertified=false,
 'blocked','NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.public.benchTargets[0].attackOptions[0].paidAfterSelfKo=false,
 'blocked','NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
test(x=>x.own.hand.push({token:'cc',name:'Counter Catcher'}),'unsupported',
 'INVALID_PRIZE_OR_BENCH_TOKEN_STATE');
test(x=>x.public.benchTargets.push(clone(x.public.benchTargets[0])),
 'unsupported','INVALID_PRIZE_OR_BENCH_TOKEN_STATE');
test(x=>x.combat.reactiveEffectsAccountedFor=false,'blocked',
 'CURSED_BLAST_UNSAFE_OR_UNAVAILABLE');
r=test(x=>{
 x.public.benchTargets[0].remainingHp=280;
 x.public.benchTargets[0].attackOptions=[{
  name:'Night Watch',sourceToken:'trev-donor',damageAfterAllEffects:150,
  paidAfterSelfKo:true,legalAfterGust:true,sourceProvenanceCertified:true,
  attackEffectsCertified:true,requiresGX:false
 }];
},'terminal-candidate');
assert.equal(r.conditionalContinuation[2].name,'Night Watch');
assert.equal(count,21);
console.log('Agent22 selfKO-enabled Counter Catcher: '+count+
 ' synthetic actor contracts passed');
