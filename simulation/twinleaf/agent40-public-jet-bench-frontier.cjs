'use strict';
const assert=require('node:assert/strict');

const VERSION='agent40-public-jet-bench-switch-v4-source-robo-and-vs-payoff';
const JET='Jet Energy ';

/**
 * A deliberately bounded owner-visible Jet Energy rescue. It proposes the
 * mandatory switch only when the current Active has no known payable attack
 * and a public Benched Pokémon could use a printed, positive-damage attack
 * after receiving the Colorless unit. The real Store alone establishes that
 * the Energy can be attached, that the switch occurs, and that the ensuing
 * attack is legal and useful. Current tactical damage is unmodeled.
 *
 * @param {object} view Detached actorObservation from the real acting seat.
 * @param {object} catalog Public printed card/energy metadata.
 * @param {{payable?:(view:object,catalog:object,pokemon:object,attack:object)=>boolean}} [deps]
 * @returns {object|null} Existing attach-special-energy root intent.
 */
function choosePublicJetBenchSwitch(view,catalog,deps={}){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic, quota=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||!Array.isArray(own.bench)||
      !Array.isArray(view.ownHand)||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      own.publicTurnRestrictions?.energyPlayLocked===true||
      own.publicTurnRestrictions?.specialEnergyPlayLocked===true||
      quota?.energyPlayLocked===true||quota?.specialEnergyPlayLocked===true||
      quota?.energyPlayedTurn===view.globalTurn||
      [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
        .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  // Active-dependent passive locks may be the entire strategic plan. A
  // guaranteed forced switch can disable Sentinel, Initialization, and
  // similar effects, even when the current Active cannot pay an attack.
  const activeOnly=/(?:as long as|while)\s+this\s+pok[eé]mon\s+is\s+(?:your\s+active\s+pok[eé]mon|in\s+the\s+active\s+spot)/i;
  if(own.active.abilityDetails?.some(x=>
    typeof x.text==='string'&&activeOnly.test(x.text)))return null;
  const handIndex=view.ownHand.findIndex(x=>x.startsWith(JET)&&
    catalog.specialEnergies instanceof Set&&catalog.specialEnergies.has(x));
  if(handIndex<0)return null;
  const payable=deps.payable??
    require('./agent17-public-context-special-energy.cjs')
      .publicSpecialAttackPayable;
  assert.equal(typeof payable,'function');
  const {ASLEEP,PARALYZED}=catalog.specialConditions??{};
  const usable=(pokemon,attack)=>{
    const r=pokemon.publicRestrictions??{};
    return Array.isArray(attack?.cost)&&
      !(attack.gxAttack===true||attack.name?.endsWith('-GX'))&&
      !pokemon.specialConditions?.some(x=>x===ASLEEP||x===PARALYZED)&&
      r.cannotAttackNextTurn!==true&&
      r.blockedAttackNameNextTurn!==attack.name&&
      r.blockedAttackNameUntilLeavesActive!==attack.name&&
      !r.cannotUseAttacksNextTurn?.includes(attack.name)&&
      (!r.onlyAllowedAttackNameNextTurn||
        r.onlyAllowedAttackNameNextTurn===attack.name);
  };
  // Preserve an already payable Active attack, including non-damage lock
  // attacks. Whether to replace it requires stronger tactical comparison.
  if(own.active.attacks?.some(attack=>usable(own.active,attack)&&
      payable(view,catalog,own.active,attack)))return null;
  const jet=view.ownHand[handIndex];
  for(let index=0;index<own.bench.length;index++){
    const target=own.bench[index];
    if(!target||!Array.isArray(target.energies)||
        !Array.isArray(target.attacks))continue;
    const withJet={...target,energies:[...target.energies,jet]};
    const attack=target.attacks.find(a=>
      typeof a.damage==='number'&&a.damage>0&&usable(target,a)&&
      payable(view,catalog,withJet,a));
    if(!attack)continue;
    return {kind:'attach-special-energy',printing:jet,handIndex,
      slot:'bench',index,
      reason:'jet-switch-to-public-payable-printed-damage',
      plannedAttackName:attack.name};
  }
  // Utility switch for rank7-style Basic-Psychic Ability lock. A visible,
  // unhooded AOR Vileplume can suppress held Items until native Jet promotes
  // an original-source Wobbuffet. Only propose with a concrete known Item
  // payoff visible to its actual owner; the final Store executes the effect.
  const itemLocks=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(p=>
    p?.printing==='Vileplume AOR'&&
    p.abilityDetails?.some(a=>a.name==='Irritating Pollen'));
  // A second protected lock remains active after the proposed Wobbuffet
  // promotion. Do not treat suppression of one copy as an Item unlock.
  const vulnerableItemLock=itemLocks.length>0&&itemLocks.every(p=>
    !(p.tools??[]).some(t=>t.startsWith('Stealthy Hood ')));
  // An established Power of Alchemy can itself suppress Basic Wobbuffet.
  // This is deliberately conservative around the documented Muk timing
  // interaction, pending a fuller lock-order policy.
  const alchemyInPlay=[own.active,...own.bench,
    view.opponentPublic?.active,...(view.opponentPublic?.bench??[])]
    .some(p=>p?.printing?.startsWith('Alolan Muk ')&&
      p.abilityDetails?.some(a=>a.name==='Power of Alchemy'));
  const nestPayoff=view.ownHand.some(p=>p.startsWith('Nest Ball '))&&
    own.bench.some(p=>p===null)&&own.deckCount>0;
  // Source rank7's actual Faba is printed Supporter, and its discard identity
  // is public. VS Seeker can reclaim it if the Supporter for the turn remains
  // available; the Item cannot be played while Vileplume Item lock applies.
  // Explicitly bounded: a different discarded Supporter is not yet assumed
  // to be a useful or native-payable replacement for this tactical line.
  // Robo Substitute is itself a printed Bench-entering Item. A spare Bench
  // space gives a tangible stall-card payoff when the opponent's Vileplume
  // would otherwise forbid the action. Native Store checks the actual play.
  const roboBenchPayoff=view.ownHand.some(p=>
    p.startsWith('Robo Substitute '))&&own.bench.some(p=>p===null);
  const vsSeekerFabaPayoff=view.ownHand.some(p=>p.startsWith('VS Seeker '))&&
    own.discard.some(p=>p.startsWith('Faba '))&&
    quota?.supporterPlayedTurn===0&&
    own.publicTurnRestrictions?.supporterPlayLocked!==true&&
    quota?.supporterPlayLocked!==true;
  if(vulnerableItemLock&&!alchemyInPlay&&
      (nestPayoff||roboBenchPayoff||vsSeekerFabaPayoff)){
    const wobb=own.bench.findIndex(p=>p?.printing==='Wobbuffet PHF');
    if(wobb>=0)return {
      kind:'attach-special-energy',printing:jet,handIndex,
      slot:'bench',index:wobb,
      reason:nestPayoff?
        'jet-promote-wobbuffet-suppress-unhooded-aor-item-lock':
        roboBenchPayoff?
          'jet-promote-wobbuffet-enable-robo-substitute':
          'jet-promote-wobbuffet-enable-public-vs-seeker',
      ...(nestPayoff?{}:roboBenchPayoff?
        {plannedItem:'Robo Substitute PHF'}:
        {plannedItem:'VS Seeker PHF',plannedSupporter:'Faba LOT'})
    };
  }
  return null;
}
module.exports={VERSION,choosePublicJetBenchSwitch};
