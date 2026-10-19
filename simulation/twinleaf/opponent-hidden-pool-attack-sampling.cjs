'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {deckPermutation,seededRandom}=require('./headless.cjs');
const {canonicalUnseenCards}=require('./canonical-unseen-cards.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=require('./normalize-deep-clone.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/**
 * Opt-in observer-constrained opponent hand/deck/Prize scoring diagnostic.
 * Source roster and public observations must independently establish the
 * hidden multiset; none of the sampled identities or positions may be known.
 * Runs only prospective AttackAction scoring; real actions stay untouched.
 * @param {{seed:number,samples:number,includePerfectionAbility?:boolean,hiddenPoolKnownVerified:boolean,opponentHandUnobservedVerified:boolean,opponentDeckOrderUnobservedVerified:boolean,opponentPrizeIdentityUnobservedVerified:boolean}} options
 * @returns {()=>void}
 */
function installOpponentHiddenPoolAttackSampling(options){
  assert.ok(Number.isSafeInteger(options.seed));
  assert.ok(Number.isSafeInteger(options.samples)&&options.samples>=1&&options.samples<=64);
  for(const key of ['hiddenPoolKnownVerified','opponentHandUnobservedVerified','opponentDeckOrderUnobservedVerified','opponentPrizeIdentityUnobservedVerified']){
    assert.equal(options[key],true,key+' must be verified before sampling');
  }
  const {SimpleTactic}=require(path.join(output,'simple-bot/simple-tactics/simple-tactics'));
  const {AttackAction,UseAbilityAction}=require(path.join(output,'game/store/actions/game-actions'));
  const {deepClone}=require(path.join(output,'utils'));
  const original=SimpleTactic.prototype.evaluateAction;
  SimpleTactic.prototype.evaluateAction=function sampledAttack(state,playerId,action,passTurnScore){
    const delegatedPerfection=options.includePerfectionAbility===true &&
      action instanceof UseAbilityAction && action.name==='Perfection';
    if(!(action instanceof AttackAction)&&!delegatedPerfection){
      return original.call(this,state,playerId,action,passTurnScore);
    }
    assertVendorCloneCompatibleSource(state);
    const owner=state.players.find(p=>p.id===playerId);
    const opponent=state.players.find(p=>p.id!==playerId);
    assert.ok(owner&&opponent&&state.players.length===2,'Expected two-player State');
    const prizeSlots=[];
    opponent.prizes.forEach((pile,i)=>pile.cards.forEach((card,j)=>prizeSlots.push([i,j])));
    const hidden=canonicalUnseenCards([
      ...opponent.hand.cards,...opponent.deck.cards,
      ...prizeSlots.map(([i,j])=>opponent.prizes[i].cards[j])
    ]);
    assert.equal(new Set(hidden).size,hidden.length,'Hidden objects cannot be aliased');
    const expected=hidden.map(c=>c.fullName).sort();
    const handCount=opponent.hand.cards.length,deckCount=opponent.deck.cards.length;
    let total=0;
    for(let n=0;n<options.samples;n++){
      const copy=normalizeDeepClonePrototypes(state,deepClone(state));
      const other=copy.players.find(p=>p.id!==playerId);
      const unseen=canonicalUnseenCards([
        ...other.hand.cards,...other.deck.cards,
        ...prizeSlots.map(([i,j])=>other.prizes[i].cards[j])
      ]);
      assert.deepEqual(unseen.map(c=>c.fullName).sort(),expected);
      const seed=(options.seed^Math.imul(state.turn+1,0x9e3779b9)^Math.imul(playerId,0x85ebca6b)^Math.imul(n+1,0xc2b2ae35))>>>0;
      const shuffle=deckPermutation(unseen.length,seededRandom(seed)).map(i=>unseen[i]);
      other.hand.cards.splice(0,handCount,...shuffle.slice(0,handCount));
      other.deck.cards.splice(0,deckCount,...shuffle.slice(handCount,handCount+deckCount));
      prizeSlots.forEach(([i,j],k)=>other.prizes[i].cards[j]=shuffle[handCount+deckCount+k]);
      const sampledAction=delegatedPerfection?
        new UseAbilityAction(action.clientId,action.name,{...action.target}):
        new AttackAction(action.clientId,action.name);
      const score=original.call(this,copy,playerId,sampledAction,passTurnScore);
      if(score===undefined)return undefined;
      assert.ok(Number.isFinite(score),'Nonfinite simulated score');
      total+=score;
    }
    return total/options.samples;
  };
  return ()=>{SimpleTactic.prototype.evaluateAction=original;};
}
module.exports={installOpponentHiddenPoolAttackSampling};
