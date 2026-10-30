'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-sole-shuffle-deckzero-paper-compat-v1-default-off';

/**
 * A sole-held Iono/Marnie can affect an opponent's nonempty hand even if
 * its owner's deck was exhausted earlier in the turn. Pinned Twinleaf's
 * first canPlay/reduceEffect gate incorrectly demands owner deck cards.
 * This deliberately narrow opt-in does not change other card playability.
 *
 * @template T
 * @param {()=>T} execute Synchronous real-Store experiment.
 * @param {object} [deps] Native-pinned or injected pure-test interfaces.
 * @returns {T}
 */
function withSoleShuffleDeckZeroCorrection(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Iono}=deps.Iono&&deps.Marnie?deps:
    require(path.join(base,'sets/10-scarlet-and-violet/set-paldea-evolved/iono'));
  const {Marnie}=deps.Iono&&deps.Marnie?deps:
    require(path.join(base,'sets/09-sword-and-shield/set-sword-and-shield/marnie'));
  const {TrainerEffect}=deps.TrainerEffect?
    deps:require(path.join(base,'game/store/effects/play-card-effects'));
  const {StateUtils}=deps.getOpponent?{}:
    require(path.join(base,'game/store/state-utils'));
  const {DRAW_CARDS,MOVE_HAND_TO_DECK_THEN_DRAW}=
    deps.drawCards&&deps.moveHandToDeckThenDraw?{}:
      require(path.join(base,'game/store/prefabs/prefabs'));
  const getOpponent=deps.getOpponent??StateUtils.getOpponent;
  const drawCards=deps.drawCards??DRAW_CARDS;
  const moveHand=deps.moveHandToDeckThenDraw??MOVE_HAND_TO_DECK_THEN_DRAW;
  const entries=[{Card:Iono,family:'iono'},{Card:Marnie,family:'marnie'}];
  const originals=entries.map(({Card})=>{
    const proto=Card.prototype;
    const can=Object.getOwnPropertyDescriptor(proto,'canPlay');
    const reduce=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
    assert.equal(typeof can?.value,'function');
    assert.equal(typeof reduce?.value,'function');
    return {proto,can,reduce};
  });
  function caseApplies(card,state,owner){
    if(!owner||owner.supporterTurn!==0||
       !Array.isArray(owner.hand?.cards)||owner.deck?.cards?.length!==0)
      return false;
    if(owner.hand.cards.some(c=>c!==card))return false;
    return getOpponent(state,owner).hand.cards.length>0;
  }
  const patched=[];
  try{
    for(let i=0;i<entries.length;i++){
      const {family}=entries[i];
      const {proto,can,reduce}=originals[i];
      Object.defineProperty(proto,'canPlay',{...can,value:function(store,state,player){
        return caseApplies(this,state,player)||can.value.call(this,store,state,player);
      }});
      Object.defineProperty(proto,'reduceEffect',{...reduce,
        value:function(store,state,effect){
          if(!(effect instanceof TrainerEffect)||
             effect.trainerCard!==this||
             !caseApplies(this,state,effect.player))
            return reduce.value.call(this,store,state,effect);
          const owner=effect.player,opponent=getOpponent(state,owner);
          const cards=[...opponent.hand.cards];
          // Preserve the pinned implementation's random hand ordering.
          assert.equal(typeof this.shuffleCards,'function');
          this.shuffleCards(cards);
          const ownerDraw=family==='iono'?owner.getPrizeLeft():5;
          const opponentDraw=family==='iono'?opponent.getPrizeLeft():4;
          return moveHand(store,state,opponent,{
            cards,drawCount:opponentDraw,sourceCard:this,
            afterDraw:()=>{drawCards(store,state,owner,ownerDraw);}
            // If a separate effect prevents every hand return, the
            // conditional draw has no source card movement to justify it.
          });
        }
      });
      patched.push(i);
    }
    return execute();
  }finally{
    for(const i of patched.reverse()){
      const {proto,can,reduce}=originals[i];
      Object.defineProperty(proto,'reduceEffect',reduce);
      Object.defineProperty(proto,'canPlay',can);
    }
  }
}

module.exports={VERSION,withSoleShuffleDeckZeroCorrection};
