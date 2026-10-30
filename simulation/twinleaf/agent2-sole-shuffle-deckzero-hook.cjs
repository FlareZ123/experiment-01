'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-sole-shuffle-opponent-only-paper-compat-v2-default-off';

/**
 * A sole-held Iono/Marnie can affect the opponent's nonempty hand even when
 * the owner deck is empty. Pinned canPlay can incorrectly veto that case.
 * When opponent hand return is prevented (e.g. Dew Guard), the printed draw
 * clause also fails: pinned onMovePrevented wrongly gives the owner cards.
 * This opt-in applies the opponent-only reducer consistently and preserves
 * the original canPlay result except for the exact owner-deck-zero case.
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
  function soleOpponentHandReturn(card,state,owner){
    if(!owner||owner.supporterTurn!==0||
       !Array.isArray(owner.hand?.cards))return false;
    if(owner.hand.cards.some(c=>c!==card))return false;
    return getOpponent(state,owner).hand.cards.length>0;
  }
  function caseApplies(card,state,owner){
    return owner?.deck?.cards?.length===0 &&
      soleOpponentHandReturn(card,state,owner);
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
             !soleOpponentHandReturn(this,state,effect.player))
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
