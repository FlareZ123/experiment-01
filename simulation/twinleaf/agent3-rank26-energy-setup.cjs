'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Source-player's Item search can inspect its own deck once prompt opens.
 * @param {object[]} deck
 * @param {object[]} discard
 * @param {number} maximum
 * @returns {{cards:object[],lightning:number,exeggcute:number,fallback:boolean}}
 */
function chooseSourceCards(deck,discard,maximum=3){
  assert.ok(Array.isArray(deck)&&Array.isArray(discard));
  const cards=[];
  const remaining=Math.max(0,2-discard.filter(c=>c.name==='Lightning Energy').length);
  for(const card of deck){
    if(cards.length>=remaining||cards.length>=maximum)break;
    if(card.name==='Lightning Energy')cards.push(card);
  }
  if(cards.length<maximum&&!discard.some(c=>c.name==='Exeggcute')){
    const egg=deck.find(c=>c.name==='Exeggcute'&&!cards.includes(c));
    if(egg)cards.push(egg);
  }
  const fallback=cards.length===0;
  if(fallback&&deck.length){
    const expendable=deck.find(c=>['Battle Compressor','Risky Ruins','Bicycle']
      .includes(c.name));
    cards.push(expendable||deck[0]);
  }
  return {cards,lightning:cards.filter(c=>c.name==='Lightning Energy').length,
    exeggcute:cards.filter(c=>c.name==='Exeggcute').length,fallback};
}

/**
 * Paper-faithful Koko package heuristic. The official Tapu Koko Prism Star FAQ
 * permits a single Lightning target, so prefer putting both Exeggcute copies
 * into discard when they remain accessible. The old two-Lightning variant is
 * retained unchanged for registered same-deal comparisons.
 * @param {object[]} deck
 * @param {object[]} discard
 * @param {number} maximum
 * @returns {{cards:object[],lightning:number,exeggcute:number,fallback:boolean}}
 */
function chooseSourceCardsOneLightningTwoEggs(deck,discard,maximum=3){
  assert.ok(Array.isArray(deck)&&Array.isArray(discard));
  const cards=[];
  if(!discard.some(c=>c.name==='Lightning Energy')){
    const lightning=deck.find(c=>c.name==='Lightning Energy');
    if(lightning&&cards.length<maximum)cards.push(lightning);
  }
  const eggNeeded=Math.max(0,2-discard.filter(c=>c.name==='Exeggcute').length);
  for(const egg of deck){
    if(cards.length>=maximum||cards.filter(c=>c.name==='Exeggcute').length>=eggNeeded)
      break;
    if(egg.name==='Exeggcute')cards.push(egg);
  }
  const fallback=cards.length===0;
  if(fallback&&maximum>0&&deck.length){
    const expendable=deck.find(c=>['Battle Compressor','Risky Ruins','Bicycle']
      .includes(c.name));
    cards.push(expendable||deck[0]);
  }
  return {cards,lightning:cards.filter(c=>c.name==='Lightning Energy').length,
    exeggcute:cards.filter(c=>c.name==='Exeggcute').length,fallback};
}

/**
 * Experiment-only first-turn source seat Item policy.
 * Uses own hand and public zones before play, owner deck only upon prompt.
 * @template T
 * @param {0|1} seat
 * @param {()=>T} work
 * @param {{oneLightningTwoEggs?:boolean}} [options]
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26SourceSetup(seat,work,options={}){
  assert.ok(seat===0||seat===1);
  const load=name=>require(path.join(output,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {GamePhase}=load('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const v2=options.oneLightningTwoEggs===true;
  const id=seat===0?101:202;
  const events=[];
  function decode(state){
    const owner=state.players[seat];
    if(this.client?.id!==id||state.activePlayer!==seat||state.turn!==1)
      return previous.call(this,state);
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(prompt){
      if(prompt instanceof ChooseCardsPrompt && prompt.player===owner &&
         prompt.cards===owner.deck&&
         owner.supporter.cards.some(c=>c.name==='Battle Compressor')){
        const choose=v2?chooseSourceCardsOneLightningTwoEggs:chooseSourceCards;
        const picked=choose(prompt.cards.cards,
          owner.discard.cards,prompt.options.max);
        if(picked.cards.length&&prompt.validate(picked.cards,state)){
          events.push({kind:'native-own-deck-selection',
            cards:picked.cards.map(c=>c.fullName),ids:picked.cards.map(c=>c.id),
            lightning:picked.lightning,exeggcute:picked.exeggcute,
            fallback:picked.fallback,promptMin:prompt.options.min});
          return new ResolvePromptAction(prompt.id,picked.cards);
        }
      }
      return previous.call(this,state);
    }
    const item=owner.hand.cards.findIndex(c=>c.name==='Battle Compressor');
    if(state.phase!==GamePhase.PLAYER_TURN||item<0||
       owner.deck.cards.length===0||owner.cannotPlayItemCards===true||
       (v2?owner.discard.cards.some(c=>c.name==='Lightning Energy')&&
         owner.discard.cards.filter(c=>c.name==='Exeggcute').length>=2:
         owner.discard.cards.filter(c=>c.name==='Lightning Energy').length>=2))
      return previous.call(this,state);
    events.push({kind:'native-held-item-proposal',sourceSeat:seat,
      handIndex:item,opponentActive:state.players[1-seat].active
        .getPokemonCard()?.name??null});
    return new PlayCardAction(id,item,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  }
  SimpleTacticsAi.prototype.decodeNextAction=decode;
  try{
    const result=work();
    return {result,policyAudit:{version:v2?'rank26-item-paper-koko-one-lightning-v2':
        'rank26-item-owner-v1',
      seat,events,competitiveQualified:false}};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}
module.exports={chooseSourceCards,chooseSourceCardsOneLightningTwoEggs,
  withRank26SourceSetup};
