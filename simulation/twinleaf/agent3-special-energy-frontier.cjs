'use strict';

const assert=require('node:assert/strict');

const VERSION='agent30-telepathic-five-special-energy-frontier-v2';

/**
 * Bounded printed-text numeric model for four rank-6 Special Energy printings
 * and the New Moon candidate's Telepathic Psychic Energy (me3-88).
 * Temple of Sinnoh turns each Special Energy card into one Colorless.
 * Unknown printings remain unsupported, rather than providing invented units.
 *
 * @param {string} printing Exact full printing name.
 * @param {object} catalog Native CardType catalog.
 * @param {boolean} temple Whether Temple of Sinnoh is publicly in play.
 * @returns {number[]|null}
 */
function specialEnergyUnits(printing,catalog,temple=false){
  const special=catalog.specialEnergies;
  if(!(special instanceof Set)||!special.has(printing))return null;
  const colorless=catalog.colorlessEnergyType;
  const lightning=catalog.basicEnergyTypes.Lightning;
  let units;
  if(printing==='Double Colorless Energy SUM'){
    units=[colorless,colorless];
  }else if(printing==='Speed Lightning Energy RCL'){
    units=[lightning];
  }else if(printing==='Capture Energy RCL'||printing==='Spiky Energy JTG'){
    units=[colorless];
  }else if(printing.startsWith('Telepathic Psychic Energy ')){
    units=[catalog.basicEnergyTypes.Psychic];
  }else{
    return null;
  }
  return temple?[colorless]:units;
}

/**
 * Count one-unit future attachments to meet a native numeric attack cost.
 * A Special Energy supplies all applicable Energy units simultaneously.
 * Cost reductions, GX attacks and other continuous effects are excluded.
 * @param {number[]} cost Native numeric printed cost.
 * @param {number[]} provided Native numeric attached units.
 * @param {number} colorless Native COLORLESS value.
 * @returns {number}
 */
function missingEnergyUnits(cost,provided,colorless){
  assert.ok(Array.isArray(cost)&&Array.isArray(provided));
  const available=provided.slice();
  let missingColored=0;
  for(const symbol of cost){
    if(symbol===colorless)continue;
    const index=available.indexOf(symbol);
    if(index<0)missingColored++;
    else available.splice(index,1);
  }
  return Math.max(missingColored,cost.length-provided.length,0);
}

/**
 * Choose a bounded one-attachment Special Energy on an existing Active.
 * Printed attack cost is a heuristic, with native Store retaining legality.
 * The Telepathic on-attachment Bench search is deliberately not scored here.
 * @param {object} view Detached actorObservation for owner root.
 * @param {object} catalog Public print and numeric type catalog.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseSpecialEnergyIntent(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const active=view.ownPublic.active;
  if(!active)return null;
  const stadium=[...(view.ownPublic.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(p=>p.startsWith('Temple of Sinnoh '));
  const attached=[];
  const basicNames=Object.keys(catalog.basicEnergyTypes);
  for(const printing of active.energies){
    const special=specialEnergyUnits(printing,catalog,temple);
    if(special!==null){
      attached.push(...special);
      continue;
    }
    if(!catalog.basicEnergies.has(printing))continue;
    const typeName=basicNames.find(name=>
      printing.startsWith(name+' Energy '));
    if(typeName)attached.push(catalog.basicEnergyTypes[typeName]);
  }
  const attacks=active.attacks.filter(attack=>
    !attack.gxAttack&&Array.isArray(attack.cost));
  let best=null;
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    const units=specialEnergyUnits(printing,catalog,temple);
    if(units===null)continue;
    const costs=attacks.map(attack=>({
      before:missingEnergyUnits(attack.cost,attached,
        catalog.colorlessEnergyType),
      after:missingEnergyUnits(attack.cost,[...attached,...units],
        catalog.colorlessEnergyType)
    }));
    const minAfter=costs.length?Math.min(...costs.map(x=>x.after)):Infinity;
    const maxGain=costs.length?
      Math.max(...costs.map(x=>x.before-x.after)):0;
    if(best===null||minAfter<best.minAfter||
      (minAfter===best.minAfter&&maxGain>best.maxGain)){
      best={kind:'attach-special-energy',handIndex,printing,minAfter,maxGain};
    }
  }
  return best===null?null:{
    kind:best.kind,handIndex:best.handIndex,printing:best.printing
  };
}

module.exports={VERSION,specialEnergyUnits,missingEnergyUnits,
  chooseSpecialEnergyIntent};
