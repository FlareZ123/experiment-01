'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,withPaperPromptContractPortfolio}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {quickBallPaymentNegative}=
  require('../simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs');

class PlayCardAction{
  /** @param {number} id @param {number} handIndex */
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  /** @param {object} owner @param {string} message @param {string} printing */
  constructor(owner,message='CHOOSE_CARD_TO_DISCARD',printing='Quick Ball FST'){
    this.id=23;this.playerId=owner.id;this.cards=owner.hand;
    this.result=undefined;this.message=message;
    this.sourceCard={fullName:printing};
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
const print=(name)=>({fullName:name});
const run=fn=>withPaperPromptContractPortfolio(fn,{
  Store,IronThornsex,types:{},currentTrialId:()=> 'rank5:quickball:fixture'
});
/** @param {string[]} names @param {string} printing @returns {object} */
function fixture(names=['Psychic Energy SVE','Quick Ball FST'],
  printing='Quick Ball FST'){
  const owner={id:55,hand:{cards:names.map(print)},deck:{cards:[]}};
  const state={turn:1,players:[owner,{id:56}],prompts:[]};
  const store=new Store(state);
  const ballIndex=owner.hand.cards.findIndex(c=>c.fullName===printing);
  return {owner,state,store,ballIndex};
}
test('common paper portfolio retains frozen Aichi FST/SSH cost contract',()=>{
  assert.match(VERSION,/^agent41-unified-paper-prompt-contract-portfolio-v\d+/);
});
test('empty original hand except printed Quick Ball vetoes played Item before Store mutation',()=>{
  for(const printing of ['Quick Ball FST','Quick Ball SSH']){
    const f=fixture([printing],printing);
    const report=run(()=>{
      assert.throws(()=>f.store.dispatch(
        new PlayCardAction(55,f.ballIndex)),
        /PAPER_ROOT_INVALID:QUICK_BALL_ONE_OTHER_CARD_REQUIRED/);
      assert.equal(f.store.mutations,0);
      return null;
    });
    assert.equal(report.audit.inspectedQuickBallPlayCardRoots,1);
    assert.equal(report.audit.vetoedQuickBallInsufficientRoots,1);
  }
});
test('one OTHER physical card satisfies root preflight',()=>{
  const f=fixture();
  const out=run(()=>f.store.dispatch(
    new PlayCardAction(55,f.ballIndex)));
  assert.equal(out.result.accepted,true);
  assert.equal(f.store.mutations,1);
  assert.equal(out.audit.inspectedQuickBallPlayCardRoots,1);
  assert.equal(out.audit.vetoedQuickBallInsufficientRoots,0);
});
test('actual Quick Ball payment prompt rejects zero and physically foreign choices',()=>{
  const f=fixture();
  f.state.prompts=[new ChooseCardsPrompt(f.owner)];
  assert.equal(quickBallPaymentNegative(f.state.prompts[0],[],f.owner),
    'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE');
  const foreign=print('Psychic Energy SVE');
  assert.equal(quickBallPaymentNegative(f.state.prompts[0],[foreign],f.owner),
    'QUICK_BALL_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND');
  const out=run(()=>{
    for(const invalid of [[],[foreign]]){
      assert.throws(()=>f.store.dispatch(new ResolvePromptAction(23,invalid)),
        /PAPER_PROMPT_INVALID/);
      assert.equal(f.store.mutations,0);
      assert.equal(f.state.prompts[0].result,undefined);
    }
    return true;
  });
  assert.equal(out.audit.inspectedQuickBallPaymentPrompts,1,
    'Foreign choices are rejected by the earlier generic physical-source guard');
  assert.equal(out.audit.vetoedBeforeDispatch,2);
  assert.equal(out.audit.nativeAccepted,0);
});
test('valid payment remains explicit PAPER_PROMPT_UNVERIFIED even when Store accepts',()=>{
  const f=fixture();
  f.state.prompts=[new ChooseCardsPrompt(f.owner)];
  const chosen=[f.owner.hand.cards[0]];
  const out=run(()=>f.store.dispatch(new ResolvePromptAction(23,chosen)));
  assert.equal(out.result.accepted,true);
  assert.equal(f.store.mutations,1);
  assert.equal(f.state.prompts[0].result,chosen);
  assert.equal(out.audit.inspectedQuickBallPaymentPrompts,1);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
});
test('optional own-deck Basic search is never mislabeled as mandatory discard',()=>{
  const f=fixture();
  const target=print('Dedenne GX UNB');
  f.owner.deck.cards.push(target);
  const prompt=new ChooseCardsPrompt(f.owner,'CHOOSE_CARD_TO_HAND');
  prompt.cards=f.owner.deck;
  f.state.prompts=[prompt];
  const out=run(()=>f.store.dispatch(new ResolvePromptAction(23,[])));
  assert.equal(out.result.accepted,true);
  assert.equal(out.audit.inspectedQuickBallPaymentPrompts,0);
  assert.equal(out.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
});
test('unrelated printed Item does not inherit Quick Ball one-card discard rule',()=>{
  const f=fixture(['Quick Ball FST']);
  f.owner.hand.cards[0].fullName='Other Item TST';
  const out=run(()=>f.store.dispatch(new PlayCardAction(55,0)));
  assert.equal(out.result.accepted,true);
  assert.equal(out.audit.inspectedQuickBallPlayCardRoots,0);
});
