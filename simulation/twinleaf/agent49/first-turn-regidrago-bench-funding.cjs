'use strict';

const assert=require('node:assert/strict');
const VERSION='agent49-early-regidrago-bench-grass-funding-v1';

/**
 * On the observed rank-13 first turn, reserve a held Grass Energy on the
 * benched Regidrago V instead of putting it on an unfunded Active Dedenne-GX.
 * A Grass attachment supplies one unit toward future Regidrago VSTAR Apex
 * Dragon and one Colorless unit for Regidrago V's printed Celestial Roar.
 * This is a prospective owner-only preference, not a future-attack guarantee.
 *
 * @param {object} view Detached acting-player root.
 * @param {{basicEnergies:Set<string>}} catalog Exact physical printing index.
 * @returns {object|null} Native-neutral attachment intent.
 */
function chooseFirstRegidragoBenchGrass(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources??{};
  if(view.globalTurn!==1||
     own?.active?.name!=='Dedenne-GX'||
     resources.energyPlayLocked===true||
     own.publicTurnRestrictions?.energyPlayLocked===true||
     resources.energyPlayedTurn===view.globalTurn||
     !(catalog?.basicEnergies instanceof Set))return null;
  const index=view.ownHand.findIndex(printing=>
    printing.startsWith('Grass Energy ')&&
    catalog.basicEnergies.has(printing));
  if(index<0)return null;
  const benchIndex=(own.bench??[]).findIndex(pokemon=>
    pokemon?.name==='Regidrago V'&&
    pokemon.printing==='Regidrago V SIT'&&
    (pokemon.energies??[]).length===0&&
    (pokemon.attacks??[]).some(attack=>
      attack.name==='Celestial Roar'));
  if(benchIndex<0)return null;
  return {
    kind:'attach-basic-energy',
    handIndex:index,printing:view.ownHand[index],
    slot:'bench',index:benchIndex,
    source:VERSION,
    futurePrintedAttack:'Celestial Roar',
    sourceVisible:true,
    provisionalNextTurnFunding:true
  };
}
module.exports={VERSION,chooseFirstRegidragoBenchGrass};
