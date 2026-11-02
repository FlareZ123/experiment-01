'use strict';
const assert=require('node:assert/strict');
const VERSION='agent26-mew-dce-recipient-v1';
const ENERGY='Double Colorless Energy SUM';
/** @param {object} view Acting player observation.
 * @param {object} catalog Printed catalog.
 * @returns {object|null} Owner-only proposed native attachment.
 */
function chooseMewDceRecipient(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const handIndex=view.ownHand.indexOf(ENERGY);
  const own=view.ownPublic,r=view.ownTurnResources;
  if(handIndex<0||!catalog.specialEnergies.has(ENERGY)||
    r.energyPlayLocked!==false||r.specialEnergyPlayLocked===true||
    r.energyPlayedTurn===view.globalTurn)return null;
  if([...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  // Do not steal a fully funded immediate attack from a different Active.
  // Unknown attached-energy printings fail closed on this opportunity test.
  const active=own.active;
  if(active?.printing!=='Mew V FST'&&
      active?.printing!=='Mew VMAX FST'&&Array.isArray(active?.attacks)&&
      active.attacks.length>0){
    const {specialEnergyUnits,missingEnergyUnits}=
      require('./agent3-special-energy-frontier.cjs');
    const {effectiveNativeAttackCost}=
      require('./agent17-public-context-special-energy.cjs');
    const supplied=[];
    let known=true;
    for(const energy of active.energies??[]){
      let units=specialEnergyUnits(energy,catalog,false);
      if(units===null&&catalog.basicEnergies?.has(energy)){
        const type=Object.keys(catalog.basicEnergyTypes??{})
          .find(n=>energy.startsWith(n+' Energy '));
        units=type?[catalog.basicEnergyTypes[type]]:null;
      }
      if(units===null){known=false;break;}
      supplied.push(...units);
    }
    if(known){
      const afterUnits=[...supplied,catalog.colorlessEnergyType,
        catalog.colorlessEnergyType];
      for(const attack of active.attacks){
        if(!(Number.isSafeInteger(attack.damage)&&attack.damage>0)||
            attack.gxAttack===true||attack.name?.endsWith('-GX'))continue;
        const cost=effectiveNativeAttackCost(view,catalog,active,attack);
        if(!Array.isArray(cost))continue;
        const before=missingEnergyUnits(cost,supplied,
          catalog.colorlessEnergyType);
        const after=missingEnergyUnits(cost,afterUnits,
          catalog.colorlessEnergyType);
        if(before>0&&after===0)return null;
      }
    }
  }
  const targets=[{slot:'active',index:0,pokemon:own.active},
    ...(own.bench??[]).map((pokemon,index)=>({slot:'bench',index,pokemon}))];
  const options=targets.filter(t=>t.pokemon&&
    (t.pokemon.printing==='Mew V FST'||
     t.pokemon.printing==='Mew VMAX FST')&&
    Array.isArray(t.pokemon.energies)&&
    t.pokemon.energies.length===0);
  options.sort((a,b)=>
    Number(b.pokemon.printing==='Mew VMAX FST')-
    Number(a.pokemon.printing==='Mew VMAX FST')||
    (a.slot==='active'?0:1)-(b.slot==='active'?0:1)||a.index-b.index);
  const t=options[0];
  return t?{kind:'attach-special-energy',handIndex,printing:ENERGY,
    slot:t.slot,index:t.index}:null;
}
module.exports={VERSION,chooseMewDceRecipient};
