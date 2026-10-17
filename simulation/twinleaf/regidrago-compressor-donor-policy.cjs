'use strict';
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const POLICY_VERSION='RegidragoCompressorDonors-v1';
const DONORS=Object.freeze(['Dragapult ex','Hisuian Goodra VSTAR','Dialga-GX','Kyurem','Koraidon ex']);
const load=name=>require(path.join(root,name));

/** @param {object} player @returns {boolean} */
function shouldPlayCompressor(player) {
  const hand=player.hand.cards;
  if(!hand.some(c=>c.name==='Battle Compressor'))return false;
  const pokemon=[player.active,...player.bench].map(slot=>
    slot.getPokemonCard()?.name??null);
  const available=pokemon.some(name=>name==='Regidrago V'||name==='Regidrago VSTAR')||
    hand.some(c=>c.name==='Regidrago V'||c.name==='Regidrago VSTAR');
  if(!available)return false;
  const discarded=new Set(player.discard.cards.filter(c=>
    DONORS.includes(c.name)).map(c=>c.name));
  return discarded.size<3;
}

/**
 * The deck is inspectable once the Battle Compressor search begins.
 * Before playing the Item, the tactic uses only visible locations.
 * @param {object[]} cards @param {number} turn @param {number} limit
 */
function chooseDonorCards(cards,turn,limit) {
  if(!Number.isInteger(limit)||limit<1)throw Error('Invalid prompt maximum');
  const selected=[];
  for(const name of DONORS){
    const card=cards.find(c=>c.name===name&&!selected.includes(c));
    if(card&&selected.length<limit)selected.push(card);
  }
  if(selected.length)return selected;
  const fallback=cards.find(c=>turn>1&&c.name==='Battle VIP Pass')||
    cards.find(c=>c.name==='Battle Compressor')||cards[0];
  return fallback?[fallback]:[];
}

/** @param {object} options Existing pinned SimpleBotOptions. */
function withRegidragoCompressorDonors(options) {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PromptResolver}=load('simple-bot/prompt-resolver/prompt-resolver');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  class RegidragoCompressorTactic extends SimpleTactic {
    useTactic(state,player){
      if(state.prompts.some(p=>p.result===undefined)||
          !shouldPlayCompressor(player)||player.deck.cards.length===0)return;
      const index=player.hand.cards.findIndex(c=>c.name==='Battle Compressor');
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  class RegidragoCompressorPrompt extends PromptResolver {
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChooseCardsPrompt)||
          prompt.player!==player||prompt.cards!==player.deck||
          !player.supporter.cards.some(c=>c.name==='Battle Compressor'))return;
      return new ResolvePromptAction(prompt.id,chooseDonorCards(
        prompt.cards.cards,state.turn,prompt.options.max));
    }
  }
  const index=options.tactics.findIndex(Tactic=>Tactic.name==='PlayTrainerTactic');
  if(index<0)throw Error('PlayTrainerTactic missing');
  return {
    ...options,
    tactics:[...options.tactics.slice(0,index),RegidragoCompressorTactic,
      ...options.tactics.slice(index)],
    promptResolvers:[RegidragoCompressorPrompt,...options.promptResolvers]
  };
}
module.exports={POLICY_VERSION,DONORS,shouldPlayCompressor,
  chooseDonorCards,withRegidragoCompressorDonors};
