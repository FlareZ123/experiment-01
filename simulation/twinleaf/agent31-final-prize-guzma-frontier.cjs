'use strict';
const assert=require('node:assert/strict');
const {fundedPlainAttacks}=require('./agent31-forced-guzma-ko-frontier.cjs');
const {isGuzma}=require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION='agent31-final-prize-guzma-owner-public-v2-shared-prize-selector';

/**
 * A fixed printed attack is only a nominal KO when it covers remaining HP
 * without relying on Weakness. Reject visible resistance and unknown Tools.
 *
 * @param {object} target Public opponent Bench slot.
 * @param {object} attacker Public own Bench slot.
 * @param {object} attack Public printed attack.
 * @returns {{remaining:number,damage:number}|null}
 */
function nominalKo(target,attacker,attack){
  if(!Number.isSafeInteger(target?.hp)||
      !Number.isSafeInteger(target?.damage)||
      target.hp<=0||target.damage<0||target.damage>=target.hp||
      !Number.isSafeInteger(attack?.damage)||attack.damage<=0)return null;
  const tools=target.tools??[];
  if(!Array.isArray(tools)||tools.some(tool=>
    !/^Eviolite [A-Z0-9]+$/.test(tool)))return null;
  const attackerTypes=attacker?.printed?.types??[];
  if(!Array.isArray(attackerTypes))return null;
  // Printed resistance values vary by format, so decline every type-matched
  // resistance instead of extrapolating from potentially outdated reductions.
  if((target.printed?.resistance??[]).some(resistance=>
    attackerTypes.includes(resistance.type)))return null;
  const damage=attack.damage-20*tools.length;
  const remaining=target.hp-target.damage;
  return damage>=remaining?{damage,remaining}:null;
}

/**
 * Opt-in late-game extension of the conservative forced-target Guzma root.
 * A real final Prize remains and one of the owner's already funded Benched
 * attacks can nominally KO a selected opponent Bench target. The opponent
 * and owner may each have multiple Benched Pokémon. The exact index on each
 * side is preserved through the native choose-Pokémon prompt bridge.
 *
 * A positive proposal is still only a line hypothesis, never a guarantee:
 * passive reductions, alternate effects, wrong printed card support, or
 * changes by the opponent may defeat it. The physical Store is authoritative.
 *
 * @param {object} view Detached acting-owner root observation.
 * @param {object} catalog Public CardManager printing catalog.
 * @returns {object|null}
 */
function chooseNominalPrizeGuzma(view,catalog,prizeGuard,planFamily){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1 || !prizeGuard(own?.prizeCount) ||
     !own.active||!opponent?.active||
     !Array.isArray(own.bench)||!Array.isArray(opponent.bench)||
     !Array.isArray(view.ownHand)||
     !own.bench.some(Boolean)||!opponent.bench.some(Boolean)||
     r?.supporterPlayedTurn!==0||
     r?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     (own.resolvingSupporter?.length??0)>0)return null;
  const handIndex=view.ownHand.findIndex(isGuzma);
  if(handIndex<0)return null;
  // Protect the immediately available final Prize on the present Active.
  if(fundedPlainAttacks(own.active,catalog).some(attack=>
    nominalKo(opponent.active,own.active,attack)!==null))return null;
  const options=[];
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const attacker=own.bench[benchIndex];
    if(!attacker)continue;
    for(const attack of fundedPlainAttacks(attacker,catalog)){
      for(let opponentBenchIndex=0;
        opponentBenchIndex<opponent.bench.length;opponentBenchIndex++){
        const target=opponent.bench[opponentBenchIndex];
        if(!target)continue;
        const score=nominalKo(target,attacker,attack);
        if(score)options.push({benchIndex,opponentBenchIndex,
          attackerPrinting:attacker.printing??null,
          targetPrinting:target.printing??null,
          attackName:attack.name,
          nominalDamage:score.damage,
          targetRemainingHp:score.remaining,
          nominalExcessDamage:score.damage-score.remaining});
      }
    }
  }
  if(options.length===0)return null;
  // Retain a deterministic choice across identical owner-public snapshots,
  // independent of physical IDs, hidden hand/deck or Prize card identities.
  options.sort((a,b)=>a.nominalExcessDamage-b.nominalExcessDamage||
    a.opponentBenchIndex-b.opponentBenchIndex||
    a.benchIndex-b.benchIndex||
    a.attackName.localeCompare(b.attackName));
  return {
    kind:'play-guzma-forced-nominal-ko',
    handIndex,printing:view.ownHand[handIndex],
    ...options[0],
    planFamily,
    prizeCardsRemainingBeforeRoot:own.prizeCount,
    finalPrizeBeforeRoot:own.prizeCount===1?1:null,
    nativeOpponentTargetMustMatchIndex:true,
    actualKoAndTacticalBenefitUnverified:true
  };
}
/**
 * Final-Prize special case: a resulting genuine native KO could end the game.
 * @param {object} view
 * @param {object} catalog
 * @returns {object|null}
 */
function chooseFinalPrizeGuzma(view,catalog){
  return chooseNominalPrizeGuzma(view,catalog,
    prizes=>prizes===1,'last-prize-multi-bench-nominal-gust');
}

/**
 * Exploratory nonfinal Prize trade: a nominal knockout may improve the
 * exchange, but opponent responses and Supporter opportunity cost can
 * reverse that apparent gain. It cannot be promoted without paired testing.
 * @param {object} view
 * @param {object} catalog
 * @returns {object|null}
 */
function choosePrizeTradeGuzma(view,catalog){
  return chooseNominalPrizeGuzma(view,catalog,
    prizes=>Number.isSafeInteger(prizes)&&prizes>=2&&prizes<=6,
    'nonfinal-prize-trade-nominal-gust');
}
module.exports={VERSION,nominalKo,chooseFinalPrizeGuzma,choosePrizeTradeGuzma};
