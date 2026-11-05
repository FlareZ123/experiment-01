'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sourceEnergy,chooseRank9CompressorAfterPass,chooseRank9CompressorDiscard,
  withRank9CompressorAfterPass
}=require('../simulation/twinleaf/agent29-rank9-compressor-owner-bridge.cjs');

/** @param {object} [changes] */
function sample(changes={}){
  const own={
    active:{name:'Mega Absol ex'},
    bench:[{name:'Electrode-GX'},null,null,null,null],
    deckCount:18,discard:[],
    ...changes.own
  };
  return {
    decisionKind:'owner-root',globalTurn:6,
    ownHand:['Battle Compressor PHF','Rare Candy SVI'],
    ownPublic:own,opponentPublic:{prizeCount:6},
    ownTurnResources:{itemPlayLocked:false},
    ...changes
  };
}

test('source owner-visible Compressor is selected after actor Pass only in a viable board',()=>{
  const x=chooseRank9CompressorAfterPass(sample());
  assert.deepEqual(x,{handIndex:0,printing:'Battle Compressor PHF',
    reason:'owner-visible-voltorb-mega-discard-energy-deficit'});
  assert.equal(x.handIndex,0);
});

test('no opponent hand/Prize/deck identities are needed by owner gate',()=>{
  const v=sample();
  v.opponentPublic={prizeCount:6};
  v.ownPublic.deckCount=31;
  assert.equal(chooseRank9CompressorAfterPass(v).handIndex,0);
});

test('source early Item respects public risk, lock, occupied board and known existing discard fuel',()=>{
  const cases=[
    sample({globalTurn:13}),
    sample({ownTurnResources:{itemPlayLocked:true}}),
    sample({own:{deckCount:2}}),
    sample({opponentPublic:{prizeCount:2}}),
    sample({ownHand:['Ultra Ball SVI']}),
    sample({own:{active:{name:'Voltorb'},bench:[null,null,null,null,null]}}),
    sample({own:{active:{name:'Mega Absol ex'},
      bench:[{name:'Dedenne-GX'},null,null,null,null]}}),
    sample({own:{discard:['Prism Energy ASC','Prism Energy ASC',
      'Darkness Energy MEE']}})
  ];
  cases.forEach((v,i)=>assert.equal(chooseRank9CompressorAfterPass(v),null,
    'Case '+i+' must not consume source Combo'));
});

test('printed source Energy recognises only expected original physical types',()=>{
  assert.equal(sourceEnergy('Prism Energy ASC'),true);
  assert.equal(sourceEnergy('Darkness Energy SVE'),true);
  assert.equal(sourceEnergy('Telepath [P] Energy M3'),true);
  assert.equal(sourceEnergy('Telepathic Psychic Energy POR'),true);
  assert.equal(sourceEnergy('Basic Lightning Energy SVE'),false);
  assert.equal(sourceEnergy('Battle Compressor PHF'),false);
});

test('owner deck inspection happens only in real ChooseCardsPrompt',()=>{
  const records=[
    {fullName:'Rare Candy SVI'},
    {fullName:'Telepath [P] Energy M3'},
    {fullName:'Prism Energy ASC',id:1},
    {fullName:'Darkness Energy MEE'},
    {fullName:'Prism Energy ASC',id:2}
  ];
  const owner={deck:{cards:records},
    discard:{cards:[{fullName:'Prism Energy ASC'}]}};
  const prompt={cards:owner.deck};
  const chosen=chooseRank9CompressorDiscard(prompt,owner);
  assert.deepEqual(chosen,[records[2],records[4]]);
  assert.equal(owner.deck.cards.length,5);
  assert.equal(owner.discard.cards.length,1);
});

test('source deck selector rejects an unrelated prompt and handles exhausted source Energy',()=>{
  const p={cards:{cards:[]}};
  const owner={deck:{cards:[]},discard:{cards:[]}};
  assert.throws(()=>chooseRank9CompressorDiscard(p,owner));
  p.cards=owner.deck;
  assert.deepEqual(chooseRank9CompressorDiscard(p,owner),[]);
});

test('late v2 restores source Combo opportunity at formerly capped real-turn positions',()=>{
  for(const turn of [13,16,18,20]){
    const v=sample({globalTurn:turn});
    assert.equal(chooseRank9CompressorAfterPass(v),null,
      'historical default v1 cutoff remains unchanged');
    assert.equal(
      chooseRank9CompressorAfterPass(v,{maxGlobalTurn:Infinity})?.handIndex,
      0,'v2 can consider the otherwise eligible owner Pass');
  }
});

test('late v2 still respects paper-relevant owner-visible gates',()=>{
  const variants=[
    sample({globalTurn:20,ownTurnResources:{itemPlayLocked:true}}),
    sample({globalTurn:20,own:{deckCount:2}}),
    sample({globalTurn:20,opponentPublic:{prizeCount:2}}),
    sample({globalTurn:20,ownHand:['Ultra Ball SVI']}),
    sample({globalTurn:20,own:{active:{name:'Mega Absol ex'},
      bench:[{name:'Dedenne-GX'},null,null,null,null]}}),
    sample({globalTurn:20,own:{discard:[
      'Prism Energy ASC','Darkness Energy SVE','Prism Energy ASC']}})
  ];
  for(const v of variants)
    assert.equal(
      chooseRank9CompressorAfterPass(v,{maxGlobalTurn:Infinity}),null);
});

