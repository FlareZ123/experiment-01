'use strict';

const VERSION='agent12-thorns-bench-mimikyu-jet-reservation-v1';
const THORNS='Iron Thorns ex TWM';
const MIMIKYU='Mimikyu PAL';
const JET='Jet Energy PAL';

/**
 * Preserve the only held Jet pivot when the actor's own Basic Psychic is
 * not yet attached to an established Benched Mimikyu. Specific to the
 * publicly visible Iron Thorns mirror and a not-currently-attack-funding
 * Jet offer to active Iron Thorns. No hidden, opponent-hand or deck reads.
 *
 * This is a priority *veto* over one developmental actor decision;
 * the existing priority chooser continues down its remaining branches.
 * Native Store judges any chosen subsequent action.
 *
 * @param {object} view Frozen actor-own hand and public board observation.
 * @param {object|null} intent Public-context special-energy proposal.
 * @returns {boolean} True only when reserving the particular proposed Jet.
 */
function shouldReserveThornsJet(view,intent){
  if(view?.decisionKind!=='owner-root'||
     intent?.kind!=='attach-special-energy'||intent.printing!==JET||
     intent.slot!=='active')return false;
  const own=view.ownPublic,opp=view.opponentPublic;
  if(own?.active?.printing!==THORNS||opp?.active?.printing!==THORNS)
    return false;
  const bench=(own.bench??[]).find(p=>p?.printing===MIMIKYU);
  if(!bench)return false;
  if((bench.energies??[]).some(p=>
     typeof p==='string'&&p.startsWith('Psychic Energy ')))return false;
  const activeEnergy=own.active.energies??[];
  // A card on a one-card board cannot finish a three-unit Volt Cyclone
  // with one Jet, even if the existing card provides two Colorless units:
  // the Lightning symbol would still be unpaid in that case.
  if(activeEnergy.length>1)return false;
  // This veto is deliberately limited to one observed public matchup,
  // and must never be confused with a complete attack-cost legality test.
  return true;
}
module.exports={VERSION,THORNS,MIMIKYU,JET,shouldReserveThornsJet};
