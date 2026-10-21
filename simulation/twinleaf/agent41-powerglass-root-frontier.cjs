'use strict';

const VERSION='agent41-owner-visible-powerglass-root-v1';

/**
 * Prepare a future copied Psychic attack using only a detached acting player's
 * hand, face-up board and discard. This is an opportunity condition: the
 * pinned Store alone determines whether the Tool is legal, whether the
 * end-turn attachment happens, and whether a later attack can be used.
 *
 * @param {object} view Detached actorObservation for a normal owner root.
 * @param {{basicEnergies:ReadonlySet<string>}} catalog Public card metadata.
 * @returns {{kind:'equip-powerglass',handIndex:number,printing:string}|null}
 */
function choosePowerglassRootIntent(view,catalog){
  if(view.decisionKind!=='owner-root')return null;
  const own=view.ownPublic,active=own?.active;
  if(active?.printing!=='Mewtwo & Mew-GX UNM'||
     (active.tools??[]).length!==0||
     view.ownTurnResources?.toolPlayLocked===true||
     own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const sources=[...(own.bench??[]).map(p=>p?.printing),...(own.discard??[])];
  if(!sources.includes('Gengar & Mimikyu-GX TEU'))return null;
  if(!(own.discard??[]).some(p=>catalog.basicEnergies.has(p)&&
     p.startsWith('Psychic Energy ')))return null;
  const handIndex=view.ownHand.findIndex(p=>p.startsWith('Powerglass SFA'));
  return handIndex<0?null:{
    kind:'equip-powerglass',handIndex,printing:view.ownHand[handIndex]
  };
}

module.exports={VERSION,choosePowerglassRootIntent};
