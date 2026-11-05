'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=
  require('./actor-observation-contract.cjs');

const VERSION='agent7-plumeria-preserve-one-mail-v1-unqualified';
const BASIC_ENERGY=Object.freeze([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);

/** @param {string} printing @returns {boolean} */
function basicEnergyPrinting(printing){
  return BASIC_ENERGY.some(name=>printing.startsWith(name+' '));
}

/**
 * A strictly owner-observable alternative to dropping both Trainer-search
 * Items for Plumeria. It is only a test proposal: Enhanced Hammer may have
 * future matchup utility even when the currently visible opposing board has
 * no Special Energy. This does not claim the alternative is optimal.
 * @param {object} view Frozen actor-only pending-prompt observation.
 * @returns {string[]|null} Two exact printings, if eligible by visible facts.
 */
function proposePreserveMailPrintings(view){
  assert.equal(view.decisionKind,'owner-prompt');
  if(view.pendingPromptType!=='ChooseCardsPrompt')return null;
  const hand=view.ownHand;
  const mails=hand.filter(name=>name.startsWith("Trainers' Mail "));
  const hammers=hand.filter(name=>name.startsWith('Enhanced Hammer '));
  if(mails.length<2||hammers.length<1)return null;
  const board=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(Boolean);
  const energy=board.flatMap(slot=>slot.energies??[]);
  if(energy.some(name=>!basicEnergyPrinting(name)))return null;
  // Match native exact-printing choices. The physical prompt resolves each
  // named copy to an original owner-hand object with its own validator.
  return [hammers[0],mails[0]];
}

/**
 * Validate the proposed printed pair against the authentic physical Plumeria
 * mandatory two-card owner-hand prompt. No deck/Prize/opponent hand is read.
 * @param {object} state Native Store state.
 * @param {0|1} seat Source actor seat.
 * @param {()=>object[]|null} fallback Existing unchanged native chooser.
 * @param {Function} [observe] Actor-only observation factory.
 * @returns {object[]|null}
 */
function choosePreserveMailPhysicalPair(
    state,seat,fallback,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof fallback,'function');
  const pending=state.prompts?.find(prompt=>prompt.result===undefined);
  const player=state.players?.[seat];
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
      pending.playerId!==player?.id||
      pending.message!=='CHOOSE_CARD_TO_DISCARD'||
      pending.options?.min!==2||pending.options?.max!==2||
      pending.options?.allowCancel!==false)return fallback();
  const names=proposePreserveMailPrintings(observe(state,seat));
  if(!names)return fallback();
  const available=pending.cards?.cards??[];
  if(available.some(c=>!player.hand.cards.includes(c)))return fallback();
  const used=new Set(),chosen=[];
  for(const name of names){
    const card=available.find(c=>!used.has(c)&&c.fullName===name);
    if(!card)return fallback();
    used.add(card);chosen.push(card);
  }
  if(pending.validate(chosen,state)!==true)return fallback();
  return chosen;
}

module.exports={VERSION,BASIC_ENERGY,basicEnergyPrinting,
  proposePreserveMailPrintings,choosePreserveMailPhysicalPair};