test('finite-turn owner probe remains bounded without altering v1',()=>{
  assert.ok(chooseRank9CompressorAfterPass(
    sample({globalTurn:16}),{maxGlobalTurn:16}));
  assert.equal(chooseRank9CompressorAfterPass(
    sample({globalTurn:17}),{maxGlobalTurn:16}),null);
});

test('owned Compressor search is decoded before stock prompt failure',()=>{
  class AddPlayerAction {}
  class PassTurnAction {}
  class PlayCardAction {
    constructor(playerId,handIndex,target){
      this.playerId=playerId;this.handIndex=handIndex;this.target=target;
    }
  }
  class ResolvePromptAction {
    constructor(id,cards){this.id=id;this.cards=cards;}
  }
  class ChooseCardsPrompt {
    constructor(deck,sourceCard){
      this.id=55;this.playerId=101;this.message='CHOOSE_CARD_TO_DISCARD';
      this.cards=deck;this.sourceCard=sourceCard;this.result=undefined;
    }
    validate(cards){return cards.length>0&&cards.length<=3;}
  }
  class ShuffleDeckPrompt {
    constructor(sourceCard){
      this.id=56;this.playerId=101;this.sourceCard=sourceCard;
      this.result=undefined;
    }
  }
  class SimpleTacticsAi {
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      if(state.prompts[0] instanceof ShuffleDeckPrompt)
        return new ResolvePromptAction(56,[0]);
      if(state.prompts.length)throw Error('stock bot cannot decode search');
      return new PassTurnAction();
    }
  }
  class Store {
    constructor(state){this.state=state;}
    dispatch(action){
      const state=this.state,owner=state.players[0];
      if(action instanceof PlayCardAction){
        const played=owner.hand.cards.splice(action.handIndex,1)[0];
        this.playedCompressor=played;
        state.prompts.push(new ChooseCardsPrompt(owner.deck,played));
      }
      if(action instanceof ResolvePromptAction){
        if(action.id===55){
          for(const card of action.cards){
            const index=owner.deck.cards.indexOf(card);
            assert.notEqual(index,-1);
            owner.deck.cards.splice(index,1);
            owner.discard.cards.push(card);
          }
          state.prompts.length=0;
          state.prompts.push(new ShuffleDeckPrompt(this.playedCompressor));
        }else if(action.id===56){
          assert.deepEqual(action.cards,[0]);
          state.prompts.length=0;
        }else throw Error('unexpected prompt');
      }
      return true;
    }
  }
  const owner={
    id:101,
    hand:{cards:[{fullName:'Battle Compressor PHF',canPlay:()=>true}]},
    deck:{cards:[
      {fullName:'Prism Energy ASC'},
      {fullName:'Darkness Energy SVE'},
      {fullName:'Rare Candy SVI'}]},
    discard:{cards:[]}
  };
  const state={players:[owner,{id:202}],turn:16,
    phase:'PLAYER_TURN',activePlayer:0,prompts:[]};
  const store=new Store(state),bot=new SimpleTacticsAi();
  const executed=withRank9CompressorAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    const item=bot.decodeNextAction(state);
    assert.equal(item.constructor.name,'PlayCardAction');
    store.dispatch(item);
    const search=bot.decodeNextAction(state);
    assert.equal(search.constructor.name,'ResolvePromptAction');
    store.dispatch(search);
    assert.equal(state.prompts[0].constructor.name,'ShuffleDeckPrompt');
    const shuffle=bot.decodeNextAction(state);
    store.dispatch(shuffle);
    return true;
  },0,{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
    cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
    promptActions:{ResolvePromptAction},
    actorObservation:()=>sample({globalTurn:16}),
    maxGlobalTurn:Infinity
  });
  assert.equal(executed.result,true);
  assert.equal(executed.audit.nativeAcceptedCompressor,1);
  assert.equal(executed.audit.ownerDeckPromptDecisions,1);
  assert.equal(executed.audit.nativeSettledDeckToDiscard,2);
  assert.equal(executed.audit.nativeSettledShuffles,1);
  assert.equal(executed.audit.events[0].shufflePromptResolved,true);
  assert.equal(owner.discard.cards.length,2);
});

test('when native allows zero, selector still pays printed Item minimum',()=>{
  const deck=[
    {fullName:'Mega Absol ex MEG'},
    {fullName:'Battle VIP Pass FST'},
    {fullName:'Guzma BUS'}
  ];
  const owner={deck:{cards:deck},discard:{cards:[]}};
  const prompt={cards:owner.deck,options:{min:0,max:3}};
  const selected=chooseRank9CompressorDiscard(
    prompt,owner,{globalTurn:20});
  assert.deepEqual(selected,[deck[1]],
    'use source-dead first-turn-only card when available');
  assert.equal(selected.length,1);
  assert.deepEqual(chooseRank9CompressorDiscard(prompt,owner),[deck[0]],
    'without late-turn dead-card premise choose a physical deck card');
  assert.equal(deck.length,3);
});

test('owner deck selector retains positive count under deck Energy exhaustion',()=>{
  const deck=[{fullName:'Trainers\' Mail ROS'}];
  const owner={deck:{cards:deck},discard:{cards:[]}};
  assert.deepEqual(chooseRank9CompressorDiscard({cards:owner.deck},owner,
    {globalTurn:20}),[deck[0]]);
});
