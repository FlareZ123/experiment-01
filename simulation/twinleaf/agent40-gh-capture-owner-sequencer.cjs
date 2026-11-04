'use strict';

const assert=require('node:assert/strict');

const VERSION='agent40-gh-capture-owner-visible-two-spare-connectors-v1';
const PRINTING=Object.freeze({
  bunnelby:'Bunnelby PRC',
  gh:'Guzma & Hala CEC',
  tag:'Tag Call CEC',
  stadium:'Artazon PAL',
  capture:'Capture Energy RCL',
  tool:'Technical Machine: Evolution PAR',
  oddish:'Oddish UNB',
  pidgey:'Pidgey MEW'
});
const CONNECTORS=new Set([PRINTING.gh,PRINTING.tag]);

/** @param {object[]} bench @param {string} printing @returns {boolean} */
const hasBenched=(bench,printing)=>bench.some(p=>p?.printing===printing);

/**
 * Explicit owner-known exact 60; this is not a lookup of the actual deck.
 * @param {string[]} ownerSixty
 * @returns {boolean}
 */
function hasRegisteredSourceLine(ownerSixty){
  if(!Array.isArray(ownerSixty)||ownerSixty.length!==60)return false;
  const counts=new Map();
  for(const p of ownerSixty)counts.set(p,(counts.get(p)||0)+1);
  return counts.get(PRINTING.bunnelby)===2 &&
    (counts.get(PRINTING.gh)??0)>=3 &&
    (counts.get(PRINTING.tag)??0)>=3 &&
    counts.get(PRINTING.stadium)===2 &&
    (counts.get(PRINTING.capture)??0)>=1 &&
    counts.get(PRINTING.tool)===2 &&
    counts.get(PRINTING.oddish)===2 &&
    counts.get(PRINTING.pidgey)===2;
}

/**
 * A deliberately narrow, non-cheating, opt-in priority for a specifically
 * witnessed Bunnelby opening. Every decision is a pure function of the
 * acting player's own actual hand, public board, turn counters and own
 * registered source 60. No real deck order, Prize contents, opposing hand,
 * or external live State enters.
 *
 * This handles an intentionally staged going-second turn-1 opening with
 * two disposable connector copies, not a complete general game policy.
 * Every proposed action still requires native Store acceptance.
 *
 * @param {object} view Immutable actorObservation at the actual owner root.
 * @param {string[]} ownerSixty Acting player's registered printed 60.
 * @returns {object|null}
 */
