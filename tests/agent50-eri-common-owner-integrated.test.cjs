'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');

const ACE=77,SUPER={TRAINER:2,ENERGY:3},TRAINER={ITEM:1,SUPPORTER:2};
const CARD_TYPES={SuperType:SUPER,TrainerType:TRAINER,
  CardTag:{ACE_SPEC:ACE}};
function card(fullName,id,extra={}){
  return {fullName,id,...extra};
}
function slot(pokemon=null){
  return {cards:pokemon?[pokemon]:[],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[],
    getPokemonCard(){return this.cards[0]??null;},
    getPokemons(){return this.cards;}};
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class AttackAction{
  constructor(id,name){this.id=id;this.attackName=name;}
}
class PassTurnAction{}
class RetreatAction{}
class UseAbilityAction{}
class UseStadiumAction{}
class ChooseCardsPrompt{
  constructor(owner,opponent){
    this.id=441;this.playerId=owner.id;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.result=undefined;
    this.cards=opponent.hand;
    this.filter={superType:SUPER.TRAINER,trainerType:TRAINER.ITEM};
    this.options={min:0,max:2,allowCancel:false};
  }
  validate(selected){
    return Array.isArray(selected)&&selected.length<=2&&
      selected.every(c=>this.cards.cards.includes(c)&&
        c.superType===SUPER.TRAINER&&c.trainerType===TRAINER.ITEM);
  }
}
class Store{
  constructor(seat){
    const thorns={name:'Iron Thorns ex',fullName:'Iron Thorns ex TWM',
      hp:230,stage:1,cardType:[4],retreat:[],weakness:[],
      resistance:[],attacks:[{name:'Volt Cyclone',cost:[4,9,9],
        damage:140,gxAttack:false}],powers:[]};
    const shadow={name:'Shadow Rider Calyrex V',
      fullName:'Shadow Rider Calyrex V CRE',hp:210,stage:1,
      cardType:[5],retreat:[],weakness:[],resistance:[],
      attacks:[],powers:[]};
    const owner={id:401,active:slot(thorns),
      bench:Array.from({length:5},()=>slot()),
      stadium:{cards:[card('Thunder Mountain Prism Star LOT',50)]},
      hand:{cards:[card('Eri TEF',51)]},deck:{cards:[]},
      prizes:Array.from({length:6},()=>({cards:[card('Prize unknown',60)]})),
      lostzone:{cards:[]},discard:{cards:[]},supporter:{cards:[]},
      energyPlayedTurn:0,supporterTurn:0};
    owner.active.energies.cards.push(card('Double Colorless Energy SUM',52));
    const opponent={id:402,active:slot(shadow),
      bench:Array.from({length:5},()=>slot()),
      stadium:{cards:[]},
      hand:{cards:[
        card('VS Seeker PHF',101,{superType:SUPER.TRAINER,
          trainerType:TRAINER.ITEM,hasTag:()=>false}),
        card('Psychic Energy SVE',102,{superType:SUPER.ENERGY}),
        card('Ultra Ball SUM',103,{superType:SUPER.TRAINER,
          trainerType:TRAINER.ITEM,hasTag:()=>false}),
        card('Computer Search BCR',104,{superType:SUPER.TRAINER,
          trainerType:TRAINER.ITEM,hasTag:tag=>tag===ACE}),
        card('Double Colorless Energy SUM',105,{superType:SUPER.ENERGY})
      ]},deck:{cards:[]},prizes:[],lostzone:{cards:[]},
      discard:{cards:[]},supporter:{cards:[]}};
    this.state={players:seat===0?[owner,opponent]:[opponent,owner],
      activePlayer:seat,turn:4,phase:2,prompts:[]};
    this.owner=owner;this.opponent=opponent;this.seat=seat;
  }
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    if(action instanceof PlayCardAction){
      assert.equal(action.id,this.owner.id);
      const supporter=this.owner.hand.cards.splice(action.handIndex,1)[0];
      assert.equal(supporter.fullName,'Eri TEF');
      this.owner.supporter.cards.push(supporter);
      this.owner.supporterTurn=1;
      this.state.prompts=[new ChooseCardsPrompt(this.owner,this.opponent)];
      return true;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.result===undefined);
      assert.ok(prompt);
      assert.equal(action.id,prompt.id);
      assert.ok(prompt.validate(action.result));
      for(const targeted of action.result){
        const i=this.opponent.hand.cards.indexOf(targeted);
        assert.ok(i>=0);
        this.opponent.hand.cards.splice(i,1);
        this.opponent.discard.cards.push(targeted);
      }
      this.owner.discard.cards.push(...this.owner.supporter.cards.splice(0));
      prompt.result=action.result;
      this.state.prompts=[];
      return true;
    }
    if(action instanceof AttackAction){
      assert.equal(action.attackName,'Volt Cyclone');
      this.opponent.active.damage+=140;
      this.state.turn=5;this.state.activePlayer=1-this.seat;
      this.owner.supporterTurn=0;
      return true;
    }
    throw Error('Mock owner only may dispatch authenticated actions');
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Fallback would use hidden State');}
}

