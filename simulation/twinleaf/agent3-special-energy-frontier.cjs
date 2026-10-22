'use strict';

const assert=require('node:assert/strict');

const VERSION='agent30-telepath-m3-native-special-energy-frontier-v5-perfection-public-donors';

/**
 * Bounded printed-text numeric model for four rank-6 Special Energy printings
 * and the New Moon candidate's native Telepath [P] Energy M3, the\n * engine equivalent of me3-88 Telepathic Psychic Energy.
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
  }else if(printing==='Telepath [P] Energy M3'){
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
 * Preserve Telepath Energy for a public Psychic attack channel and choose a
 * recipient with a real printed Psychic requirement. A cheap Colorless-only
 * attack on Unown or Duskull must not automatically consume the same
 * singleton Energy that could establish a Gengar or Trevenant response.
 * This is a deterministic owner-visible heuristic, not an attack certificate.
 *
 * @param {object} view Detached actor-only observation.
 * @param {object} catalog Exact printing and energy-type catalog.
 * @returns {{kind:string,handIndex:number,printing:string,
 *   slot:'active'|'bench',index:number}|null}
 */
function chooseTelepathPsychicRecipient(view,catalog){
  const telepath='Telepath [P] Energy M3';
  const handIndex=view.ownHand.indexOf(telepath);
  if(handIndex<0)return null;
  const p=catalog.basicEnergyTypes.Psychic;
  const colorless=catalog.colorlessEnergyType;
  const typeNames=Object.keys(catalog.basicEnergyTypes);
  const stadium=[...(view.ownPublic.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(name=>name.startsWith('Temple of Sinnoh '));
  const provided=specialEnergyUnits(telepath,catalog,temple);
  if(provided===null)return null;
  const slots=[
    {slot:'active',index:0,pokemon:view.ownPublic.active},
    ...(view.ownPublic.bench??[]).map((pokemon,index)=>({
      slot:'bench',index,pokemon
    }))
  ];
  const options=[];
  for(const target of slots){
    const pokemon=target.pokemon;
    if(!pokemon?.printed?.types?.includes(p))continue;
    const energies=[];
    let known=true;
    for(const printing of pokemon.energies??[]){
      const special=specialEnergyUnits(printing,catalog,temple);
      if(special!==null){energies.push(...special);continue;}
      if(!catalog.basicEnergies.has(printing)){known=false;break;}
      const name=typeNames.find(t=>printing.startsWith(t+' Energy '));
      if(name===undefined){known=false;break;}
      energies.push(catalog.basicEnergyTypes[name]);
    }
    if(!known)continue;
    // Perfection grants Mewtwo public donor attacks from its own Bench and
    // discard. Consider only verified catalog printings and currently usable
    // public Ability state; K0 deck and concealed Prize cards are irrelevant.
    let attacks=pokemon.attacks??[];
    if(target.slot==='active'&&pokemon.printing==='Mewtwo & Mew-GX UNM'&&
       catalog.perfectionDonors instanceof Map){
      const {publicPerfectionVeto}=
        require('./agent30-known-perfection-options.cjs');
      if(publicPerfectionVeto(view)===null){
        const sources=new Set([
          ...(view.ownPublic.discard??[]),
          ...(view.ownPublic.bench??[]).flatMap(p=>p?[p.printing]:[])
        ]);
        attacks=[...attacks,...[...catalog.perfectionDonors]
          .filter(([printing])=>sources.has(printing))
          .flatMap(([,donorAttacks])=>donorAttacks)];
      }
    }
    for(const attack of attacks){
      if(attack.gxAttack===true||!Array.isArray(attack.cost)||
          !attack.cost.includes(p))continue;
      const before=missingEnergyUnits(attack.cost,energies,colorless);
      const after=missingEnergyUnits(attack.cost,
        [...energies,...provided],colorless);
      if(before<=after)continue;
      options.push({...target,after,gain:before-after,
        attackCost:attack.cost.length});
    }
  }
  options.sort((a,b)=>a.after-b.after||
    (a.slot==='active'?0:1)-(b.slot==='active'?0:1)||
    b.gain-a.gain||a.attackCost-b.attackCost||a.index-b.index);
  const best=options[0];
  return best?{kind:'attach-special-energy',handIndex,
    printing:telepath,slot:best.slot,index:best.index}:null;
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
  const telepath=chooseTelepathPsychicRecipient(view,catalog);
  if(telepath)return telepath;
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
    // Telepath remains reserved if no typed Psychic attack channel exists.
    if(printing==='Telepath [P] Energy M3')continue;
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
    // A search-free Energy attachment must advance at least one printed
    // attack cost; otherwise reserve the resource for a later board state.
    if(maxGain===0)continue;
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
  chooseTelepathPsychicRecipient,chooseSpecialEnergyIntent};
