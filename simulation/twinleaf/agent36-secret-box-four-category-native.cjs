'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES}=
  require('./agent36-secret-box-four-category-selector.cjs');
const {withPaperSecretBoxSearchCategory}=
  require('./agent4-secret-box-paper-search-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Resolve a genuine pinned Secret Box TWM owner-deck prompt using the
 * four-category selector. This is a conditional native Store fixture, not a
 * source-dealt game or competitive result.
 *
 * @param {0|1} [seat=0]
 * @returns {object}
 */
function probeSecretBoxFourCategories(seat=0){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {Store}=native('game/store/store');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const f=stagedPainfulSpoons(seat);
  const payment=[
    f.card('Psychic Energy SVE'),
    f.card('Grass Energy MEE'),
    f.card('Fire Energy MEE')
  ];
  const box=f.card('Secret Box TWM');
  const targets=[
    f.card('Fog Crystal CRE'),
    f.card('Powerglass SFA'),
    f.card('Ace Trainer XY7'),
    f.card('Sky Field ROS')
  ];
  f.source.hand.cards.push(...payment,box);
  f.source.deck.cards.push(...targets);
  const handBefore=f.source.hand.cards.length;
  const deckBefore=f.source.deck.cards.length;
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);

  f.store.dispatch(new PlayCardAction(f.source.id,
    f.source.hand.cards.indexOf(box),{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  const paymentPrompt=pending();
  assert.equal(paymentPrompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(paymentPrompt.sourceCard?.fullName,'Secret Box TWM');
  assert.equal(paymentPrompt.playerId,f.source.id);
  assert.equal(paymentPrompt.message,'CHOOSE_CARD_TO_DISCARD');
  const paymentCollectionIsOwnerHand=paymentPrompt.cards===f.source.hand;
  const paymentOfferedCardsAreOwnerHand=Array.isArray(paymentPrompt.cards?.cards)&&
    paymentPrompt.cards.cards.every(card=>f.source.hand.cards.includes(card));
  assert.equal(paymentOfferedCardsAreOwnerHand,true);
  assert.equal(paymentPrompt.validate(payment,f.state),true);
  f.store.dispatch(new ResolvePromptAction(paymentPrompt.id,payment));

  const searchPrompt=pending();
  assert.equal(searchPrompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(searchPrompt.sourceCard?.fullName,'Secret Box TWM');
  assert.equal(searchPrompt.playerId,f.source.id);
  assert.equal(searchPrompt.message,'CHOOSE_CARD_TO_HAND');
  assert.equal(searchPrompt.cards,f.source.deck);
  const categoryMaxima={
    items:searchPrompt.options?.maxItems??null,
    tools:searchPrompt.options?.maxTools??null,
    supporters:searchPrompt.options?.maxSupporters??null,
    stadiums:searchPrompt.options?.maxStadiums??null
  };
  const selected=chooseSecretBoxCategories(searchPrompt,f.source,f.state,
    {TrainerCard,TrainerType},ROOT93_NEW_MOON_PREFERENCES);
  assert.ok(selected,'The genuine owner prompt must offer the four preferred cards');
  assert.deepEqual(selected.map(card=>card.fullName),[
    'Fog Crystal CRE','Powerglass SFA','Ace Trainer XY7','Sky Field ROS'
  ]);
  assert.equal(searchPrompt.validate(selected,f.state),true);

  const guarded=withPaperSecretBoxSearchCategory(()=>{
    f.store.dispatch(new ResolvePromptAction(searchPrompt.id,selected));
  },{Store,TrainerCard,TrainerType});
  assert.equal(guarded.audit.sourceSearchPrompts,1);
  assert.equal(guarded.audit.acceptedSearches,1);
  assert.equal(guarded.audit.vetoedSearches,0);

  const continuation=[];
  for(let i=0;i<15;i++){
    const prompt=pending();
    if(!prompt)break;
    let reply;
    if(prompt.constructor.name==='ShowCardsPrompt')reply=true;
    else if(prompt.constructor.name==='ShuffleDeckPrompt')
      reply=Array.from({length:f.source.deck.cards.length},(_,index)=>index);
    else if(prompt.constructor.name==='WaitPrompt')reply=null;
    else throw new Error('Unexpected Secret Box continuation prompt '+
      prompt.constructor.name);
    continuation.push(prompt.constructor.name);
    f.store.dispatch(new ResolvePromptAction(prompt.id,reply));
  }

  assert.equal(pending(),undefined);
  assert.equal(selected.every(card=>f.source.hand.cards.includes(card)),true);
  assert.equal(selected.every(card=>!f.source.deck.cards.includes(card)),true);
  assert.equal(f.source.deck.cards.length,deckBefore-4);
  assert.equal(payment.every(card=>f.source.discard.cards.includes(card)),true);
  assert.equal(f.source.discard.cards.includes(box),true);
  return {
    seat,source:'Secret Box TWM',ownerPromptBound:true,
    paymentSourceBound:true,paymentCollectionIsOwnerHand,
    paymentOfferedCardsAreOwnerHand,
    searchSourceBound:true,searchCollectionBound:true,
    categoryMaxima,selected: selected.map(card=>card.fullName),
    selectedPhysicalCount:selected.length,
    deckBefore,deckAfter:f.source.deck.cards.length,
    handBefore,handAfter:f.source.hand.cards.length,
    paymentDiscarded:payment.map(card=>card.fullName),
    boxDiscarded:f.source.discard.cards.includes(box),
    continuation,guardAudit:guarded.audit,
    qualifiedGame:false
  };
}

module.exports={probeSecretBoxFourCategories};
