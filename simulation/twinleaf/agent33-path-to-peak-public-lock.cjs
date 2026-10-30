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
  if(!(locks instanceof Set)||!own.active)return null;
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.length>0||r.stadiumPlayLocked!==false||
    !Number.isSafeInteger(r.stadiumPlayedTurn)||
    r.stadiumPlayedTurn>=view.globalTurn)return null;
  const cards=[own.active,...(own.bench??[])].filter(Boolean);
  if(cards.some(slot=>locks.has(slot.printing)))return null;
  if(view.ownHand.some(printing=>locks.has(printing)))return null;
  const opponents=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(Boolean);
  if(!opponents.some(slot=>locks.has(slot.printing)))return null;
  const index=view.ownHand.findIndex(printing=>
    printing.startsWith('Path to the Peak '));
  if(index<0)return null;
  return {kind:'play-path-to-peak',
    handIndex:index,printing:view.ownHand[index],
    reason:'public-opposing-rulebox-ability-and-no-owner-self-lock'};
}
module.exports={VERSION,choosePathToPeakOpposingAbility};
