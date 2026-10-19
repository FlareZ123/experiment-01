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
 * Check only the currently observable hand. Search availability in the own
 * deck is inspected later and only in the actual Store ChooseCardsPrompt.
 * With Tag Call, the source can retrieve Guzma & Hala as a TAG TEAM Supporter;
 * G&H's printed search can supply both a Stadium and a Special Energy.
 * @param {{name:string}[]} hand
 * @param {{allowTagCall?:boolean,allowStadiumSearch?:boolean}} options
 * @returns {'direct'|'tag-call'|null}
 */
function chooseOpeningRoute(hand,options={}) {
  if (hasOpeningLine(hand)) return 'direct';
  if (!options.allowTagCall && !options.allowStadiumSearch) return null;
  if (hand.some(card=>card.name==='Double Colorless Energy') ||
      chooseDiscardPair(hand).length!==2) return null;
  const hasGuzmaHala=hand.some(card=>card.name==='Guzma & Hala');
  const hasThunder=hand.some(card=>card.name==='Thunder Mountain Prism Star');
  if (hasGuzmaHala && options.allowStadiumSearch) return 'direct';
  if (!hasGuzmaHala && options.allowTagCall &&
      (hasThunder || options.allowStadiumSearch) &&
      hand.some(card=>card.name==='Tag Call')) return 'tag-call';
  return null;
}

/**
 * Scope a single honest-hand policy to the actual source opponent's first
 * playing turn. It may inspect the own deck ONLY during G&H's real
 * ChooseCardsPrompt, after the legal search has begun. It never reads Prizes.
 *
 * @template T
 * @param {()=>T} work One source-dealt in-process headless match.
 * @param {{seat?:number,turn?:number,allowTagCall?:boolean,allowStadiumSearch?:boolean}} [options]
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
  let route=null;

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
          !(route=chooseOpeningRoute(player.hand.cards,options))) {
        return original.call(this,state);
      }
      started = true;
      actorId = player.id;
      stage = route==='tag-call' ? 'tag-search' : 'mode';
      return choose(state,route==='tag-call' ?
        'Play held Tag Call for Guzma & Hala' : 'Play held Guzma & Hala',
        play(player,route==='tag-call' ? 'Tag Call' : 'Guzma & Hala',
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    }
    if (actorId!==player.id || stage==='done' || stage==='aborted') {
      return original.call(this,state);
    }
    if (state.turn!==turn || state.activePlayer!==seat) {
      abort(state,'Source turn ended before attack');
      return original.call(this,state);
    }

    if (stage==='tag-search' && prompt?.constructor.name==='ChooseCardsPrompt') {
      // Own-deck read is confined to the live, authorized Tag Call search.
      const supporter=player.deck.cards.find(c=>c.name==='Guzma & Hala');
      if (!supporter || !prompt.validate([supporter],state)) {
        abort(state,'Tag Call search cannot retrieve Guzma & Hala');
        return original.call(this,state);
      }
      stage='tag-followup';
      return choose(state,'Search one genuine TAG TEAM Supporter',
        new ResolvePromptAction(prompt.id,[supporter]));
    }
    if (stage==='tag-followup' && prompt) {
      if (prompt.constructor.name==='ShowCardsPrompt')
        return choose(state,'Acknowledge Tag Call revealed card',
          new ResolvePromptAction(prompt.id,true));
      if (prompt.constructor.name==='WaitPrompt')
        return choose(state,'Acknowledge Tag Call completion',
          new ResolvePromptAction(prompt.id,null));
      abort(state,'Unexpected Tag Call follow-up prompt '+prompt.constructor.name);
      return original.call(this,state);
    }
    if (stage==='tag-followup' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      if (!player.hand.cards.some(c=>c.name==='Guzma & Hala')) {
        abort(state,'Tag Call did not deliver Guzma & Hala');
        return original.call(this,state);
      }
      stage='mode';
      return choose(state,'Play searched Guzma & Hala',
        play(player,'Guzma & Hala',
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
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
      const hasThunder=player.hand.cards.some(card=>
        card.name==='Thunder Mountain Prism Star');
      const thunder=hasThunder ? null : player.deck.cards.find(card=>
        card.name==='Thunder Mountain Prism Star');
      const selected=thunder ? [thunder,dce] : [dce];
      if (!dce || (!hasThunder && !options.allowStadiumSearch) ||
          (!hasThunder && !thunder) || !prompt.validate(selected,state)) {
        abort(state,'Required DCE/Stadium inaccessible in legal G&H search');
        return original.call(this,state);
      }
      stage='followup';
      events.push({turn:state.turn,stage:'search',cards:selected.map(c=>c.name)});
      return choose(state,'Search G&H for eligible Stadium and Special Energy',
        new ResolvePromptAction(prompt.id,selected));
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

module.exports={chooseDiscardPair,hasOpeningLine,chooseOpeningRoute,
  withAutonomousThornsSourceAttack};
