'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent37-owner-attack-discard-recovery-prompt-v1';
const MESSAGE='CHOOSE_CARD_TO_DECK';

/**
 * A native attack may move a chosen card from the owner's discard pile into
 * their deck. Project one physical, actor-authenticated, prompt-validated
 * recovery target without revealing any opponent concealed cards.
 * The wrapper must first require GamePhase.ATTACK.
 *
 * @param {object} state Original pinned Store state.
 * @param {0|1} seat Original answering physical seat.
 * @param {(state:object,seat:0|1)=>object} [observe]
 * @returns {object|null}
 */
function actorAttackRecoveryInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(!owner||pending?.constructor?.name!=='ChooseCardsPrompt'||
      pending.playerId!==owner.id||pending.message!==MESSAGE||
      pending.cards!==owner.discard)return null;
  const options=pending.options??{};
  if(!Number.isInteger(options.max)||options.max!==1||
      !Number.isInteger(options.min)||options.min>1||
      !Array.isArray(owner.discard.cards))return null;
  const offered=owner.discard.cards.map(c=>({
    printing:c.fullName,
    selectableAlone:pending.validate([c])===true
  })).sort((a,b)=>a.printing<b.printing?-1:
    a.printing>b.printing?1:Number(b.selectableAlone)-Number(a.selectableAlone))
    .map((entry,index)=>Object.freeze({index,...entry}));
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  return Object.freeze({actor,prompt:Object.freeze({
    id:pending.id,message:MESSAGE,source:'own-discard-to-deck',
    offered:Object.freeze(offered),
    canSkip:pending.validate([])===true,
    canCancel:pending.validate(null)===true
  })});
}
module.exports={VERSION,MESSAGE,actorAttackRecoveryInput};
