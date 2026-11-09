'use strict';

const assert=require('node:assert/strict');
const {isGuzma}=require('../agent2-held-guzma-mobility-frontier.cjs');
const {chooseFinalPrizeGuzma,choosePrizeTradeGuzma,nominalKo}=
  require('../agent31-final-prize-guzma-frontier.cjs');
const {fundedPlainAttacks}=
  require('../agent31-forced-guzma-ko-frontier.cjs');
const {eligibleDamagingAttack}=
  require('../agent2-held-guzma-mobility-frontier.cjs');
const {paysWithBasics}=
  require('../agent7-actor-free-retreat-frontier.cjs');
const {printedAllPokemonEnergyScaling}=
  require('../agent17-printed-scaling-basic-ko.cjs');

const VERSION='agent31-late-seeker-guzma-scaling-nominal-prize-v2';

/**
 * A conservative computed-damage attack line. Only a printed additive
 * all-Pokémon Energy formula is accepted. Unknown attached Special Energy
 * makes the entire count unreliable, so abstain.
 *
 * @param {object} view Owner-public board and hand.
 * @param {object} catalog Pinned public printing metadata.
 * @returns {object|null} Actual indices and explicit nominal calculation.
 */
function chooseScaledNominalGuzma(view,catalog){
  const own=view.ownPublic,opponent=view.opponentPublic;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||!opponent?.active||
    !Array.isArray(own.bench)||!Array.isArray(opponent.bench)||
    !Number.isSafeInteger(own.prizeCount)||own.prizeCount<1||
    !Array.isArray(view.ownHand)||!view.ownHand.some(isGuzma)||
    r?.supporterPlayedTurn!==0||r.supporterPlayLocked===true||
    own.publicTurnRestrictions?.supporterPlayLocked===true||
    own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    (own.resolvingSupporter?.length??0)>0)return null;

  const slots=[own.active,...own.bench].filter(Boolean);
  if(slots.some(pokemon=>!Array.isArray(pokemon.energies)||
    pokemon.energies.some(printing=>!catalog.basicEnergies?.has(printing))))
    return null;
  const paidAttacks=pokemon=>{
    if(!pokemon)return [];
    const fixed=fundedPlainAttacks(pokemon,catalog);
    const scaled=(pokemon.attacks??[]).flatMap(attack=>{
      if(!eligibleDamagingAttack(pokemon,attack,catalog)||
         !paysWithBasics(pokemon,attack,catalog))return [];
      const rule=printedAllPokemonEnergyScaling(attack);
      if(!rule)return [];
      const energyCount=slots.reduce((count,slot)=>
        count+slot.energies.filter(printing=>
          printing.startsWith(rule.energyType+' Energy ')).length,0);
      const damage=rule.baseDamage+energyCount*rule.damagePerUnit;
      return Number.isSafeInteger(damage)&&damage>0?
        [{...attack,damage,damageCalculation:null,
          printedScalingBaseDamage:rule.baseDamage,
          countedBasicEnergyUnits:energyCount,
          printedScalingPerUnit:rule.damagePerUnit}]:[];
    });
    return [...fixed,...scaled];
  };
  // Preserve direct final-Prize or immediate KO lines on the current Active.
  if(paidAttacks(own.active).some(attack=>
    nominalKo(opponent.active,own.active,attack)))return null;

  const options=[];
  for(let ownIndex=0;ownIndex<own.bench.length;ownIndex++){
    const attacker=own.bench[ownIndex];
    if(!attacker)continue;
    for(const attack of paidAttacks(attacker)){
      if(!Number.isSafeInteger(attack.countedBasicEnergyUnits))continue;
      for(let opponentIndex=0;opponentIndex<opponent.bench.length;
        opponentIndex++){
        const target=opponent.bench[opponentIndex];
        if(!target)continue;
        const score=nominalKo(target,attacker,attack);
        if(!score)continue;
        options.push({
          benchIndex:ownIndex,opponentBenchIndex:opponentIndex,
          attackerPrinting:attacker.printing??null,
          targetPrinting:target.printing??null,attackName:attack.name,
          nominalDamage:score.damage,targetRemainingHp:score.remaining,
          nominalExcessDamage:score.damage-score.remaining,
          countedBasicEnergyUnits:attack.countedBasicEnergyUnits,
          printedScalingPerUnit:attack.printedScalingPerUnit
        });
      }
    }
  }
  options.sort((a,b)=>a.nominalExcessDamage-b.nominalExcessDamage||
    a.opponentBenchIndex-b.opponentBenchIndex||a.benchIndex-b.benchIndex||
    a.attackName.localeCompare(b.attackName));
  if(!options.length)return null;
  const handIndex=view.ownHand.findIndex(isGuzma);
  return {kind:'play-guzma-forced-nominal-ko',
    handIndex,printing:view.ownHand[handIndex],...options[0],
    planFamily:'scaled-basic-energy-nominal-gust',
    prizeCardsRemainingBeforeRoot:own.prizeCount,
    actualKoAndTacticalBenefitUnverified:true,
    nativeOpponentTargetMustMatchIndex:true};
}

