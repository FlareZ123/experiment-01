'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseOwnedBoxFetchShake
}=require('../simulation/twinleaf/agent44-secretbox-owner-prompt.cjs');

function card(name,index=0){return {name,fullName:name+' '+index};}
class ChooseCardsPrompt{
  constructor(cards,owner,max=true){
    this.cards=owner.deck;this.playerId=owner.id;
    this.options={maxItems:1,maxTools:1,maxSupporters:1,maxStadiums:1};
    this.validate=selected=>max&&selected.length>0&&
      selected.every(x=>cards.includes(x))&&
      selected.filter(x=>x.name==='Boost Shake').length===1&&
      selected.filter(x=>x.name==='Float Stone').length<=1;
  }
}
function fixture({deckNames,handNames,benchNames=[],activeName='Budew',
  promptValidator=true}){
  const deckCards=deckNames.map((n,i)=>card(n,i));
  const handCards=handNames.map((n,i)=>card(n,i));
  const bench=Array.from({length:5},(_,i)=>({
    getPokemonCard:()=>benchNames[i]?card(benchNames[i]):null
  }));
  const owner={
    id:101,deck:{cards:deckCards},hand:{cards:handCards},
    active:{getPokemonCard:()=>card(activeName)},bench
  };
  return {owner,prompt:new ChooseCardsPrompt(deckCards,owner,promptValidator)};
}

test('K1 real owner search accepts Item Shake and unprized Tool together',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Float Stone','Garbodor','Trubbish',
      'Temple of Sinnoh','Crispin'],
    handNames:['Quick Ball','Darkness Energy']
  });
  const selected=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(selected.eligible,true);
  assert.deepEqual(selected.selectedNames,['Boost Shake','Float Stone']);
  assert.equal(selected.sources.basicSearcherHeld,'Quick Ball');
  assert.equal(selected.nativeAccepted,true);
});

test('already-held Tool needs only Item Shake in native selection',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Crispin'],
    handNames:['Float Stone','Battle VIP Pass']
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{turn:1});
  assert.equal(x.eligible,true);
  assert.deepEqual(x.selectedNames,['Boost Shake']);
  assert.equal(x.sources.searchedTool,null);
});

test('Trubbish already on public Bench skips need for Basic search Item',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Float Stone'],
    handNames:['Darkness Energy'],
    benchNames:['Trubbish','Crobat V','Dedenne-GX','Tapu Lele-GX','Budew']
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(x.eligible,true);
  assert.equal(x.sources.benchFree,false);
  assert.equal(x.sources.trubbishInPlay,true);
});

test('owner Active Trubbish is a legal Shake evolution target with full Bench',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Float Stone'],
    handNames:['Darkness Energy'],
    activeName:'Trubbish',
    benchNames:['Crobat V','Dedenne-GX','Tapu Lele-GX','Budew','Mega Absol ex']
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(x.eligible,true);
});

test('no Trubbish available rejects K1 route without consulting opponent',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Float Stone'],
    handNames:['Quick Ball','Iono']
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(x.eligible,false);
  assert.equal(x.reason,'K1_PHYSICAL_COMPONENT_MISSING');
  assert.deepEqual(x.selectedCards,[]);
});

test('Prized singleton Boost Shake or Garbodor rejects search',()=>{
  for(const excluded of ['Boost Shake','Garbodor']){
    const {owner,prompt}=fixture({
      deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone']
        .filter(name=>name!==excluded),
      handNames:['Quick Ball','Darkness Energy']
    });
    const x=chooseOwnedBoxFetchShake(prompt,owner,{});
    assert.equal(x.eligible,false,excluded);
  }
});

test('Ultra Ball without two remaining cards is not a viable Basic search',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone'],
    handNames:['Ultra Ball']
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(x.eligible,false);
  assert.equal(x.sources.basicSearcherHeld,null);
});

test('native prompt rejection cannot be overridden by own deck visibility',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone'],
    handNames:['Quick Ball','Iono'],promptValidator:false
  });
  const x=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(x.eligible,false);
  assert.equal(x.nativeAccepted,false);
  assert.equal(x.reason,'NATIVE_PROMPT_REJECTED_SELECTION');
  assert.deepEqual(x.selectedCards,[]);
});

test('forged prompt rejects wrong owner deck or player id',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone'],
    handNames:['Quick Ball','Iono']
  });
  assert.throws(()=>chooseOwnedBoxFetchShake({
    ...prompt,cards:{cards:owner.deck.cards}},owner,{}),
    error=>error.code==='ERR_ASSERTION'&&error.operator==='strictEqual');
  prompt.playerId=999;
  assert.throws(()=>chooseOwnedBoxFetchShake(prompt,owner,{}),/native prompted owner/);
});

test('wrong categorical prompt signature fails closed',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone'],
    handNames:['Quick Ball','Iono']
  });
  prompt.options={max:1};
  assert.throws(()=>chooseOwnedBoxFetchShake(prompt,owner,{}),
    /Unsupported owner search signature/);
});

test('first-turn VIP works only in ordinary opening turns, later VIP is dead',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish','Float Stone'],
    handNames:['Battle VIP Pass']
  });
  const early=chooseOwnedBoxFetchShake(prompt,owner,{turn:2});
  assert.equal(early.eligible,true);
  assert.equal(early.sources.basicSearcherHeld,'Battle VIP Pass');
  const late=chooseOwnedBoxFetchShake(prompt,owner,{turn:7});
  assert.equal(late.eligible,false);
  assert.equal(late.sources.basicSearcherHeld,null);
  const unknown=chooseOwnedBoxFetchShake(prompt,owner,{});
  assert.equal(unknown.eligible,false);
});

test('do not count held Trubbish or Float Stone as Ultra Ball discard fodder',()=>{
  const {owner,prompt}=fixture({
    deckNames:['Boost Shake','Garbodor','Trubbish'],
    handNames:['Ultra Ball','Float Stone','Iono']
  });
  const ineligible=chooseOwnedBoxFetchShake(prompt,owner,{turn:1});
  assert.equal(ineligible.eligible,false);
  assert.equal(ineligible.sources.basicSearcherHeld,null);
  owner.hand.cards.push(card('Dark Patch',9));
  const nowViable=chooseOwnedBoxFetchShake(prompt,owner,{turn:1});
  assert.equal(nowViable.eligible,true);
  assert.equal(nowViable.sources.basicSearcherHeld,'Ultra Ball');
});
