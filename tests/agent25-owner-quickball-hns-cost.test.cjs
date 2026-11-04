'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  chooseHnsQuickBallCost,ownerBallDonorOpportunity,
  withOwnerHnsQuickBallCost
}=require('../simulation/twinleaf/agent25-owner-quickball-hns-cost.cjs');

function handCard(name,id){return {fullName:name,id};}
function makeState(seat=0,{includeCompressor=true,donor='Shuppet M5',
  source='Quick Ball SSH',forbiddenOpponentHand=false}={}){
  const hand=[
    handCard('Quick Ball SSH',12),
    handCard(donor,13),
    handCard('Grass Energy MEE',14),
    ...(includeCompressor?[handCard('Battle Compressor PHF',15)]:[])
  ];
  const owner={id:seat===0?101:202,
    hand:{cards:hand},discard:{cards:[]},
    active:{getPokemonCard:()=>({fullName:'Dhelmise M5'})},
    bench:[]};
  const opponent={id:seat===0?202:101};
  if(forbiddenOpponentHand)
    Object.defineProperty(opponent,'hand',{get(){
      throw Error('Opposing hidden hand was read');}
    });
  const prompt={
    constructor:{name:'ChooseCardsPrompt'},
    result:undefined,id:'payment13',playerId:owner.id,
    sourceCard:{fullName:source},message:'CHOOSE_CARD_TO_DISCARD',
    cards:{cards:hand.filter(c=>c.fullName!=='Quick Ball SSH')},
    options:{min:1,max:1,allowCancel:false},
    validate(answer){return Array.isArray(answer)&&answer.length===1&&
      this.cards.cards.includes(answer[0]);}
  };
  const players=seat===0?[owner,opponent]:[opponent,owner];
  return {state:{players,activePlayer:seat,turn:3,prompts:[prompt]},
    owner,opponent,prompt};
}

test('pure capacity-aware chooser uses physical offered owner HNS donors',()=>{
  const basic={eligible:true,heldCompressor:true,hasDhelmise:true,
    visibleDiscard:0,offered:['Shuppet M5','Grass Energy MEE'],
    ownHand:['Shuppet M5','Battle Compressor PHF','Grass Energy MEE']};
  assert.equal(chooseHnsQuickBallCost(basic),'Shuppet M5');
  assert.equal(chooseHnsQuickBallCost({...basic,visibleDiscard:4}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,heldCompressor:false}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,hasDhelmise:false}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,offered:['Grass Energy MEE']}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,
    offered:['Sinistcha M5','Banette M5'],ownHand:['Sinistcha M5','Banette M5']}),'Banette M5');
});

test('strict live owner-payment classifier tolerates detached offered CardList',()=>{
  for(const seat of [0,1]){
    const x=makeState(seat,{forbiddenOpponentHand:true});
    assert.notStrictEqual(x.prompt.cards,x.owner.hand);
    const event=ownerBallDonorOpportunity(x.state,seat);
    assert.strictEqual(event.card,x.owner.hand.cards[1]);
    assert.equal(event.prompt.id,'payment13');
    assert.equal(event.ownDiscardCount,0);
    assert.equal(ownerBallDonorOpportunity(x.state,1-seat),null);
    assert.equal(ownerBallDonorOpportunity(
      makeState(seat,{includeCompressor:false}).state,seat),null);
    assert.equal(ownerBallDonorOpportunity(
      makeState(seat,{source:'Ultra Ball SUM'}).state,seat),null);
  }
});

test('opaque opponent private inventory cannot affect identical owner choice',()=>{
  const a=makeState(0,{forbiddenOpponentHand:true});
  const b=makeState(0,{forbiddenOpponentHand:true});
  a.opponent.secretDraw=['never reveal'];
  b.opponent.secretDraw=['different secret','secret prize'];
  assert.equal(ownerBallDonorOpportunity(a.state,0)?.card.fullName,
    ownerBallDonorOpportunity(b.state,0)?.card.fullName);
});

test('native decoder replacement chooses a real card then observes real Store acceptance on both seats',()=>{
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class AddPlayerAction{}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {kind:'native-fallback'};}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return;
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(x=>x.id===action.id);
        assert.ok(p);
        assert.ok(p.validate(action.result,this.state));
        const owner=this.state.players.find(x=>x.id===p.playerId);
        for(const card of action.result){
          const index=owner.hand.cards.indexOf(card);
          assert.ok(index>=0);
          owner.hand.cards.splice(index,1);
          owner.discard.cards.push(card);
        }
        p.result=action.result;
      }
    }
  }
  const oldDecoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const seat of [0,1]){
    const x=makeState(seat,{forbiddenOpponentHand:true});
    const result=withOwnerHnsQuickBallCost(seat,()=>{
      const store=new Store(x.state);
      store.dispatch(new AddPlayerAction());
      const bot=new SimpleTacticsAi(x.owner.id);
      const action=bot.decodeNextAction(x.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.result[0].fullName,'Shuppet M5');
      store.dispatch(action);
      assert.ok(x.owner.discard.cards.includes(action.result[0]));
      return 'native-root-executed';
    },{SimpleTacticsAi,Store,ResolvePromptAction});
    assert.equal(result.result,'native-root-executed');
    assert.equal(result.audit.eligible,1);
    assert.equal(result.audit.selected,1);
    assert.equal(result.audit.accepted,1);
    assert.equal(result.audit.physicallyMoved,1);
    assert.equal(result.audit.errored,0);
    assert.equal(result.audit.decisions[0].physicalMovedToDiscard,true);
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction'),oldDecoder);
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      Store.prototype,'dispatch'),oldDispatch);
  }
});

test('K0 owner-only Ball chooser never probes own deck, Prize cards or opponent hidden zones',()=>{
  for(const seat of [0,1]){
    const x=makeState(seat,{source:'Quick Ball FST',forbiddenOpponentHand:true});
    for(const [target,prop] of [[x.owner,'deck'],[x.owner,'prizes'],
      [x.opponent,'deck'],[x.opponent,'prizes']]){
      Object.defineProperty(target,prop,{get(){
        throw Error('Forbidden K0 undisclosed zone probed: '+prop);
      }});
    }
    assert.equal(ownerBallDonorOpportunity(x.state,seat)?.card.fullName,
      'Shuppet M5');
    const y=makeState(seat);
    y.prompt.cards.cards.push(handCard('Shuppet M5',9999));
    assert.equal(ownerBallDonorOpportunity(y.state,seat),null,
      'Native offered card outside physical owner hand must fail closed');
  }
});
