'use strict';
const assert=require('node:assert/strict');
const {TYPES,energyUnits,canPaySymbols}=
  require('./actor-energy-payability.cjs');

const SYMBOLS=Object.freeze({
  Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',
  Fighting:'F',Darkness:'D',Metal:'M',Fairy:'Y'
});
const VERSION='agent17-public-context-special-energy-intent-v2-stadium-cost';

/**
 * Translate the public attack's native cost into the independently tested
 * flexible-unit matcher. Unsupported native enums fail closed.
 * @param {number[]} cost Native public printed attack cost
 * @param {object} catalog Public printed type mapping
 * @returns {string[]|null}
 */
function publicCostSymbols(cost,catalog){
  if(!Array.isArray(cost))return null;
  const byNumber=new Map([[catalog.colorlessEnergyType,'C']]);
  for(const [name,symbol] of Object.entries(SYMBOLS)){
    if(catalog.basicEnergyTypes[name]!==undefined){
      byNumber.set(catalog.basicEnergyTypes[name],symbol);
    }
  }
  const result=cost.map(type=>byNumber.get(type));
  return result.every(type=>typeof type==='string')?result:null;
}


/**
 * Return the numeric printed cost after only recognized public Stadium
 * reductions. The resulting array is independent of the card's stored
 * immutable printed cost. Unknown modifiers remain outside this model.
 * @param {object} view Detached acting-player observation
 * @param {object} catalog Public native type catalog
 * @param {object} pokemon Public active or Bench slot
 * @param {object} attack Its public printed attack
 * @returns {number[]|null}
 */
