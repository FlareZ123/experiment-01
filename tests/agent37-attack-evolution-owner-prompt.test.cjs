'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {actorAttackEvolutionInput,VERSION}=
  require('../simulation/twinleaf/agent37-attack-evolution-owner-prompt.cjs');
const {chooseActorSingleSearch,withActorOwnerSingleSearch}=
  require('../simulation/twinleaf/agent41-actor-owner-single-search.cjs');

class ChooseCardsPrompt{}
class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Store{
  constructor(){this.state=null;}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const p=this.state.prompts.find(x=>x.id===action.id);
      assert.equal(p.validate(action.result),true);
      p.result=action.result;
    }
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'NATIVE_FALLBACK';}
}

const TYPES=Object.freeze({PLAYER_TURN:5,ATTACK:6});

/** @param {0|1} seat @param {string} [message] @param {boolean} [eligible] */
function fixture(seat,message='CHOOSE_CARD_TO_EVOLVE',eligible=true){
  const p1={id:101,deck:{cards:[
    {fullName:'Psychic Energy SVE',evolvesFrom:null},
    {fullName:'Alolan Exeggutor ex SSP',evolvesFrom:'Exeggcute'}
  ]},hand:{cards:[]},discard:{cards:[]}};
  const p2={id:202,deck:{cards:[
    {fullName:'Basic Energy SVE',evolvesFrom:null},
    {fullName:'Exeggutor SSP',evolvesFrom:'Exeggcute'}
  ]},hand:{cards:[]},discard:{cards:[]}};
  const players=[p1,p2],owner=players[seat];
  const other=players[1-seat];
  other.hand.cards=[{fullName:'Private opponent card'}];
  const prompt=Object.assign(new ChooseCardsPrompt(),{
    id:seat+150,playerId:eligible?owner.id:other.id,
    cards:eligible?owner.deck:other.deck,
    result:undefined,message,options:{min:0,max:1,allowCancel:false},
    validate:selected=>Array.isArray(selected)&&selected.length<=1&&
      selected.every(card=>owner.deck.cards.includes(card)&&
        card.evolvesFrom==='Exeggcute')
  });
  return {owner,state:{players,activePlayer:seat,turn:1,phase:TYPES.ATTACK,
    prompts:[prompt]}};
}

const obs=(state,seat)=>Object.freeze({
  decisionKind:'owner-prompt',globalTurn:state.turn,actorSeat:seat
});

test('only a genuine owner deck-to-Active evolution prompt reveals validated K1 targets',()=>{
  const {state}=fixture(0);
  const a=actorAttackEvolutionInput(state,0,obs);
  assert.equal(a.prompt.source,'own-deck-evolution');
  assert.deepEqual(a.prompt.offered,[
    {index:0,printing:'Alolan Exeggutor ex SSP',selectableAlone:true},
    {index:1,printing:'Psychic Energy SVE',selectableAlone:false}
  ]);
  assert.deepEqual(chooseActorSingleSearch(a),{indices:[0]});
  assert.ok(Object.isFrozen(a.prompt.offered));
  assert.equal(JSON.stringify(a).includes('Private opponent card'),false);
  assert.equal(actorAttackEvolutionInput(state,1,obs),null);
  assert.equal(actorAttackEvolutionInput(fixture(0,'CHOOSE_CARD_TO_HAND').state,0,obs),null);
  assert.equal(actorAttackEvolutionInput(fixture(0,'CHOOSE_CARD_TO_EVOLVE',false).state,0,obs),null);
  assert.equal(typeof VERSION,'string');
});

test('two real physical seats, attack-phase evolution opt-in resolves native-typed choices',()=>{
  const priorAI=SimpleTacticsAi.prototype.decodeNextAction;
  const priorDispatch=Store.prototype.dispatch;
  const result=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const observed=[];
    for(const seat of [0,1]){
      const {owner,state}=fixture(seat);
      store.state=state;
      const bot=new SimpleTacticsAi(owner.id);
      const proposed=bot.decodeNextAction(state);
      assert.ok(proposed instanceof ResolvePromptAction);
      assert.equal(proposed.result.length,1);
      assert.equal(proposed.result[0].evolvesFrom,'Exeggcute');
      store.dispatch(proposed);
      assert.strictEqual(state.prompts[0].result[0],proposed.result[0]);
      observed.push({seat,printing:proposed.result[0].fullName});
    }
    return observed;
  },{
    Store,SimpleTacticsAi,ResolvePromptAction,GamePhase:TYPES,
    attackPhaseEvolution:true,attackPhaseSearch:false,
    observe:(state,seat)=>{throw Error('Evolution must use its own public target projector');}
  });
  assert.deepEqual(result.result,[
    {seat:0,printing:'Alolan Exeggutor ex SSP'},
    {seat:1,printing:'Exeggutor SSP'}
  ]);
  assert.equal(result.audit.attackPhaseEvolutionOptIn,true);
  assert.match(result.audit.version,/agent37-owner-attack-evolution-deck-prompt-v1/);
  assert.equal(result.audit.selected,2);
  assert.equal(result.audit.accepted,2);
  assert.equal(result.audit.nativePromptPostconditionsConfirmed,2);
  assert.deepEqual(result.audit.bySeat,{0:1,1:1});
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorAI);
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
});

test('attack evolution is default-off and does not borrow unrelated deck-to-hand permissions',()=>{
  const run=(optIn,message)=>{
    return withActorOwnerSingleSearch(()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      const {owner,state}=fixture(0,message);
      store.state=state;
      return new SimpleTacticsAi(owner.id).decodeNextAction(state);
    },{Store,SimpleTacticsAi,ResolvePromptAction,GamePhase:TYPES,
      attackPhaseEvolution:optIn,attackPhaseSearch:false,
      observe:()=>{throw Error('No unsupported prompt may be read');}});
  };
  const base=run(false,'CHOOSE_CARD_TO_EVOLVE');
  assert.equal(base.result,'NATIVE_FALLBACK');
  assert.equal(base.audit.selected,0);
  assert.equal('attackPhaseEvolutionOptIn' in base.audit,false);
  const unrelated=run(true,'CHOOSE_CARD_TO_HAND');
  assert.equal(unrelated.result,'NATIVE_FALLBACK');
  assert.equal(unrelated.audit.selected,0);
});
