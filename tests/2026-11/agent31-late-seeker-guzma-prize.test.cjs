'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseLateSeekerGuzmaPrize,VERSION}=
  require('../../simulation/twinleaf/agent31/late-seeker-guzma-prize.cjs');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {selectOwnerVsSeekerSupporterPrompt}=
  require('../../simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs');

const P=5,C=9,SEEKER='VS Seeker PHF',GUZMA='Guzma BUS';
const ENERGY='Psychic Energy MEE';
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([ENERGY]),basicEnergyTypes:{Psychic:P},
  colorlessEnergyType:C,specialConditions:{ASLEEP:2,PARALYZED:3}};
const attack=(damage=100)=>({name:'Moon Press',cost:[P,C,C],
  damage,damageCalculation:null,text:'',gxAttack:false});
const poke=(name,attached=0,damage=100)=>({
  name,printing:name,attacks:[attack(damage)],
  energies:Array.from({length:attached},()=>ENERGY),
  publicRestrictions:{},specialConditions:[],
  printed:{types:[P],resistance:[]},hp:100,damage:0,tools:[]
});
function view(){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:9,
    ownHand:[SEEKER],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      itemPlayLocked:false,energyPlayedTurn:9},
    ownPublic:{active:poke('Dedenne GX UNB'),
      bench:[poke('Crobat V DAA'),poke('Lunatone OBF',3),null,null,null],
      discard:[GUZMA],deckCount:25,prizeCount:1,
      resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false,
        itemPlayLocked:false,attackLockTurnsRemaining:0}},
    opponentPublic:{active:poke('Iron Thorns ex TWM',0,100),
      bench:[poke('Oranguru V ASR',0,100),
        poke('Lunatone OBF',0,100),null,null,null],
      prizeCount:4}};
}
test('Seeker plans only when a funded Bench attack can take a nominal Prize',()=>{
  const v=view();
  const root=chooseLateSeekerGuzmaPrize(v,catalog);
  assert.equal(root.source,VERSION);
  assert.equal(root.kind,'play-seeker-get-guzma');
  assert.equal(root.printing,SEEKER);
  assert.equal(root.target,GUZMA);
  assert.equal(root.intendedBenchIndex,1);
  assert.equal(root.intendedOpponentBenchIndex,1);
  assert.equal(root.intendedAttackName,'Moon Press');
  assert.equal(root.actualGustAndKnockoutUnverified,true);
  assert.notEqual(chooseActorRootIntent(v,catalog).kind,root.kind);
  assert.equal(chooseActorRootIntent(v,catalog,{
    seekerGuzmaNominalKo:true}).kind,root.kind);
});
test('after physically adding Guzma to hand, recompute actual supporter plan',()=>{
  const v=view();
  v.ownHand=[GUZMA];v.ownPublic.discard=[];
  const root=chooseActorRootIntent(v,catalog,{
    seekerGuzmaNominalKo:true});
  assert.equal(root.kind,'play-guzma-forced-nominal-ko');
  assert.equal(root.handIndex,0);
  assert.equal(root.opponentBenchIndex,1);
});
test('no use when direct attack wins, unpaid, locks, quota, or unknown target Tool',()=>{
  const v=view();
  v.ownPublic.active.energies=[ENERGY,ENERGY,ENERGY];
  v.opponentPublic.active.hp=90;
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownPublic.active.energies=[];v.opponentPublic.active.hp=200;
  v.ownPublic.bench[1].energies=[];
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownPublic.bench[1].energies=[ENERGY,ENERGY,ENERGY];
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownTurnResources.itemPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.opponentPublic.bench[1].tools=['Big Charm RCL'];
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
});
test('exact Guzma printings, no speculative hidden information',()=>{
  const v=view();
  v.ownPublic.discard=['Guzma & Hala CEC'];
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog),null);
  v.ownPublic.discard=[GUZMA];
  Object.defineProperty(v,'opponentHidden',{get(){
    throw Error('private opponent zones must never be read');}});
  assert.equal(chooseLateSeekerGuzmaPrize(v,catalog).target,GUZMA);
});
test('native ChooseCardsPrompt resolves exact physical discarded Guzma',()=>{
  const physical={fullName:GUZMA,id:98};
  const owner={id:41,discard:{cards:[physical]}};
  const state={players:[owner,{id:42}]};
  const prompt={id:132,playerId:41,cards:owner.discard,
    result:undefined,constructor:{name:'ChooseCardsPrompt'},
    validate(cards){return cards.length===1&&cards[0]===physical;}};
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  const result=selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,GUZMA);
  assert.strictEqual(result.card,physical);
  assert.deepEqual(result.action.result,[physical]);
  assert.equal(result.targetPrinting,GUZMA);
});
test('native-shaped three-action Store chain selects owner Seeker, own-discard prompt, and Guzma',()=>{
  const handCard=fullName=>({fullName});
  const pokemon={fullName:'Lunatone OBF',name:'Lunatone',hp:90,
    stage:1,cardType:[],retreat:[],weakness:[],resistance:[],
    attacks:[],powers:[]};
  function slot(){return {cards:[],getPokemonCard:()=>null,
    getPokemons:()=>[],damage:0,specialConditions:[],
    energies:{cards:[]},tools:[]};}
  function player(id){
    return {id,active:slot(),bench:Array.from({length:5},slot),
      hand:{cards:[]},deck:{cards:[]},prizes:[],
      stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
      supporter:{cards:[]},supporterTurn:0,retreatedTurn:0,
      energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0};
  }
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class PassTurnAction{constructor(id){this.id=id;}}
  class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class ChooseCardsPrompt{
    constructor(owner){
      this.id=137;this.playerId=owner.id;this.cards=owner.discard;
      this.result=undefined;
    }
    validate(cards){
      return cards.length===1&&
        this.cards.cards.includes(cards[0])&&
        cards[0].fullName===GUZMA;
    }
  }
  class Store{
    constructor(){
      this.state={players:[player(101),player(202)],
        activePlayer:0,prompts:[],turn:9,phase:2};
      this.state.players[0].hand.cards=[handCard(SEEKER)];
      this.state.players[0].discard.cards=[handCard(GUZMA)];
    }
    dispatch(action){
      const owner=this.state.players[0];
      if(action instanceof PlayCardAction){
        const card=owner.hand.cards.splice(action.handIndex,1)[0];
        assert.ok(card);
        if(card.fullName===SEEKER){
          owner.discard.cards.push(card);
          this.state.prompts=[new ChooseCardsPrompt(owner)];
        }else{
          assert.equal(card.fullName,GUZMA);
          owner.supporterTurn=1;
          owner.supporter.cards.push(card);
        }
      }else if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts[0];
        assert.ok(prompt&&prompt.validate(action.result));
        const card=action.result[0];
        const i=owner.discard.cards.indexOf(card);
        assert.ok(i>=0);
        owner.discard.cards.splice(i,1);
        owner.hand.cards.push(card);
        prompt.result=action.result;
        this.state.prompts=[];
      }
      return true;
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('unsafe native decoder');}
  }
  const store=new Store();
  const observe=()=>({
    ...view(),
    ownHand:store.state.players[0].hand.cards.map(c=>c.fullName),
    ownPublic:{...view().ownPublic,
      discard:store.state.players[0].discard.cards.map(c=>c.fullName)},
    ownTurnResources:{...view().ownTurnResources,
      supporterPlayedTurn:store.state.players[0].supporterTurn}
  });
  const names=[];
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  const run=withActorOnlyRootPolicy(()=>{
    store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(101);
    for(let i=0;i<3;i++){
      const action=bot.decodeNextAction(store.state);
      names.push(action.constructor.name);
      store.dispatch(action);
    }
    return store;
  },{SimpleTacticsAi,Store,observe,
    getCatalog:()=>catalog,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    cardActions:{PlayCardAction,PlayerType:{ANY:2,BOTTOM_PLAYER:0},
      SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
    promptActions:{ResolvePromptAction},
    gameActions:{PassTurnAction,AttackAction},
    seekerGuzmaNominalKo:true});
  assert.deepEqual(names,['PlayCardAction','ResolvePromptAction','PlayCardAction']);
  assert.equal(run.audit.seekerGuzmaPromptsProposed,1);
  assert.equal(run.audit.seekerGuzmaPromptsAccepted,1);
  assert.equal(run.audit.acceptedActorRoots,2);
  assert.equal(store.state.players[0].supporterTurn,1);
  assert.deepEqual(store.state.players[0].discard.cards.map(x=>x.fullName),[SEEKER]);
  assert.equal(store.state.players[0].supporter.cards[0].fullName,GUZMA);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,old);
});
