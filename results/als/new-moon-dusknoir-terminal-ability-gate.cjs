'use strict';
/**
 * Actor-visible no-attack terminal line:
 * use Bench Stage2 Dusknoir's Cursed Blast (13 counters) on an opponent
 * Pokemon already at <=130 remaining HP, take its Prize(s), and win game.
 * Own Dusk self-KOs, awarding opponent a Prize: refuse opponent final Prize.
 * Opponent-last-Pokemon KO is a separate victory condition from final Prize.
 * Fully conditional native-rule action proposal; never reads hidden zones.
 */
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const bool=x=>x===true||x===false;
function terminalCursedBlast(view){
 if(!view||!view.public||!view.own||!view.combat)
  return {status:'unsupported',reason:'MISSING_ACTOR_VIEW'};
 const {public:p,own:o,combat:c}=view;
 if(!nat(p.ownPrizesRemaining)||!nat(p.opponentPrizesRemaining)||
    !bool(c.abilityLegal)||!bool(c.abilityNotSuppressed)||
    !bool(c.reactiveEffectsResolved)||!bool(o.benchedDusknoirReady)||
    !Array.isArray(p.targets)||!p.targets.every(x=>x&&
      typeof x.token==='string'&&x.token.length>0&&
      nat(x.remainingHp)&&nat(x.prizeValue)&&x.prizeValue<=3&&
      x.prizeValue>=1&&bool(x.abilityCountersApply)) ||
    (p.opponentBenchCount!==undefined&&(!nat(p.opponentBenchCount)||
      p.opponentBenchCount>5))||
    (p.opponentActiveTargetToken!==undefined&&
      (typeof p.opponentActiveTargetToken!=='string'||
       p.opponentActiveTargetToken.length===0)))
   return {status:'unsupported',reason:'ACTOR_TERMINAL_FACTS_UNCERTIFIED'};
 if(p.ownPrizesRemaining<1||p.ownPrizesRemaining>6||
    p.opponentPrizesRemaining<1||p.opponentPrizesRemaining>6)
   return {status:'unsupported',reason:'INVALID_PRIZE_STATE'};
 if(p.opponentPrizesRemaining===1)
   return {status:'blocked',reason:'SELF_KO_CONCEDES_OPPONENT_FINAL_PRIZE'};
 if(!o.benchedDusknoirReady||!c.abilityLegal||!c.abilityNotSuppressed)
   return {status:'blocked',reason:'CURSED_BLAST_UNAVAILABLE'};
 if(!c.reactiveEffectsResolved)
   return {status:'blocked',reason:'UNMODELED_REACTIVE_EFFECTS'};
 // A single opposing Active with no Bench is another exact game-winning
 // condition: its KO leaves the opponent with no Pokemon in play, even if
 // our Prize count is not yet zero. Never infer an empty Bench from a missing
 // field. The source Dusknoir is Benched, so its self-KO leaves our Active.
 const noBenchActive=(x)=>p.opponentBenchCount===0&&
   p.opponentActiveTargetToken===x.token;
 const winners=p.targets.filter(x=>x.remainingHp>0&&x.remainingHp<=130&&
   x.abilityCountersApply&&
   (x.prizeValue>=p.ownPrizesRemaining||noBenchActive(x)));
 if(!winners.length)
   return {status:'blocked',reason:'NO_CERTIFIED_ABILITY_ONLY_TERMINAL_KO'};
 winners.sort((a,b)=>Number(b.prizeValue>=p.ownPrizesRemaining)-
   Number(a.prizeValue>=p.ownPrizesRemaining)||
   b.prizeValue-a.prizeValue||a.remainingHp-b.remainingHp||
   a.token.localeCompare(b.token));
 const target=winners[0];
 const lastPokemonWin=noBenchActive(target)&&
   target.prizeValue<p.ownPrizesRemaining;
 return {
  status:'terminal-candidate',
  reason:lastPokemonWin?'ABILITY_KOS_LAST_OPPONENT_POKEMON':
    'ABILITY_ONLY_WINNING_PRIZE_KO',
  terminalMode:lastPokemonWin?'no-opponent-pokemon':'all-prizes',
  opponentNoPokemonAfterKO:lastPokemonWin,
  firstAction:{type:'use-ability',source:'Benched Dusknoir SFA20',
    ability:'Cursed Blast',targetToken:target.token},
  targetRemainingHp:target.remainingHp,
  prizesTakenFromTarget:target.prizeValue,
  projectedOwnPrizesAfterKO:Math.max(0,p.ownPrizesRemaining-target.prizeValue),
  projectedOpponentPrizesAfterDuskSelfKO:p.opponentPrizesRemaining-1,
  revalidateNativeEffectOrder:true,
  evidence:'conditional actor-visible terminal Prize hypothesis, not a native game'
 };
}
module.exports={terminalCursedBlast};
