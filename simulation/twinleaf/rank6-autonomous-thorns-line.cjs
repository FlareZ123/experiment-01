'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const safeDiscards = ['Tropical Beach', "Trainers' Mail", 'Palace Belt', 'Camping Gear'];

/**
 * Narrow, conservative source-hand discard policy. This is a reproducible
 * heuristic, not an optimal discard-value calculation. Preserve the intended
 * Thunder Mountain and the DCE payment channel.
 * @param {{name:string}[]} hand
 * @returns {{name:string}[]}
 */
function chooseDiscardPair(hand) {
  const chosen = [];
  for (const name of safeDiscards) {
    for (const card of hand) {
      if (card.name === name && chosen.length < 2) chosen.push(card);
    }
  }
  return chosen.length === 2 ? chosen : [];
}

/** @param {{name:string}[]} hand @returns {boolean} */
function hasOpeningLine(hand) {
  return hand.some(card => card.name === 'Guzma & Hala') &&
    hand.some(card => card.name === 'Thunder Mountain Prism Star') &&
    !hand.some(card => card.name === 'Double Colorless Energy') &&
    chooseDiscardPair(hand).length === 2;
}

/**
 * Scope a single honest-hand policy to the actual source opponent's first
 * playing turn. It may inspect the own deck ONLY during G&H's real
 * ChooseCardsPrompt, after the legal search has begun. It never reads Prizes.
 *
 * @template T
 * @param {()=>T} work One source-dealt in-process headless match.
 * @param {{seat?:number,turn?:number}} [options]
 * @returns {{result:T,started:boolean,completed:boolean,events:object[],abortReason:string|null}}
 */
function withAutonomousThornsSourceAttack(work, options={}) {
  const seat = options.seat ?? 1;
  const turn = options.turn ?? 2;
  assert.ok(typeof work === 'function');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} part */
  const engine = part => require(path.join(output,part));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {GamePhase} = engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const events = [];
  let stage = 'idle';
  let actorId = null;
  let started = false;
  let completed = false;
  let abortReason = null;

  /** @param {object} state @param {string} reason */
  function abort(state,reason) {
    abortReason = reason;
    events.push({turn:state.turn,stage,reason});
    stage = 'aborted';
  }

  /** @param {object} state @param {string} action @param {object} value */
  function choose(state,action,value) {
    events.push({turn:state.turn,stage,action});
    return value;
  }

  /** @param {object} player @param {string} name @param {object} target */
  function play(player,name,target) {
    const index = player.hand.cards.findIndex(card=>card.name===name);
    assert.ok(index>=0,'Visible-hand card unavailable: '+name);
    return new PlayCardAction(player.id,index,target);
  }

  SimpleTacticsAi.prototype.decodeNextAction = function autonomousThorns(state) {
    const player = state.players[seat];
    if (!player || this.client?.id !== player.id) {
      return original.call(this,state);
    }
    const prompt = state.prompts.find(item =>
      item.playerId===player.id && item.result===undefined);
    if (stage==='idle') {
      if (state.turn!==turn || state.phase!==GamePhase.PLAYER_TURN ||
          state.activePlayer!==seat || prompt ||
          player.active.getPokemonCard()?.name!=='Iron Thorns ex' ||
          !hasOpeningLine(player.hand.cards)) {
        return original.call(this,state);
      }
      started = true;
      actorId = player.id;
      stage = 'mode';
      return choose(state,'Play held Guzma & Hala',
        play(player,'Guzma & Hala',
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    }
    if (actorId!==player.id || stage==='done' || stage==='aborted') {
      return original.call(this,state);
    }
    if (state.turn!==turn || state.activePlayer!==seat) {
      abort(state,'Source turn ended before attack');
      return original.call(this,state);
    }

    if (stage==='mode' && prompt?.constructor.name==='SelectOptionPrompt') {
      stage='discard';
      return choose(state,'Select G&H discard/search mode',
        new ResolvePromptAction(prompt.id,1));
    }
    if (stage==='discard' && prompt?.constructor.name==='ChooseCardsPrompt') {
      const cards=chooseDiscardPair(player.hand.cards);
      if (cards.length!==2 || !prompt.validate(cards,state)) {
        abort(state,'Unable to pay visible-hand discard requirement');
        return original.call(this,state);
      }
      stage='search';
      events.push({turn:state.turn,stage:'discard',cards:cards.map(c=>c.name)});
      return choose(state,'Discard two low-protection hand cards',
        new ResolvePromptAction(prompt.id,cards));
    }
    if (stage==='search' && prompt?.constructor.name==='ChooseCardsPrompt') {
      // Searching our deck is legal only now, after opening this prompt.
      const dce=player.deck.cards.find(card=>card.name==='Double Colorless Energy');
      if (!dce || !prompt.validate([dce],state)) {
        abort(state,'DCE inaccessible at legal deck-search prompt');
        return original.call(this,state);
      }
      stage='followup';
      return choose(state,'Search exactly one DCE',
        new ResolvePromptAction(prompt.id,[dce]));
    }
    if (stage==='followup' && prompt) {
      if (prompt.constructor.name==='ShowCardsPrompt') {
        return choose(state,'Acknowledge selected cards',
          new ResolvePromptAction(prompt.id,true));
      }
      if (prompt.constructor.name==='WaitPrompt') {
        return choose(state,'Acknowledge transition',
          new ResolvePromptAction(prompt.id,null));
      }
      abort(state,'Unexpected G&H follow-up prompt '+prompt.constructor.name);
      return original.call(this,state);
    }
    if (stage==='followup' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      stage='attach';
      return choose(state,'Play held Thunder Mountain',
        play(player,'Thunder Mountain Prism Star',
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    }
    if (stage==='attach' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      if (!player.hand.cards.some(c=>c.name==='Double Colorless Energy')) {
        abort(state,'Searched DCE unavailable in hand');
        return original.call(this,state);
      }
      stage='attack';
      return choose(state,'Attach searched Double Colorless Energy',
        play(player,'Double Colorless Energy',
          {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    }
    if (stage==='attack' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      const thunder=player.stadium.cards.some(c=>
        c.name==='Thunder Mountain Prism Star');
      const attached=player.active.energies.cards.some(c=>
        c.name==='Double Colorless Energy');
      if (!thunder || !attached ||
          player.active.getPokemonCard()?.name!=='Iron Thorns ex') {
        abort(state,'Expected Stadium/Energy/Active unavailable');
        return original.call(this,state);
      }
      stage='done';
      completed=true;
      return choose(state,'Announce Volt Cyclone',
        new AttackAction(player.id,'Volt Cyclone'));
    }
    abort(state,'Unexpected source policy stage/prompt combination');
    return original.call(this,state);
  };

  try {
    const result=work();
    return {result,started,completed,events,abortReason};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={chooseDiscardPair,hasOpeningLine,withAutonomousThornsSourceAttack};