function effectiveNativeAttackCost(view,catalog,pokemon,attack){
  if(!Array.isArray(attack?.cost))return null;
  const cost=attack.cost.slice();
  const stadium=[...(view.ownPublic?.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.some(p=>p.startsWith('Thunder Mountain Prism Star '))&&
      pokemon?.printed?.types?.includes(catalog.basicEnergyTypes.Lightning)){
    const i=cost.indexOf(catalog.basicEnergyTypes.Lightning);
    if(i>=0)cost.splice(i,1);
  }
  if(stadium.some(p=>p.startsWith('Dimension Valley '))&&
      pokemon?.printed?.types?.includes(catalog.basicEnergyTypes.Psychic)){
    const i=cost.indexOf(catalog.colorlessEnergyType);
    if(i>=0)cost.splice(i,1);
  }
  // Wondrous Labyrinth Prism Star raises every non-Fairy attack cost by
  // one Colorless. A printed Fairy type is needed for the exemption;
  // missing public type metadata must not certify a false payable attack.
  if(stadium.some(p=>p.startsWith('Wondrous Labyrinth '))){
    const types=pokemon?.printed?.types;
    if(!Array.isArray(types)||
       !Number.isSafeInteger(catalog.basicEnergyTypes?.Fairy))
      return null;
    if(!types.includes(catalog.basicEnergyTypes.Fairy))
      cost.push(catalog.colorlessEnergyType);
  }
  return cost;
}

/**
 * Translate the same public effective native cost to flexible energy symbols
 * used by special Energy payability. Shared numeric/symbolic reductions
 * prevent inconsistent first-choice action and attachment-gain proposals.
 * @param {object} view Detached acting-player observation
 * @param {object} catalog Public native type catalog
 * @param {object} pokemon Public active or Bench slot
 * @param {object} attack Its public printed attack
 * @returns {string[]|null}
 */
function effectivePublicAttackCost(view,catalog,pokemon,attack){
  return publicCostSymbols(effectiveNativeAttackCost(
    view,catalog,pokemon,attack),catalog);
}

/**
 * Conservative public attached-Energy context: Reversal's extra units are
 * never assumed without a separately verified no-Rule-Box fact. GX/EX
 * classification is narrower because Counter Energy checks only those
 * two printed names. Dragon identity comes from public catalog metadata.
 * @param {object} view Detached actor view
 * @param {object} pokemon Face-up public slot
 * @param {object} catalog Public static print catalog
 * @returns {object}
 */
function publicEnergyContext(view,pokemon,catalog){
  const stage=pokemon?.printed?.stage;
  const isBasic=stage===catalog.stages?.BASIC;
  const profile=catalog.publicPokemonProfileIndex instanceof Map?
    require('./agent10-original-printing-energy-flags.cjs')
      .visiblePrintedProfile(catalog.publicPokemonProfileIndex,
        pokemon.printing):null;
  return {
    isBasic,
    isEvolution:profile?.isEvolution??
      (stage!==undefined&&stage!==null&&!isBasic),
    isDragon:catalog.dragonPokemonPrintings instanceof Set&&
      catalog.dragonPokemonPrintings.has(pokemon.printing),
    // Unknown printings stay conservative; exactly matched public
    // no-Rule-Box Stage 1 printings may receive Reversal's extra units.
    hasRuleBox:profile?.hasRuleBox??true,
    behindOnPrizes:typeof view.ownPublic?.prizeCount==='number'&&
      typeof view.opponentPublic?.prizeCount==='number'&&
      view.ownPublic.prizeCount>view.opponentPublic.prizeCount,
    // Counter's expanded value requires a confirmed non-GX/non-EX
    // printing; ordinary card names do not certify the exact rules box.
    isPokemonGXorEX:profile===null?undefined:
      profile.isPokemonGX||profile.isPokemonEX
  };
}

/**
 * Find the number of hypothetical one-unit flexible future attachments
 * needed to pay this cost. Used only to compare immediate progress;
 * does not claim those future Energy cards exist in the player's deck.
 * @param {string[]} cost
 * @param {string[][]} units
 * @returns {number}
 */
function futureOneUnitDeficit(cost,units){
  for(let missing=0;missing<=cost.length;missing++){
    const extras=Array.from({length:missing},()=>TYPES);
    if(canPaySymbols(cost,[...units,...extras]))return missing;
  }
  return cost.length;
}

/**
 * Check visible printed attack costs using flexible attached Energy units.
 * Native Store remains the final legality authority.
 * @param {object} view
 * @param {object} catalog
 * @param {object} pokemon
 * @param {object} attack
 * @returns {boolean}
 */
function publicSpecialAttackPayable(view,catalog,pokemon,attack){
  const cost=effectivePublicAttackCost(view,catalog,pokemon,attack);
  if(cost===null)return false;
  const stadium=[...(view.ownPublic.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(p=>p.startsWith('Temple of Sinnoh '));
  const context=publicEnergyContext(view,pokemon,catalog);
  const attached=[];
  for(const printing of pokemon.energies??[]){
    const units=temple&&catalog.specialEnergies.has(printing)?
      [['C']]:energyUnits(printing,context);
    if(units===null)return false;
    attached.push(...units);
  }
  return canPaySymbols(cost,attached);
}

/**
 * Choose one owner-hand Special Energy and legal-looking public recipient.
 * Native Store remains the only authority on target validity and effects.
 * This opt-in does not use any deck identities, Prize identities or
 * opponent concealed cards; it may skip strategically useful attachments.
 * @param {object} view Frozen detached actorObservation
 * @param {object} catalog Public print catalog
 * @returns {object|null}
 */
function choosePublicContextSpecialEnergy(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const temple=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .some(p=>p.startsWith('Temple of Sinnoh '));
  const targets=[
    {slot:'active',index:0,pokemon:own.active},
    ...(own.bench??[]).map((pokemon,index)=>({slot:'bench',index,pokemon}))
  ];
  const candidates=[];
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    if(!catalog.specialEnergies?.has(printing))continue;
    for(const target of targets){
      const pokemon=target.pokemon;
      if(!pokemon)continue;
      const context=publicEnergyContext(view,pokemon,catalog);
      // Temple only suppresses effects of Special Energy once attached.
      // Double Dragon's from-hand Dragon attachment restriction remains.
      if(printing.startsWith('Double Dragon Energy ')&&
          !context.isDragon)continue;
      // Jet's Bench switching effect is suppressed under Temple.
      // Without Temple, leave this mandatory switch to a dedicated plan.
      if(printing.startsWith('Jet Energy ')&&
          target.slot==='bench'&&!temple)continue;
      const added=temple?[['C']]:energyUnits(printing,context);
      if(added===null)continue;
      const attached=[];
      let allKnown=true;
      for(const known of pokemon.energies??[]){
        const more=temple&&catalog.specialEnergies.has(known)?
          [['C']]:energyUnits(known,context);
        if(more===null){allKnown=false;break;}
        attached.push(...more);
      }
      if(!allKnown)continue;
      for(const attack of pokemon.attacks??[]){
        if(attack.gxAttack===true||attack.name?.endsWith('-GX'))continue;
        const cost=effectivePublicAttackCost(view,catalog,pokemon,attack);
        if(cost===null||cost.length===0)continue;
        const before=futureOneUnitDeficit(cost,attached);
        const after=futureOneUnitDeficit(cost,[...attached,...added]);
        if(before<=after)continue;
        candidates.push({
          kind:'attach-special-energy',printing,handIndex,
          slot:target.slot,index:target.index,gain:before-after,
          deficit:after
        });
      }
    }
  }
  candidates.sort((a,b)=>a.deficit-b.deficit||
    b.gain-a.gain||
    (a.slot==='active'?0:1)-(b.slot==='active'?0:1)||
    a.handIndex-b.handIndex||a.index-b.index);
  const best=candidates[0];
  if(!best)return null;
  const {kind,printing,handIndex,slot,index}=best;
  return {kind,printing,handIndex,slot,index};
}

module.exports={VERSION,publicCostSymbols,effectiveNativeAttackCost,effectivePublicAttackCost,publicEnergyContext,
  futureOneUnitDeficit,choosePublicContextSpecialEnergy,
  publicSpecialAttackPayable};
