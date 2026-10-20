'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseFogPrinting,withActorFogCrystalPrompt}=
  require('../simulation/twinleaf/agent9-fog-actor-prompt.cjs');
const view={decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
  ownPublic:{bench:[null,{},null,null,null]}};
const offered=[
  {printing:'Allowed Psychic',permitted:true,basicPsychic:true,
    psychicEnergy:false},
  {printing:'Psychic Energy',permitted:true,basicPsychic:false,
    psychicEnergy:true}
];

test('K1 owner-prompt chooser prefers Basic if Bench available',()=>{
  assert.equal(chooseFogPrinting(view,offered),'Allowed Psychic');
  assert.equal(chooseFogPrinting({...view,ownPublic:{bench:[{},{},{},{},{}]}},
    offered),'Psychic Energy');
  assert.equal(chooseFogPrinting(view,offered.map(r=>({...r,permitted:false}))),
    null);
  assert.throws(()=>chooseFogPrinting({...view,pendingOwnerDeckSearch:false},
    offered));
});

test('interceptor materializes authentic owner Item and Choice and observes native dispatch',()=>{
  class FogBasic{
    constructor(){this.fullName='Psychic Basic CRE';this.superType=1;
      this.stage=0;this.cardType=[5];}
  }
  class PsychicEnergy{
    constructor(){this.fullName='Psychic Energy MEE';this.superType=2;
      this.energyType=0;this.name='Psychic Energy';}
  }
  class ChooseCardsPrompt {
    constructor(id,deck){
      this.id=7;this.playerId=id;this.cards=deck;
      this.result=undefined;this.message='CHOOSE_CARD_TO_HAND';
    }
    validate(cards){return Array.isArray(cards)&&cards.length<=1&&
      cards.every(c=>this.cards.cards.includes(c));}
  }
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      Object.assign(this,{id,handIndex,target});}
  }
  class ResolvePromptAction{
    constructor(id,result){Object.assign(this,{id,result});}
  }
  class Store{dispatch(){return true;}}
  class Bot{
    constructor(id){this.client={id};}
    decodeNextAction(){return {type:'OLD_FALLBACK'};}
  }
  const deck={cards:[new FogBasic(),new PsychicEnergy()]};
  const players=[
    {id:101,hand:{cards:[{fullName:'Fog Crystal CRE',trainerType:7}]},
      deck},
    {id:202,hand:{cards:[]},deck:{cards:[]}}
  ];
  const state={players,turn:2,activePlayer:0,prompts:[]};
  const observe=(s,seat)=>({
    actorSeat:seat,globalTurn:s.turn,
    decisionKind:s.prompts.length?'owner-prompt':'owner-root',
    pendingOwnerDeckSearch:s.prompts.length>0,
    ownHand:s.players[seat].hand.cards.map(c=>c.fullName),
    ownPublic:{active:{printing:'Active'},bench:[null,null,null,null,null]},
    ownTurnResources:{itemPlayLocked:false}
  });
  const engine=key=>{
    const modules={
      'simple-bot/simple-tactics-ai':{SimpleTacticsAi:Bot},
      'game/store/store':{Store},
      'game/store/actions/play-card-action':{
        PlayCardAction,PlayerType:{ANY:1},SlotType:{BOARD:2}},
      'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
      'game/store/card/card-types':{SuperType:{POKEMON:1,ENERGY:2},
        TrainerType:{ITEM:7},EnergyType:{BASIC:0},
        Stage:{BASIC:0},CardType:{PSYCHIC:5}},
      'game/game-message':{GameMessage:{
        CHOOSE_CARD_TO_HAND:'CHOOSE_CARD_TO_HAND'}}
    };
    assert.ok(modules[key],key);return modules[key];
  };
  const oldBot=Bot.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const result=withActorFogCrystalPrompt(()=>{
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    const bot=new Bot(101);
    const root=bot.decodeNextAction(state);
    assert.ok(root instanceof PlayCardAction);
    assert.equal(root.handIndex,0);
    store.dispatch(root);
    state.players[0].hand.cards.splice(0,1);
    state.prompts=[new ChooseCardsPrompt(101,deck)];
    const choice=bot.decodeNextAction(state);
    assert.ok(choice instanceof ResolvePromptAction);
    assert.deepEqual(choice.result,[deck.cards[0]]);
    store.dispatch(choice);
    state.prompts=[];
    state.players[0].hand.cards=[deck.cards[0]];
    store.dispatch(new PlayCardAction(101,0,{player:1,slot:2,index:0}));
    return 'synthetic completed channel';
  },{engine,observe});
  assert.equal(result.result,'synthetic completed channel');
  assert.equal(result.audit.fogItemRootNativeAccepted,1);
  assert.equal(result.audit.fogPromptNativeAccepted,1);
  assert.equal(result.audit.postSearchPhysicalCardPlays,1);
  assert.equal(result.audit.rejectedNativeChoices,0);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
  assert.strictEqual(Bot.prototype.decodeNextAction,oldBot);
});
