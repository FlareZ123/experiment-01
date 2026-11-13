'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {effectiveNativeAttackCost,publicCostSymbols}=
  require('./agent17-public-context-special-energy.cjs');

const MIMIKYU='Mimikyu GRI';
const KNOWN_STADIUM_PREFIXES=[
  'Dimension Valley ',
  'Thunder Mountain Prism Star ',
  'Wondrous Labyrinth Prism Star ',
  'Path to the Peak ',
  'Sky Field ',
  'PokéStop ',
  'Silent Lab ',
  'Temple of Sinnoh '
];

/**
 * Determine whether the owner's physical Mimikyu can pay its printed Copycat
 * attack under the current public Stadium. This deliberately handles only
 * Basic Psychic Energy attachments, the exact Shadow Rider 60's Energy pool.
 * Unknown Stadiums, unknown attached Energy and unsupported cost symbols
 * return unknown rather than a false positive.
 *
 * @param {object} state Native Twinleaf State.
 * @param {object} player Actual acting owner.
 * @param {0|1} seat Owner physical seat.
 * @param {{slot?:'active'|'bench',index?:number}} [where]
 * @returns {{status:'payable'|'not-payable'|'unknown',required?:number,
 *   attached?:number,stadium?:string|null,costSymbols?:string[],reason?:string}}
 */
function mimikyuCopycatReadiness(state,player,seat,{slot='bench',index=0}={}){
  if(![0,1].includes(seat)||state.players[seat]?.id!==player?.id){
    return {status:'unknown',reason:'wrong-owner-seat'};
  }
  if(slot!=='active'&&slot!=='bench'){
    return {status:'unknown',reason:'unsupported-slot'};
  }
  const physicalSlot=slot==='active'?player.active:player.bench[index];
  const view=actorObservation(state,seat);
  const pokemon=slot==='active'?view.ownPublic.active:view.ownPublic.bench[index];
  if(!physicalSlot||!pokemon||pokemon.printing!==MIMIKYU){
    return {status:'unknown',reason:'physical-mimikyu-not-at-location'};
  }
  const attack=pokemon.attacks?.find(row=>row.name==='Copycat');
  if(!Array.isArray(attack?.cost)){
    return {status:'unknown',reason:'copycat-cost-unavailable'};
  }
  const stadiums=[...(view.ownPublic.stadium??[]),
    ...(view.opponentPublic.stadium??[])];
  if(stadiums.length>1){
    return {status:'unknown',reason:'multiple-public-stadiums'};
  }
  const stadium=stadiums[0]??null;
  if(stadium!==null&&!KNOWN_STADIUM_PREFIXES.some(prefix=>
      stadium.startsWith(prefix))){
    return {status:'unknown',reason:'unmodeled-stadium',stadium};
  }

  const {CardType,EnergyType}=require(path.join(OUTPUT,
    'game/store/card/card-types'));
  const {EnergyCard}=require(path.join(OUTPUT,'game/store/card/energy-card'));
  const catalog={
    basicEnergyTypes:{
      Lightning:CardType.LIGHTNING,
      Psychic:CardType.PSYCHIC,
      Fairy:CardType.FAIRY
    },
    colorlessEnergyType:CardType.COLORLESS
  };
  const effectiveCost=effectiveNativeAttackCost(view,catalog,pokemon,attack);
  if(!Array.isArray(effectiveCost)||
      effectiveCost.some(type=>type!==CardType.PSYCHIC&&
        type!==CardType.COLORLESS)){
    return {status:'unknown',reason:'unsupported-effective-copycat-cost',stadium};
  }

  const attachedCards=physicalSlot.energies.cards;
  if(attachedCards.some(card=>!(card instanceof EnergyCard)||
      card.energyType!==EnergyType.BASIC||
      !card.provides.includes(CardType.PSYCHIC))){
    return {status:'unknown',reason:'non-basic-psychic-attached-energy',stadium};
  }
  const symbols=publicCostSymbols(effectiveCost,catalog);
  if(symbols===null||symbols.some(symbol=>symbol!=='P'&&symbol!=='C')){
    return {status:'unknown',reason:'unmapped-effective-copycat-cost',stadium};
  }
  const required=effectiveCost.length;
  const attached=attachedCards.length;
  return {
    status:attached>=required?'payable':'not-payable',
    required,attached,stadium,costSymbols:symbols
  };
}

module.exports={MIMIKYU,KNOWN_STADIUM_PREFIXES,mimikyuCopycatReadiness};
