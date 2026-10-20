'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {chooseWobbuffetVmaxRecipient} = require('./wobbuffet-vmax-psychic-recipient.cjs');

/**
 * Propose an owner-hand, Bench-only, exactly-one basic Psychic attachment
 * after the real Store has already produced the pending prompt. No opponent
 * hidden zone, own deck order, or Prize data is consulted.
 *
 * @param {object} state Native state.
 * @param {object} own Acting player.
 * @param {0|1} seat Physical seat.
 * @param {object} prompt Actual pending native prompt.
 * @param {object} types Pinned constructors/enums.
 * @returns {object[]|null} Physical CardAssign array, or delegate.
 */
function selectWobbuffetVmaxDoorPrompt(state, own, seat, prompt, types) {
  if (state.activePlayer !== seat || state.phase !== types.GamePhase.PLAYER_TURN ||
      !(prompt instanceof types.AttachEnergyPrompt) ||
      prompt.playerId !== own.id || prompt.cardList !== own.hand ||
      prompt.message !== types.GameMessage.ATTACH_ENERGY_TO_BENCH ||
      prompt.playerType !== types.PlayerType.BOTTOM_PLAYER ||
      !prompt.slots.includes(types.SlotType.BENCH) ||
      prompt.options.min !== 1 || prompt.options.max !== 1 ||
      prompt.filter.name !== 'Psychic Energy' ||
      prompt.filter.energyType !== types.EnergyType.BASIC) return null;
  const target = chooseWobbuffetVmaxRecipient(own);
  if (!target) return null;
  const card = own.hand.cards.find(item =>
    item.name === 'Psychic Energy' &&
    item.energyType === types.EnergyType.BASIC &&
    !prompt.options.blocked.includes(own.hand.cards.indexOf(item)));
  if (!card) return null;
  const answer = [{card, to:{
    player:types.PlayerType.BOTTOM_PLAYER,
    slot:types.SlotType.BENCH,
    index:target.index
  }}];
  return prompt.validate(answer) ? answer : null;
}

/**
 * Revise only an already-existing Underworld-Door-shaped prompt at a genuine
 * Wobbuffet Active board. The root ability must have been played elsewhere.
 * The generic bot handles all unrelated decisions and prompts unchanged.
 *
 * @template T
 * @param {0|1} seat Acting candidate seat.
 * @param {()=>T} execute Synchronous runner.
 * @param {object} [injected] Unit-test seam.
 * @returns {{result:T,policyAudit:object}}
 */
function withWobbuffetVmaxDoorPrompt(seat,execute,injected) {
  assert.ok(seat === 0 || seat === 1);
  assert.equal(typeof execute,'function');
  const load = name => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const types = injected || {
    SimpleTacticsAi:load('simple-bot/simple-tactics-ai').SimpleTacticsAi,
    AttachEnergyPrompt:load('game/store/prompts/attach-energy-prompt').AttachEnergyPrompt,
    ResolvePromptAction:load('game/store/actions/resolve-prompt-action').ResolvePromptAction,
    GameMessage:load('game/game-message').GameMessage,
    GamePhase:load('game/store/state/state').GamePhase,
    EnergyType:load('game/store/card/card-types').EnergyType,
    ...load('game/store/actions/play-card-action')
  };
  const previous=types.SimpleTacticsAi.prototype.decodeNextAction;
  const actorId=seat === 0 ? 101 : 202;
  const events=[];
  const override=function vmaxDoorPrompt(state) {
    if (this.client?.id === actorId) {
      const own = state.players[seat];
      const pending = state.prompts.find(p => p.result === undefined &&
        p.playerId === own?.id);
      if (pending) {
        const answer=selectWobbuffetVmaxDoorPrompt(state,own,seat,pending,types);
        if (answer) {
          const replacement=new types.ResolvePromptAction(pending.id,answer);
          if (this.isValidAction(state,replacement)) {
            events.push({kind:'accepted-underworld-door-vmax-recipient',turn:state.turn,
              targetIndex:answer[0].to.index,sourceCard:answer[0].card.fullName});
            return replacement;
          }
          events.push({kind:'native-rejected-door-vmax-recipient',turn:state.turn});
        }
      }
    }
    return previous.call(this,state);
  };
  types.SimpleTacticsAi.prototype.decodeNextAction=override;
  try {
    return {result:execute(),policyAudit:{
      version:'wobbuffet-vmax-door-prompt-v1',seat,events,
      fullGameHiddenInformationSafe:false,competitiveGameQualified:false
    }};
  } finally {
    assert.equal(types.SimpleTacticsAi.prototype.decodeNextAction,override);
    types.SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={selectWobbuffetVmaxDoorPrompt,withWobbuffetVmaxDoorPrompt};
