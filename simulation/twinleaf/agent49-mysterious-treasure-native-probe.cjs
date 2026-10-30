'use strict';
const assert=require('node:assert/strict');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');

const TREASURE='Mysterious Treasure FLI';
const TARGET='Regidrago V SIT';

/**
 * Observe genuine pinned Store's first printed Item choice request with an
 * explicit owner-disposable hand and deck containing a search target.
 * No owner deck contents enter the pre-Item root decision.
 * @param {0|1} seat
 * @returns {object}
 */
function runSeat(seat){
  const x=stage(seat),manager=initializeCards();
  let counter=123000;
  const nativeCard=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Actual pinned card absent: '+name);
    card.id=counter++;
    return card;
  };
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(nativeCard(TREASURE),
    nativeCard('Psychic Energy SVE'),
    nativeCard('Psychic Energy SVE'));
  x.owner.deck.cards.push(nativeCard(TARGET));
  const {PlayCardAction,PlayerType,SlotType}=require(
    '../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const pre={ownHand:x.owner.hand.cards.map(c=>c.fullName),
    ownDiscard:x.owner.discard.cards.map(c=>c.fullName),
    ownDeckCount:x.owner.deck.cards.length,
    ownActive:x.owner.active.getPokemonCard()?.fullName,
    opponentHandCount:x.opponent.hand.cards.length};
  let error=null;
  try{x.store.dispatch(new PlayCardAction(x.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));}
  catch(e){error=String(e?.message??e);}
  const prompt=x.store.state.prompts.find(p=>p.result===undefined);
  const post={ownHand:x.owner.hand.cards.map(c=>c.fullName),
    ownDiscard:x.owner.discard.cards.map(c=>c.fullName),
    ownDeckCount:x.owner.deck.cards.length,
    opponentHandCount:x.opponent.hand.cards.length,
    pendingPrompt:prompt?{
      kind:prompt.constructor.name,owner:prompt.playerId===x.owner.id,
      min:prompt.min,max:prompt.max,count:prompt.count,
      cards:prompt.cards?.cards?.map(c=>c.fullName)??null,
      cardList:prompt.cardList?.cards?.map(c=>c.fullName)??null
    }:null};
  return {seat,printing:TREASURE,target:TARGET,pre,error,post};
}
function run(){return {
  schema:'agent49-native-original-mysterious-treasure-first-prompt-v1',
  results:[runSeat(0),runSeat(1)],
  cardPool:'Mysterious Treasure FLI113 original source in 10/29 registered sixty decks',
  qualifiedCompetitiveGames:0,
  caveat:'First native Item prompt only, no subsequent deck search or resolved match'};
}
if(require.main===module)process.stdout.write(
  'AGENT49_MYSTERIOUS_TREASURE_NATIVE '+JSON.stringify(run())+'\n');
module.exports={runSeat,run};
