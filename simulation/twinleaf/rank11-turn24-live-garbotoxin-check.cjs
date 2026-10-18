'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {object} */
const engine=name=>require(path.join(output,name));

/**
 * Read actual first rank11-response candidate turn-24 Perfection power
 * availability from the authentic headless Store. No staged state, clone,
 * queued action substitution, AI argument or RNG operation is involved.
 *
 * Preserve the original bot and card identities; compare replay hashes
 * against runs with this observer entirely absent.
 *
 * @template T
 * @param {()=>T} execute Source game with fixed 60s/seed.
 * @returns {{result:T,event:object|null}}
 */
function withLiveFirstCandidateTurn24AbilityCheck(execute) {
  if(typeof execute!=='function')throw new TypeError('Need source game');
  const {Store}=engine('game/store/store');
  const {GamePhase}=engine('game/store/state/state');
  const {CheckPokemonPowersEffect}=engine('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  let rootStore=null;
  let event=null;
  function watchedDispatch(action) {
    // Initial AddPlayerAction belongs to the actual source game. Bot tactic
    // clones may call dispatch later; never treat their states as game truth.
    if(!rootStore && action.constructor.name==='AddPlayerAction') {
      rootStore=this;
    }
    const response=original.value.call(this,action);
    if(this!==rootStore || event || this.state.turn!==24 ||
        this.state.activePlayer!==1 ||
        this.state.phase!==GamePhase.PLAYER_TURN ||
        this.state.prompts.some(prompt=>prompt.result===undefined))return response;
    const state=this.state;
    const candidate=state.players[1];
    const opponent=state.players[0];
    const mew=candidate.active.getPokemonCard();
    if(mew?.name!=='Mewtwo & Mew-GX')return response;
    const check=new CheckPokemonPowersEffect(candidate,mew);
    this.reduceEffect(state,check);
    const blocked=IS_ABILITY_BLOCKED(this,state,candidate,mew);
    const visible=check.powers.some(power=>power.name==='Perfection');
    event={
      schema:'live-root-rank11-first-candidate-turn24-power-availability-v1',
      globalTurn:state.turn,sourceActualSlot:0,candidateActualSlot:1,
      triggerAction:action.constructor.name,
      candidateActive:mew.fullName,
      sourceActive:opponent.active.getPokemonCard()?.fullName??null,
      sourceActiveToolNames:opponent.active.tools.map(card=>card.name),
      sourceBench:opponent.bench.filter(slot=>slot.getPokemonCard()).map(slot=>({
        pokemon:slot.getPokemonCard().fullName,
        tools:slot.tools.map(card=>card.name)
      })),
      sourceBenchCount:opponent.bench.filter(slot=>slot.getPokemonCard()).length,
      candidateBenchCount:candidate.bench.filter(slot=>slot.getPokemonCard()).length,
      candidateHandCardNames:candidate.hand.cards.map(card=>card.name),
      candidateFieldBlowerInHand:candidate.hand.cards.some(card=>card.name==='Field Blower'),
      PerfectionBlocked:blocked,
      PerfectionVisibleInPrintedPowerCheck:visible,
      qualification:'one live Store power-availability check; observer noninterference must be independently asserted'
    };
    return response;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:watchedDispatch});
  try {
    return {result:execute(),event};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}
module.exports={withLiveFirstCandidateTurn24AbilityCheck};
