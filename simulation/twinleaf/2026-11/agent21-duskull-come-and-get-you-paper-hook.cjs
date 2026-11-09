'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-duskull-come-and-get-you-discard-bench-v1';
const engineRoot=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native=file=>require(path.join(engineRoot,file));

/**
 * Correct pinned Shrouded Fable Duskull's inherited Come and Get You attack.
 *
 * The upstream generator reads player.hand instead of player.discard when
 * checking for eligible Duskull, and requires one selection even though the
 * printed wording says "up to 3." A full Bench must not reject the attack.
 * PRE 35 inherits SFA 18's reducer, so both printings receive this fix.
 *
 * Uses only the actual attack owner and visible public Bench capacity; the
 * eligible Duskull objects come from that owner's permitted discard pile.
 * All cards move through the pinned engine's native MOVE_CARDS effect.
 *
 * Scoped, reversible development wrapper. It does not promote a game to
 * competitively paper-qualified, and must be enabled symmetrically in a
 * newly registered trial before it can influence field evaluation.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store workload.
 * @param {{Duskull?:Function,WAS_ATTACK_USED?:Function,
 *   MOVE_CARDS?:Function,ChooseCardsPrompt?:Function,
 *   PokemonCard?:Function,SuperType?:object,GameMessage?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperDuskullComeAndGetYou(run,deps={}){
  assert.equal(typeof run,'function');
  const Duskull=deps.Duskull??native(
    'sets/10-scarlet-and-violet/set-shrouded-fable/duskull').Duskull;
  const prefabs=deps.WAS_ATTACK_USED&&deps.MOVE_CARDS?deps:
    native('game/store/prefabs/prefabs');
  const WAS_ATTACK_USED=deps.WAS_ATTACK_USED??prefabs.WAS_ATTACK_USED;
  const MOVE_CARDS=deps.MOVE_CARDS??prefabs.MOVE_CARDS;
  const {PokemonCard}=deps.PokemonCard?deps:
    native('game/store/card/pokemon-card');
  const {SuperType}=deps.SuperType?deps:
    native('game/store/card/card-types');
  const {GameMessage}=deps.GameMessage?deps:native('game');
  const {ChooseCardsPrompt}=deps.ChooseCardsPrompt?deps:
    native('game/store/prompts/choose-cards-prompt');
  const descriptor=Object.getOwnPropertyDescriptor(
    Duskull.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');

  const audit={
    version:VERSION,observedAttacks:0,emptyBenchSlots:0,
    noEligibleDiscard:0,choicePrompts:0,selectedPhysicalDuskull:0,
    defaultOff:true,paperQualifiedGames:0
  };
  function corrected(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this))
      return descriptor.value.call(this,store,state,effect);
    audit.observedAttacks++;
    const owner=effect.player;
    const slots=owner.bench.filter(slot=>slot.cards.length===0);
    const eligible=owner.discard.cards.filter(card=>
      card instanceof PokemonCard&&card.name==='Duskull');
    if(slots.length===0){
      audit.emptyBenchSlots++;
      return state;
    }
    if(eligible.length===0){
      audit.noEligibleDiscard++;
      return state;
    }
    const max=Math.min(3,slots.length,eligible.length);
    const self=this;
    function* attack(next){
      let selected=[];
      audit.choicePrompts++;
      yield store.prompt(state,new ChooseCardsPrompt(owner,
        GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
        owner.discard,{superType:SuperType.POKEMON,name:'Duskull'},
        {min:0,max,allowCancel:true}),
      cards=>{
        selected=cards??[];
        next();
      });
      assert.ok(Array.isArray(selected)&&selected.length<=max,
        'Duskull selection exceeds allowed physical placement');
      assert.equal(new Set(selected).size,selected.length,
        'Duskull selection repeats physical card');
      for(let i=0;i<selected.length;i++){
        const card=selected[i];
        assert.ok(owner.discard.cards.includes(card)&&
          card instanceof PokemonCard&&card.name==='Duskull',
        'Duskull selection did not originate in owner discard');
        MOVE_CARDS(store,state,owner.discard,slots[i],{
          cards:[card],sourceCard:effect.source.getPokemonCard()
        });
        slots[i].pokemonPlayedTurn=state.turn;
        audit.selectedPhysicalDuskull++;
      }
    }
    const generator=attack(()=>generator.next());
    return generator.next().value;
  }
  Object.defineProperty(Duskull.prototype,'reduceEffect',{
    ...descriptor,value:corrected
  });
  try{return {result:run(),audit:{...audit}};}
  finally{
    assert.equal(Duskull.prototype.reduceEffect,corrected,
      'Duskull paper hook lost reducer ownership');
    Object.defineProperty(Duskull.prototype,'reduceEffect',descriptor);
  }
}
module.exports={VERSION,withPaperDuskullComeAndGetYou};
