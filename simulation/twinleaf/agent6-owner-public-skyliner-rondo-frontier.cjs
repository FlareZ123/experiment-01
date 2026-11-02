'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent6-owner-public-skyliner-rondo-mobility-v3-public-ability-lock-veto';

/**
 * Offer a public nominal Prize attack, using a zero-cost Skyliner retreat
 * into funded JTG Clefairy. The acting owner can see its own board, attacks,
 * Energy and its opponent's face-up target and Bench size. Do not infer a
 * real KO if a print's HP, damage or other modifiers are unknown.
 *
 * The first proven source ALS uses Active uncharged Latias; the second uses
 * Active Mimikyu GRI with one Telepath [P] Energy and Latias on the Bench.
 * Native Store ultimately adjudicates Ability suppression, actual retreat
 * cost, attack damage, prevention, retaliation and Knock Outs. These
 * restraints intentionally keep this an exact-printing experimental root.
 *
 * @param {object} view Deeply frozen authenticated actor owner-root view.
 * @param {object} catalog Public native basic Energy/status metadata.
 * @returns {{kind:'skyliner-rondo-retreat',benchIndex:number,
 *   printing:string,attackName:string,estimatedBaseDamage:number,
 *   nominalPrizeOpportunity:true,reason:string}|null}
 */
function chooseOwnerSkylinerRondoRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  if(view.globalTurn===1||!active||!Array.isArray(own.bench)||!r||
     r.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(s=>
       s===catalog.specialConditions.ASLEEP||
       s===catalog.specialConditions.PARALYZED))return null;
  const latias=slot=>slot?.printing==='Latias ex SSP'&&
    slot.abilities?.includes('Skyliner');
  if(!latias(active)&&!own.bench.some(latias))return null;
  // Printed abilities in actor observations remain listed even when a
  // publicly known lock makes their effects inactive. This conservative
  // gate avoids proposing Skyliner-based free Retreat under those locks.
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.some(p=>p.startsWith('Path to the Peak ')))return null;
  const opponent=view.opponentPublic;
  if(opponent?.active?.printing==='Iron Thorns ex TWM'&&
     opponent.active.abilities?.includes('Initialization'))return null;
  const opponentPokemon=[opponent?.active,...(opponent?.bench??[])];
  if(opponentPokemon.some(p=>p?.abilities?.includes('Garbotoxin')&&
     Array.isArray(p.tools)&&p.tools.length>0))return null;

  if(!Array.isArray(active.energies))return null;
  const unchargedLatias=active.printing==='Latias ex SSP'&&
    active.energies.length===0;
  const filchMimikyu=active.printing==='Mimikyu GRI'&&
    active.energies.length===1&&
    active.energies[0]==='Telepath [P] Energy M3';
  if(!unchargedLatias&&!filchMimikyu)return null;
  if(active.attacks?.some(a=>Number.isSafeInteger(a.damage)&&a.damage>0&&
    paysWithBasics(active,a,catalog)))return null;

  const enemy=view.opponentPublic?.active;
  if(!Number.isSafeInteger(enemy?.hp)||enemy.hp<=0||
     !Number.isSafeInteger(enemy.damage)||enemy.damage<0||
     !Array.isArray(view.opponentPublic?.bench))return null;
  const benchCount=own.bench.filter(Boolean).length+
    view.opponentPublic.bench.filter(Boolean).length;
  const base=20+20*benchCount;
  // Damage-preventing effects and Weakness remain native Store questions.
  // Requiring a public no-Weakness nominal KO gives a useful lower-bound
  // opportunity where positive attack value exceeds a draw-only Filch.
  if(base<enemy.hp-enemy.damage)return null;

  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(pokemon?.printing!=="Lillie's Clefairy ex JTG"||
       !Array.isArray(pokemon.energies)||
       pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(s=>
         s===catalog.specialConditions.ASLEEP||
         s===catalog.specialConditions.PARALYZED))continue;
    const rondo=pokemon.attacks?.find(a=>a.name==='Full Moon Rondo');
    if(!rondo||!paysWithBasics(pokemon,rondo,catalog))continue;
    return {kind:'skyliner-rondo-retreat',benchIndex,
      printing:pokemon.printing,attackName:rondo.name,
      estimatedBaseDamage:base,nominalPrizeOpportunity:true,
      reason:'owner-public-skyliner-funded-rondo-nominal-active-ko'};
  }
  return null;
}

module.exports={VERSION,chooseOwnerSkylinerRondoRetreat};
