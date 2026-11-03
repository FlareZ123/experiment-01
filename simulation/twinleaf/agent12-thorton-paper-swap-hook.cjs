'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent12-paper-thorton-reversible-target-and-preservation-v1';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Use a reversible research-owned implementation of exact printed Thorton.
 * The pinned Thorton implementation removes the outgoing Basic before
 * inserting the replacement, causing the generic Store to reset the now-
 * empty slot and discard Energy/Tools, damage and in-play turn history.
 * It also supplies an empty/undefined blocked-target array for evolved
 * Pokémon and accepts them as targets.
 *
 * This hook installs only for a synchronous native experiment. It does not
 * modify the vendor submodule, cannot prove full deal/policy parity, and must
 * be reviewed against the pinned upstream revision whenever updated.
 * @template T
 * @param {()=>T} execute Native Store transaction.
 * @returns {T}
 */
function withPaperThortonSwap(execute){
  assert.equal(typeof execute,'function');
  const {Thorton}=native('sets/09-sword-and-shield/set-lost-origin/thorton');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {Stage,SuperType}=native('game/store/card/card-types');
  const {WAS_TRAINER_USED}=native('game/store/prefabs/trainer-prefabs');
  const {MOVE_CARDS}=native('game/store/prefabs/prefabs');
  const {ChoosePokemonPrompt}=
    native('game/store/prompts/choose-pokemon-prompt');
  const {ChooseCardsPrompt}=
    native('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=native('game/game-message');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const proto=Thorton.prototype;
  const oldReduce=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  const oldCanPlay=Object.getOwnPropertyDescriptor(proto,'canPlay');
  assert.equal(typeof oldReduce?.value,'function');
  assert.equal(typeof oldCanPlay?.value,'function');

  const eligibleOwnSlots=player=>[
    player.active,...player.bench
  ].filter(slot=>slot.getPokemonCard()?.stage===Stage.BASIC);
  const deckBasicAvailable=player=>player.discard.cards.some(
    c=>c instanceof PokemonCard&&c.stage===Stage.BASIC
  );

  function paperCanPlay(_store,_state,player){
    return player.supporterTurn===0&&
      deckBasicAvailable(player)&&eligibleOwnSlots(player).length>0;
  }

  function paperReduce(store,state,effect){
    if(!WAS_TRAINER_USED(effect,this))
      return oldReduce.value.call(this,store,state,effect);
    const player=effect.player;
    if(!paperCanPlay(store,state,player))
      throw Error('PAPER_THORTON_NO_ELIGIBLE_BASIC_OR_SUPPORTER_SPENT');

    MOVE_CARDS(store,state,player.hand,player.supporter,{
      cards:[effect.trainerCard],sourceCard:this
    });
    effect.preventDefault=true;
    const blocked=[];
    if(player.active.getPokemonCard()?.stage!==Stage.BASIC)
      blocked.push({player:PlayerType.BOTTOM_PLAYER,
        slot:SlotType.ACTIVE,index:0});
    player.bench.forEach((slot,index)=>{
      if(slot.getPokemonCard()&&slot.getPokemonCard().stage!==Stage.BASIC)
        blocked.push({player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index});
    });

    return store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE,SlotType.BENCH],
        {min:1,max:1,allowCancel:false,blocked}
      ),
      selected=>{
        const targets=selected??[];
        const target=targets[0];
        if(targets.length!==1||!eligibleOwnSlots(player).includes(target))
          throw Error('PAPER_THORTON_TARGET_MUST_BE_BASIC');
        const outgoing=target.getPokemonCard();
        return store.prompt(
          state,
          new ChooseCardsPrompt(
            player,GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
            player.discard,
            {superType:SuperType.POKEMON,stage:Stage.BASIC},
            {min:1,max:1,allowCancel:false}
          ),
          selectedCards=>{
            const cards=selectedCards??[];
            const incoming=cards[0];
            if(cards.length!==1||
              !(incoming instanceof PokemonCard)||
              incoming.stage!==Stage.BASIC||
              !player.discard.cards.includes(incoming)||
              target.getPokemonCard()!==outgoing)
              throw Error('PAPER_THORTON_DISCARD_BASIC_SELECTION_INVALID');

            // Crucial: move incoming Basic into the slot BEFORE removing the
            // outgoing Basic, so getPokemons().length never reaches zero.
            // Otherwise pinned MoveCardsEffect automatically discards tools
            // and Energy and resets damage/turn-history on the empty slot.
            MOVE_CARDS(store,state,player.discard,target,{
              cards:[incoming],sourceCard:this
            });
            MOVE_CARDS(store,state,target,player.discard,{
              cards:[outgoing],sourceCard:this
            });
          }
        );
      }
    );
  }

  Object.defineProperty(proto,'canPlay',{...oldCanPlay,value:paperCanPlay});
  Object.defineProperty(proto,'reduceEffect',{...oldReduce,value:paperReduce});
  try{return execute();}
  finally{
    assert.strictEqual(proto.canPlay,paperCanPlay);
    assert.strictEqual(proto.reduceEffect,paperReduce);
    Object.defineProperty(proto,'reduceEffect',oldReduce);
    Object.defineProperty(proto,'canPlay',oldCanPlay);
  }
}

module.exports={VERSION,PINNED,withPaperThortonSwap};
