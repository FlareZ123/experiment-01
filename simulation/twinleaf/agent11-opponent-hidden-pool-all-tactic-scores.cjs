'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {deckPermutation,seededRandom}=require('./headless.cjs');
const {canonicalUnseenCards}=require('./canonical-unseen-cards.cjs');
const {
  normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource
}=require('./normalize-deep-clone.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Reconstruct only known pinned SimpleTactic root actions using primitive
 * identifiers and public target descriptors. No action may retain a reference
 * to a live Store-owned object.
 *
 * @param {object} action A pinned game/store Action.
 * @param {object} types The pinned engine action constructors.
 * @returns {object}
 */
function reproduceRootAction(action,types) {
  if(action instanceof types.PlayCardAction)
    return new types.PlayCardAction(action.id,action.handIndex,{...action.target});
  for(const name of ['UseAbilityAction','UseTrainerAbilityAction',
    'UseEnergyAbilityAction']){
    if(action instanceof types[name])
      return new types[name](action.clientId,action.name,{...action.target});
  }
  if(action instanceof types.AttackAction)
    return new types.AttackAction(action.clientId,action.name);
  if(action instanceof types.RetreatAction)
    return new types.RetreatAction(action.clientId,action.benchIndex);
  if(action instanceof types.UseStadiumAction)
    return new types.UseStadiumAction(action.clientId);
  if(action instanceof types.PassTurnAction)
    return new types.PassTurnAction(action.clientId);
  throw new Error('Pinned SimpleTactic action is not supported by blinded scorer: '+
    action?.constructor?.name);
}

/**
 * Experimental, reversible extension of Agent23's partial diagnostic:
 * evaluate each legal SimpleTactic root action under the same deterministic
 * samples of the opponent's unseen hand/deck/Prizes. The source's fixed
 * printed 60 and public observations must establish the unseen multiset.
 * This does not alter live actions, search decisions or prompt resolvers.
 *
 * Returning undefined if any sample's speculative action is rejected is an
 * intentional fail-closed restriction. Do not promote this proxy to a
 * human-grade player policy without testing legality and decision strength.
 *
 * @param {{
 *   seed:number,samples:number,
 *   hiddenPoolKnownVerified:true,
 *   opponentHandUnobservedVerified:true,
 *   opponentDeckOrderUnobservedVerified:true,
 *   opponentPrizeIdentityUnobservedVerified:true
 * }} options
 * @returns {()=>void} Restore the original pinned evaluator.
 */
function installOpponentHiddenPoolAllTacticScores(options) {
  assert.ok(Number.isSafeInteger(options.seed),'Expected finite integer seed');
  assert.ok(Number.isSafeInteger(options.samples)&&
    options.samples>=1&&options.samples<=32,
  'Expected 1 to 32 deterministic samples');
  for(const key of ['hiddenPoolKnownVerified',
    'opponentHandUnobservedVerified',
    'opponentDeckOrderUnobservedVerified',
    'opponentPrizeIdentityUnobservedVerified'])
    assert.equal(options[key],true,'Unverified hidden-zone assumption: '+key);

  const load=name=>require(path.join(output,name));
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  const {deepClone}=load('utils');
  const types={PlayCardAction,...load('game/store/actions/game-actions')};
  const original=SimpleTactic.prototype.evaluateAction;

  SimpleTactic.prototype.evaluateAction=function sampledAllActions(
    state,playerId,action,passTurnScore
  ){
    assertVendorCloneCompatibleSource(state);
    const owner=state.players.find(p=>p.id===playerId);
    const opponent=state.players.find(p=>p.id!==playerId);
    assert.ok(owner&&opponent&&state.players.length===2,
      'Only complete two-player games are supported');
    const slots=[];
    opponent.prizes.forEach((pile,i)=>
      pile.cards.forEach((_card,j)=>slots.push([i,j])));
    const concealed=canonicalUnseenCards([
      ...opponent.hand.cards,...opponent.deck.cards,
      ...slots.map(([i,j])=>opponent.prizes[i].cards[j])
    ]);
    assert.equal(new Set(concealed).size,concealed.length,
      'Hidden physical card objects must be distinct');
    const knownPool=concealed.map(card=>card.fullName).sort();
    const handCount=opponent.hand.cards.length;
    const deckCount=opponent.deck.cards.length;
    let total=0;
    for(let n=0;n<options.samples;n++){
      const copy=normalizeDeepClonePrototypes(state,deepClone(state));
      const other=copy.players.find(p=>p.id!==playerId);
      const unseen=canonicalUnseenCards([
        ...other.hand.cards,...other.deck.cards,
        ...slots.map(([i,j])=>other.prizes[i].cards[j])
      ]);
      assert.deepEqual(unseen.map(card=>card.fullName).sort(),knownPool,
        'Cloned hidden pool unexpectedly changed');
      // Actor-visible seed: not derived from the opponent's hand identities,
      // positions, actual hidden Prize distribution or card object IDs.
      const seed=(options.seed^Math.imul(state.turn+1,0x9e3779b9)^
        Math.imul(playerId,0x85ebca6b)^
        Math.imul(n+1,0xc2b2ae35))>>>0;
      const indices=deckPermutation(unseen.length,seededRandom(seed));
      const shuffled=indices.map(i=>unseen[i]);
      other.hand.cards.splice(0,handCount,...shuffled.slice(0,handCount));
      other.deck.cards.splice(0,deckCount,
        ...shuffled.slice(handCount,handCount+deckCount));
      slots.forEach(([i,j],k)=>{
        other.prizes[i].cards[j]=shuffled[handCount+deckCount+k];
      });
      const hypothetical=reproduceRootAction(action,types);
      const value=original.call(this,copy,playerId,hypothetical,passTurnScore);
      if(value===undefined)return undefined;
      assert.ok(Number.isFinite(value),'Speculative score must be finite');
      total+=value;
    }
    return total/options.samples;
  };

  return function restore(){
    assert.strictEqual(SimpleTactic.prototype.evaluateAction,
      sampledAllActions,
      'Another intervention replaced the experimental scorer');
    SimpleTactic.prototype.evaluateAction=original;
  };
}

module.exports={
  installOpponentHiddenPoolAllTacticScores,reproduceRootAction
};
