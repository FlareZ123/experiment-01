'use strict';

const assert=require('node:assert/strict');

const VERSION='agent5-owner-visible-marshadow-unb-counterchain-v1';
const MARSHADOW='Marshadow UNB';
const SHADOW='Shadow Rider Calyrex V CRE';
const FOG='Fog Crystal CRE';
const FLOAT='Float Stone BKT';
const ENERGY='Psychic Energy SVE';
const THUNDER='Thunder Mountain Prism Star LOT';
const THORNS='Iron Thorns ex TWM';
const COMPETING_STADIUMS=new Set(['Sky Field ROS','Dimension Valley PHF']);

/**
 * A very narrow, fail-closed original rank1 anti-rank6/24/29 development
 * sequence. Each root decision sees one detached owner-hand plus face-up
 * public board only. No source hand/deck, own concealed deck or Prize
 * identity, opponent hidden hand, known seed or future action is inspected.
 *
 * Source driver must still compare the line's opportunity cost against
 * attacking, Stadium replacement and later search chains; this tactic is
 * opt-in and is not a competitively qualified bot.
 *
 * @param {object} view Native actorObservation detached owner-root snapshot.
 * @returns {{kind:string,handIndex?:number,benchIndex?:number,
 *            printing?:string}|null}
 */
function chooseMarshadowCounterRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,foe=view.opponentPublic;
  const r=view.ownTurnResources,hand=view.ownHand;
  if(!own||!foe||!r||!Array.isArray(hand))return null;
  if(!foe.stadium?.includes(THUNDER)||
     foe.active?.printing!==THORNS)return null;
  if(hand.some(c=>COMPETING_STADIUMS.has(c)))return null;

  const active=own.active,bench=own.bench??[];
  const marshadowOnBench=bench.findIndex(slot=>
    slot?.printing===MARSHADOW);
  if(active?.printing===SHADOW&&marshadowOnBench>=0&&
    own.publicTurnRestrictions?.attackLockTurnsRemaining===0){
    return {kind:'marshadow-resetting-hole',benchIndex:marshadowOnBench,
      printing:MARSHADOW};
  }
  if(active?.printing!==MARSHADOW)return null;
  const ownSideOnly=[...bench].filter(Boolean);
  if(ownSideOnly.some(slot=>slot.printing!==SHADOW))return null;
  if(ownSideOnly.length>1)return null;
  const shadowAt=bench.findIndex(slot=>slot?.printing===SHADOW);
  if(shadowAt>=0){
    if(r.retreatedTurn!==view.globalTurn&&
       active.specialConditions?.length===0 &&
       active.publicRestrictions?.cannotRetreatNextTurn!==true &&
       active.publicRestrictions?.cannotRetreatWhileActive!==true &&
       (active.tools?.includes(FLOAT)||
        active.energies?.includes(ENERGY)))
      return {kind:'retreat-marshadow',benchIndex:shadowAt,
        printing:SHADOW};

    if(active.tools?.length||active.energies?.length)return null;
    const toolIndex=hand.indexOf(FLOAT);
    if(toolIndex>=0&&!r.toolPlayLocked)
      return {kind:'attach-floatstone',handIndex:toolIndex,
        printing:FLOAT};
    const energyIndex=hand.indexOf(ENERGY);
    if(energyIndex>=0&&!r.energyPlayLocked&&
       r.energyPlayedTurn!==view.globalTurn)
      return {kind:'attach-psychic',handIndex:energyIndex,
        printing:ENERGY};
    return null;
  }
  if(bench.every(slot=>slot===null)&&
     r.pokemonPlayLocked!==true&&
     r.abilityPokemonPlayLocked!==true){
    const canPay=hand.includes(FLOAT)||hand.includes(ENERGY);
    if(!canPay)return null;
    const shadowIndex=hand.indexOf(SHADOW);
    if(shadowIndex>=0)
      return {kind:'bench-shadow',handIndex:shadowIndex,
        benchIndex:0,printing:SHADOW};
    const fogIndex=hand.indexOf(FOG);
    if(fogIndex>=0&&r.itemPlayLocked!==true)
      return {kind:'fog-search-shadow',handIndex:fogIndex,
        printing:FOG};
  }
  return null;
}

/**
 * The owner may inspect the deck only at its real native Fog search prompt.
 * Search target comes from the native offered, legally validated objects.
 * @param {object} view Actor-only owner-prompt view.
 * @param {{printing:string,permitted:boolean}[]} offered
 * @returns {string|null}
 */
function chooseMarshadowFogTarget(view,offered) {
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  assert.ok(Array.isArray(offered));
  if(view.ownPublic.active?.printing!==MARSHADOW||
     !view.opponentPublic.stadium?.includes(THUNDER))return null;
  return offered.find(x=>x.permitted&&x.printing===SHADOW)
    ?.printing??null;
}

module.exports={VERSION,chooseMarshadowCounterRoot,
  chooseMarshadowFogTarget};
