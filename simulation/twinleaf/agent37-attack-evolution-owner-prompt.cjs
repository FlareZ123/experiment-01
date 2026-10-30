'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent37-owner-attack-evolution-deck-prompt-v1';
const MESSAGE='CHOOSE_CARD_TO_EVOLVE';

/**
 * Project an authenticated, genuine ATTACK-phase evolution search into the
 * same inert menu shape as an owner deck-to-hand search. Native prompt
 * validation, rather than a guessed card-name evolutionary relation, decides
 * what is eligible. The caller must authenticate ATTACK phase beforehand.
 *
 * @param {object} state Live pinned Store state containing a pending prompt.
 * @param {0|1} seat Genuine answering physical seat.
 * @param {(state:object,seat:0|1)=>object} [observe]
 * @returns {object|null}
 */
function actorAttackEvolutionInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(!owner||pending?.constructor?.name!=='ChooseCardsPrompt'||
      pending.playerId!==owner.id||pending.message!==MESSAGE||
      pending.cards!==owner.deck)return null;
  const options=pending.options??{};
  if(!Number.isInteger(options.max)||options.max!==1||
      !Number.isInteger(options.min)||options.min>1||
      !Array.isArray(pending.cards.cards))return null;
  const offered=pending.cards.cards.map(c=>({
    printing:c.fullName,
    selectableAlone:pending.validate([c])===true
  })).sort((a,b)=>a.printing<b.printing?-1:
    a.printing>b.printing?1:Number(b.selectableAlone)-Number(a.selectableAlone))
    .map((row,index)=>Object.freeze({index,...row}));
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      id:pending.id,message:MESSAGE,source:'own-deck-evolution',
      offered:Object.freeze(offered),
      canSkip:pending.validate([])===true,
      canCancel:pending.validate(null)===true
    })
  });
}

module.exports={VERSION,MESSAGE,actorAttackEvolutionInput};
