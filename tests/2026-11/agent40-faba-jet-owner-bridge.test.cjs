'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  chooseFabaJetHoodRoot,chooseFabaJetHoodPrompt,
  choosePostJetNestRoot,choosePostJetNestSearchPrompt,
  hoodedVileplumeTarget
} = require('../../simulation/twinleaf/2026-11/agent40-faba-jet-owner-bridge.cjs');

const lock = (tools=['Stealthy Hood UNB']) => ({
  printing:'Vileplume AOR',tools,
  abilityDetails:[{name:'Irritating Pollen'}]
});
function owner() {
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Nest Ball SVI','Faba LOT','Jet Energy PAL'],
    ownTurnResources:{
      supporterPlayedTurn:0,energyPlayedTurn:0,
      supporterPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false
    },
    ownPublic:{
      active:{printing:'Mimikyu PAL'},bench:[
        {printing:'Wobbuffet PHF'},null,null,null,null
      ],deckCount:35,stadium:[],
      publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Bunnelby PRC'},
      bench:[lock(),null,null,null,null],stadium:[]
    }
  };
}

test('co-held exact source Faba Jet Nest proposes real Supporter intent',()=>{
  const view=owner();
  assert.deepEqual(chooseFabaJetHoodRoot(view),{
    kind:'play-faba-jet-hood',printing:'Faba LOT',handIndex:1,
    target:{slot:'bench',index:0},
    reason:'remove-hood-before-jet-wobbuffet-item-unlock'
  });
  const another=structuredClone(view);
  another.opponentHiddenHand=['secret'];
  another.ownerHiddenPrize=['secret'];
  assert.deepEqual(chooseFabaJetHoodRoot(another),chooseFabaJetHoodRoot(view));
});

test('Faba root declines all contested resources and protected Vileplume duplicates',()=>{
  const v=owner();
  const original=structuredClone(v);
  v.ownHand=['Nest Ball SVI','Faba LOT'];
  assert.equal(chooseFabaJetHoodRoot(v),null);
  v.ownHand=original.ownHand;
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseFabaJetHoodRoot(v),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.energyPlayedTurn=4;
  assert.equal(chooseFabaJetHoodRoot(v),null);
  v.ownTurnResources.energyPlayedTurn=0;
  v.ownPublic.bench=[{printing:'Wobbuffet PHF'},{printing:'A'},{printing:'B'},
    {printing:'C'},{printing:'D'}];
  assert.equal(chooseFabaJetHoodRoot(v),null);
  v.ownPublic.bench=original.ownPublic.bench;
  v.opponentPublic.bench[1]=lock();
  assert.equal(chooseFabaJetHoodRoot(v),null,
    'Two protected Item locks need two removals');
  v.opponentPublic.bench[1]=null;
  v.opponentPublic.bench[0].tools=[];
  assert.equal(chooseFabaJetHoodRoot(v),null,
    'Faba Supporter should not be spent without a Hood target');
  v.opponentPublic.bench[0]=lock();
  v.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseFabaJetHoodRoot(v),null);
});

test('authentic Faba Select and public Bench target prompt answers are owner-scoped',()=>{
  const v=owner();
  v.decisionKind='owner-prompt';
  const types={PlayerType:{TOP_PLAYER:2},SlotType:{BENCH:5,ACTIVE:4}};
  const select={
    type:'Select',message:'DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY',
    values:['CHOICE_STADIUM','CHOICE_TOOL','CHOICE_SPECIAL_ENERGY']
  };
  assert.deepEqual(chooseFabaJetHoodPrompt(v,select,{},types),
    {answer:1,kind:'faba-select-tool'});
  let requested=null;
  const choose={
    type:'Choose pokemon',message:'CHOOSE_POKEMON_TO_DISCARD_CARDS',
    decode(list){requested=list;return list.map(x=>x.index+17);}
  };
  assert.deepEqual(chooseFabaJetHoodPrompt(v,choose,{},types),
    {answer:[17],kind:'faba-target-hooded-vileplume'});
  assert.deepEqual(requested,[{player:2,slot:5,index:0}]);
  assert.deepEqual(hoodedVileplumeTarget({active:lock(),bench:[]}),
    {slot:'active',index:0});
});

test('post-switch original Item follows physical Wobbuffet and open Bench',()=>{
  const v=owner();
  v.ownPublic.active.printing='Wobbuffet PHF';
  assert.deepEqual(choosePostJetNestRoot(v),{
    kind:'play-nest-after-jet',printing:'Nest Ball SVI',
    handIndex:0,reason:'use-unlocked-source-basic-search'
  });
  v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;
  assert.equal(choosePostJetNestRoot(v),null);
  v.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  v.ownPublic.active.printing='Mimikyu PAL';
  assert.equal(choosePostJetNestRoot(v),null);
});

test('Nest own-deck search only reads source-granted K1 membership',()=>{
  const v=owner();
  v.decisionKind='owner-prompt';
  v.pendingOwnerDeckSearch=true;
  const ownDeck={cards:[
    {fullName:'Regirock XYP',id:17},
    {fullName:'Wobbuffet PHF',id:18}
  ]};
  const prompt={type:'Choose cards',cards:ownDeck,
    decode:indices=>indices.map(index=>ownDeck.cards[index].id)};
  assert.deepEqual(choosePostJetNestSearchPrompt(v,prompt,ownDeck,
    ['Snorlax PGO','Regirock XYP']),{
    answer:[17],printing:'Regirock XYP',
    kind:'nest-select-actual-owner-deck-basic'
  });
  v.pendingOwnerDeckSearch=false;
  assert.equal(choosePostJetNestSearchPrompt(v,prompt,ownDeck,
    ['Regirock XYP']),null,'No search entitlement, no private deck access');
  v.pendingOwnerDeckSearch=true;
  assert.equal(choosePostJetNestSearchPrompt(v,{...prompt,cards:{cards:[]}},
    ownDeck,['Regirock XYP']),null,'Reject a different search zone');
  assert.equal(choosePostJetNestSearchPrompt(v,prompt,ownDeck,
    ['Missing Pokemon']),null,'Absent desired Basic is not invented');
});
