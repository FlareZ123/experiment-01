'use strict';
const assert=require('node:assert/strict');
const VERSION='agent5-rank13-source-owned-grass-bench-first-own-turn-v1';
const REGIDRAGO=new Set(['Regidrago V SIT','Regidrago VSTAR SIT']);

/**
 * Use the owner's actual held Basic Grass Energy to fund its established
 * Benched Regidrago on its first own turn, including a second-seat T2.
 * This changes a real hand attachment with no hidden deck information.
 *
 * @param {object} view Actor's detached own-root view
 * @param {{basicEnergies:Set<string>}} catalog Native printed card index
 * @returns {object|null} Native-neutral physical Energy attachment
 */
function chooseSourceFirstOwnGrass(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources??{};
  const firstOwn=view.globalTurn===1&&view.actorSeat===0||
    view.globalTurn===2&&view.actorSeat===1;
  if(!firstOwn||!own?.active||
     REGIDRAGO.has(own.active.printing)||
     r.energyPlayLocked===true||
     own.publicTurnRestrictions?.energyPlayLocked===true||
     r.energyPlayedTurn===view.globalTurn||
     !(catalog?.basicEnergies instanceof Set))return null;
  const handIndex=(view.ownHand??[]).findIndex(p=>
    p.startsWith('Grass Energy ')&&catalog.basicEnergies.has(p));
  if(handIndex<0)return null;
  const options=(own.bench??[]).map((pokemon,index)=>({
    pokemon,index,
    grassCount:(pokemon?.energies??[])
      .filter(e=>e.startsWith('Grass Energy ')).length
  })).filter(x=>REGIDRAGO.has(x.pokemon?.printing)&&
    x.grassCount<2);
  if(!options.length)return null;
  options.sort((a,b)=>b.grassCount-a.grassCount||a.index-b.index);
  return {kind:'attach-basic-energy',handIndex,
    printing:view.ownHand[handIndex],slot:'bench',
    index:options[0].index,source:VERSION,
    sourceVisible:true,futurePrintedAttack:'Apex Dragon',
    nativePaymentUnverified:true};
}
module.exports={VERSION,chooseSourceFirstOwnGrass};
