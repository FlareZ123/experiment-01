'use strict';
const assert=require('node:assert/strict');
const {isGuzma,eligibleDamagingAttack}=
  require('./agent2-held-guzma-mobility-frontier.cjs');
const {safePrintedDamageText}=
  require('./agent31-forced-guzma-ko-frontier.cjs');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent2-rank9-public-special-funded-guzma-v1';

/**
 * The exact observed rank-9 owner-public counterfactual is deliberately
 * narrow. Unknown effects, differing printed Weakness, or absent physical
 * Energy readiness must abstain rather than become invented KO facts.
 * This is a tactical proposal, not a damage-referee or competitive result.
 *
 * @param {object} view Detached owner root observation.
 * @param {object} catalog Public printed-card catalog.
 * @returns {object|null} Existing native-compatible Guzma root intent.
 */
function chooseRank9SpecialFundedGuzma(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic,r=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||!opp?.active||
     !Array.isArray(own.bench)||!Array.isArray(opp.bench)||
     !Array.isArray(view.ownHand)||!own.bench.some(Boolean)||
     !opp.bench.some(Boolean)||
     own.active.printing==='Mega Absol ex ME1'||
     r?.supporterPlayedTurn!==0||r?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     (own.resolvingSupporter?.length??0)>0)return null;
  const handIndex=view.ownHand.findIndex(isGuzma);
  if(handIndex<0)return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const attacker=own.bench[benchIndex];
    if(attacker?.printing!=='Mega Absol ex ME1'|| 
       attacker.printed?.stage!==catalog.stages?.BASIC||
       !attacker.printed?.types?.includes(catalog.basicEnergyTypes?.Darkness)||
       !attacker.energies?.some(p=>catalog.specialEnergies?.has(p)))
      continue;
    const attack=attacker.attacks?.find(a=>a.name==='Claw of Darkness'&&
      a.damage===200&&a.damageCalculation==null&&
      eligibleDamagingAttack(attacker,a,catalog)&&
      safePrintedDamageText(attacker,a)&&
      publicSpecialAttackPayable(view,catalog,attacker,a));
    if(!attack)continue;
    for(let opponentBenchIndex=0;opponentBenchIndex<opp.bench.length;
        opponentBenchIndex++){
      const target=opp.bench[opponentBenchIndex];
      if(target?.name!=='Trevenant & Dusknoir-GX'||
         !Number.isSafeInteger(target.hp)||
         !Number.isSafeInteger(target.damage)||
         target.damage<0||target.damage>=target.hp)
        continue;
      const weaknesses=target.printed?.weakness;
      if(!Array.isArray(weaknesses)||!weaknesses.some(w=>
          attacker.printed.types.includes(w.type)&&
          [2,'×2','x2','X2'].includes(w.value)))
        continue;
      const resistances=target.printed?.resistance;
      if(!Array.isArray(resistances)||resistances.some(w=>
          attacker.printed.types.includes(w.type)))continue;
      const tools=target.tools??[];
      if(!Array.isArray(tools)||tools.some(t=>
          !/^Eviolite [A-Z0-9]+$/.test(t)))continue;
      const nominalDamage=400-20*tools.length;
      const remainingHp=target.hp-target.damage;
      if(nominalDamage<remainingHp)continue;
      return {
        kind:'play-guzma-forced-nominal-ko',
        handIndex,printing:view.ownHand[handIndex],
        benchIndex,opponentBenchIndex,
        attackerPrinting:attacker.printing,
        targetPrinting:target.printing,
        attackName:'Claw of Darkness',
        nominalDamage,targetRemainingHp:remainingHp,
        planFamily:'rank9-special-funded-weakness-guzma',
        nativeOpponentTargetMustMatchIndex:true,
        printedSpecialEnergyPayable:true,
        predictedNativeTargetsForced:false,
        actualKoAndTacticalBenefitUnverified:true,
        paperDamageAndPromptChainUnverified:true
      };
    }
  }
  return null;
}

module.exports={VERSION,chooseRank9SpecialFundedGuzma};
