'use strict';
const assert=require('node:assert/strict');
const VERSION='agent33-path-to-peak-visible-opposing-rulebox-ability-v1';
/**
 * Avoid self-lock by requiring no currently visible owner rule-box Ability
 * Pokémon and no held ability-bearing evolution. Only the frozen public
 * print catalog and visible opponent board determine target applicability.
 */
function choosePathToPeakOpposingAbility(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const locks=catalog.ruleboxAbilityPrintings;
  const ruleboxes=catalog.ruleboxPokemonPrintings;
  if(!(locks instanceof Set)||!(ruleboxes instanceof Set)||!own.active)
    return null;
  // VSTAR Power consumption is a public, player-wide resource, not a
  // per-card flag. A spent Seal Stone no longer grants a usable Power.
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.length>0||r.stadiumPlayLocked!==false||
    !Number.isSafeInteger(r.stadiumPlayedTurn)||
    r.stadiumPlayedTurn>=view.globalTurn)return null;
  const cards=[own.active,...(own.bench??[])].filter(Boolean);
  if(cards.some(slot=>locks.has(slot.printing)||
      (ruleboxes.has(slot.printing)&&slot.tools?.some(print=>
        print.startsWith('Forest Seal Stone ')||
        print.startsWith('Sky Seal Stone '))&&
        own.publicTurnRestrictions?.vstarUsed!==true)))return null;
  if(view.ownHand.some(printing=>locks.has(printing)))return null;
  const opponents=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(Boolean);
  if(!opponents.some(slot=>locks.has(slot.printing)||
      (ruleboxes.has(slot.printing)&&slot.tools?.some(print=>
        print.startsWith('Forest Seal Stone ')||
        print.startsWith('Sky Seal Stone '))&&
        view.opponentPublic?.publicTurnRestrictions?.vstarUsed!==true)))
    return null;
  const index=view.ownHand.findIndex(printing=>
    printing.startsWith('Path to the Peak '));
  if(index<0)return null;
  return {kind:'play-path-to-peak',
    handIndex:index,printing:view.ownHand[index],
    reason:'public-opposing-rulebox-ability-and-no-owner-self-lock'};
}
module.exports={VERSION,choosePathToPeakOpposingAbility};
