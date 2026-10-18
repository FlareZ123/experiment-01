'use strict';

const path = require('node:path');
const {isRank11BoostShakeCandidate} =
  require('./rank11-boostshake-opening-eligibility.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod = name => require(path.join(root, name));

/**
 * Conditional policy alternative for a real first-turn source rank11 board.
 * Before its first own-deck search, it reads only public board and own hand.
 * Search availability is learned through actual pending search prompts.
 * It never stages cards or mutates the Store outside real returned actions.
 * Back Order may obtain two Tools when Float Stone is absent from the hand.
 *
 * The heuristic intentionally commits a VSTAR power, VIP Item and turn-ending
 * Boost Shake to establish Tool-Garbodor. A competitive chooser must compare
 * those opportunity costs with the non-lock alternatives in further research.
 *
 * @template T
 * @param {()=>T} execute Source-dealt runMatch.
 * @returns {{result:T,attempted:boolean,completed:boolean,aborted:string|null,
 *   issuedActions:object[],initialOwnHand:string[]|null}}
 */
function withRank11AdaptiveBoostShake(execute) {
  const {SimpleTacticsAi} = mod('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    mod('game/store/actions/play-card-action');
  const {UseAbilityAction} = mod('game/store/actions/game-actions');
  const {ResolvePromptAction} = mod('game/store/actions/resolve-prompt-action');
  const {GamePhase} = mod('game/store/state/state');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const board = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const active = {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const events = [];
  let stage=0,attempted=false,aborted=null,initialOwnHand=null;

  /** @param {any} state @param {string} reason @param {any} action */
  function issue(state,reason,action) {
    events.push({turn:state.turn,ordinal:stage,reason,
      action:action.constructor.name});
    stage += 1;
    return action;
  }

  /** @param {any} state @param {string} reason */
  function abort(state,reason) {
    aborted = reason;
    events.push({turn:state.turn,ordinal:stage,reason:'abort: '+reason});
  }

  /** @param {any} player @param {string} name @param {object} target */
  function fromHand(player,name,target) {
    const index = player.hand.cards.findIndex(card => card.name === name);
    return index < 0 ? null : new PlayCardAction(player.id,index,target);
  }

  /** @param {any} state @param {any} pending @param {string} name */
  function fromSearch(state,pending,name) {
    const card = pending.cards?.cards?.find(card => card.name === name);
    if (!card || pending.validate([card],state) !== true) return null;
    return new ResolvePromptAction(pending.id,[card]);
  }

  /** @param {any} player */
  function trubbishBenchIndex(player) {
    return player.bench.findIndex(slot =>
      slot.getPokemonCard()?.name === 'Trubbish' && slot.tools.length === 0);
  }

  SimpleTacticsAi.prototype.decodeNextAction = function adaptive(state) {
    const player = state.players.find(p => p.id === this.client?.id);
    if (player?.id !== 101) return previous.call(this,state);
    const pending = state.prompts.find(p => p.result === undefined);

    if (!attempted && !pending &&
        state.phase === GamePhase.PLAYER_TURN &&
        isRank11BoostShakeCandidate(state,player)) {
      const action = fromHand(player,'Battle VIP Pass',board);
      attempted=true;
      initialOwnHand=player.hand.cards.map(card => card.fullName);
      return issue(state,'commit only from visible K0 opening hand',action);
    }

    if (!attempted || aborted || stage >= 11) {
      return previous.call(this,state);
    }

    const searchStages = new Map([
      [1,['ChooseCardsPrompt','Trubbish']],
      [6,['ChooseCardsPrompt','Boost Shake']],
      [9,['ChooseCardsPrompt','Garbodor']]
    ]);
    if (pending) {
      if (stage === 3 && pending.constructor.name === 'ChooseCardsPrompt') {
        const desired=['Forest Seal Stone'];
        if (!player.hand.cards.some(card => card.name === 'Float Stone')) {
          desired.push('Float Stone');
        }
        const cards=desired.map(name =>
          pending.cards?.cards?.find(card => card.name === name));
        if (cards.every(Boolean) && pending.validate(cards,state) === true) {
          return issue(state,'Back Order searches '+desired.join(' and '),
            new ResolvePromptAction(pending.id,cards));
        }
        abort(state,'Back Order cannot find '+desired.join(' and '));
        return previous.call(this,state);
      }
      const wanted=searchStages.get(stage);
      if (wanted && pending.constructor.name === wanted[0]) {
        const action=fromSearch(state,pending,wanted[1]);
        if (action) return issue(state,'own-deck prompt for '+wanted[1],action);
        abort(state,'search result missing '+wanted[1]);
        return previous.call(this,state);
      }
      if (stage === 10 && pending.constructor.name === 'ChoosePokemonPrompt') {
        const index=player.bench.findIndex(slot =>
          slot.getPokemonCard()?.name === 'Trubbish' &&
          slot.tools.some(tool => tool.name === 'Float Stone'));
        if (index >= 0 && pending.validate([player.bench[index]],state) === true) {
          return issue(state,'evolve Tool-bearing source Trubbish',
            new ResolvePromptAction(pending.id,[player.bench[index]]));
        }
        abort(state,'no eligible Tool-bearing Trubbish in evolve prompt');
        return previous.call(this,state);
      }
      // The Store can expose a second unrelated prompt before resuming
      // the planned action stage. Let the original prompt policy resolve it.
      return previous.call(this,state);
    }

    let action=null;
    if (stage === 2 && trubbishBenchIndex(player) >= 0) {
      action=new UseAbilityAction(player.id,'Back Order',active);
    } else if (stage === 4 && player.active.tools.length === 0) {
      action=fromHand(player,'Forest Seal Stone',active);
    } else if (stage === 5) {
      action=new UseAbilityAction(player.id,'Star Alchemy',active);
    } else if (stage === 7 && trubbishBenchIndex(player) >= 0) {
      action=fromHand(player,'Float Stone',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:trubbishBenchIndex(player)
      });
    } else if (stage === 8) {
      action=fromHand(player,'Boost Shake',board);
    }
    if (!action) {
      abort(state,'resource or board missing at stage '+stage);
      return previous.call(this,state);
    }
    return issue(state,'execute conditional opening step '+stage,action);
  };

  try {
    const result=execute();
    return {result,attempted,completed:stage===11,aborted,
      issuedActions:events,initialOwnHand};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={withRank11AdaptiveBoostShake};
