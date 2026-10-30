'use strict';

const assert=require('node:assert/strict');

const VERSION='agent32-owner-observable-oranguru-star-vip-route-offer-v1';
const PRINT=Object.freeze({
  oranguru:'Oranguru V ASR',
  shake:'Boost Shake EVS',
  trubbish:'Trubbish FST',
  vip:'Battle VIP Pass FST',
  forest:'Forest Seal Stone SIT',
  float:'Float Stone BKT',
  garbodor:'Garbodor BKP'
});

/** @param {string[]|null|undefined} printings @param {string} prefix */
function containsPrinting(printings,prefix){
  return Array.isArray(printings)&&
    printings.some(p=>typeof p==='string'&&p.startsWith(prefix));
}

/**
 * Single owner-visible, card-defined multistep plan opportunity. The actor
 * can recognize the hand/board situation and conserve its Tool slots.
 *
 * This is an *offer* to one external arbitration policy, never an action
 * dispatcher. It does not assert native legality of Back Order/Star Alchemy,
 * availability of any unseen deck-search target, strategic dominance, or
 * completion of the eleven subsequent native actions. There is no identity,
 * role, seat, source rank, decklist, or seed branch.
 *
 * All inputs come from detached actorObservation. A hidden Prize or deck card
 * remains unknown until a lawful owner-deck search creates K1 knowledge.
 *
 * @param {object} view Detached actorObservation of the current actor root.
 * @returns {object} Versioned eligibility, blocked reason, and costed plan.
 */
function offerOranguruStarVip(view){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(view.ownPublic&&view.ownTurnResources);

  const result={version:VERSION,
    opportunity:'oranguru-star-search-vip-held-shake-first-turn',
    eligible:false,blocker:null,
    candidateKind:'multi-step-setup',
    firstActionHint:null,
    requiredFutureNativePromptChain:[],
    missingTools:[],
    reservations:[],
    resourceKnowledge:'owner-K0-only',
    nativeLegality:'unverified',
    dominance:'not-established',
    competitiveEvidenceQualified:false
  };
  const refuse=blocker=>({...result,blocker});
  const own=view.ownPublic;
  const resources=view.ownTurnResources;
  const active=own.active;
  const hand=view.ownHand;
  const bench=own.bench;
  if(view.globalTurn!==1&&view.globalTurn!==2)
    return refuse('not-first-game-round');
  if(active?.printing!==PRINT.oranguru)
    return refuse('not-original-tool-free-oranguru-active');
  if(!Array.isArray(active.tools)||active.tools.length!==0)
    return refuse('oranguru-active-tool-slot-already-spent');
  if(!Array.isArray(bench)||bench.every(x=>x!==null))
    return refuse('no-open-bench-slot');
  if(!hand.includes(PRINT.shake))
    return refuse('boost-shake-not-held');
  if(hand.includes(PRINT.vip)||hand.includes(PRINT.trubbish)||
    bench.some(x=>x?.printing?.startsWith(PRINT.trubbish)))
    return refuse('other-existing-vip-or-trubbish-route');
  if(hand.filter(p=>p===PRINT.garbodor).length>=2)
    return refuse('both-searchable-garbodor-already-held');
  if(resources.vstarUsed===true||own.publicTurnRestrictions?.vstarUsed===true)
    return refuse('vstar-power-already-spent');
  if(resources.itemPlayLocked===true||
    resources.toolPlayLocked===true||
    resources.pokemonPlayLocked===true||
    resources.evolutionPlayLocked===true)
    return refuse('known-own-play-lock');
  if(resources.abilityPlayLocked===true)
    return refuse('known-owner-ability-lock');

  const opponentActive=view.opponentPublic?.active;
  // These effects block Oranguru's printed Back Order and its VSTAR search
  // when not otherwise negated. A tool-free Oranguru has no Hood protection.
  // If a richer official card/rules validator exposes modified lock status,
  // it must override this conservative first-pass eligibility.
  if(opponentActive?.name==='Iron Thorns ex'&&
    opponentActive.abilities?.includes('Initialization'))
    return refuse('opposing-active-initialization');
  if(opponentActive?.name==='Galarian Weezing'&&
    opponentActive.abilities?.includes('Neutralizing Gas'))
    return refuse('opposing-active-neutralizing-gas');
  if(containsPrinting(own.stadium,'Path to the Peak ')||
    containsPrinting(view.opponentPublic?.stadium,'Path to the Peak '))
    return refuse('path-to-the-peak-ability-lock');
  const opponentSlots=[opponentActive,
    ...(view.opponentPublic?.bench??[])];
  if(opponentSlots.some(slot=>
    slot?.abilities?.includes('Garbotoxin')&&
    Array.isArray(slot.tools)&&slot.tools.length>0))
    return refuse('opposing-equipped-garbotoxin');

  const missingTools=[PRINT.forest,PRINT.float]
    .filter(printing=>!hand.includes(printing));
  const firstActionHint=missingTools.length>0 ?
    'consider-back-order-before-any-active-tool-attachment' :
    'consider-forest-seal-stone-to-active-before-star-alchemy';

  return {...result,eligible:true,blocker:null,firstActionHint,
    missingTools,
    reservations:[
      'active-oranguru-tool-slot-for-forest-seal-stone',
      'one-open-bench-slot-for-trubbish',
      'trubbish-tool-slot-for-float-stone',
      'one-vstar-power-for-battle-vip-pass',
      'boost-shake-turn-ending-action',
      'one-garbodor-bkp-still-searchable-in-original-deck'
    ],
    requiredFutureNativePromptChain:[
      ...(missingTools.length?['Back Order owner-deck search']:[]),
      'Forest Seal Stone Tool attachment to active Oranguru',
      'Star Alchemy owner-deck search for VIP Pass',
      'Battle VIP Pass owner-deck search for Trubbish',
      'Float Stone Tool attachment to Benched Trubbish',
      'Boost Shake owner-deck search for Garbodor',
      'Boost Shake owner-Bench evolution target',
      'Opponent real owner-root response'
    ],
    note:'Open K0 offer only. K1 card availability, native Store action acceptance, opportunity cost, and opponent counterplay must be verified.'
  };
}

module.exports={VERSION,PRINT,offerOranguruStarVip};
