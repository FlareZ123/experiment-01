'use strict';

const assert=require('node:assert/strict');
const {chooseActorSingleSearch}=
  require('../agent41-actor-owner-single-search.cjs');

const VERSION='agent37-owner-mew-genesect-quickball-search-v1';
const QUICK_BALL_PRINTINGS=new Set(['Quick Ball FST','Quick Ball SSH']);
const MEW='Mew V FST';
const GENESECT='Genesect V FST';

/**
 * Select an actual native-eligible Basic when the Mew/Genesect owner has
 * initiated Quick Ball. This strategy examines only the owner's detached
 * public board, in-flight Item printing, and owner-authorized search menu.
 * Opponent and unrelated owner searches retain the original policy.
 *
 * @param {object} input Valid detached owner search input.
 * @param {0|1} intendedSeat Original Mew/Genesect physical actor seat.
 * @returns {{indices:number[]}|{printings:string[]}|{indices:null}|null}
 */
function chooseMewGenesectQuickBallSearch(input,intendedSeat){
  assert.ok(intendedSeat===0||intendedSeat===1);
  const actor=input.actor,prompt=input.prompt;
  if(actor.actorSeat!==intendedSeat||
     prompt.source!=='own-deck'||
     prompt.message!=='CHOOSE_CARD_TO_HAND'||
     !actor.ownPublic.resolvingSupporter.some(x=>
       QUICK_BALL_PRINTINGS.has(x))||
     prompt.bundles!==undefined)return chooseActorSingleSearch(input);

  const board=[actor.ownPublic.active,...actor.ownPublic.bench];
  const haveMew=board.some(p=>p?.printing===MEW||
    p?.printing==='Mew VMAX FST');
  const haveGenesect=board.some(p=>p?.printing===GENESECT);
  const preference=haveMew?
    haveGenesect?[MEW,GENESECT]:[GENESECT,MEW]:
    [MEW,GENESECT];
  for(const target of preference){
    const card=prompt.offered.find(c=>
      c.printing===target&&c.selectableAlone);
    if(card)return {indices:[card.index]};
  }
  return chooseActorSingleSearch(input);
}

module.exports={VERSION,chooseMewGenesectQuickBallSearch};
