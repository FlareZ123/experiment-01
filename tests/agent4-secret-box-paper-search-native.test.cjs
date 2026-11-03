'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {secretBoxSearchCategoryNegative,withPaperSecretBoxSearchCategory}=
  require('../simulation/twinleaf/agent4-secret-box-paper-search-hook.cjs');
const {probeSecretBoxPayment}=
  require('../simulation/twinleaf/agent4-secret-box-payment-native.cjs');

class TrainerCard{
  constructor(trainerType){this.trainerType=trainerType;}
}
const TrainerType={ITEM:0,SUPPORTER:1,STADIUM:2,TOOL:3};
const types={TrainerCard,TrainerType};
function pure(){
  const deck={cards:[0,1,2,3].map(x=>new TrainerCard(x))};
  const owner={deck};
  return {deck,owner,prompt:{cards:deck}};
}

test('pure Secret Box search paper category, identity, and maximum',()=>{
  const {owner,prompt,deck}=pure();
  const all=[...deck.cards];
  assert.equal(secretBoxSearchCategoryNegative(prompt,all,owner,types),null);
  assert.equal(secretBoxSearchCategoryNegative(prompt,[],owner,types),null);
  assert.equal(secretBoxSearchCategoryNegative(prompt,[all[0]],owner,types),null);
  assert.equal(secretBoxSearchCategoryNegative(prompt,[all[0],all[0]],owner,types),
    'SECRET_BOX_SEARCH_DUPLICATE_PHYSICAL_CARD');
  const secondItem=new TrainerCard(TrainerType.ITEM);
  owner.deck.cards.push(secondItem);
  assert.equal(secretBoxSearchCategoryNegative(prompt,[all[0],secondItem],owner,types),
    'SECRET_BOX_SEARCH_MORE_THAN_ONE_PER_CATEGORY');
  assert.equal(secretBoxSearchCategoryNegative(prompt,[all[0],new TrainerCard(1)],owner,types),
    'SECRET_BOX_SEARCH_NOT_IN_OWNER_DECK');
  owner.deck.cards.push({});
  assert.equal(secretBoxSearchCategoryNegative(prompt,[owner.deck.cards.at(-1)],owner,types),
    'SECRET_BOX_SEARCH_NOT_ELIGIBLE_TRAINER');
  assert.equal(secretBoxSearchCategoryNegative(prompt,all.concat(secondItem),owner,types),
    'SECRET_BOX_SEARCH_AT_MOST_FOUR_TRAINERS');
  assert.equal(secretBoxSearchCategoryNegative(
    {cards:{cards:[...owner.deck.cards]}},all,owner,types),
    'SECRET_BOX_SEARCH_NOT_IN_OWNER_DECK');
});

test('native both seats: mandatory cost paid but Store accepts forbidden two Items; guard vetoes',()=>{
  for(const seat of [0,1]){
    const raw=probeSecretBoxPayment(seat,'three','two-items');
    const guarded=withPaperSecretBoxSearchCategory(()=>
      probeSecretBoxPayment(seat,'three','two-items'));
    console.log('AGENT4_SECRET_BOX_CATEGORY_NEGATIVE '+JSON.stringify({
      seat,raw,guarded:guarded.result,audit:guarded.audit}));
    assert.equal(raw.rootError,null);
    assert.equal(raw.paymentError,null);
    assert.equal(raw.energyADiscarded,true);
    assert.equal(raw.energyBDiscarded,true);
    assert.equal(raw.energyCDiscarded,true);
    assert.equal(raw.continuation[0].nativeValidatorAccepted,false);
    assert.equal(raw.continuation[0].error,null);
    assert.equal(raw.targetLocations[0].inHand,true);
    assert.equal(raw.extraItemLocation.inHand,true);
    assert.equal(guarded.result.rootError,null);
    assert.equal(guarded.result.paymentError,null);
    assert.match(guarded.result.continuation[0].error,
      /PAPER_SECRET_BOX_SEARCH_INVALID:SECRET_BOX_SEARCH_MORE_THAN_ONE_PER_CATEGORY/);
    assert.equal(guarded.result.extraItemLocation.inHand,false);
    assert.equal(guarded.result.targetLocations[0].inHand,false);
    assert.equal(guarded.audit.sourceSearchPrompts,1);
    assert.equal(guarded.audit.vetoedSearches,1);
    assert.equal(guarded.audit.acceptedSearches,0);
  }
});

test('native genuine legal four categories and legal subset survive both seats',()=>{
  for(const seat of [0,1]){
    for(const mode of ['four','none']){
      const guarded=withPaperSecretBoxSearchCategory(()=>
        probeSecretBoxPayment(seat,'three',mode));
      const trial=guarded.result;
      assert.equal(trial.rootError,null);
      assert.equal(trial.paymentError,null);
      assert.equal(guarded.audit.vetoedSearches,0);
      assert.equal(guarded.audit.sourceSearchPrompts,1);
      assert.equal(guarded.audit.acceptedSearches,1);
      assert.equal(trial.continuation[0].error,null);
      if(mode==='four')assert.equal(trial.targetLocations.every(x=>x.inHand),true);
    }
  }
});

test('native Store dispatch prototype is restored after normal and guard-veto runs',()=>{
  const path=require('node:path');
  const {Store}=require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  withPaperSecretBoxSearchCategory(()=>probeSecretBoxPayment(0,'three','two-items'));
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),before);
});
