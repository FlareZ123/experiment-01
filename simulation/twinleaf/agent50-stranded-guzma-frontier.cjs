'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent50-owner-visible-stranded-guzma-pivot-v1';

/**
 * A source-agnostic proposal for a held Guzma Supporter that can move an
 * unpowered Active away from a previously invested Bench. This root action
 * cannot guarantee which eligible Pokémon will be selected in its subsequent
 * native prompts, and cannot prove a legal retreat or payable attack itself.
 *
 * @param {object} view Detached actor-only native owner-root observation.
 * @param {object} catalog Public printing/Basic Energy type catalog.
 * @returns {{kind:'play-stranded-guzma',handIndex:number,printing:string}|null}
 */
function chooseStrandedGuzma(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,other=view.opponentPublic,resources=view.ownTurnResources;
  const active=own?.active;
  if(view.globalTurn<=1||!active||
      !Array.isArray(other?.bench)||!other.bench.some(Boolean)||
      !Array.isArray(own.bench)||
      !own.bench.some(slot=>slot&&slot.energies?.length>0)||
      resources.supporterPlayedTurn>=1||
      resources.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true)return null;
  const handIndex=view.ownHand.indexOf('Guzma BUS');
  if(handIndex<0)return null;
  const canAlreadyAttack=active.attacks?.some(attack=>
    attack.gxAttack!==true&&Number.isFinite(attack.damage)&&
    attack.damage>0&&paysWithBasics(active,attack,catalog));
  if(canAlreadyAttack)return null;
  return {kind:'play-stranded-guzma',handIndex,printing:view.ownHand[handIndex]};
}

module.exports={VERSION,chooseStrandedGuzma};
