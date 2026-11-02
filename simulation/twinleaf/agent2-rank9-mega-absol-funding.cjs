'use strict';
const assert=require('node:assert/strict');
const {energyUnits,canPaySymbols}=require('./actor-energy-payability.cjs');
const {
  publicEnergyContext,effectivePublicAttackCost,futureOneUnitDeficit
}=require('./agent17-public-context-special-energy.cjs');
const VERSION='agent2-owner-public-m1l-mega-absol-funding-v1';
const CLAW='Your opponent reveals their hand, and you discard a card you find there.';

/**
 * Concrete three-attachment plan for an exact public Mega Absol core.
 * It prioritizes making Claw payable in future turns over a generic
 * one-attachment "nearest currently payable attack" greediness.
 * Only actual currently held Basic/Special Energy may be selected.
 * No opponent hand, unknown deck or hidden Prize contents are used.
 *
 * @param {object} view Detached owner-root view.
 * @param {object} catalog Full public print catalog.
 * @returns {object|null} Native-compatible owner attachment.
 */
function chooseMegaAbsolStagedFunding(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.bench)||
     !Array.isArray(view.ownHand)||
     r?.energyPlayLocked===true||
     r?.energyPlayedTurn===view.globalTurn||
     own.publicTurnRestrictions?.energyPlayLocked===true)return null;
  const temple=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(x=>x.startsWith('Temple of Sinnoh '));
  const candidates=[];
  for(let index=0;index<own.bench.length;index++){
    const pokemon=own.bench[index];
    if(pokemon?.printing!=='Mega Absol ex M1L'||
       pokemon.printed?.stage!==catalog.stages?.BASIC||
       !pokemon.printed?.types?.includes(catalog.basicEnergyTypes.Darkness))
      continue;
    const attack=pokemon.attacks?.find(x=>
      x.name==='Claw of Darkness'&&x.damage===200&&
      (x.damageCalculation===undefined||x.damageCalculation===null)&&
      x.text===CLAW);
    if(!attack)continue;
    const cost=effectivePublicAttackCost(view,catalog,pokemon,attack);
    if(cost===null||cost.length===0)continue;
    const context=publicEnergyContext(view,pokemon,catalog);
    const current=[];
    let recognized=true;
    for(const printing of pokemon.energies??[]){
      const more=temple&&catalog.specialEnergies.has(printing)?
        [['C']]:energyUnits(printing,context);
      if(!more){recognized=false;break;}
      current.push(...more);
    }
    if(!recognized)continue;
    const before=futureOneUnitDeficit(cost,current);
    if(before===0)continue;
    const darkCost=cost.filter(x=>x==='D');
    for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
      const printing=view.ownHand[handIndex];
      const basic=catalog.basicEnergies?.has(printing)===true;
      const special=catalog.specialEnergies?.has(printing)===true;
      if(!basic&&!special)continue;
      if(special&&(r?.specialEnergyPlayLocked===true||
         own.publicTurnRestrictions?.specialEnergyPlayLocked===true))
        continue;
      // Mega Absol is Basic. Reversal and Counter Energy stay conservative
      // through the existing publicEnergyContext and energyUnits helpers.
      const addition=temple&&special?
        [['C']]:energyUnits(printing,context);
      if(!addition)continue;
      const after=futureOneUnitDeficit(cost,[...current,...addition]);
      if(after>=before)continue;
      // Prioritize a scarce printed Darkness requirement over incidental C.
      const darkBefore=futureOneUnitDeficit(darkCost,current);
      const darkAfter=futureOneUnitDeficit(darkCost,[...current,...addition]);
      const helpsDark=darkAfter<darkBefore;
      candidates.push({
        kind:basic?'attach-basic-energy':'attach-special-energy',
        printing,handIndex,slot:'bench',index,
        after,helpsDark,gain:before-after,
        publicAttackName:'Claw of Darkness',
        remainingFutureAttachments:after,
        wholeGameValueUnverified:true
      });
    }
  }
  candidates.sort((a,b)=>a.after-b.after||
    Number(b.helpsDark)-Number(a.helpsDark)||
    b.gain-a.gain||a.index-b.index||a.handIndex-b.handIndex);
  return candidates[0]??null;
}
module.exports={VERSION,chooseMegaAbsolStagedFunding};
