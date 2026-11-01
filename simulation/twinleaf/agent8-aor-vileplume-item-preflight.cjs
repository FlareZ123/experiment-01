'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent8-aor-vileplume-public-item-ability-preflight-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A candidate Item root can be prevented by Vileplume AOR even when the
 * Twinleaf owner cannotPlayItemCards boolean is false. The printing is
 * face-up, so its presence is public information.
 *
 * This is a native-engine legality preflight for exactly AOR Vileplume.
 * Its native check is performed in a detached Store clone. It does not
 * inspect any hand, deck or Prize identity, and it never chooses a card.
 *
 * @param {object} view Owner-authenticated frozen actor observation.
 * @returns {boolean}
 */
function exposedAorVileplume(view){
  assert.equal(view?.decisionKind,'owner-root');
  return [view.ownPublic,view.opponentPublic].some(player=>
    [player?.active,...(player?.bench??[])]
      .some(slot=>slot?.printing==='Vileplume AOR'));
}

/**
 * Determine whether pinned Twinleaf would apply the publicly visible
 * Vileplume AOR Item prohibition to the current actor. Follow the exact
 * pinned Vileplume PlayItemEffect reducer's IS_ABILITY_BLOCKED predicate.
 * A detached native clone prevents reducer-side effects from changing the
 * live match. No output from this observer is allowed to enter a frozen
 * policy unless a subsequent, opt-in policy experiment explicitly does so.
 *
 * @param {object} view Native-current actor-only observation.
 * @param {object} state Actual live Store state, used only to make a clone.
 * @param {{Store?:Function,deepClone?:Function,isAbilityBlocked?:Function}} [deps]
 * @returns {{version:string,applicable:boolean,nativeItemLocked:boolean,
 *   visibleAorCount:number,source:'pinned-detached-ability-check'|'not-present',
 *   competitiveQualified:false}}
 */
function nativeAorVileplumeItemPreflight(view,state,deps={}){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.ok(state?.players?.length===2);
  if(!exposedAorVileplume(view))return {
    version:VERSION,applicable:false,nativeItemLocked:false,
    visibleAorCount:0,source:'not-present',competitiveQualified:false
  };
  const engine=name=>require(path.join(OUTPUT,name));
  const Store=deps.Store??engine('game/store/store').Store;
  const deepClone=deps.deepClone??engine('utils').deepClone;
  const isAbilityBlocked=deps.isAbilityBlocked??
    engine('game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  assert.equal(typeof Store,'function');
  assert.equal(typeof deepClone,'function');
  assert.equal(typeof isAbilityBlocked,'function');
  const clone=new Store({onStateChange(){}});
  clone.state=deepClone(state);
  const actor=clone.state.players[view.actorSeat];
  const candidates=clone.state.players.flatMap(player=>
    [player.active,...player.bench].map(slot=>slot.getPokemonCard())
      .filter(card=>card?.fullName==='Vileplume AOR'));
  assert.ok(candidates.length>0,'Public AOR Vileplume absent from native clone');
  const oldRandom=Math.random;
  Math.random=()=>0.5;
  let effective=0;
  try{
    for(const card of candidates){
      if(!isAbilityBlocked(clone,clone.state,actor,card))effective++;
    }
  }finally{
    Math.random=oldRandom;
  }
  return {
    version:VERSION,applicable:true,nativeItemLocked:effective>0,
    visibleAorCount:candidates.length,
    source:'pinned-detached-ability-check',
    competitiveQualified:false
  };
}

module.exports={VERSION,exposedAorVileplume,nativeAorVileplumeItemPreflight};
