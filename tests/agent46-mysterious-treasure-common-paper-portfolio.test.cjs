'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,independentMysteriousTreasurePaymentNegative,
  withPaperPromptContractPortfolio
}=require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

const TREASURE='Mysterious Treasure FLI';
const card=name=>({fullName:name});
class PlayCardAction{
  /** @param {number} id @param {number} handIndex */
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  /** @param {object} owner @param {string} [msg] @param {string} [printing] */
  constructor(owner,msg='CHOOSE_CARD_TO_DISCARD',printing=TREASURE){
    this.id=49;this.playerId=owner.id;this.player=owner;
    this.message=msg;this.sourceCard=card(printing);
    this.cards=msg==='CHOOSE_CARD_TO_HAND'?owner.deck:owner.hand;
    this.options={min:msg==='CHOOSE_CARD_TO_HAND'?0:1,
      max:1,allowCancel:false};
    this.result=undefined;
  }
  validate(){return true;}
}
class Store{
  /** @param {object} state */
  constructor(state){this.state=state;this.mutations=0;}
  dispatch(action){
    this.mutations++;
    if(action instanceof ResolvePromptAction)
      this.state.prompts[0].result=action.result;
    return {accepted:true};
  }
}
class IronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(){return null;}
}
const run=fn=>withPaperPromptContractPortfolio(fn,{
  Store,IronThornsex,types:{},currentTrialId:()=> 'original-treasure-fli-pure'
});
/** @param {string[]} [printings] @returns {object} */
function fixture(printings=[TREASURE,'Psychic Energy SVE']){
  const owner={id:49,hand:{cards:printings.map(card)},
    deck:{cards:[card('Regidrago V SIT')]}};
  const state={turn:1,players:[owner,{id:50}],prompts:[]};
  return {owner,state,store:new Store(state),
    playedIndex:owner.hand.cards.findIndex(c=>c.fullName===TREASURE)};
}
test('common source FLI payment contract remains present after version upgrades',()=>{
  assert.match(VERSION,/^agent41-unified-paper-prompt-contract-portfolio-v\d+/);
});
test('printed one-card cost rejects empty and over-one payment',()=>{
  const f=fixture();
  const prompt=new ChooseCardsPrompt(f.owner);
  assert.equal(independentMysteriousTreasurePaymentNegative(
    prompt,[],f.owner),'MYSTERIOUS_TREASURE_PAYMENT_REQUIRES_EXACTLY_ONE');
  assert.equal(independentMysteriousTreasurePaymentNegative(
    prompt,[f.owner.hand.cards[1],f.owner.hand.cards[1]],f.owner),
    'MYSTERIOUS_TREASURE_PAYMENT_REQUIRES_EXACTLY_ONE');
});
test('source physical membership excludes a forged same-printing card and self',()=>{
  const f=fixture();
  const p=new ChooseCardsPrompt(f.owner);
  assert.equal(independentMysteriousTreasurePaymentNegative(
    p,[card('Psychic Energy SVE')],f.owner),
    'MYSTERIOUS_TREASURE_NOT_IN_PHYSICAL_OWNER_HAND');
  assert.equal(independentMysteriousTreasurePaymentNegative(
    p,[p.sourceCard],f.owner),
    'MYSTERIOUS_TREASURE_NOT_IN_PHYSICAL_OWNER_HAND');
  assert.equal(independentMysteriousTreasurePaymentNegative(
    p,[f.owner.hand.cards[1]],f.owner),null);
});
test('unpayable original FLI Item root is refused before Store state changes',()=>{
  const f=fixture([TREASURE]);
  const outcome=run(()=>{
    assert.throws(()=>f.store.dispatch(
      new PlayCardAction(f.owner.id,f.playedIndex)),
      /PAPER_ROOT_INVALID:MYSTERIOUS_TREASURE_REQUIRES_ANOTHER_CARD/);
    assert.equal(f.store.mutations,0);
    return null;
  });
  assert.equal(outcome.audit.inspectedTreasurePlayCardRoots,1);
  assert.equal(outcome.audit.vetoedTreasureInsufficientRoots,1);
});
test('one distinct owner card permits root but does not certify entire Item',()=>{
  const f=fixture();
  const x=run(()=>f.store.dispatch(
    new PlayCardAction(f.owner.id,f.playedIndex)));
  assert.equal(x.result.accepted,true);
  assert.equal(x.audit.inspectedTreasurePlayCardRoots,1);
  assert.equal(x.audit.vetoedTreasureInsufficientRoots,0);
});
test('source-stamped discard prompt rejects zero then accepts one as unverified',()=>{
  const f=fixture();
  f.state.prompts=[new ChooseCardsPrompt(f.owner)];
  const donor=f.owner.hand.cards[1];
  const x=run(()=>{
    assert.throws(()=>f.store.dispatch(
      new ResolvePromptAction(49,[])),/MYSTERIOUS_TREASURE_PAYMENT_REQUIRES_EXACTLY_ONE/);
    assert.equal(f.store.mutations,0);
    assert.equal(f.state.prompts[0].result,undefined);
    return f.store.dispatch(new ResolvePromptAction(49,[donor]));
  });
  assert.equal(x.audit.inspectedTreasurePaymentPrompts,2);
  assert.equal(x.audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(x.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(x.audit.nativeAccepted,1);
  assert.equal(x.audit.competitiveQualifiedGames,0);
});
test('own-deck Psychic or Dragon selection is separate optional search',()=>{
  const f=fixture();
  f.state.prompts=[new ChooseCardsPrompt(f.owner,'CHOOSE_CARD_TO_HAND')];
  const x=run(()=>f.store.dispatch(new ResolvePromptAction(49,[])));
  assert.equal(x.result.accepted,true);
  assert.equal(x.audit.inspectedTreasurePaymentPrompts,0);
  assert.equal(x.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
});
test('another source printing cannot inherit Mysterious Treasure exclusion',()=>{
  const f=fixture();
  f.state.prompts=[new ChooseCardsPrompt(f.owner,
    'CHOOSE_CARD_TO_DISCARD','Other Item ABC')];
  const x=run(()=>f.store.dispatch(new ResolvePromptAction(49,[])));
  assert.equal(x.result.accepted,true);
  assert.equal(x.audit.inspectedTreasurePaymentPrompts,0);
  assert.equal(x.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
});
