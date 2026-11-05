'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,independentRoxiePaymentNegative,
  withPaperPromptContractPortfolio}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  /** @param {object} player */
  constructor(player){
    this.id=46;this.player=player;this.playerId=player.id;
    this.result=undefined;this.cards=player.hand;
    this.sourceCard={fullName:'Roxie CEC'};
    this.options={min:0,max:2,blocked:[]};
    this.filter={};
  }
  /** Original validator is known to misread shifted blocked indexes. */
  validate(){return false;}
}
class FakeStore{
  /** @param {object} state */
  constructor(state){this.state=state;this.mutations=0;}
  /** @param {object} action */
  dispatch(action){
    this.mutations++;
    this.state.prompts[0].result=action.result;
    return {accepted:true};
  }
}
class IronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(){return null;}
}
const pokemon=(name,gx=false,ex=false)=>({name,kind:'pokemon',gx,ex});
const koffing=pokemon('Koffing CEC');
const lele=pokemon('Tapu Lele-GX GRI',true);
const unrelated={name:'Ultra Ball',kind:'trainer'};
const predicate=card=>card?.kind==='pokemon'&&!card.gx&&!card.ex;
const deps={Store:FakeStore,IronThornsex,isRoxiePaymentCard:predicate,
  currentTrialId:()=> '31:roxie:source',types:{}};
/** @returns {object} */
function fixture(){
  const owner={id:46,hand:{cards:[koffing,lele,unrelated]},deck:{cards:[]}};
  const state={turn:3,players:[owner,{id:47}],prompts:[]};
  const prompt=new ChooseCardsPrompt(owner);
  state.prompts=[prompt];
  return {state,store:new FakeStore(state),prompt};
}

test('Roxie exact printed eligibility distinguishes Koffing, GX, Item and zero count',()=>{
  const f=fixture();
  assert.equal(independentRoxiePaymentNegative(f.prompt,[koffing],predicate),null);
  assert.equal(independentRoxiePaymentNegative(f.prompt,[lele],predicate),
    'ROXIE_PRINTED_DISALLOWS_SELECTED_CARD');
  assert.equal(independentRoxiePaymentNegative(f.prompt,[unrelated],predicate),
    'ROXIE_PRINTED_DISALLOWS_SELECTED_CARD');
  assert.equal(independentRoxiePaymentNegative(f.prompt,[],predicate),
    'ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO');
  assert.equal(independentRoxiePaymentNegative(f.prompt,null,predicate),
    'ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO');
  assert.equal(independentRoxiePaymentNegative(f.prompt,
    [koffing,lele,unrelated],predicate),
    'ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO');
  assert.match(VERSION,/^agent41-unified-paper-prompt-contract-portfolio-v\d+/);
});

test('common Store rejects GX payment before mutation then accepts genuine Koffing despite native validator disagreement',()=>{
  const f=fixture();
  assert.equal(f.prompt.validate([koffing]),false);
  const outcome=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(46,[lele])),
      /PAPER_PROMPT_INVALID:.*ROXIE_PRINTED_DISALLOWS_SELECTED_CARD/);
    assert.equal(f.store.mutations,0);
    assert.equal(f.prompt.result,undefined);
    return f.store.dispatch(new ResolvePromptAction(46,[koffing]));
  },deps);
  assert.deepEqual(outcome.result,{accepted:true});
  assert.equal(f.store.mutations,1);
  assert.equal(outcome.audit.inspectedRoxiePaymentPrompts,2);
  assert.equal(outcome.audit.vetoedBeforeDispatch,1);
  assert.equal(outcome.audit.nativeAccepted,1);
  assert.equal(outcome.audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(outcome.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(outcome.audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
  assert.equal(outcome.audit.examples[0].sourcePrinting,'Roxie CEC');
});

test('empty and over-two Roxie payments are printed-invalid even under permissive native validator',()=>{
  for(const payment of [[],[koffing,lele,unrelated]]){
    const f=fixture();
    f.prompt.validate=()=>true;
    const audit=withPaperPromptContractPortfolio(()=>{
      assert.throws(()=>f.store.dispatch(new ResolvePromptAction(46,payment)),
        /ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO/);
      assert.equal(f.store.mutations,0);
      return true;
    },deps).audit;
    assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
  }
});

test('unrelated ChooseCards source cannot inherit Roxie printing exclusions',()=>{
  const f=fixture();
  f.prompt.sourceCard={fullName:'Different Item'};
  const audit=withPaperPromptContractPortfolio(()=>
    f.store.dispatch(new ResolvePromptAction(46,[lele])),deps).audit;
  assert.equal(audit.inspectedRoxiePaymentPrompts,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(f.store.mutations,1);
});

test('physical source and foreign identity checks remain independent of Roxie card class',()=>{
  const f=fixture();
  const foreign=pokemon('Other physically missing Pokémon');
  const report=independentRoxiePaymentNegative(
    f.prompt,[foreign],predicate);
  assert.equal(report,'ROXIE_NOT_IN_PHYSICAL_OWNER_HAND');
  const audit=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(46,[foreign])),
      /PAPER_PROMPT_INVALID/);
    assert.equal(f.store.mutations,0);
    return true;
  },deps).audit;
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(audit.nativeAccepted,0);
});
