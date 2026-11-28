'use strict';
/**
 * Conditional paper-Expanded terminal sequence:
 *   Benched Dusknoir SFA20 Cursed Blast(130) to enemy Benched high-Prize target
 *   -> own Dusknoir self-KO awards opponent 1 Prize
 *   -> now-behind Counter Catcher from hand gusts that damaged Bench target
 *   -> already-paid native-attested attack finishes the target and takes
 *      our final Prize(s) without spending a Supporter.
 *
 * This is NOT a native policy, game, result, or authorization to dispatch.
 * The root cannot prove future prompts; a worker must revalidate every step.
 * It never assumes an opponent hand, unrevealed Prize or unoffered deck card.
 */
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const bool=x=>x===true||x===false;
const blocked=(reason,details={})=>({status:'blocked',reason,...details});
function counterCatcherAfterSelfKo(v){
 if(!v||!v.public||!v.own||!v.combat)
   return {status:'unsupported',reason:'MISSING_ACTOR_VIEW'};
 const {public:p,own:o,combat:c}=v;
 if(![p.ownPrizesRemaining,p.opponentPrizesRemaining].every(nat)||
    !Array.isArray(p.benchTargets)||!Array.isArray(o.hand)||
    ![o.benchedDusknoirReady,o.itemPlayLocked,o.counterCatcherNativeInHand,
      o.activeAttackerStillPresent,o.gxUsed,
      c.cursedBlastLegal,c.cursedBlastCountersApply,
      c.reactiveEffectsAccountedFor,c.counterCatcherPostKOAllowed,
      c.allPostGustEffectsCertified].every(bool)||
    !p.benchTargets.every(t=>t&&typeof t.token==='string'&&t.token.length>0&&
      nat(t.remainingHp)&&nat(t.prizeValue)&&t.prizeValue>=1&&
      t.prizeValue<=3&&bool(t.blastCountersApply)&&
      Array.isArray(t.attackOptions)&&
      t.attackOptions.every(a=>a&&typeof a.name==='string'&&
        a.name.length>0&&typeof a.sourceToken==='string'&&
        a.sourceToken.length>0&&nat(a.damageAfterAllEffects)&&
        bool(a.paidAfterSelfKo)&&bool(a.legalAfterGust)&&
        bool(a.sourceProvenanceCertified)&&bool(a.attackEffectsCertified)&&
        bool(a.requiresGX))))
   return {status:'unsupported',reason:'UNCERTIFIED_ACTOR_COUNTERCATCHER_FACTS'};
 if(p.ownPrizesRemaining<1||p.ownPrizesRemaining>6||
    p.opponentPrizesRemaining<1||p.opponentPrizesRemaining>6||
    new Set(p.benchTargets.map(t=>t.token)).size!==p.benchTargets.length)
   return {status:'unsupported',reason:'INVALID_PRIZE_OR_BENCH_TOKEN_STATE'};
 if(p.opponentPrizesRemaining===1)
   return blocked('SELF_KO_AWARDS_OPPONENT_LAST_PRIZE');
 // This gate identifies a new Counter Catcher opportunity from the *single*
 // Dusk self-KO. When already behind it is a different sequencing choice;
 // when ahead the single self-KO does not make Counter Catcher legal.
 if(p.ownPrizesRemaining!==p.opponentPrizesRemaining)
   return blocked('SELF_KO_DOES_NOT_NEWLY_ENABLE_COUNTER_CATCHER');
 if(!o.benchedDusknoirReady||!c.cursedBlastLegal||
    !c.cursedBlastCountersApply||!c.reactiveEffectsAccountedFor)
   return blocked('CURSED_BLAST_UNSAFE_OR_UNAVAILABLE');
 if(!o.counterCatcherNativeInHand||o.itemPlayLocked||
    !c.counterCatcherPostKOAllowed)
   return blocked('POST_KO_ITEM_GUST_UNAVAILABLE');
 if(!o.activeAttackerStillPresent||!c.allPostGustEffectsCertified)
   return blocked('POST_GUST_ATTACK_UNCERTIFIED');
 const candidates=[];
 for(const target of p.benchTargets) {
  // A target KOed on the Bench by the 13 counters cannot subsequently
  // be switched to Active. Other damage-counter-prevention effects are fatal.
  if(!target.blastCountersApply||target.remainingHp<=130||
     target.prizeValue<p.ownPrizesRemaining)continue;
  for(const attack of target.attackOptions) {
   if(!attack.legalAfterGust||!attack.paidAfterSelfKo||
      !attack.sourceProvenanceCertified||!attack.attackEffectsCertified||
      attack.requiresGX&&o.gxUsed)continue;
   if(130+attack.damageAfterAllEffects<target.remainingHp)continue;
   candidates.push({target,attack});
  }
 }
 if(!candidates.length)
   return blocked('NO_CERTIFIED_POST_SELFKO_GUST_TERMINAL');
 // Prefer to preserve the GX allowance, then choose stable printed targets.
 candidates.sort((a,b)=>Number(a.attack.requiresGX)-Number(b.attack.requiresGX)||
   b.target.prizeValue-a.target.prizeValue||
   a.target.token.localeCompare(b.target.token)||
   a.attack.name.localeCompare(b.attack.name));
 const {target,attack}=candidates[0];
 return {
  status:'terminal-candidate',reason:'BLAST_SELFKO_ENABLES_COUNTER_CATCHER_FOR_WIN',
  terminalMode:'all-prizes',
  firstAction:{type:'use-ability',source:'Benched Dusknoir SFA20',
    ability:'Cursed Blast',targetToken:target.token},
  conditionalContinuation:[
   {type:'play-item',name:'Counter Catcher',
    condition:'Reobserve opponent Prize count and native Item legal frontier'},
   {type:'gust-target',token:target.token,
    condition:'Reobserve native opponent Bench selection prompt'},
   {type:'attack',name:attack.name,sourceToken:attack.sourceToken,
    condition:'Reobserve paid source and damage after opponent promotion'}
  ],
  initialPrizes:{own:p.ownPrizesRemaining,opponent:p.opponentPrizesRemaining},
  projectedPrizes:{ownAfterTargetKO:Math.max(0,p.ownPrizesRemaining-target.prizeValue),
    opponentAfterSelfKO:p.opponentPrizesRemaining-1},
  proposedDamage:{blastCounters:13,blastAmount:130,
    attackAfterAllEffects:attack.damageAfterAllEffects,
    total:130+attack.damageAfterAllEffects,targetRemainingHp:target.remainingHp},
  targetToken:target.token,needsLiveRevalidation:true,
  evidence:'conditioned first-action tactical plan, no native transition or game'
 };
}
module.exports={counterCatcherAfterSelfKo};
