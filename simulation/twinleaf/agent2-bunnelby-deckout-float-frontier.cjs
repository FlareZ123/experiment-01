'use strict';

const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {publicSkylinerSuppressionReason}=
  require('./agent6-skyliner-ability-suppression-guard.cjs');

const VERSION='agent2-bunnelby-imminent-deckout-float-owner-v1';
const FLOAT='Float Stone BKT';
const BUNNELBY='Bunnelby PRC';
const MILL_ATTACK='Burrow';

/**
 * A narrow, owner-observation-only proposal for a high-impact zero-damage
 * Attack line. Two printed Burrow attacks may empty an opposing deck of at
 * most two cards before the opponent's next mandatory draw.
 *
 * This is an optional candidate Root intent. It does NOT adjudicate the
 * intervening Pokémon Checkup, other replacement effects, all effective
 * Retreat modifiers or an opponent's undiscovered card identities. Require
 * genuine Store acceptance and a competing-move policy before selection.
 *
 * @param {object} view Detached, frozen actorObservation for current owner.
 * @param {object} catalog Public static printing and native enum catalog.
 * @returns {object|null} Native-neutral intent for existing Float handlers.
 */
function chooseBunnelbyImminentDeckoutFloat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic;
  if(!own||!opp||view.globalTurn<=1)return null;
  if(!Number.isSafeInteger(opp.deckCount)||
      opp.deckCount<1||opp.deckCount>2)return null;

  const r=view.ownTurnResources,active=own.active;
  if(!r||!Number.isSafeInteger(r.retreatedTurn)||
      r.retreatedTurn===view.globalTurn||
      !active||active.printing===BUNNELBY||
      !Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length===0||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      active.publicRestrictions?.cannotRetreatNextTurn===true||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.specialConditions?.some(x=>
        x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED))
    return null;

  // Latias ex's public Skyliner already makes Basic Active retreat free.
  // Do not consume the unique Float when its proposed mobility is redundant.
  // If a recognized public lock suppresses Skyliner, retain the candidate.
  const skylinerPresent=[own.active,...(own.bench??[])].some(p=>
    p?.printing==='Latias ex SSP'&&
    p.abilities?.includes('Skyliner'));
  if(skylinerPresent&&
      active.printed?.stage===catalog.stages?.BASIC&&
      publicSkylinerSuppressionReason(view)===null)
    return null;

  const stadium=[...(own.stadium??[]),...(opp.stadium??[])];
  if(stadium.some(x=>x.startsWith('Jamming Tower '))||
      opp.active?.tools?.some(x=>x.startsWith('Tool Jammer ')))
    return null;

  const bench=(own.bench??[]).findIndex(pokemon=>
    pokemon?.printing===BUNNELBY&&
    pokemon.abilities?.includes('Barrage')&&
    pokemon.abilityDetails?.some(power=>
      power.name==='Barrage'&&
      typeof power.text==='string'&&
      power.text.includes('attack twice'))&&
    pokemon.publicRestrictions?.cannotAttackNextTurn!==true&&
    !pokemon.specialConditions?.some(x=>
      x===catalog.specialConditions?.ASLEEP||
      x===catalog.specialConditions?.PARALYZED)&&
    pokemon.attacks?.some(attack=>
      attack.name===MILL_ATTACK&&
      attack.damage===0&&
      attack.text==='Discard the top card of your opponent\'s deck.'&&
      pokemon.publicRestrictions?.blockedAttackNameNextTurn!==attack.name&&
      pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive!==attack.name&&
      !pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)&&
      (!pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn||
        pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn===attack.name)&&
      publicSpecialAttackPayable(view,catalog,pokemon,attack)));
  if(bench<0)return null;

  const base={
    benchIndex:bench,printing:BUNNELBY,targetAttackName:MILL_ATTACK,
    projectedPrintedDamage:0,estimatedCardsMilled:opp.deckCount,
    conditionalTerminalAfterOpponentDraw:true,
    source:VERSION,paperQualified:false
  };
  if(active.tools?.includes(FLOAT))
    return {...base,kind:'retreat-emergency-floatstone'};
  if(!Array.isArray(active.tools)||active.tools.length!==0||
      r.toolPlayLocked===true||
      own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const handIndex=view.ownHand.indexOf(FLOAT);
  if(handIndex<0)return null;
  return {...base,kind:'attach-emergency-floatstone',handIndex};
}
module.exports={VERSION,FLOAT,BUNNELBY,MILL_ATTACK,
  chooseBunnelbyImminentDeckoutFloat};
