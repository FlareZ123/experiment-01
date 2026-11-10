'use strict';
const assert=require('node:assert/strict');
const {chooseFogPrinting,withActorFogCrystalPrompt}=
  require('../agent9-fog-actor-prompt.cjs');

const GENGAR='Gengar & Mimikyu-GX TEU';
const MEWTWO='Mewtwo & Mew-GX UNM';

/**
 * Preserve a genuinely payable early Horror House-GX / Perfection line.
 * A live owner Fog Crystal search can find a single Basic Psychic Energy.
 * Giving the only search to a third Basic Pokémon with no Energy in hand
 * consumes the action needed to fund an already-present attacking Pokémon.
 * The native Store still checks legal prompt selection and later attachment.
 *
 * @param {object} view Detached acting owner's current authorized Fog prompt.
 * @param {{printing:string,permitted:boolean,psychicEnergy:boolean,basicPsychic:boolean}[]} offered
 *   Exact native deck cards offered only after an owner-authorized search.
 * @returns {string|null} Exact valid printing, or the existing fallback.
 */
function chooseEarlyGengarPsychicEnergy(view,offered){
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  assert.ok(Array.isArray(offered));
  const active=view.ownPublic.active;
  const activeGengar=active?.printing===GENGAR;
  const activeMewtwo=active?.printing===MEWTWO &&
    view.ownPublic.bench.some(slot=>slot?.printing===GENGAR);
  const canStillAttach=view.ownTurnResources.energyPlayedTurn!==
    view.globalTurn && view.ownTurnResources.energyPlayLocked!==true;
  const alreadyEnergy=active?.energies?.length>0;
  const heldBasicPsychic=view.ownHand.some(printing=>
    printing.startsWith('Psychic Energy '));
  if((activeGengar||activeMewtwo)&&canStillAttach&&
      !alreadyEnergy&&!heldBasicPsychic){
    const found=offered.find(row=>row.permitted&&row.psychicEnergy);
    if(found)return found.printing;
  }
  return chooseFogPrinting(view,offered);
}

/** @param {()=>unknown} run Native synchronous actor Store execution. */
function withEarlyGengarFogPsychicEnergy(run,deps={}){
  return withActorFogCrystalPrompt(run,{
    ...deps,choosePrinting:chooseEarlyGengarPsychicEnergy
  });
}
module.exports={GENGAR,MEWTWO,chooseEarlyGengarPsychicEnergy,
  withEarlyGengarFogPsychicEnergy};
