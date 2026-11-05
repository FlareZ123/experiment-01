'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withPublicSupporterRevealWitness}=
  require('../simulation/twinleaf/agent1-native-public-supporter-reveal-witness.cjs');

class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,playerId,deck){
    this.id=id;this.playerId=playerId;this.cards=deck;
    this.filter={superType:'TRAINER',trainerType:'SUPPORTER'};
    this.result=undefined;
  }
}
class ShowCardsPrompt{
  constructor(id,playerId,cards){
    this.id=id;this.playerId=playerId;this.cards=cards;
    this.result=undefined;
  }
}
class PassTurnAction{}
class FakeStore{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof PassTurnAction){
      this.state.turn++;
      this.state.activePlayer=1-this.state.activePlayer;
      return this.state;
    }
    const prompt=this.state.prompts.find(p=>p.id===action.id);
    assert.ok(prompt);
    assert.equal(prompt.result,undefined);
    prompt.result=action.result;
    return this.state;
  }
}
const dependencies={
  Store:FakeStore,ResolvePromptAction,ChooseCardsPrompt,
  ShowCardsPrompt,types:{SuperType:{TRAINER:'TRAINER'},
    TrainerType:{SUPPORTER:'SUPPORTER'}}
};

test('physically selected hidden Supporter name is emitted only after native opponent ShowCards acceptance',()=>{
  const owner={id:91,deck:{cards:[]}};
  const opponent={id:92,deck:{cards:[]}};
  let privateNameReads=0;
  const supporter={
    trainerType:'SUPPORTER',
    get fullName(){privateNameReads++;return 'Carmine TWM';}
  };
  owner.deck.cards.push(supporter);
  const store=new FakeStore({turn:2,players:[owner,opponent],prompts:[]});
  const descriptor=Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch');
  const observed=withPublicSupporterRevealWitness(()=>{
    store.state.prompts=[new ChooseCardsPrompt(7,owner.id,owner.deck)];
    store.dispatch(new ResolvePromptAction(7,[supporter]));
    assert.equal(privateNameReads,0,
      'Never read chosen Supporter name while only the owner knows it');
    store.state.prompts=[new ShowCardsPrompt(8,opponent.id,[supporter])];
    store.dispatch(new ResolvePromptAction(8,true));
    assert.equal(privateNameReads,1,
      'Name is read for audit only after opponent acknowledgement');
    return 23;
  },dependencies);
  assert.equal(observed.result,23);
  assert.equal(observed.audit.eligibleAcceptedSourceSearches,1);
  assert.equal(observed.audit.matchedNativeAcceptedPublicSupporterReveals,1);
  assert.equal(observed.audit.unmatchedAcceptedPublicSupporterReveals,0);
  assert.deepEqual(observed.audit.publicReveals,[{
    ownerSeat:0,opponentSeat:1,turn:2,
    printedSupporterRevealed:'Carmine TWM',
    selectedSearchPromptId:7,revealPromptId:8,
    nativeOpponentAcknowledged:true
  }]);
  assert.strictEqual(FakeStore.prototype.dispatch,descriptor.value);
});

test('unassociated opponent reveal never leaks pending unshown selected Supporter',()=>{
  const owner={id:3,deck:{cards:[]}};
  const opponent={id:8,deck:{cards:[]}};
  const chosen={trainerType:'SUPPORTER',
    fullName:'Marnie SSH'};
  const other={trainerType:'SUPPORTER',
    fullName:'Guzma BUS'};
  const state={turn:2,players:[owner,opponent],prompts:[]};
  const store=new FakeStore(state);
  const observed=withPublicSupporterRevealWitness(()=>{
    state.prompts=[new ChooseCardsPrompt(1,owner.id,owner.deck)];
    store.dispatch(new ResolvePromptAction(1,[chosen]));
    state.prompts=[new ShowCardsPrompt(2,opponent.id,[other])];
    store.dispatch(new ResolvePromptAction(2,true));
    return true;
  },dependencies);
  assert.equal(observed.audit.eligibleAcceptedSourceSearches,1);
  assert.equal(observed.audit.matchedNativeAcceptedPublicSupporterReveals,0);
  assert.equal(observed.audit.unmatchedAcceptedPublicSupporterReveals,1);
  assert.deepEqual(observed.audit.publicReveals,[]);
  assert.equal(observed.audit.readsOpponentHiddenDeck,false);
  assert.equal(observed.audit.competitivelyQualifiedGames,0);
});

test('accepted source pass after public Reveal records exact held card and bounded native canPlay, no hidden cards',()=>{
  const card={trainerType:'SUPPORTER',fullName:'Marnie SSH',
    canPlay:(target,state,player)=>{
      assert.equal(target,null);
      assert.equal(state.turn,2);
      assert.equal(player.id,11);
      return true;
    }};
  const owner={id:11,deck:{cards:[card]},hand:{cards:[card]},
    supporterTurn:0,cannotPlaySupporterCards:false};
  const opponent={id:22,deck:{cards:[]},hand:{cards:[]}};
  const state={turn:2,activePlayer:0,players:[owner,opponent],prompts:[]};
  const store=new FakeStore(state);
  const observed=withPublicSupporterRevealWitness(()=>{
    state.prompts=[new ChooseCardsPrompt(18,owner.id,owner.deck)];
    store.dispatch(new ResolvePromptAction(18,[card]));
    state.prompts=[new ShowCardsPrompt(19,opponent.id,[card])];
    store.dispatch(new ResolvePromptAction(19,true));
    state.prompts=[];
    store.dispatch(new PassTurnAction());
    return state.turn;
  },dependencies);
  assert.equal(observed.result,3);
  assert.equal(observed.audit.matchedNativeAcceptedPublicSupporterReveals,1);
  assert.deepEqual(observed.audit.sourceOwnerPassAfterPublicReveal,[{
    sourceOwnerSeat:0,turn:2,
    revealedSupporterPrinting:'Marnie SSH',
    samePhysicalSelectedSupporterStillHeld:true,
    nativeSupporterTurnQuotaBeforePass:0,
    nativeSupporterPlayLockBeforePass:false,
    nativeNullTargetCanPlay:'true',
    nullTargetCanPlayDoesNotCertifyTargetLegality:true,
    publishedOnlyAfterOpponentAcceptedReveal:true,
    actualNativePassAccepted:true
  }]);
});
