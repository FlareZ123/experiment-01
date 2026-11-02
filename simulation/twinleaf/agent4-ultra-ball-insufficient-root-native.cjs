'use strict';
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Original rank14 printed Ultra Ball MEG with only one physically available
 * other hand card. An Item whose printed cost is discarding two cannot be
 * played in this state. Prepared Store, both actual owner seats, never a
 * natural 60-card opening.
 * @param {0|1} seat Native owner's actual physical player seat.
 * @returns {object} Owner public/result count and physically retained cards.
 */
function probeUltraBallInsufficientRoot(seat){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons(seat);
  const grass=f.card('Grass Energy MEE');
  const ultra=f.card('Ultra Ball MEG');
  const target=f.card('Regidrago V SIT');
  f.source.hand.cards.push(grass,ultra);
  f.source.deck.cards.push(target);
  const sourceHandBefore=f.source.hand.cards.length;
  const deckBefore=f.source.deck.cards.length;
  let error=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,1,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(e){error=String(e?.message??e);}
  return {
    seat,error,
    sourceHandBefore,sourceHandAfter:f.source.hand.cards.length,
    deckBefore,deckAfter:f.source.deck.cards.length,
    ultraStillInHand:f.source.hand.cards.includes(ultra),
    grassStillInHand:f.source.hand.cards.includes(grass),
    ultraInDiscard:f.source.discard.cards.includes(ultra),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    scope:'Original printed Ultra Ball MEG root in conditional native Store with one other hand card'
  };
}
module.exports={probeUltraBallInsufficientRoot};
