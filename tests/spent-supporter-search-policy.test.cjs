'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  rerankSpentSupporterSearch,
  eligibleUnrestrictedSearch,
  withSpentSupporterSearch
} = require('../simulation/twinleaf/spent-supporter-search-policy.cjs');

const SUPPORTER = 3;
const acerola = {fullName:'Acerola BUS',trainerType:SUPPORTER};
const energy = {fullName:'Psychic Energy MEE'};
const item = {fullName:'Fog Crystal CRE',trainerType:2};
const values = new Map([[acerola,7],[energy,6],[item,2]]);
const score = card => values.get(card);

function fixture({ownerId=101,spent=1,hand=[],filter={},
  max=1,allowCancel=false}={}) {
  const player = {
    id:ownerId,supporterTurn:spent,hand:{cards:hand},deck:{cards:[acerola,energy,item]}
  };
  return {player,cards:player.deck,filter,options:{max,allowCancel}};
}

test('exact missing first-Supporter bonus changes the selected first card',()=>{
  assert.deepEqual(rerankSpentSupporterSearch(
    [acerola,energy,item],score,c=>c.trainerType===SUPPORTER,5),
  [energy,acerola,item]);
});

test('original order wins when adjusted scores are tied',()=>{
  const cards=[item,acerola];
  assert.deepEqual(rerankSpentSupporterSearch(cards,()=>2,
    c=>c.trainerType===SUPPORTER,0),cards);
});

test('card multiplicities and original object identities are unchanged',()=>{
  const cards=[acerola,item,item,energy,acerola];
  const got=rerankSpentSupporterSearch(cards,score,
    c=>c.trainerType===SUPPORTER,5);
  assert.equal(got.length,cards.length);
  assert.deepEqual([...got].sort((a,b)=>cards.indexOf(a)-cards.indexOf(b)),
    [acerola,acerola,item,item,energy]);
});

test('only owner unrestricted deck search after Supporter play qualifies',()=>{
  assert.equal(eligibleUnrestrictedSearch(fixture(),101,SUPPORTER),true);
  for(const bad of [
    fixture({ownerId:202}),fixture({spent:0}),
    fixture({hand:[acerola]}),fixture({filter:{name:'Acerola'}}),
    fixture({max:2}),fixture({allowCancel:true})
  ])assert.equal(eligibleUnrestrictedSearch(bad,101,SUPPORTER),false);
  const otherZone=fixture();
  otherZone.cards={cards:[]};
  assert.equal(eligibleUnrestrictedSearch(otherZone,101,SUPPORTER),false);
});

test('reversible injected resolver reorders the real candidate one-card prompt only',()=>{
  class FakeResolver {
    constructor(){
      this.options={scores:{hand:{hasSupporter:5}}};
      this.stateScore={getCardScore(_state,_owner,card){return score(card)}};
    }
    buildCardsToChoose(){return [acerola,energy,item]}
  }
  const original=FakeResolver.prototype.buildCardsToChoose;
  const prompt=fixture();
  const executed=withSpentSupporterSearch(0,()=>{
    const resolver=new FakeResolver();
    assert.deepEqual(resolver.buildCardsToChoose({turn:16},prompt),
      [energy,acerola,item]);
    assert.deepEqual(resolver.buildCardsToChoose({turn:16},fixture({spent:0})),
      [acerola,energy,item]);
    return 42;
  },{resolverClass:FakeResolver,supporterType:SUPPORTER});
  assert.equal(executed.result,42);
  assert.equal(executed.audit.events.length,1);
  assert.equal(executed.audit.events[0].correctedFirst,'Psychic Energy MEE');
  assert.equal(executed.audit.events[0].nativeFirst,'Acerola BUS');
  assert.equal(FakeResolver.prototype.buildCardsToChoose,original);
});

test('resolver hook restores on exception and rejects an invalid seat',()=>{
  class FakeResolver {buildCardsToChoose(){return []}}
  const original=FakeResolver.prototype.buildCardsToChoose;
  assert.throws(()=>withSpentSupporterSearch(1,()=>{
    throw new Error('intentional test failure');
  },{resolverClass:FakeResolver,supporterType:SUPPORTER}),/intentional/);
  assert.equal(FakeResolver.prototype.buildCardsToChoose,original);
  assert.throws(()=>withSpentSupporterSearch(2,()=>null,
    {resolverClass:FakeResolver,supporterType:SUPPORTER}),/candidateSeat/);
});
