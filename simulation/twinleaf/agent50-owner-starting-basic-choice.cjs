'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-owner-starting-basic-choice-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * A very narrow setup-only choice of owner-hand Basic Pokémon.
 * No State or Card objects escape this function; it uses only the
 * actor-owned input and the prompt's published selection validator.
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} owner Authenticated owner of prompt and hand.
 * @param {{BASIC:number}} Stage Pinned native Stage enum.
 * @param {{PLAY_DURING_SETUP:string|number}} CardTag Pinned native tags.
 * @returns {object[]|null} Native actual Card instances or null.
 */
function chooseOwnedStartingBasics(prompt,owner,Stage,CardTag){
  if(prompt.cards!==owner.hand)return null;
  const cards=owner.hand.cards;
  const maximum=prompt.options.max;
  const blocked=new Set(prompt.options.blocked??[]);
  if(!Number.isSafeInteger(maximum)||maximum<1)return null;
  const eligible=cards.filter((card,index)=>
    !blocked.has(index)&&
    (card.stage===Stage.BASIC||
      card.tags?.includes(CardTag.PLAY_DURING_SETUP)));
  if(eligible.length===0)return null;
  const selected=[];
  for(const card of eligible){
    if(selected.length>=maximum)break;
    const proposed=[...selected,card];
    // Each extension is explicitly checked using the native prompt rules;
    // a bad item is skipped without changing the physical Store state.
    if(prompt.validate(proposed))selected.push(card);
  }
  return selected.length>0&&prompt.validate(selected)?selected:null;
}

/**
 * Install this prompt-only adapter on an actual synchronous native run.
 * The caller MUST install the fail-closed native decoder quarantine outside
 * this adapter; all unsupported root and prompt decisions delegate unchanged.
 *
 * @template T
 * @param {()=>T} run Native synchronous runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Injectable native modules.
 * @returns {{result:T,audit:object}}
 */
function withOwnerStartingBasicChoice(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');
  const {Stage,CardTag}=engine('game/store/card/card-types');
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const events=[];
  let proposals=0;
  let unsupportedOwnBasicChoices=0;
  const intercepted=function ownerSetupOnly(state){
    const clientId=this.client?.id;
    const seat=state.players?.findIndex(player=>player.id===clientId)??-1;
    const prompt=state.prompts?.find(p=>
      p.playerId===clientId&&p.result===undefined);
    if((seat===0||seat===1)&&
      state.turn===0&&state.phase===GamePhase.SETUP&&
      prompt instanceof ChooseCardsPrompt&&
      prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS){
      const owner=state.players[seat];
      if(prompt.playerId===owner.id&&prompt.cards===owner.hand){
        const selected=chooseOwnedStartingBasics(prompt,owner,Stage,CardTag);
        if(selected){
          const result=new ResolvePromptAction(prompt.id,selected);
          events.push({seat,turn:state.turn,phase:state.phase,
            message:prompt.message,
            selections:selected.map(card=>card.fullName),
            ownerVisibleCardCount:owner.hand.cards.length,
            nativeStoreAccepted:'not-yet-observed'});
          proposals++;
          return result;
        }
      }
      unsupportedOwnBasicChoices++;
    }
    return previous.value.call(this,state);
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...previous,value:intercepted});
  try{
    const result=run();
    return {result,audit:{version:VERSION,proposals,
      unsupportedOwnBasicChoices,events,
      ownerInformationSafeCompletePolicy:false,
      competitiveGames:0}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      intercepted);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',previous);
  }
}

module.exports={VERSION,chooseOwnedStartingBasics,
  withOwnerStartingBasicChoice};
