'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const VERSION='agent25-rank31-paper-duskull-discard-option-v1';

/**
 * Pinned source error: SFA18 Come and Get You checks player.hand.cards
 * while its actual printed effect places Duskull from the discard pile.
 * Prismatic Evolutions 35 is a subclass of the same original reducer.
 *
 * Research-owned, default-off hook: only Duskull PRE #35, only attack 0.
 * The printed attack may choose zero targets, including when Bench is full.
 * Do not alter printed Energy costs, native attack declaration checks,
 * source-deck identity, any other attack, or the vendored Twinleaf code.
 *
 * @template T
 * @param {()=>T} execute Real pinned native Store execution.
 * @param {{deps?:object}} [options] Injectable native constructors for tests.
 * @returns {{result:T,audit:object}}
 */
function withPaperDuskullDiscardOption(execute,options={}){
  assert.equal(typeof execute,'function');
  const load=modulePath=>require(path.join(OUT,modulePath));
  const d=options.deps??{};
  const DuskullPRE=d.DuskullPRE??load(
    'sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts').DuskullPRE;
  const {WAS_ATTACK_USED,MOVE_CARDS}=d.prefabs??load(
    'game/store/prefabs/prefabs');
  const {PokemonCard}=d.pokemon??load(
    'game/store/card/pokemon-card');
  const {SuperType}=d.types??load(
    'game/store/card/card-types');
  const {ChooseCardsPrompt}=d.prompts??load(
    'game/store/prompts/choose-cards-prompt');
  const {GameMessage}=d.messages??load('game/game-message');
  const original=Object.getOwnPropertyDescriptor(
    DuskullPRE.prototype,'reduceEffect');
  // The PRE subclass inherits the original SFA reducer; it does not own
  // a descriptor at its own prototype level. Restore inheritance afterward.
  const inherited=DuskullPRE.prototype.reduceEffect;
  assert.equal(typeof inherited,'function');
  assert.ok(original===undefined||typeof original.value==='function');
  const audit={version:VERSION,strictPrinting:'Duskull PRE',
    invoked:0,noTargetNoop:0,prompts:0,selectedCount:0,
    eligibleDiscardCounts:[],paperQualified:false,
    sourceDeckCardsUnchanged:true,actualStoreActionEligibilityUnchanged:true};

  function paperReduce(store,state,effect){
    if(this.fullName!=='Duskull PRE'||!WAS_ATTACK_USED(effect,0,this))
      return inherited.call(this,store,state,effect);
    audit.invoked++;
    const player=effect.player;
    const open=player.bench.filter(slot=>slot.cards.length===0);
    const eligible=player.discard.cards.filter(card=>
      card instanceof PokemonCard&&card.name==='Duskull');
    const max=Math.min(3,open.length,eligible.length);
    audit.eligibleDiscardCounts.push({
      available:eligible.length,openBench:open.length,max});
    if(max===0){
      // Rulebook: attacks with a Bench-put effect may do nothing. The
      // source SFA reducer incorrectly throws CANNOT_USE_POWER after
      // scanning the player's *hand* rather than their discard.
      audit.noTargetNoop++;
      return state;
    }
    const prompt=new ChooseCardsPrompt(
      player,GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.discard,{superType:SuperType.POKEMON,name:'Duskull'},
      {min:0,max,allowCancel:false}
    );
    audit.prompts++;
    return store.prompt(state,prompt,selected=>{
      const cards=selected??[];
      assert.ok(Array.isArray(cards)&&cards.length<=max,
        'Printed Come and Get You recipient count must be 0..max');
      assert.ok(new Set(cards).size===cards.length&&
        cards.every(card=>eligible.includes(card)&&
          player.discard.cards.includes(card)),
        'Printed Come and Get You targets must remain distinct discard Duskull');
      for(const [i,card] of cards.entries()){
        MOVE_CARDS(store,state,player.discard,open[i],
          {cards:[card],sourceCard:effect.source.getPokemonCard()});
        open[i].pokemonPlayedTurn=state.turn;
      }
      audit.selectedCount+=cards.length;
    });
  }

  Object.defineProperty(DuskullPRE.prototype,'reduceEffect',{
    configurable:true,enumerable:false,writable:true,value:paperReduce
  });
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent25DuskullPaperAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(DuskullPRE.prototype.reduceEffect,paperReduce);
    if(original)Object.defineProperty(
      DuskullPRE.prototype,'reduceEffect',original);
    else delete DuskullPRE.prototype.reduceEffect;
    assert.strictEqual(DuskullPRE.prototype.reduceEffect,inherited);
  }
}

module.exports={VERSION,withPaperDuskullDiscardOption};
