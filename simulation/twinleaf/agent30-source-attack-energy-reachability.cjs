'use strict';

const assert=require('node:assert/strict');
const VERSION='agent30-source-attack-energy-reachability-v1';
const TYPES=new Set(['Grass','Fire','Water','Lightning','Psychic',
  'Fighting','Darkness','Metal','Fairy','Colorless']);
const COLORLESS_SINGLE=new Set(['Capture Energy','Jet Energy',
  'Memory Energy','Powerful Colorless Energy','Spiky Energy',
  'Recycle Energy']);
const ANY_SINGLE=new Set(['Rainbow Energy','Aurora Energy']);

/**
 * Source-print roster Energy name → direct units for a specific Pokémon.
 * Unknown Special Energy must never become a known negative proof.
 * Effects elsewhere that modify attacks, attachments or card text are out
 * of scope; this is an ordinary printed-attack funding upper envelope.
 * @param {string} name English source-roster Energy card name.
 * @param {{types:string[],stage:string}} pokemon Exact target printing.
 * @returns {string[]|null} null when this type of Energy is unsupported.
 */
function directUnits(name,pokemon){
  assert.ok(Array.isArray(pokemon.types));
  const base=name.match(/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/);
  if(base)return [base[1]];
  if(COLORLESS_SINGLE.has(name))return ['Colorless'];
  if(ANY_SINGLE.has(name))return ['ANY'];
  if(name==='Double Colorless Energy')return ['Colorless','Colorless'];
  if(name==='Prism Energy')return pokemon.stage==='Basic'?['ANY']:['Colorless'];
  if(name==='Double Dragon Energy')return pokemon.types.includes('Dragon')?
    ['ANY','ANY']:[];
  if(name==='Telepathic Psychic Energy')return ['Psychic'];
  if(name==='Speed Lightning Energy')return ['Lightning'];
  if(name==='Unit Energy LPM')return ['LPM'];
  return null;
}

/**
 * Assess necessary direct Energy sufficiency using full physical copies,
 * assuming they can eventually be attached normally to the one attacker.
 * Coloured attack costs consume distinct units; all other types pay [C].
 * Not a playable-line, timing, prize-availability, or win-rate estimate.
 * @param {{types:string[],stage:string}} pokemon
 * @param {string[]} printedCost
 * @param {{name:string,count:number}[]} sourceEnergyCopies
 * @returns {{status:'POSSIBLE'|'IMPOSSIBLE'|'UNVERIFIED',unknownEnergy:string[],knownUnits:number,reason:string}}
 */
function assessDirectEnergy(pokemon,printedCost,sourceEnergyCopies){
  assert.ok(pokemon&&Array.isArray(pokemon.types)&&
    ['Basic','Stage 1','Stage 2','VMAX','VSTAR'].includes(pokemon.stage));
  assert.ok(Array.isArray(printedCost)&&printedCost.every(x=>TYPES.has(x)));
  assert.ok(Array.isArray(sourceEnergyCopies));
  const units=[];
  const unknown=[];
  for(const row of sourceEnergyCopies){
    assert.equal(typeof row.name,'string');
    assert.ok(Number.isSafeInteger(row.count)&&row.count>=0);
    const contribution=directUnits(row.name,pokemon);
    if(contribution===null){if(row.count>0)unknown.push(row.name);continue;}
    for(let c=0;c<row.count;c++)units.push(...contribution);
  }
  const colored=printedCost.filter(t=>t!=='Colorless');
  const occupied=new Set();
  function match(i){
    if(i===colored.length)return true;
    for(let j=0;j<units.length;j++){
      if(occupied.has(j)||!(units[j]===colored[i]||units[j]==='ANY'||
        (units[j]==='LPM'&&['Lightning','Psychic','Metal'].includes(colored[i]))))continue;
      occupied.add(j);
      if(match(i+1))return true;
      occupied.delete(j);
    }
    return false;
  }
  const sufficient=units.length>=printedCost.length&&match(0);
  return {
    status:sufficient?'POSSIBLE':unknown.length?'UNVERIFIED':'IMPOSSIBLE',
    unknownEnergy:unknown,knownUnits:units.length,
    reason:sufficient?'known-energy-funding-exists':
      unknown.length?'unmodeled-energy-provider':'known-deck-energy-cannot-pay-printed-cost'
  };
}

module.exports={VERSION,directUnits,assessDirectEnergy};