const SEEKER='VS Seeker PHF';

/**
 * Recover a public discarded Guzma only when a fully owner-visible
 * already-funded Bench attack makes a nominal Prize-taking gust plausible.
 * Recompute the Guzma choice after the physical recovery, rather than
 * promising that the board or Store prompts cannot change.
 *
 * A nominal KO is a policy hypothesis. Printed Damage and Basic Energy
 * checks do not certify against prevention, every lock or every damage
 * modifier. The native Store must still accept the paid chain.
 *
 * @param {object} view Detached owner observation.
 * @param {object} catalog Public printed card catalog.
 * @returns {object|null} Native-neutral root intent.
 */
function chooseLateSeekerGuzmaPrize(view,catalog,scope={}){
  assert.equal(view?.decisionKind,'owner-root');
  if(scope.ownerSeat!==undefined&&scope.ownerSeat!==null&&
     view.actorSeat!==scope.ownerSeat)return null;
  if(scope.globalTurn!==undefined&&scope.globalTurn!==null&&
     view.globalTurn!==scope.globalTurn)return null;
  if(!Array.isArray(view.ownHand)||!view.ownPublic?.active)return null;
  const own=view.ownPublic,resources=view.ownTurnResources;
  const planFor=candidate=>{
    const augmented={...view,ownHand:candidate};
    const ordinary=own.prizeCount===1?
      chooseFinalPrizeGuzma(augmented,catalog):
      choosePrizeTradeGuzma(augmented,catalog);
    return ordinary??chooseScaledNominalGuzma(augmented,catalog);
  };

  // Once the Supporter is physically recovered, an ordinary Guzma root is
  // selected from the updated hand; no remembered private-zone intention.
  if(view.ownHand.some(isGuzma)){
    const plan=planFor(view.ownHand);
    return plan?{...plan,source:VERSION,
      recoveredWithSeekerNotAssumed:true}:null;
  }

  if(resources?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     !Array.isArray(own.discard))return null;
  const seekerIndex=view.ownHand.indexOf(SEEKER);
  if(seekerIndex<0)return null;

  // Multiple printed Guzma versions can coexist in the discard. Choosing
  // the exact printing is important to the native owner-discard prompt.
  const discarded=[...new Set(own.discard.filter(isGuzma))].sort();
  for(const printing of discarded){
    const plan=planFor([...view.ownHand,printing]);
    if(!plan)continue;
    return {
      kind:'play-seeker-get-guzma',
      source:VERSION,
      printing:SEEKER,
      handIndex:seekerIndex,
      target:printing,
      intendedBenchIndex:plan.benchIndex,
      intendedOpponentBenchIndex:plan.opponentBenchIndex,
      intendedAttackName:plan.attackName,
      intendedNominalDamage:plan.nominalDamage,
      intendedPrizeCountBeforeRoot:own.prizeCount,
      actualGustAndKnockoutUnverified:true
    };
  }
  return null;
}

module.exports={VERSION,SEEKER,chooseScaledNominalGuzma,chooseLateSeekerGuzmaPrize};