function chooseGhCaptureRoot(view,ownerSixty){
  assert.equal(view.decisionKind,'owner-root');
  if(!hasRegisteredSourceLine(ownerSixty)||view.globalTurn!==2)return null;
  const own=view.ownPublic,quota=view.ownTurnResources;
  if(own.active?.printing!==PRINTING.bunnelby||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const hand=view.ownHand,bench=own.bench;
  if(!Array.isArray(hand)||!Array.isArray(bench))return null;
  const haveOddish=hasBenched(bench,PRINTING.oddish);
  const havePidgey=hasBenched(bench,PRINTING.pidgey);
  const stadiumUp=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
    .includes(PRINTING.stadium);
  const connectors=hand.filter(p=>CONNECTORS.has(p)).length;
  const setupCards=[PRINTING.stadium,PRINTING.capture,PRINTING.tool];
  // Root entry is intentionally conservative: the actual hand visibly
  // contains the G&H, two other connectors and none of its three tutor
  // targets. This is a subset of valid first-turn lock opportunities.
  if(!stadiumUp&&!haveOddish&&!havePidgey&&
      setupCards.every(p=>!hand.includes(p))&&
      hand.includes(PRINTING.gh)&&connectors>=3&&
      quota.supporterPlayedTurn===0&&
      quota.supporterPlayLocked!==true){
    return {kind:'play-gh',handIndex:hand.indexOf(PRINTING.gh),
      printing:PRINTING.gh,spareConnectors:connectors-1};
  }

  if(!stadiumUp&&hand.includes(PRINTING.stadium)&&
      quota.stadiumPlayLocked!==true&&
      quota.stadiumPlayedTurn!==view.globalTurn){
    return {kind:'play-artazon',handIndex:hand.indexOf(PRINTING.stadium),
      printing:PRINTING.stadium};
  }
  if(stadiumUp&&!haveOddish&&bench.some(x=>x===null)&&
      quota.stadiumUsedTurn!==view.globalTurn){
    return {kind:'use-artazon'};
  }
  if(haveOddish&&!havePidgey&&bench.some(x=>x===null)&&
      hand.includes(PRINTING.capture)&&
      own.active.energies.length===0&&
      quota.energyPlayedTurn!==view.globalTurn&&
      quota.energyPlayLocked!==true&&
      quota.specialEnergyPlayLocked!==true){
    return {kind:'attach-capture',handIndex:hand.indexOf(PRINTING.capture),
      printing:PRINTING.capture};
  }
  if(haveOddish&&havePidgey&&
      own.active.energies.includes(PRINTING.capture)&&
      own.active.tools.length===0&&hand.includes(PRINTING.tool)&&
      quota.toolPlayLocked!==true){
    return {kind:'equip-tm',handIndex:hand.indexOf(PRINTING.tool),
      printing:PRINTING.tool};
  }
  if(haveOddish&&havePidgey&&
      own.active.energies.includes(PRINTING.capture)&&
      own.active.tools.includes(PRINTING.tool)&&
      !own.active.specialConditions?.length&&
      own.active.publicRestrictions?.cannotAttackNextTurn!==true){
    return {kind:'attack-evolution',attackName:'Evolution'};
  }
  return null;
}

/**
 * Handle only actual native prompt entitlements for this narrowly specified
 * line. Actual deck identities are consulted only if the Store has already
 * generated the owner's own ChooseCardsPrompt for that exact deck object.
 * A failed native search is allowed to fail; no hidden contents are read
 * to improve the prior owner-root choices.
 *
 * @param {object} state Current genuine native Store State.
 * @param {0|1} seat Actual acting player's physical seat.
 * @param {object} prompt Pending actual owner prompt.
 * @returns {{kind:string,selected:object[]|number}|null}
 */
function chooseGhCapturePrompt(state,seat,prompt){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  if(!prompt||prompt.playerId!==owner.id||
      prompt.result!==undefined||!owner)return null;
  const kind=prompt.constructor?.name;
  const ghResolving=owner.supporter.cards.some(c=>
    c.fullName===PRINTING.gh);
  if(ghResolving&&kind==='SelectOptionPrompt'&&
      prompt.options?.disabled?.[1]!==true&&
      prompt.validate(1,state)){
    return {kind:'gh-three-channel-mode',selected:1};
  }
  if(kind!=='ChooseCardsPrompt')return null;
  if(ghResolving&&prompt.cards===owner.hand){
    const choices=owner.hand.cards.filter(c=>
      CONNECTORS.has(c.fullName)).slice(0,2);
    if(choices.length===2&&prompt.validate(choices,state))
      return {kind:'gh-discard-two-spare-connectors',selected:choices};
    return null;
  }
  // The real owner-deck search prompt is the first permitted inspection
  // of previously hidden deck identities. Never test the deck earlier.
  if(prompt.cards!==owner.deck)return null;
  const take=printing=>owner.deck.cards.find(c=>c.fullName===printing);
  if(ghResolving){
    const search=[
      take(PRINTING.stadium),take(PRINTING.tool),take(PRINTING.capture)
    ];
    if(search.every(Boolean)&&prompt.validate(search,state))
      return {kind:'gh-three-channel-deck-search',selected:search};
    return null;
  }
  const bench=owner.bench.map(slot=>slot.getPokemonCard()?.fullName);
  if(owner.stadium.cards.some(c=>c.fullName===PRINTING.stadium)&&
      !bench.includes(PRINTING.oddish)){
    const oddish=take(PRINTING.oddish);
    if(oddish&&prompt.validate([oddish],state))
      return {kind:'artazon-oddish',selected:[oddish]};
  }
  if(owner.active.energies.cards.some(c=>
      c.fullName===PRINTING.capture)&&
      !bench.includes(PRINTING.pidgey)){
    const pidgey=take(PRINTING.pidgey);
    if(pidgey&&prompt.validate([pidgey],state))
      return {kind:'capture-pidgey',selected:[pidgey]};
  }
  return null;
}

module.exports={VERSION,PRINTING,CONNECTORS,
  hasRegisteredSourceLine,chooseGhCaptureRoot,chooseGhCapturePrompt};
