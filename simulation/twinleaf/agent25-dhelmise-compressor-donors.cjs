'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));
const VERSION='DhelmiseHnsOwnerCompressor-v1';
const DHELMISE='Dhelmise M5';
const COMPRESSOR='Battle Compressor PHF';
const DONOR_ORDER=Object.freeze(['Banette M5','Shuppet M5','Sinistcha M5']);
const hnsPrints=new Set(DONOR_ORDER);

/**
 * Public owner zones only: this count is a setup proxy, deliberately
 * unaware of active opponent Ability locks. Paper correctness of native
 * Hide 'n' Sneak attack is supplied by the independent reversible hook.
 * @param {object} player
 */
function visibleHnsDiscardCount(player){
  return player.discard.cards.reduce((n,c)=>
    n+(hnsPrints.has(c.fullName)?1:0),0);
}

/** Owner can seek an actual deck discard only if Dhelmise is relevant now. */
function shouldSeekHns(player){
  const hasCompressor=player.hand.cards.some(c=>c.fullName===COMPRESSOR);
  if(!hasCompressor)return false;
  const ownerPokemon=[player.active,...player.bench]
    .map(slot=>slot.getPokemonCard()?.fullName);
  if(!ownerPokemon.includes(DHELMISE)&&
      !player.hand.cards.some(card=>card.fullName===DHELMISE))return false;
  return visibleHnsDiscardCount(player)<4;
}

/**
 * Select only cards the genuine owner search prompt makes visible.
 * Restrict to printed HNS donors and choose enough for the four threshold.
 * Selecting no cards is allowed by the original Battle Compressor text,
 * but in such circumstances the tactic should generally decline to act.
 * @param {object[]} ownerCards Owner-accessible prompted deck cards.
 * @param {number} needed Need based only on visible discard.
 * @param {number} maximum Actual ChooseCardsPrompt maximum.
 */
function chooseHnsDonors(ownerCards,needed,maximum){
  assert.ok(Number.isInteger(needed)&&needed>0);
  assert.ok(Number.isInteger(maximum)&&maximum>0);
  const chosen=[];
  for(const name of DONOR_ORDER){
    for(const card of ownerCards){
      if(chosen.length>=Math.min(needed,maximum))break;
      if(card.fullName===name&&!chosen.includes(card))chosen.push(card);
    }
  }
  return chosen;
}

/**
 * Opt-in research-side owner-visible heuristic. Integrated only on one
 * explicitly selected physical candidate seat, default completely off.
 * All decisions are ordinary pinned SimpleBot native root/prompt actions.
 *
 * @param {object} options Pinned SimpleBot options.
 * @returns {object} New options; no engine or vendor code changes.
 */
function withDhelmiseCompressorDonors(options){
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PromptResolver}=load('simple-bot/prompt-resolver/prompt-resolver');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=
    load('game/store/prompts/choose-cards-prompt');

  class DhelmiseCompressorTactic extends SimpleTactic{
    useTactic(state,player){
      if(state.prompts.some(p=>p.result===undefined)||
          !shouldSeekHns(player)||player.deck.cards.length===0)return;
      const index=player.hand.cards.findIndex(c=>c.fullName===COMPRESSOR);
      assert.ok(index>=0);
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  class DhelmiseCompressorPrompt extends PromptResolver{
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChooseCardsPrompt)||
          prompt.player!==player||prompt.cards!==player.deck||
          !player.supporter.cards.some(c=>c.fullName===COMPRESSOR))return;
      const needed=4-visibleHnsDiscardCount(player);
      if(needed<1)return;
      return new ResolvePromptAction(prompt.id,
        chooseHnsDonors(prompt.cards.cards,needed,prompt.options.max));
    }
  }
  const index=options.tactics.findIndex(T=>T.name==='PlayTrainerTactic');
  assert.ok(index>=0,'Pinned PlayTrainerTactic not found');
  return {...options,
    tactics:[...options.tactics.slice(0,index),DhelmiseCompressorTactic,
      ...options.tactics.slice(index)],
    promptResolvers:[DhelmiseCompressorPrompt,...options.promptResolvers]
  };
}
module.exports={VERSION,DHELMISE,COMPRESSOR,DONOR_ORDER,
  visibleHnsDiscardCount,shouldSeekHns,chooseHnsDonors,
  withDhelmiseCompressorDonors};