const CATALOG={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  specialEnergies:new Set(),basicEnergyTypes:{Lightning:4},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

for(const seat of [0,1]){
  test('fully wired Eri root, authenticated reveal, physical ACE discard then attack seat '+seat,()=>{
    const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
    const beforeStore=Store.prototype.dispatch;
    const outcome=withActorOnlyRootPolicy(()=>{
      const store=new Store(seat);
      store.dispatch(new AddPlayerAction());
      const ai=new SimpleTacticsAi(401);
      const firstView=actorObservation(store.state,seat);
      assert.equal(firstView.decisionKind,'owner-root');
      assert.equal(firstView.opponentPublic.handCount,5);
      assert.ok(!Object.hasOwn(firstView.opponentPublic,'hand'));
      const first=ai.decodeNextAction(store.state);
      assert.ok(first instanceof PlayCardAction);
      assert.equal(first.handIndex,0);
      store.dispatch(first);
      const prompt=store.state.prompts[0];
      assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
      const response=ai.decodeNextAction(store.state);
      assert.ok(response instanceof ResolvePromptAction);
      assert.deepEqual(response.result.map(card=>card.fullName),
        ['Computer Search BCR','VS Seeker PHF']);
      store.dispatch(response);
      assert.equal(store.opponent.hand.cards.length,3);
      assert.deepEqual(store.opponent.discard.cards.map(c=>c.fullName),
        ['Computer Search BCR','VS Seeker PHF']);
      const next=ai.decodeNextAction(store.state);
      assert.ok(next instanceof AttackAction);
      assert.equal(next.attackName,'Volt Cyclone');
      store.dispatch(next);
      assert.equal(store.opponent.active.damage,140);
      assert.equal(store.state.turn,5);
      return {selected:['Computer Search BCR','VS Seeker PHF'],seat};
    },{
      SimpleTacticsAi,Store,
      observe:actorObservation,getCatalog:()=>CATALOG,
      GamePhase:{PLAYER_TURN:2,FINISHED:7},
      cardActions:{PlayCardAction,PlayerType:{ANY:0,BOTTOM_PLAYER:1},
        SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
      gameActions:{AttackAction,PassTurnAction,RetreatAction,
        UseAbilityAction,UseStadiumAction},
      promptActions:{ResolvePromptAction},
      eriCardTypes:CARD_TYPES,
      thornsDirectLine:true,eriRevealRoot:true
    });
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
    assert.strictEqual(Store.prototype.dispatch,beforeStore);
    assert.equal(outcome.audit.eriPromptsProposed,1);
    assert.equal(outcome.audit.eriPromptsAccepted,1);
    assert.equal(outcome.audit.eriItemsDiscarded,2);
    assert.equal(outcome.audit.nativePhysicalConfirmedByIntent['play-eri-reveal'],1);
    assert.equal(outcome.audit.acceptedActorRoots,2);
    assert.equal(outcome.audit.unsupportedPromptFallbacks,0);
    assert.equal(outcome.audit.competitiveGameQualified,false);
  });
}
