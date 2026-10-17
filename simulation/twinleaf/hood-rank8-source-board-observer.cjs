'use strict';

const {publicBoardSnapshot} = require('./public-board-telemetry.cjs');

/**
 * Detached public state and the acting player's own hand, observed after a
 * root decision is already selected. No observer result is fed to either AI.
 * @param {object} state
 * @param {number} seat
 * @returns {object}
 */
function snapshot(state, seat) {
  const actor = state.players[seat];
  return {
    turn:state.turn,phase:state.phase,activePlayer:state.activePlayer,
    board:publicBoardSnapshot(state),
    prizes:state.players.map(p=>p.prizes.filter(x=>x.cards.length).length),
    handSizes:state.players.map(p=>p.hand.cards.length),
    actingHand:actor?.hand.cards.map(c=>c.fullName)??null,
    opponentDarknessDiscard:state.players[0].discard.cards
      .filter(c=>c.name==='Darkness Energy').length,
    unresolvedPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}

/**
 * Resolve the actual Pokémon that declared an Ability, using Twinleaf's
 * UseAbilityAction.target (SlotType.ACTIVE=1, BENCH=2).
 * @param {object} state
 * @param {number} seat
 * @param {object} action
 * @param {string} kind
 * @returns {object|null}
 */
function abilitySourceBefore(state, seat, action, kind) {
  if (kind !== 'UseAbilityAction') return null;
  const target = action.target;
  const player = state.players[seat];
  const source = target?.slot === 1 ? player?.active :
    target?.slot === 2 && Number.isInteger(target.index) ?
      player?.bench?.[target.index] : null;
  const pokemon = source?.getPokemonCard?.();
  return {
    name: pokemon?.name ?? null,
    tools: source ? source.tools.map(card => card.name) : null,
    target: target ? {slot:target.slot,index:target.index} : null
  };
}

/**
 * Instrument only actual live Store dispatches. Speculative Simulator Stores
 * never enter this observer. It restores the original dispatch method on exit.
 * @template T
 * @param {Function} Store
 * @param {()=>T} execute
 * @returns {{result:T,records:object[],liveDispatches:number}}
 */
function withRank8BoardObserver(Store,execute) {
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(!original || typeof original.value!=='function') {
    throw new TypeError('Expected a Store.dispatch method');
  }
  let live=null;
  let liveDispatches=0;
  const records=[];
  const instrumented=function (...args) {
    const action=args[0];
    const kind=action?.constructor?.name??'UnknownAction';
    if(!live && kind==='AddPlayerAction') live=this;
    if(this!==live) return original.value.apply(this,args);
    const ordinal=liveDispatches++;
    const state=this.state;
    const populated=state.players.length===2;
    const seat=populated?state.players.findIndex(p=>
      p.id===(action.clientId??action.id)):-1;
    const activeSeat=seat>=0?seat:state.activePlayer;
    const card=populated && kind==='PlayCardAction' ?
      state.players[activeSeat]?.hand.cards[action.handIndex]?.name??null:null;
    const relevant=populated && (
      // Full source turn-7 actions distinguish a Tool deliberately spent
      // before Iono from a spare Tool held when Trubbish becomes visible.
      (state.turn===7 && state.activePlayer===0) ||
      ['AttackAction','RetreatAction','PassTurnAction','UseAbilityAction']
        .includes(kind) ||
      kind==='PlayCardAction' && (
        /Energy|Garbodor|Trubbish|Hood|Stone|Temple|Dark Patch|Guzma|Mega Absol|Arven/i.test(card||'')
      ));
    const before=relevant?snapshot(state,activeSeat):null;
    const abilitySource=before?abilitySourceBefore(state,activeSeat,action,kind):null;
    let dispatchError=null;
    try {
      return original.value.apply(this,args);
    } catch(error) {
      dispatchError=String(error?.message||error);
      throw error;
    } finally {
      if(before) {
        records.push({
          ordinal,turn:before.turn,actingSeat:activeSeat,
          action:kind,card,declaredName:action.name??null,
          abilitySource,before,after:snapshot(this.state,activeSeat),dispatchError
        });
      }
    }
  };
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:instrumented});
  try {
    return {result:execute(),records,liveDispatches};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={snapshot,abilitySourceBefore,withRank8BoardObserver};
