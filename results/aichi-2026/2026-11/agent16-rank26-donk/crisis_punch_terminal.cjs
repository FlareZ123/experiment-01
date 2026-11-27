'use strict';
/* A sufficient terminal certificate for the exact rank26 attackers after
 * opponent's remaining Prizes are reduced to exactly one. Caller supplies
 * verified effective damage and Prize value, including actual public effects.
 * This deliberately rejects unknown attack/KO/promotion triggers. It never
 * predicts the opponent's promotion from private information. */
function certifyCrisisPunchTerminal(x){
  const no=reason=>({terminal:false,reason});
  if(!x||x.attackReady!==true||x.toolEffective!==true||x.stableAttackConditions!==true||
     !Number.isSafeInteger(x.energyUnits)||x.energyUnits<3||
     !Number.isSafeInteger(x.ownPrizes)||x.ownPrizes<1||x.ownPrizes>6||
     typeof x.firstTurnGoingFirst!=='boolean'||!Array.isArray(x.opponentBench)||x.opponentBench.length>5)
    return no('UNPROVEN_PRECONDITIONS');
  let attacks;
  if(x.attacker==='Meloetta ex BLK 44'){
    if(x.firstTurnGoingFirst&&x.debutEffective!==true)return no('DEBUT_UNAVAILABLE');
    attacks=1;
  }else if(x.attacker==='Bunnelby PRC 121'){
    if(x.firstTurnGoingFirst)return no('FIRST_TURN_ATTACK_PROHIBITED');
    // If Barrage's second attack is not verified, consider only one attack.
    attacks=x.barrageEffective===true?2:1;
  }else return no('UNSUPPORTED_ATTACKER');
  const targets=[x.opponentActive,...x.opponentBench];
  if(targets.some(t=>!t||typeof t.id!=='string'||!t.id||!Number.isSafeInteger(t.hpRemaining)||t.hpRemaining<1||
      !Number.isSafeInteger(t.damagePerPunch)||t.damagePerPunch<0||!Number.isSafeInteger(t.prizes)||t.prizes<1||t.prizes>3)||
      new Set(targets.map(t=>t.id)).size!==targets.length)return no('UNPROVEN_TARGET_EFFECTS');
  const first=targets[0],bench=targets.slice(1),p=x.ownPrizes;
  if(first.damagePerPunch>=first.hpRemaining){
    if(first.prizes>=p||!bench.length)return {terminal:true,maxAttacks:1,branches:[{first:first.id,win:'first-ko'}]};
    if(attacks<2)return no('NO_SECOND_ATTACK');
    const branches=bench.map(t=>({first:first.id,promotion:t.id,second:t.id,
      terminal:t.damagePerPunch>=t.hpRemaining&&(bench.length===1||first.prizes+t.prizes>=p)}));
    if(branches.every(b=>b.terminal))return {terminal:true,maxAttacks:2,branches};
    return no('AT_LEAST_ONE_PROMOTION_SURVIVES');
  }
  if(attacks===2&&2*first.damagePerPunch>=first.hpRemaining&&(first.prizes>=p||!bench.length))
    return {terminal:true,maxAttacks:2,branches:[{first:first.id,second:first.id,win:'second-hit-ko'}]};
  return no('NO_FORCED_TERMINAL');
}
module.exports={certifyCrisisPunchTerminal};
