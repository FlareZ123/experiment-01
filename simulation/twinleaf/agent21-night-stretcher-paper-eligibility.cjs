'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-pinned-night-stretcher-owner-discard-paper-eligibility-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Temporarily correct the pinned Night Stretcher SFA false-positive canPlay:
 * native source treats any Energy card in discard as enough for canPlay,
 * although its actual effect can choose only Basic Energy or any Pokemon.
 *
 * Native upstream code is unchanged, and the patch always restores its exact
 * property descriptor. The only inspected inventory is the acting player's
 * publicly visible DISCARD; no own or opponent hidden cards are consulted.
 * Install around a synchronous native game boundary.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{native?:(name:string)=>any}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperNightStretcherEligibility(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=deps.native??(name=>require(path.join(OUTPUT,name)));
  const {NightlyStretcher}=native(
    'sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {SuperType,EnergyType}=native('game/store/card/card-types');
  const proto=NightlyStretcher.prototype;
  const before=Object.getOwnPropertyDescriptor(proto,'canPlay');
  assert.equal(typeof before?.value,'function');
  const audit={version:VERSION,checked:0,
    rejectedSpecialOnlyOrEmpty:0,
    eligibleBasicOrPokemon:0,
    ownerDiscardOnly:true,
    prospectiveOriginalGamesQualified:0};

  /** @this {any} */
  function paperCanPlay(store,state,player){
    audit.checked++;
    const eligible=player.discard.cards.some(card=>
      card instanceof PokemonCard||
      (card.superType===SuperType.ENERGY&&
       card.energyType===EnergyType.BASIC));
    if(!eligible){
      audit.rejectedSpecialOnlyOrEmpty++;
      return false;
    }
    audit.eligibleBasicOrPokemon++;
    return before.value.call(this,store,state,player);
  }

  Object.defineProperty(proto,'canPlay',{...before,value:paperCanPlay});
  try{return {result:execute(),audit};}
  finally{Object.defineProperty(proto,'canPlay',before);}
}

module.exports={VERSION,withPaperNightStretcherEligibility};
