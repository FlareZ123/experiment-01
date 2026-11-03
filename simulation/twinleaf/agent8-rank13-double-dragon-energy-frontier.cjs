'use strict';

const assert=require('node:assert/strict');

const VERSION='agent8-rank13-owned-regidrago-double-dragon-energy-v1';
const ENERGY='Double Dragon Energy ROS';
const REGIDRAGO=new Set(['Regidrago V SIT','Regidrago VSTAR SIT']);

/**
 * The original printed Double Dragon Energy can be attached to a Dragon
 * Pokémon and provides two units of every Energy type there. This narrow
 * development root chooses a Regidrago receiver from its PUBLIC zone only.
 * No hidden deck/Prize contents and no future winning claim are consulted.
 * Native Store is final authority over attachment and continuous effects.
 *
 * @param {object} view Frozen detached own-actor decision root.
 * @returns {object|null}
 */
function chooseRank13DoubleDragonRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,turn=view.globalTurn;
  const resources=view.ownTurnResources;
  if(!own||!Number.isSafeInteger(turn)||
     resources?.energyPlayLocked===true||
     resources?.specialEnergyPlayLocked===true||
     resources?.energyPlayedTurn===turn)return null;
  const held=view.ownHand.indexOf(ENERGY);
  if(held<0)return null;
  // Temple removes the two multicolored units while in play. Do not claim
  // that a Temple-affected attachment has paid Regidrago's attack cost.
  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(p=>p.startsWith('Temple of Sinnoh ')))return null;
  const candidates=[{pokemon:own.active,slot:'active',index:0},
    ...(own.bench??[]).map((pokemon,index)=>({
      pokemon,slot:'bench',index
    }))].filter(x=>REGIDRAGO.has(x.pokemon?.printing))
    .map(x=>({...x,attached:x.pokemon.energies??[],
      vstar:x.pokemon.printing==='Regidrago VSTAR SIT'}))
    .filter(x=>x.attached.filter(p=>p===ENERGY).length<2);
  if(!candidates.length)return null;
  // Existing first DDE gets priority so the second goes to the same
  // physical Pokémon. Within that criterion prefer an evolved VSTAR.
  candidates.sort((a,b)=>
    b.attached.filter(p=>p===ENERGY).length-
      a.attached.filter(p=>p===ENERGY).length||
    Number(b.vstar)-Number(a.vstar)||
    (a.slot==='active'?0:1)-(b.slot==='active'?0:1)||
    a.index-b.index);
  const chosen=candidates[0];
  return {kind:'attach-special-energy',handIndex:held,
    printing:ENERGY,slot:chosen.slot,index:chosen.index,
    receiver:chosen.pokemon.printing,
    previousDdeCount:chosen.attached.filter(p=>p===ENERGY).length,
    source:VERSION,ownerVisible:true,
    nativeLegalAndPayoffUnverified:true};
}
module.exports={VERSION,ENERGY,REGIDRAGO,chooseRank13DoubleDragonRoot};
