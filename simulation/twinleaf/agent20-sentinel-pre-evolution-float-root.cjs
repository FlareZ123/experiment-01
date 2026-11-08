'use strict';

const VERSION='agent20-sentinel-v2-owner-pre-evolution-float-plan-v1';
const FLOAT='Float Stone BKT';
const ODDISH='Oddish UNB';
const BUNNELBY='Bunnelby PRC';
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';

/**
 * Propose proactive Float Stone on the actual Benched Oddish before
 * Bunnelby's double TM: Evolution attack establishes Vileplume.
 *
 * Source-specific, intentionally conditional. A Float Stone Tool on that
 * evolved Vileplume later permits free Retreat following a surviving Gust.
 * The caller must submit the proposed action to native Store for final legal
 * validation. This function sees only the acting owner's detached hand
 * and the public board, never hidden deck or Prize identities.
 *
 * @param {object} view Detached actorObservation of current actor.
 * @returns {{kind:string,handIndex:number,benchIndex:number,
 *   printing:string,targetPrinting:string,reason:string}|null}
 */
function chooseSentinelPreEvolutionFloat(view){
  if(view?.decisionKind!=='owner-root'||view.globalTurn!==2||
    !Array.isArray(view.ownHand))return null;
  const own=view.ownPublic;
  const turn=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.bench)||!turn||
    own.active.printing!==BUNNELBY||
    !own.active.tools?.includes(TM)||
    !own.active.energies?.includes(JET)||
    turn.toolPlayLocked!==false||
    own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const handIndex=view.ownHand.indexOf(FLOAT);
  if(handIndex<0)return null;
  const benchIndex=own.bench.findIndex(pokemon=>
    pokemon?.printing===ODDISH&&
    Array.isArray(pokemon.tools)&&pokemon.tools.length===0);
  if(benchIndex<0)return null;
  return {
    kind:'attach-sentinel-pre-evolution-float',
    handIndex,benchIndex,
    printing:FLOAT,targetPrinting:ODDISH,
    reason:'preserve-zero-cost-vileplume-after-gust'
  };
}

module.exports={VERSION,FLOAT,ODDISH,BUNNELBY,TM,JET,
  chooseSentinelPreEvolutionFloat};
