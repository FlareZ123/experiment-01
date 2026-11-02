'use strict';
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(output,p));
/** @param {0|1} seat @param {boolean} take */
function probe(seat,take){
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const f=stagedPainfulSpoons(seat);
 f.source.active.cards.splice(0,1,f.card('Iron Thorns ex TWM'));
 const stadium=f.card('Thunder Mountain Prism Star LOT');
 f.source.deck.cards.push(stadium);
 f.source.hand.cards.push(f.card('Guzma & Hala CEC'));
 const before=f.source.deck.cards.slice();
 f.store.dispatch(new PlayCardAction(f.source.id,0,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
 const prompt=f.state.prompts.find(p=>p.result===undefined&&p.message==='CHOOSE_CARD_TO_HAND');
 if(!prompt)throw Error('native stadium search not found');
 const reply=take?[stadium]:[];
 const valid=prompt.validate(reply,f.state);
 f.store.dispatch(new ResolvePromptAction(prompt.id,reply));
 return {seat,take,valid,shufflePrompt:f.state.prompts.some(p=>p.result===undefined&&p.constructor.name==='ShuffleDeckPrompt'),preCount:before.length,postCount:f.source.deck.cards.length,
    orderedBefore:before.map(c=>c.fullName),
    orderedAfter:f.source.deck.cards.map(c=>c.fullName),inHand:f.source.hand.cards.includes(stadium),paperQualified:false};
}
module.exports={probe};
