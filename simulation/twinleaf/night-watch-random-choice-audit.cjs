'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {seededRandom} = require('./headless.cjs');
const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(output,file));

/**
 * Audit the physical printed Trevenant & Dusknoir-GX Night Watch hidden-hand
 * selection. Stock SimpleTacticsAi applies stateScore.getCardScore to every
 * concealed opponent card, violating the printed random-selection meaning.
 * The optional independent seeded stream samples without replacement and
 * overrides only this exact direct attack's ChooseCardsPrompt.
 *
 * @template T
 * @param {number} seed Whole-game known PRNG seed.
 * @param {boolean} randomPaperChoice
 * @param {()=>T} execute Run a synchronous pinned headless game.
 * @returns {{result:T,choices:object[],policy:string}}
 */
function withDirectNightWatchRandomChoice(seed,randomPaperChoice,execute) {
  assert(Number.isSafeInteger(seed) && seed>=0 && seed<=0xffffffff);
  const {ChooseCardsPromptResolver} = engine(
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const prior=ChooseCardsPromptResolver.prototype.resolvePrompt;
  const hash=crypto.createHash('sha256')
    .update(JSON.stringify(['night-watch-random-paper-v1',seed]))
    .digest().readUInt32LE(0);
  const random=seededRandom(hash||1);
  const choices=[];

  ChooseCardsPromptResolver.prototype.resolvePrompt=function nightWatchRandomChoice(
    state,player,prompt) {
    const actor=state.players.find(p=>p.id===prompt?.playerId);
    const opponent=state.players.find(p=>p.id!==prompt?.playerId);
    if (!(prompt instanceof ChooseCardsPrompt) ||
        prompt.options?.isSecret!==true ||
        prompt.message!==GameMessage.CHOOSE_CARD_TO_DISCARD ||
        prompt.cards!==opponent?.hand ||
        actor?.active.getPokemonCard()?.name!=='Trevenant & Dusknoir-GX') {
      return prior.call(this,state,player,prompt);
    }
    const snapshot=prompt.cards.cards.slice();
    const count=prompt.options.min;
    assert.equal(count,prompt.options.max);
    assert.ok(count<=snapshot.length);
    const scored=snapshot.map(card=>({
      fullName:card.fullName,cardId:card.id,
      score:this.stateScore.getCardScore(state,prompt.playerId,card)
    }));
    let action;
    if(randomPaperChoice){
      const pool=snapshot.slice();
      const chosen=[];
      for(let i=0;i<count;i++){
        const index=Math.floor(random()*pool.length);
        chosen.push(pool.splice(index,1)[0]);
      }
      assert.equal(prompt.validate(chosen),true,
        'Random physical choice must obey the actual source prompt');
      action=new ResolvePromptAction(prompt.id,chosen);
    } else {
      action=prior.call(this,state,player,prompt);
    }
    const result=action.result;
    assert.ok(Array.isArray(result));
    choices.push({
      turn:state.turn,actorId:actor.id,
      attack:'Night Watch',selectionProtocol:randomPaperChoice ?
        'independent-random-subset-v1' : 'stock-scored-hidden-hand-v1',
      opponentHandBefore:scored,
      selected:result.map(card=>({fullName:card.fullName,cardId:card.id})),
      sourceHandLength:snapshot.length
    });
    return action;
  };
  try {
    return {result:execute(),choices,policy:randomPaperChoice ?
      'NightWatchRandomPaper-v1' : 'NightWatchStockScoredHiddenHand-v1'};
  }finally{
    ChooseCardsPromptResolver.prototype.resolvePrompt=prior;
  }
}

module.exports={withDirectNightWatchRandomChoice};
