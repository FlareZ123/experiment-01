'use strict';

const assert=require('node:assert/strict');
const {energyUnits}=require('./actor-energy-payability.cjs');
const {publicEnergyContext,publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent10-raichu-printed-ko-energy-before-attack-v1';
const RAICHU='Alolan Raichu UNM';
const BOUNDED_SPECIALS=new Set([
  'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'
]);

/**
 * Numerically count only presently provided Lightning units, respecting
 * current public Prize context and Temple suppression. An unsupported
 * attached Energy makes the estimate unknown (null), never zero.
 *
 * @param {string[]} printings Exact native Energy print names.
 * @param {object} context From publicEnergyContext.
 * @param {boolean} temple Public Temple of Sinnoh in play.
 * @param {Set<string>} specialPrintings Full static printed catalog.
 * @returns {number|null}
 */
function lightningUnitCount(printings,context,temple,specialPrintings){
  let count=0;
  for(const printing of printings){
    const units=temple&&specialPrintings.has(printing)?
      [['C']]:energyUnits(printing,context);
    if(units===null)return null;
    count+=units.filter(types=>types.includes('L')).length;
  }
  return count;
}


/**
 * Maximum number of opposing targets whose printed remaining HP could be
 * exhausted by N freely distributable 30-damage Electro Rain packets.
 * Equal-KO-value assumption is for a conservative action opportunity
 * witness; Prize values and defensive effects are unmodelled.
 *
 * @param {number[]} remainingHP Face-up positive printed remaining HP.
 * @param {number} packets Available Lightning-energy selections.
 * @returns {number}
 */
function maximumRawKnockouts(remainingHP,packets){
  assert.ok(Number.isSafeInteger(packets)&&packets>=0);
  const costs=remainingHP.filter(value=>Number.isFinite(value)&&value>0)
    .map(value=>Math.ceil(value/30)).sort((a,b)=>a-b);
  let used=0,knockouts=0;
  for(const cost of costs){
    if(used+cost>packets)break;
    used+=cost;knockouts++;
  }
  return knockouts;
}

/**
 * Demonstrate a narrowly scoped omitted action: Electro Rain is already
 * payable, yet one source-held Special Energy crosses a printed Knock Out
 * damage threshold against a face-up public target this same turn.
 *
 * This policy knows only the actor's current hand, both face-up boards,
 * publicly visible Prize counts and the PUBLIC card catalog. It is a
 * rationality candidate, not a guaranteed KO: protective effects, other
 * attacks, Tool costs, discard economy, locks and the opponent's response
 * still require native and human validation.
 *
 * @param {object} view Frozen detached actor root observation.
 * @param {object} catalog Static public print/energy catalog.
 * @returns {{kind:'attach-special-energy',handIndex:number,
 *   printing:string,slot:'active',index:0}|null}
 */
function chooseRaichuPrintedKnockoutAttachment(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own.active;
  const quota=view.ownTurnResources;
  if(active?.printing!==RAICHU||view.globalTurn===1||
     quota.energyPlayLocked===true||
     quota.specialEnergyPlayLocked===true||
     quota.energyPlayedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const restrictions=active.publicRestrictions??{};
  if(restrictions.cannotAttackNextTurn===true||
     restrictions.cannotUseAttacksNextTurn?.includes('Electro Rain')||
     restrictions.blockedAttackNameNextTurn==='Electro Rain'||
     restrictions.blockedAttackNameUntilLeavesActive==='Electro Rain'||
     (restrictions.onlyAllowedAttackNameNextTurn&&
       restrictions.onlyAllowedAttackNameNextTurn!=='Electro Rain')||
     active.specialConditions?.some(v=>v===catalog.specialConditions.ASLEEP||
       v===catalog.specialConditions.PARALYZED))return null;

  const attack=active.attacks?.find(a=>a.name==='Electro Rain');
  if(!attack||!publicSpecialAttackPayable(view,catalog,active,attack))
    return null;
  const temple=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(printing=>printing.startsWith('Temple of Sinnoh '));
  const context=publicEnergyContext(view,active,catalog);
  const current=lightningUnitCount(active.energies,context,temple,
    catalog.specialEnergies);
  if(current===null||current<1)return null;
  const targets=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(Boolean);
  const remainingHP=targets.map(p=>p.hp-p.damage).filter(remaining=>
    Number.isFinite(remaining)&&remaining>0);
  const currentKOs=maximumRawKnockouts(remainingHP,current);
  if(remainingHP.length===0)return null;
  let best=null;
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    if(!BOUNDED_SPECIALS.has(printing)||
       !catalog.specialEnergies?.has(printing))continue;
    const addition=lightningUnitCount([printing],context,temple,
      catalog.specialEnergies);
    if(addition===null||addition<1)continue;
    const futureKOs=maximumRawKnockouts(remainingHP,current+addition);
    if(futureKOs<=currentKOs)continue;
    const score=(futureKOs-currentKOs)*1000+futureKOs*100+addition;
    if(best===null||score>best.score)
      best={score,handIndex,printing};
  }
  return best?{
    kind:'attach-special-energy',
    handIndex:best.handIndex,
    printing:best.printing,slot:'active',index:0
  }:null;
}

module.exports={VERSION,RAICHU,BOUNDED_SPECIALS,lightningUnitCount,
  maximumRawKnockouts,chooseRaichuPrintedKnockoutAttachment};
