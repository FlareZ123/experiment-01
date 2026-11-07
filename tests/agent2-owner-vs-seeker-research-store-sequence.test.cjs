'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const SEEKER='VS Seeker PHF';
const RESEARCH="Professor's Research JTG";
const card=fullName=>({fullName});
const pokemon={fullName:'Regidrago V SIT',name:'Regidrago V',hp:220,
  stage:1,cardType:[],retreat:[],weakness:[],resistance:[],
  attacks:[],powers:[]};
function slot(occupied=true){
  const cards=occupied?[pokemon]:[];
  return {cards,getPokemonCard:()=>cards[0]??null,
    getPokemons:()=>cards,damage:0,specialConditions:[],
    energies:{cards:[]},tools:[]};
}
function player(id,hand=[],discard=[]){
  return {
    id,active:slot(),bench:Array.from({length:5},()=>slot(false)),
    hand:{cards:hand.map(card)},
    deck:{cards:Array.from({length:14},(_,i)=>card('Psychic Energy MEE'))},
    prizes:[],stadium:{cards:[]},discard:{cards:discard.map(card)},
    lostzone:{cards:[]},supporter:{cards:[]},
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,stadiumUsedTurn:0
  };
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){this.id=id;this.handIndex=handIndex;
    this.target=target;}
}
class PassTurnAction{constructor(id){this.id=id;}}
class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(owner){
    this.id=71;this.playerId=owner.id;this.cards=owner.discard;
    this.result=undefined;
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length===1&&
      this.cards.cards.includes(cards[0])&&
      cards[0].fullName===RESEARCH;
  }
}
class Store{
  constructor(hand=[SEEKER],discard=[RESEARCH]){
    this.state={
      players:[player(10,hand,discard),player(20)],
      activePlayer:0,prompts:[],turn:11,phase:2
    };
    this.verifiedDrawnPhysical=[];
  }
  dispatch(action){
    const owner=this.state.players[0];
    if(action instanceof PlayCardAction){
      assert.equal(action.id,owner.id);
      const selected=owner.hand.cards.splice(action.handIndex,1)[0];
      assert.ok(selected);
      if(selected.fullName===SEEKER){
        owner.discard.cards.push(selected);
        this.state.prompts=[new ChooseCardsPrompt(owner)];
      }else{
        assert.equal(selected.fullName,RESEARCH);
        assert.equal(owner.supporterTurn,0);
        owner.supporterTurn=1;
        owner.supporter.cards.push(selected);
        this.verifiedDrawnPhysical=owner.deck.cards.splice(0,7);
        owner.hand.cards.push(...this.verifiedDrawnPhysical);
      }
    }else if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(x=>x.id===action.id);
      assert.ok(prompt&&prompt.validate(action.result));
      const selected=action.result[0];
      const at=owner.discard.cards.indexOf(selected);
      assert.ok(at>=0);
      owner.discard.cards.splice(at,1);
      owner.hand.cards.push(selected);
      prompt.result=action.result;
      this.state.prompts=[];
    }
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Unsafe native decoder reached');}
}
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  basicEnergyTypes:{},colorlessEnergyType:9,specialConditions:{}
};

/**
 * Controlled Store fixture checks entire plug-in dispatch chain. This is
 * not a pinned engine run and cannot establish paper-native legal behavior.
 * @param {boolean} optIn
 * @returns {object}
 */
function sequence(optIn){
  const store=new Store();
  const before=SimpleTacticsAi.prototype.decodeNextAction;
  const dispatched=[];
  const selected=withActorOnlyRootPolicy(()=>{
    store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(10);
    for(let i=0;i<(optIn?3:1);i++){
      const action=bot.decodeNextAction(store.state);
      dispatched.push(action.constructor.name);
      store.dispatch(action);
    }
    return store;
  },{SimpleTacticsAi,Store,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    cardActions:{PlayCardAction,PlayerType:{ANY:1,BOTTOM_PLAYER:0},
      SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
    promptActions:{ResolvePromptAction},
    gameActions:{PassTurnAction,AttackAction},
    getCatalog:()=>catalog,seekerResearchRoot:optIn});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
  return {store,dispatched,audit:selected.audit};
}

test('default-off no VS Seeker roots are proposed',()=>{
  const s=sequence(false);
  assert.deepEqual(s.dispatched,['PassTurnAction']);
  assert.equal(s.audit.seekerResearchRootOptIn,false);
  assert.equal(s.audit.seekerResearchPromptsAccepted,0);
});

test('three actual typed fixture Store actions settle item, prompt, Supporter and draw',()=>{
  const {store,dispatched,audit}=sequence(true);
  assert.deepEqual(dispatched,[
    'PlayCardAction','ResolvePromptAction','PlayCardAction'
  ]);
  assert.equal(audit.seekerResearchRootOptIn,true);
  assert.equal(audit.seekerResearchPromptsProposed,1);
  assert.equal(audit.seekerResearchPromptsAccepted,1);
  assert.equal(audit.acceptedActorRoots,2);
  assert.equal(audit.rejectedActorRoots,0);
  assert.equal(store.state.players[0].supporterTurn,1);
  assert.equal(store.state.players[0].hand.cards.length,7);
  assert.equal(store.verifiedDrawnPhysical.length,7);
  assert.equal(store.state.players[0].deck.cards.length,7);
  assert.deepEqual(store.state.players[0].discard.cards.map(x=>x.fullName),[SEEKER]);
  assert.deepEqual(store.state.players[0].supporter.cards.map(x=>x.fullName),
    [RESEARCH]);
  assert.equal(store.state.players[1].hand.cards.length,0);
  assert.equal(audit.competitiveGameQualified,false);
});
